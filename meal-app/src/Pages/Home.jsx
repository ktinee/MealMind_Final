import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';

const SESSION_KEY = 'mealmind_session';

function getUsername() {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
    return session?.username || 'there';
  } catch {
    return 'there';
  }
}

function Home() {
  const navigate = useNavigate();

  function logOut() {
    window.localStorage.removeItem(SESSION_KEY);
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="dashboard-brand">mealmind</span>
        <p className="dashboard-eyebrow">YOUR MEALMIND SPACE</p>
        <h1>Welcome, {getUsername()}!</h1>
        <p>
          This is a placeholder home page. Your meal-planning features can be
          added here.
        </p>
        <div className="dashboard-actions">
          <Link to="/profile">View profile</Link>
          <button type="button" onClick={logOut}>Log out</button>
        </div>
      </section>
    </main>
  );
}

export default Home;
