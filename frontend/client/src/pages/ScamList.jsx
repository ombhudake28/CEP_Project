import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import ScamCard from '../components/ScamCard.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import useApi from '../hooks/useApi.js';
import usePageMeta from '../hooks/usePageMeta.js';

function CardSkeleton() {
  return (
    <div className="cs-card" aria-hidden="true">
      <Skeleton height={160} radius={0} />
      <div className="cs-card__body">
        <Skeleton width={90} height={22} radius={999} />
        <Skeleton width="80%" height={22} />
        <Skeleton height={14} />
        <Skeleton width="70%" height={14} />
      </div>
    </div>
  );
}

export default function ScamList() {
  const { t } = useTranslation();
  const { data, error, loading, retry } = useApi('/scams');
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  usePageMeta(t('scamList.metaTitle'), t('scamList.metaDesc'));

  const scams = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const severities = useMemo(() => [...new Set(scams.map((s) => s.severity).filter(Boolean))], [scams]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scams.filter((s) => {
      if (severity !== 'all' && s.severity !== severity) return false;
      if (!q) return true;
      return `${s.title} ${s.summary}`.toLowerCase().includes(q);
    });
  }, [scams, query, severity]);

  const clear = () => {
    setQuery('');
    setSeverity('all');
  };

  return (
    <PageShell>
      <h1 className="cs-title">{t('scamList.title')}</h1>
      <p className="cs-lead">{t('scamList.intro')}</p>

      {error && <ErrorState error={error} onRetry={retry} />}

      {!error && (
        <>
          <div className="cs-filters">
            <div className="cs-field">
              <label className="cs-label" htmlFor="scam-search">{t('scamList.searchLabel')}</label>
              <input
                id="scam-search"
                className="cs-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('scamList.searchPlaceholder')}
                disabled={loading}
              />
            </div>
            <div role="group" aria-label={t('scamList.filterLabel')} className="cs-chips">
              {['all', ...severities].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`cs-chip${severity === s ? ' is-active' : ''}`}
                  aria-pressed={severity === s}
                  onClick={() => setSeverity(s)}
                  disabled={loading}
                >
                  {s === 'all' ? t('scamList.all') : t(`ui.severity.${String(s).toLowerCase()}`, { defaultValue: s })}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="cs-grid" aria-busy="true" aria-label={t('ui.loading')}>
              {[0, 1, 2, 3, 4, 5].map((n) => <CardSkeleton key={n} />)}
            </div>
          )}

          {!loading && (
            <>
              <p className="cs-muted" role="status" aria-live="polite">
                {t('scamList.shown', { shown: visible.length, total: scams.length })}
              </p>
              {visible.length > 0 ? (
                <div className="cs-grid">
                  {visible.map((s) => <ScamCard key={s.slug} scam={s} />)}
                </div>
              ) : (
                <div className="cs-empty">
                  <p>{t('scamList.empty')}</p>
                  <button type="button" className="cs-btn cs-btn--ghost" onClick={clear}>{t('scamList.clear')}</button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageShell>
  );
}
