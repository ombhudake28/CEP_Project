import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function NotFound() {
  const { t } = useTranslation();
  usePageMeta(t('notFoundPage.metaTitle'), t('notFoundPage.text'));

  return (
    <PageShell>
      <div className="cs-empty">
        <p className="cs-404" aria-hidden="true">404</p>
        <h1 className="cs-title">{t('notFoundPage.title')}</h1>
        <p>{t('notFoundPage.text')}</p>
        <div className="cs-actions">
          <Link className="cs-btn cs-btn--primary" to="/">{t('notFoundPage.home')}</Link>
          <Link className="cs-btn cs-btn--ghost" to="/scams">{t('notFoundPage.scams')}</Link>
        </div>
      </div>
    </PageShell>
  );
}
