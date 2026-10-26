import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from './Icons.jsx';

export default function Toast({ message, onClose, duration = 3500 }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!message) return undefined;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [message, onClose, duration]);

  return (
    <div className="cs-toast-region cs-noprint" role="status" aria-live="polite">
      {message && (
        <div className="cs-toast">
          <span>{message}</span>
          <button type="button" className="cs-toast__x" onClick={onClose} aria-label={t('ui.dismiss')}>
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  );
}
