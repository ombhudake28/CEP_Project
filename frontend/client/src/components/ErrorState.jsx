import { useTranslation } from 'react-i18next';

export default function ErrorState({ error, onRetry, title }) {
  const { t } = useTranslation();
  let message = t('ui.errorGeneric');
  if (error && error.code === 'NETWORK_ERROR') message = t('ui.errorNetwork');
  else if (error && error.message) message = error.message;

  return (
    <div className="cs-error" role="alert">
      <h2 className="cs-error__title">{title || t('ui.errorTitle')}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="cs-btn cs-btn--primary" onClick={onRetry}>
          {t('ui.retry')}
        </button>
      )}
    </div>
  );
}
