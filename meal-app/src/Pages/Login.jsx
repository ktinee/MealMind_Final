
import { useState } from 'react';
import './style.css';

const SESSION_KEY = 'mealmind_session';

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || 'http://localhost:3001'
).replace(/\/+$/, '');



function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const username = form.elements.name.value.trim();
    const password = form.elements.password.value;

    if (!username || !password) {
      setMessageType('error');
      setMessage('Please enter both your username and password.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Incorrect username or password. Please try again.'
        );
      }

      if (!result.userId || !result.sessionToken) {
        throw new Error('The server returned an invalid login session.');
      }

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: result.userId,
          username: result.username || username,
          sessionToken: result.sessionToken,
        })
      );

      window.location.assign('/home');

    } catch (error) {
      setMessageType('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign in right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">

      <div className="login-decoration decoration-one" aria-hidden="true"></div>
      <div className="login-decoration decoration-two" aria-hidden="true"></div>
      <div className="login-decoration decoration-three" aria-hidden="true"></div>

      <div className="login-card">

        <a href="/" className="login-brand">
          <span className="brand-icon">m</span>
          <span>mealmind</span>
        </a>

        <div className="login-heading">
          <span className="form-label">LET'S GET STARTED</span>
          <h1>Welcome back!</h1>
          <p>Log in to continue your MealMind journey.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>

          <div className="login-field">
            <label htmlFor="loginName">Username</label>
            <input
              id="loginName"
              name="name"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="loginPassword">Password</label>

            <div className="password-wrapper">
              <input
                id="loginPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Log In'}
            <span>→</span>
          </button>

          {message && (
            <p
              className={`login-message login-message-${messageType}`}
              role={messageType === 'error' ? 'alert' : 'status'}
            >
              {message}
            </p>
          )}

        </form>

        <div className="login-register">
          Don't have an account?
          <a href="/signup"> Create an account</a>
        </div>


      </div>

    </main>
  );
}

export default Login;
