import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || 'http://localhost:3001'
).replace(/\/+$/, '');

function Signup() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to create your account.');
      }

      setMessage('Account created. You can now log in.');
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <a href="/" className="login-brand">
          <span className="brand-icon">m</span>
          <span>mealmind</span>
        </a>
        <div className="login-heading">
          <span className="form-label">GET STARTED</span>
          <h1>Create your account</h1>
          <p>Join MealMind to plan meals around your life.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="signupName">Name</label>
            <input id="signupName" name="name" autoComplete="name" required />
          </div>
          <div className="login-field">
            <label htmlFor="signupUsername">Username</label>
            <input
              id="signupUsername"
              name="username"
              autoComplete="username"
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
            <span>→</span>
          </button>
          {message && (
            <p className="login-message login-message-info" role="status">
              {message}
            </p>
          )}
        </form>
        <div className="login-register">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}

export default Signup;