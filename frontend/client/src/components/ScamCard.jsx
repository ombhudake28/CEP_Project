import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SeverityBadge from './SeverityBadge.jsx';

export default function ScamCard({ scam }) {
  const { t } = useTranslation();
  return (
    <article className="cs-card">
      {scam.image && (
        <img className="cs-card__img" src={scam.image} alt="" loading="lazy" width="400" height="220" />
      )}
      <div className="cs-card__body">
        <SeverityBadge severity={scam.severity} />
        <h3 className="cs-card__title">
          <Link className="cs-card__link" to={`/scams/${scam.slug}`}>{scam.title}</Link>
        </h3>
        <p className="cs-card__text">{scam.summary}</p>
        <span className="cs-card__cta" aria-hidden="true">{t('scamList.learnMore')} &rarr;</span>
      </div>
    </article>
  );
}
