import { useTranslation } from 'react-i18next';

export default function SeverityBadge({ severity }) {
  const { t } = useTranslation();
  if (!severity) return null;
  const key = String(severity).toLowerCase();
  return (
    <span className={`cs-sev cs-sev--${key}`}>
      <span className="cs-sr">{t('ui.severityLabel')}: </span>
      {t(`ui.severity.${key}`, { defaultValue: severity })}
    </span>
  );
}
