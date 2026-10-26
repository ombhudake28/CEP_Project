import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { CheckIcon, CloseIcon } from '../components/Icons.jsx';
import useApi from '../hooks/useApi.js';
import usePageMeta from '../hooks/usePageMeta.js';

function QuizRunner({ questions }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const nextRef = useRef(null);
  const resultRef = useRef(null);
  const total = questions.length;
  const q = questions[index];

  const choose = useCallback(
    (i) => {
      if (picked !== null || done) return;
      setPicked(i);
      if (i === q.answerIndex) setScore((s) => s + 1);
    },
    [picked, done, q]
  );

  useEffect(() => {
    if (picked !== null && nextRef.current) nextRef.current.focus();
  }, [picked]);

  useEffect(() => {
    if (done && resultRef.current) resultRef.current.focus();
  }, [done]);

  useEffect(() => {
    const onKey = (e) => {
      if (done || picked !== null || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= q.options.length) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, picked, q, choose]);

  const goNext = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const answered = done ? total : index + (picked !== null ? 1 : 0);
  const percent = Math.round((answered / total) * 100);

  if (done) {
    const ratio = score / total;
    const msg = ratio >= 0.8 ? 'msgHigh' : ratio >= 0.5 ? 'msgMid' : 'msgLow';
    return (
      <div className="cs-quiz cs-result">
        <div className="cs-progress" role="progressbar" aria-label={t('quizPage.progressLabel')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
          <div className="cs-progress__bar" style={{ width: '100%' }} />
        </div>
        <h2 className="cs-h2" tabIndex={-1} ref={resultRef}>
          {t('quizPage.score', { score, total })}
        </h2>
        <p className="cs-prose">{t(`quizPage.${msg}`)}</p>
        <div className="cs-actions">
          <button type="button" className="cs-btn cs-btn--primary" onClick={restart}>{t('quizPage.retry')}</button>
          <Link className="cs-btn cs-btn--ghost" to="/scams">{t('quizPage.readScams')}</Link>
        </div>
      </div>
    );
  }

  const correct = picked !== null && picked === q.answerIndex;

  return (
    <div className="cs-quiz">
      <p className="cs-muted">{t('quizPage.progress', { current: index + 1, total })}</p>
      <div className="cs-progress" role="progressbar" aria-label={t('quizPage.progressLabel')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="cs-progress__bar" style={{ width: `${percent}%` }} />
      </div>

      <h2 className="cs-h2" id={`q-${q.id}`}>{q.question}</h2>
      <p className="cs-muted">{t('quizPage.hint')}</p>

      <div className="cs-opts" role="group" aria-labelledby={`q-${q.id}`}>
        {q.options.map((opt, i) => {
          let cls = 'cs-opt';
          if (picked !== null) {
            if (i === q.answerIndex) cls += ' is-correct';
            else if (i === picked) cls += ' is-wrong';
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              aria-disabled={picked !== null}
              onClick={() => choose(i)}
            >
              <span className="cs-opt__num" aria-hidden="true">{i + 1}</span>
              <span className="cs-opt__text">{opt}</span>
              {picked !== null && i === q.answerIndex && <CheckIcon className="cs-opt__icon" />}
              {picked !== null && i === picked && i !== q.answerIndex && <CloseIcon className="cs-opt__icon" />}
            </button>
          );
        })}
      </div>

      <div className="cs-feedback" role="status" aria-live="polite">
        {picked !== null && (
          <div className={correct ? 'cs-feedback__box is-correct' : 'cs-feedback__box is-wrong'}>
            <strong>{correct ? t('quizPage.correct') : t('quizPage.incorrect')}</strong>
            {!correct && <p>{t('quizPage.answerWas', { answer: q.options[q.answerIndex] })}</p>}
            {q.explanation && <p>{q.explanation}</p>}
          </div>
        )}
      </div>

      {picked !== null && (
        <button type="button" ref={nextRef} className="cs-btn cs-btn--primary" onClick={goNext}>
          {index + 1 < total ? t('quizPage.next') : t('quizPage.seeResults')}
        </button>
      )}
    </div>
  );
}

export default function Quiz() {
  const { t } = useTranslation();
  const { data, error, loading, retry, lang } = useApi('/quiz');
  usePageMeta(t('quizPage.metaTitle'), t('quizPage.metaDesc'));
  const questions = Array.isArray(data) ? data : [];

  return (
    <PageShell>
      <h1 className="cs-title">{t('quizPage.title')}</h1>
      <p className="cs-lead">{t('quizPage.intro')}</p>

      {loading && (
        <div aria-busy="true" aria-label={t('ui.loading')}>
          <Skeleton height={12} radius={999} />
          <div className="cs-gap" />
          <Skeleton height={28} width="80%" />
          <div className="cs-gap" />
          <Skeleton height={52} radius={12} />
          <div className="cs-gap" />
          <Skeleton height={52} radius={12} />
          <div className="cs-gap" />
          <Skeleton height={52} radius={12} />
        </div>
      )}
      {error && <ErrorState error={error} onRetry={retry} />}
      {!loading && !error && questions.length === 0 && <p className="cs-note">{t('quizPage.empty')}</p>}
      {!loading && !error && questions.length > 0 && <QuizRunner key={lang} questions={questions} />}
    </PageShell>
  );
}
