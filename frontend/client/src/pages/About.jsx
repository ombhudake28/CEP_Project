import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function About() {
  const { t } = useTranslation();
  usePageMeta(t('aboutPage.metaTitle'), t('aboutPage.metaDesc'));

  return (
    <PageShell>
      <h1 className="cs-title">{t('aboutPage.title')}</h1>

      <section className="cs-section" aria-labelledby="ab-mission">
        <h2 id="ab-mission" className="cs-h2">{t('aboutPage.missionTitle')}</h2>
        <p className="cs-prose">{t('aboutPage.mission')}</p>
      </section>

      <section className="cs-section" aria-labelledby="ab-how">
        <h2 id="ab-how" className="cs-h2">{t('aboutPage.howTitle')}</h2>
        <ol className="cs-steps">
          <li><Link to="/scams">{t('aboutPage.how1')}</Link></li>
          <li><Link to="/quiz">{t('aboutPage.how2')}</Link></li>
          <li><Link to="/helpline">{t('aboutPage.how3')}</Link></li>
          <li><Link to="/report">{t('aboutPage.how4')}</Link></li>
        </ol>
      </section>

      <section className="cs-section" aria-labelledby="ab-lang">
        <h2 id="ab-lang" className="cs-h2">{t('aboutPage.langTitle')}</h2>
        <p className="cs-prose">{t('aboutPage.langText')}</p>
      </section>

      <section className="cs-section cs-note" aria-labelledby="ab-disc">
        <h2 id="ab-disc" className="cs-h2">{t('aboutPage.disclaimerTitle')}</h2>
        <p className="cs-prose">{t('aboutPage.disclaimer')}</p>
      </section>
    </PageShell>
  );
}
