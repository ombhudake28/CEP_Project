import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import mr from './locales/mr/translation.json';

const getStoredLang = () => {
  try {
    return localStorage.getItem('lang') || 'en';
  } catch {
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: getStoredLang(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
