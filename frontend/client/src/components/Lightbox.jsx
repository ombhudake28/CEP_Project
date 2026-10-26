import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

export default function Lightbox({ images, index, onClose, onChange }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const count = images.length;
  const image = images[index];

  const prev = useCallback(() => onChange((index - 1 + count) % count), [index, count, onChange]);
  const next = useCallback(() => onChange((index + 1) % count), [index, count, onChange]);

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previous && previous.focus) previous.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll('button:not([disabled])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  if (!image) return null;

  return createPortal(
    <div
      className="cs-lb"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="cs-lb__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('scamDetail.viewerLabel')}
        ref={dialogRef}
      >
        <button type="button" ref={closeRef} className="cs-lb__btn cs-lb__close" onClick={onClose} aria-label={t('ui.close')}>
          <CloseIcon />
        </button>
        <img className="cs-lb__img" src={image.src} alt={image.alt || ''} />
        <div className="cs-lb__cap" aria-live="polite">
          {image.caption && <p>{image.caption}</p>}
          <p className="cs-lb__count">{t('scamDetail.imageCounter', { current: index + 1, total: count })}</p>
        </div>
        {count > 1 && (
          <>
            <button type="button" className="cs-lb__btn cs-lb__prev" onClick={prev} aria-label={t('scamDetail.prevImage')}>
              <ChevronLeftIcon />
            </button>
            <button type="button" className="cs-lb__btn cs-lb__next" onClick={next} aria-label={t('scamDetail.nextImage')}>
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
