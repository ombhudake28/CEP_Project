import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { currentLang } from './useApi.js';

const SITE = 'Cyber Suraksha';

export default function usePageMeta(title, description) {
  const { i18n } = useTranslation();
  const lang = currentLang(i18n);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title ? `${title} | ${SITE}` : SITE;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (description) meta.setAttribute('content', description);
  }, [title, description, lang]);
}
