import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';

const SESSION_KEY = 'mealmind_session';

function getUsername() {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
    return session?.username || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function Profile() {
  const navigate = useNavigate();

  function logOut() {
    window.localStorage.removeItem(SESSION_KEY);
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="dashboard-brand">mealmind</span>
        <p className="dashboard-eyebrow">PROFILE</p>
        <h1>Your account</h1>
        <p>Username: {getUsername()}</p>
        <div className="dashboard-actions">
          <Link to="/home">Back to home</Link>
          <button type="button" onClick={logOut}>Log out</button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
