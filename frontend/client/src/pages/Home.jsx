import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';

const links = [
  { to: '/scams', title: 'Learn common scams', text: 'Read real-world scam patterns and quick red flags.' },
  { to: '/quiz', title: 'Test your instincts', text: 'Check how quickly you can spot fake messages and calls.' },
  { to: '/helpline', title: 'Get emergency help', text: 'Call 1930 and find state contacts when something feels wrong.' },
  { to: '/report', title: 'Report suspicious activity', text: 'Share scam details to help warn others and stay prepared.' },
];

export default function Home() {
  return (
    <PageShell className="cs-home">
      <div className="cs-home__hero">
        <div className="cs-home__panel">
          <p className="cs-muted" style={{ marginBottom: '10px' }}>Cyber awareness for everyday life</p>
          <h1 className="cs-title" style={{ marginTop: 0 }}>Stay one step ahead of online scams.</h1>
          <p className="cs-lead">
            Cyber Suraksha helps people in India recognise scam patterns, respond quickly, and protect their money and privacy.
          </p>
          <div className="cs-actions">
            <Link to="/scams" className="cs-btn cs-btn--primary">Explore scams</Link>
            <Link to="/quiz" className="cs-btn cs-btn--ghost">Take the quiz</Link>
          </div>
        </div>

        <div className="cs-home__panel">
          <h2 className="cs-h2">Quick actions</h2>
          <ul className="cs-steps">
            <li>Check the sender, link and urgency.</li>
            <li>Verify before you click or share OTPs.</li>
            <li>Call 1930 if a payment or account feels compromised.</li>
          </ul>
        </div>
      </div>

      <div className="cs-home__card-grid">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="cs-home__card">
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
