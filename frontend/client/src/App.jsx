import { NavLink, Route, Routes, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Home from './pages/Home.jsx';
import ScamList from './pages/ScamList.jsx';
import ScamDetail from './pages/ScamDetail.jsx';
import Quiz from './pages/Quiz.jsx';
import Helpline from './pages/Helpline.jsx';
import Report from './pages/Report.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/scams', label: 'Scams' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/helpline', label: 'Helpline' },
  { to: '/report', label: 'Report' },
  { to: '/about', label: 'About' },
];

export default function App() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || 'en';

  const onChangeLang = (lang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('lang', lang);
    } catch {
      // ignore storage failures
    }
  };

  return (
    <>
      <header className="cs-header">
        <div className="cs-shell cs-header__inner">
          <Link to="/" className="cs-brand">Cyber Suraksha</Link>
          <nav className="cs-nav" aria-label="Main navigation">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="cs-lang" aria-label="Language switcher">
            {['en', 'hi', 'mr'].map((lang) => (
              <button
                key={lang}
                type="button"
                className={current.startsWith(lang) ? 'active' : ''}
                aria-pressed={current.startsWith(lang)}
                onClick={() => onChangeLang(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="cs-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scams" element={<ScamList />} />
          <Route path="/scams/:slug" element={<ScamDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/report" element={<Report />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
