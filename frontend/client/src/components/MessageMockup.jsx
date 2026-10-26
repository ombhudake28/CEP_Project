import { useTranslation } from 'react-i18next';
import { WarningIcon, PhoneIcon, CloseIcon } from './Icons.jsx';

export default function MessageMockup({ example }) {
  const { t } = useTranslation();
  if (!example) return null;
  const { channel, sender, text } = example;
  const initial = String(sender || '?').trim().charAt(0).toUpperCase();

  return (
    <div className={`cs-mock cs-mock--${channel}`} role="group" aria-label={t('scamDetail.exampleAria')}>
      <span className="cs-tag" role="note">
        <WarningIcon width={16} height={16} />
        {t('scamDetail.thisIsScam')}
      </span>

      {channel === 'email' && (
        <div className="cs-mock__email">
          <div className="cs-mock__emailhead">
            <span className="cs-mock__avatar" aria-hidden="true">{initial}</span>
            <div>
              <div className="cs-mock__label">{t('scamDetail.emailFrom')}</div>
              <div className="cs-mock__sender">{sender}</div>
            </div>
          </div>
          <p className="cs-mock__text">{text}</p>
        </div>
      )}

      {channel === 'call' && (
        <div className="cs-mock__call">
          <span className="cs-mock__avatar cs-mock__avatar--lg" aria-hidden="true">{initial}</span>
          <div className="cs-mock__sender">{sender}</div>
          <div className="cs-mock__label">{t('scamDetail.incomingCall')}</div>
          <div className="cs-mock__callbtns" aria-hidden="true">
            <span className="cs-mock__round cs-mock__round--no"><CloseIcon /></span>
            <span className="cs-mock__round cs-mock__round--yes"><PhoneIcon /></span>
          </div>
          <div className="cs-mock__said">
            <div className="cs-mock__label">{t('scamDetail.callerSays')}</div>
            <p className="cs-mock__text">{text}</p>
          </div>
        </div>
      )}

      {channel !== 'email' && channel !== 'call' && (
        <div className="cs-mock__sms">
          <div className="cs-mock__smshead">{sender}</div>
          <p className="cs-mock__bubble cs-mock__text">{text}</p>
        </div>
      )}
    </div>
  );
}
