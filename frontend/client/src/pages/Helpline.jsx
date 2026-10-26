import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import HelplineCard from '../components/HelplineCard.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { PrintIcon } from '../components/Icons.jsx';
import useApi from '../hooks/useApi.js';
import usePageMeta from '../hooks/usePageMeta.js';

const PORTAL_FALLBACK = 'https://cybercrime.gov.in';
const STORAGE_KEY = 'stateCode';

function readStoredState() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function digits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export default function Helpline() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(readStoredState);
  const [checked, setChecked] = useState({});
  const { data, error, loading, retry } = useApi(
    '/helplines',
    { state: selected || undefined },
    { keepPrevious: true }
  );
  usePageMeta(t('helplinePage.metaTitle'), t('helplinePage.metaDesc'));

  const states = data && Array.isArray(data.availableStates) ? data.availableStates : [];

  // Default / invalid selection: prefer MH, otherwise the first state returned.
  useEffect(() => {
    if (!states.length) return;
    if (selected && states.some((s) => s.code === selected)) return;
    const pick = states.find((s) => s.code === 'MH') || states[0];
    setSelected(pick.code);
  }, [states, selected]);

  const onStateChange = (e) => {
    const code = e.target.value;
    setSelected(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable: selection still works for this visit */
    }
  };

  const national = data && Array.isArray(data.national) ? data.national : [];
  const portal = national.find((n) => n.website && /cybercrime\.gov\.in/i.test(n.website));
  const portalUrl = (portal && portal.website) || PORTAL_FALLBACK;
  const otherNational = national.filter((n) => {
    if (digits(n.phone) === '1930') return false;
    if (n.website && /cybercrime\.gov\.in/i.test(n.website) && !n.phone) return false;
    return true;
  });

  const stateInfo = data && data.state ? data.state : null;
  const stateName = stateInfo ? stateInfo.name : (states.find((s) => s.code === selected) || {}).name || '';
  const contacts = stateInfo && Array.isArray(stateInfo.contacts) ? stateInfo.contacts : [];
  const refreshing = loading && Boolean(data);

  const steps = ['step1', 'step2', 'step3', 'step4'];

  return (
    <PageShell>
      <h1 className="cs-title">{t('helplinePage.title')}</h1>
      <p className="cs-lead">{t('helplinePage.intro')}</p>

      <HelplineCard
        variant="primary"
        name={t('helplinePage.nationalTitle')}
        description={t('helplinePage.nationalDesc')}
        phone="1930"
        callLabel={t('helplinePage.call1930Label')}
      />

      <section className="cs-section" aria-labelledby="hl-portal">
        <h2 id="hl-portal" className="cs-h2">{t('helplinePage.portalTitle')}</h2>
        <HelplineCard
          name={t('helplinePage.portalTitle')}
          description={t('helplinePage.portalDesc')}
          website={portalUrl}
        />
      </section>

      <section className="cs-section cs-print-area" aria-labelledby="hl-hour">
        <h2 id="hl-hour" className="cs-h2">{t('helplinePage.firstHourTitle')}</h2>
        <p className="cs-muted cs-noprint">{t('helplinePage.firstHourHint')}</p>
        <ul className="cs-hour">
          {steps.map((s) => (
            <li key={s}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(checked[s])}
                  onChange={(e) => setChecked((c) => ({ ...c, [s]: e.target.checked }))}
                />
                <span>{t(`helplinePage.${s}`)}</span>
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="cs-btn cs-btn--ghost cs-noprint" onClick={() => window.print()}>
          <PrintIcon width={18} height={18} /> {t('helplinePage.print')}
        </button>
      </section>

      <section className="cs-section cs-noprint" aria-labelledby="hl-state" aria-busy={loading}>
        <h2 id="hl-state" className="cs-h2">{t('helplinePage.stateTitle')}</h2>

        {error && <ErrorState error={error} onRetry={retry} />}

        {!error && loading && !data && (
          <div aria-label={t('ui.loading')}>
            <Skeleton height={44} width={260} radius={10} />
            <div className="cs-gap" />
            <Skeleton height={110} radius={14} />
          </div>
        )}

        {!error && data && (
          <>
            <div className="cs-field">
              <label className="cs-label" htmlFor="state-select">{t('helplinePage.stateLabel')}</label>
              <select id="state-select" className="cs-input" value={selected} onChange={onStateChange}>
                {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>

            <div className={refreshing ? 'cs-dim' : undefined}>
              {contacts.length > 0 ? (
                <>
                  <h3 className="cs-h3">{t('helplinePage.stateContactsFor', { state: stateName })}</h3>
                  <div className="cs-grid">
                    {contacts.map((c, i) => (
                      <HelplineCard
                        key={`${c.name}-${i}`}
                        name={c.name}
                        phone={c.phone}
                        website={c.website}
                        description={c.description}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="cs-note">{t('helplinePage.noContacts', { state: stateName })}</p>
              )}
            </div>

            {otherNational.length > 0 && (
              <>
                <h3 className="cs-h3">{t('helplinePage.otherNational')}</h3>
                <div className="cs-grid">
                  {otherNational.map((n) => (
                    <HelplineCard
                      key={n.id}
                      name={n.name}
                      phone={n.phone}
                      website={n.website}
                      description={n.description}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </PageShell>
  );
}
