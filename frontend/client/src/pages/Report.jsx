import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import { http, normalizeError, currentLang } from '../hooks/useApi.js';
import usePageMeta from '../hooks/usePageMeta.js';

const CHANNELS = ['sms', 'email', 'call', 'whatsapp', 'other'];
const FIELD_ORDER = ['channel', 'message', 'contact', 'consent'];
const MIN = 10;
const MAX = 2000;

function validate(values, t) {
  const errors = {};
  if (!CHANNELS.includes(values.channel)) errors.channel = t('reportPage.errors.channel');
  const len = values.message.trim().length;
  if (len < MIN) errors.message = t('reportPage.errors.messageShort');
  else if (len > MAX) errors.message = t('reportPage.errors.messageLong');
  if (!values.consent) errors.consent = t('reportPage.errors.consent');
  return errors;
}

export default function Report() {
  const { t, i18n } = useTranslation();
  const lang = currentLang(i18n);
  usePageMeta(t('reportPage.metaTitle'), t('reportPage.metaDesc'));

  const [values, setValues] = useState({ channel: '', message: '', contact: '', consent: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const channelRef = useRef(null);
  const messageRef = useRef(null);
  const contactRef = useRef(null);
  const consentRef = useRef(null);
  const thanksRef = useRef(null);
  const refs = { channel: channelRef, message: messageRef, contact: contactRef, consent: consentRef };

  useEffect(() => {
    if (done && thanksRef.current) thanksRef.current.focus();
  }, [done]);

  const setField = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  };

  const focusFirst = (errs) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first && refs[first].current) refs[first].current.focus();
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (sending) return;
    setFormError('');
    const found = validate(values, t);
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError(t('reportPage.errors.form'));
      focusFirst(found);
      return;
    }
    setSending(true);
    try {
      const body = { channel: values.channel, message: values.message.trim(), consent: true };
      if (values.contact.trim()) body.contact = values.contact.trim();
      const res = await http.post('/report', body);
      setDone(res.data.data);
    } catch (err) {
      const e = normalizeError(err);
      if (e.code === 'VALIDATION_ERROR' && Array.isArray(e.details)) {
        const mapped = {};
        e.details.forEach((d) => {
          if (d && d.field && !mapped[d.field]) mapped[d.field] = d.message;
        });
        setErrors(mapped);
        setFormError(t('reportPage.errors.form'));
        focusFirst(mapped);
      } else if (e.code === 'NETWORK_ERROR') {
        setFormError(t('ui.errorNetwork'));
      } else {
        setFormError(e.message || t('reportPage.errors.server'));
      }
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setValues({ channel: '', message: '', contact: '', consent: false });
    setErrors({});
    setFormError('');
    setDone(null);
  };

  if (done) {
    const when = new Date(done.receivedAt);
    return (
      <PageShell>
        <div className="cs-thanks">
          <h1 className="cs-title" tabIndex={-1} ref={thanksRef}>{t('reportPage.thanksTitle')}</h1>
          <p>{t('reportPage.thanksText')}</p>
          <p className="cs-thanks__id">{done.id}</p>
          <p className="cs-muted">{t('reportPage.thanksSub')}</p>
          {!Number.isNaN(when.getTime()) && (
            <p className="cs-muted">{t('reportPage.received', { date: when.toLocaleString(lang) })}</p>
          )}
          <div className="cs-actions">
            <button type="button" className="cs-btn cs-btn--primary" onClick={reset}>{t('reportPage.another')}</button>
            <Link className="cs-btn cs-btn--ghost" to="/helpline">{t('reportPage.officialLink')}</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const len = values.message.length;

  return (
    <PageShell>
      <h1 className="cs-title">{t('reportPage.title')}</h1>
      <p className="cs-lead">{t('reportPage.intro')}</p>
      <p className="cs-note">
        {t('reportPage.official')} <Link to="/helpline">{t('reportPage.officialLink')}</Link>
      </p>

      <form className="cs-form" onSubmit={onSubmit} noValidate>
        {formError && <div className="cs-formerr" role="alert">{formError}</div>}

        <div className="cs-field">
          <label className="cs-label" htmlFor="rp-channel">{t('reportPage.channelLabel')}</label>
          <select
            id="rp-channel"
            ref={channelRef}
            className="cs-input"
            value={values.channel}
            onChange={(e) => setField('channel', e.target.value)}
            aria-invalid={Boolean(errors.channel)}
            aria-describedby={errors.channel ? 'rp-channel-err' : undefined}
            required
          >
            <option value="">{t('reportPage.channelChoose')}</option>
            {CHANNELS.map((c) => <option key={c} value={c}>{t(`reportPage.channels.${c}`)}</option>)}
          </select>
          {errors.channel && <p className="cs-err" id="rp-channel-err">{errors.channel}</p>}
        </div>

        <div className="cs-field">
          <label className="cs-label" htmlFor="rp-message">{t('reportPage.messageLabel')}</label>
          <p className="cs-help" id="rp-message-help">{t('reportPage.messageHelp')}</p>
          <textarea
            id="rp-message"
            ref={messageRef}
            className="cs-input cs-textarea"
            rows={6}
            maxLength={MAX}
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            placeholder={t('reportPage.messagePlaceholder')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`rp-message-help rp-message-count${errors.message ? ' rp-message-err' : ''}`}
            required
          />
          <div className={`cs-counter${len >= MAX - 100 ? ' is-near' : ''}`} id="rp-message-count">
            {t('reportPage.counter', { current: len, max: MAX })}
          </div>
          {errors.message && <p className="cs-err" id="rp-message-err">{errors.message}</p>}
        </div>

        <div className="cs-field">
          <label className="cs-label" htmlFor="rp-contact">{t('reportPage.contactLabel')}</label>
          <p className="cs-help" id="rp-contact-help">{t('reportPage.contactHelp')}</p>
          <input
            id="rp-contact"
            ref={contactRef}
            className="cs-input"
            type="text"
            autoComplete="off"
            value={values.contact}
            onChange={(e) => setField('contact', e.target.value)}
            placeholder={t('reportPage.contactPlaceholder')}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={`rp-contact-help${errors.contact ? ' rp-contact-err' : ''}`}
          />
          {errors.contact && <p className="cs-err" id="rp-contact-err">{errors.contact}</p>}
        </div>

        <p className="cs-note" id="rp-privacy">{t('reportPage.privacy')}</p>

        <div className="cs-field">
          <label className="cs-consent" htmlFor="rp-consent">
            <input
              id="rp-consent"
              ref={consentRef}
              type="checkbox"
              checked={values.consent}
              onChange={(e) => setField('consent', e.target.checked)}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={`rp-privacy${errors.consent ? ' rp-consent-err' : ''}`}
              required
            />
            <span>{t('reportPage.consent')}</span>
          </label>
          {errors.consent && <p className="cs-err" id="rp-consent-err">{errors.consent}</p>}
        </div>

        <button type="submit" className="cs-btn cs-btn--primary" disabled={sending} aria-busy={sending}>
          {sending ? t('reportPage.sending') : t('reportPage.submit')}
        </button>
      </form>
    </PageShell>
  );
}
