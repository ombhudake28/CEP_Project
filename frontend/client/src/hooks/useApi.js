import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export const SUPPORTED_LANGS = ['en', 'hi', 'mr'];

export function currentLang(i18n) {
  const l = String(i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);
  return SUPPORTED_LANGS.includes(l) ? l : 'en';
}

export const http = axios.create({ baseURL: '/api', timeout: 15000 });

export function normalizeError(err) {
  const e = err && err.response && err.response.data && err.response.data.error;
  if (e) {
    return { message: e.message, code: e.code, details: e.details, status: err.response.status };
  }
  return {
    message: null,
    code: err && err.response ? 'HTTP_ERROR' : 'NETWORK_ERROR',
    status: err && err.response ? err.response.status : 0,
  };
}

/**
 * GET helper. Re-fetches when path, params or the active language change.
 * options.keepPrevious keeps the last data on screen while reloading.
 */
export default function useApi(path, params = {}, options = {}) {
  const { i18n } = useTranslation();
  const lang = currentLang(i18n);
  const paramsKey = JSON.stringify(params);
  const keepPrevious = Boolean(options.keepPrevious);
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [tick, setTick] = useState(0);
  const retry = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    setState((s) => ({ data: keepPrevious ? s.data : null, error: null, loading: true }));
    http
      .get(path, { params: { ...JSON.parse(paramsKey), lang }, signal: controller.signal })
      .then((res) => setState({ data: res.data.data, error: null, loading: false }))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState({ data: null, error: normalizeError(err), loading: false });
      });
    return () => controller.abort();
  }, [path, paramsKey, lang, tick, keepPrevious]);

  return { data: state.data, error: state.error, loading: state.loading, retry, lang };
}
