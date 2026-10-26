import { useTranslation } from 'react-i18next';
import { PhoneIcon, ExternalIcon } from './Icons.jsx';

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function HelplineCard({ name, phone, website, description, variant = 'default', callLabel }) {
  const { t } = useTranslation();
  const tel = phone ? `tel:${String(phone).replace(/[^\d+]/g, '')}` : null;
  const Heading = variant === 'primary' ? 'h2' : 'h3';

  return (
    <article className={`cs-hl cs-hl--${variant}`}>
      <Heading className="cs-hl__name">{name}</Heading>
      {description && <p className="cs-hl__desc">{description}</p>}
      {phone && (
        <a className="cs-hl__phone" href={tel} aria-label={callLabel || t('helplinePage.callNumber', { phone })}>
          <PhoneIcon width={variant === 'primary' ? 40 : 22} height={variant === 'primary' ? 40 : 22} />
          <span>{phone}</span>
        </a>
      )}
      {website && (
        <a className="cs-hl__web" href={website} target="_blank" rel="noopener noreferrer">
          {hostOf(website)}
          <ExternalIcon width={16} height={16} />
          <span className="cs-sr">{t('helplinePage.opensNewTab')}</span>
        </a>
      )}
    </article>
  );
}
