import '../styles/pages.css';
import BackToTop from './BackToTop.jsx';

export default function PageShell({ children, className = '' }) {
  return (
    <div className={`cs-page cs-enter ${className}`.trim()}>
      {children}
      <BackToTop />
    </div>
  );
}
