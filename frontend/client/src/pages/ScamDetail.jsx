import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import SeverityBadge from '../components/SeverityBadge.jsx';
import MessageMockup from '../components/MessageMockup.jsx';
import Lightbox from '../components/Lightbox.jsx';
import ScamCard from '../components/ScamCard.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Toast from '../components/Toast.jsx';
import { WarningIcon, ShareIcon, PrintIcon, PhoneIcon } from '../components/Icons.jsx';
import useApi from '../hooks/useApi.js';
import usePageMeta from '../hooks/usePageMeta.js';
import copyText from '../utils/copyText.js';

function DetailSkeleton() {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" aria-label={t('ui.loading')}>
      <Skeleton height={28} width="60%" />
      <div className="cs-gap" />
      <Skeleton height={240} radius={14} />
      <div className="cs-gap" />
      <Skeleton height={16} />
      <Skeleton height={16} width="90%" />
      <Skeleton height={16} width="75%" />
    </div>
  );
}

export default function ScamDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { data: scam, error, loading, retry } = useApi(`/scams/${encodeURIComponent(slug)}`);
  const { data: list } = useApi('/scams');
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState('');
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const closeToast = useCallback(() => setToast(''), []);

  const notFound = Boolean(error && (error.code === 'NOT_FOUND' || error.status === 404));

  let metaTitle = t('scamList.title');
  let metaDesc = t('scamList.metaDesc');
  if (scam) {
    metaTitle = scam.title;
    metaDesc = scam.summary;
  } else if (notFound) {
    metaTitle = t('scamDetail.notFoundTitle');
  }
  usePageMeta(metaTitle, metaDesc);

  const nextScams = useMemo(() => {
    if (!Array.isArray(list) || !scam) return [];
    const others = list.filter((s) => s.slug !== scam.slug);
    const i = list.findIndex((s) => s.slug === scam.slug);
    if (i < 0) return others.slice(0, 2);
    return [...others.slice(i), ...others.slice(0, i)].slice(0, 2);
  }, [list, scam]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: scam.title, text: scam.summary, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    const ok = await copyText(url);
    setToast(ok ? t('scamDetail.linkCopied') : t('scamDetail.shareFailed'));
  };

  if (loading) {
    return <PageShell><DetailSkeleton /></PageShell>;
  }

  if (notFound) {
    return (
      <PageShell>
        <div className="cs-empty">
          <h1 className="cs-title">{t('scamDetail.notFoundTitle')}</h1>
          <p>{t('scamDetail.notFoundText')}</p>
          <Link className="cs-btn cs-btn--primary" to="/scams">{t('scamDetail.allScams')}</Link>
        </div>
      </PageShell>
    );
  }

  if (error || !scam) {
    return <PageShell><ErrorState error={error} onRetry={retry} /></PageShell>;
  }

  const images = Array.isArray(scam.images) ? scam.images : [];
  const hero = images.find((i) => /-hero\./.test(i.src)) || images[0];
  const list2 = (arr) => (Array.isArray(arr) ? arr : []);

  return (
    <PageShell key={scam.slug}>
      <Link className="cs-back cs-noprint" to="/scams">&larr; {t('scamDetail.back')}</Link>

      <header className="cs-hero">
        {hero && <img className="cs-hero__img" src={hero.src} alt={hero.alt || ''} />}
        <div className="cs-hero__meta">
          <SeverityBadge severity={scam.severity} />
          <h1 className="cs-title">{scam.title}</h1>
          <p className="cs-lead">{scam.summary}</p>
          <button type="button" className="cs-btn cs-btn--ghost cs-noprint" onClick={share}>
            <ShareIcon width={18} height={18} /> {t('scamDetail.share')}
          </button>
        </div>
      </header>

      <section className="cs-section" aria-labelledby="sec-what">
        <h2 id="sec-what" className="cs-h2">{t('scamDetail.whatIsIt')}</h2>
        <p className="cs-prose">{scam.whatIsIt}</p>
      </section>

      {scam.example && (
        <section className="cs-section" aria-labelledby="sec-example">
          <h2 id="sec-example" className="cs-h2">{t('scamDetail.example')}</h2>
          <p className="cs-muted">{t('scamDetail.exampleHint')}</p>
          <MessageMockup example={scam.example} />
        </section>
      )}

      <section className="cs-section" aria-labelledby="sec-how">
        <h2 id="sec-how" className="cs-h2">{t('scamDetail.howItWorks')}</h2>
        <ol className="cs-timeline">
          {list2(scam.howItWorks).map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      <section className="cs-section" aria-labelledby="sec-flags">
        <h2 id="sec-flags" className="cs-h2">{t('scamDetail.redFlags')}</h2>
        <ul className="cs-flags">
          {list2(scam.redFlags).map((flag, i) => (
            <li key={i}><WarningIcon className="cs-flags__icon" /><span>{flag}</span></li>
          ))}
        </ul>
      </section>

      {images.length > 0 && (
        <section className="cs-section cs-noprint" aria-labelledby="sec-gallery">
          <h2 id="sec-gallery" className="cs-h2">{t('scamDetail.gallery')}</h2>
          <div className="cs-gallery">
            {images.map((img, i) => (
              <figure key={img.src} className="cs-gallery__item">
                <button
                  type="button"
                  className="cs-gallery__btn"
                  onClick={() => setLightbox(i)}
                  aria-haspopup="dialog"
                  aria-label={t('scamDetail.enlarge', { n: i + 1, caption: img.caption || img.alt || '' })}
                >
                  <img src={img.src} alt={img.alt || ''} loading="lazy" />
                </button>
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="cs-section" aria-labelledby="sec-safe">
        <h2 id="sec-safe" className="cs-h2">{t('scamDetail.staySafe')}</h2>
        <ul className="cs-safe">
          {list2(scam.howToStaySafe).map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </section>

      <section className="cs-section cs-alert cs-print-area" aria-labelledby="sec-scammed">
        <h2 id="sec-scammed" className="cs-h2">{t('scamDetail.ifScammed')}</h2>
        <p>{t('scamDetail.ifScammedIntro')}</p>
        <ol className="cs-steps">
          {list2(scam.ifScammed).map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <div className="cs-actions cs-noprint">
          <Link className="cs-btn cs-btn--danger" to="/helpline">
            <PhoneIcon width={18} height={18} /> {t('scamDetail.getHelp')}
          </Link>
          <button type="button" className="cs-btn cs-btn--ghost" onClick={() => window.print()}>
            <PrintIcon width={18} height={18} /> {t('scamDetail.print')}
          </button>
        </div>
      </section>

      {nextScams.length > 0 && (
        <section className="cs-section cs-noprint" aria-labelledby="sec-next">
          <h2 id="sec-next" className="cs-h2">{t('scamDetail.nextScams')}</h2>
          <div className="cs-grid">
            {nextScams.map((s) => <ScamCard key={s.slug} scam={s} />)}
          </div>
        </section>
      )}

      {lightbox !== null && (
        <Lightbox images={images} index={lightbox} onClose={closeLightbox} onChange={setLightbox} />
      )}
      <Toast message={toast} onClose={closeToast} />
    </PageShell>
  );
}
