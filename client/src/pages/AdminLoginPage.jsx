import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api.js';
import { isLoggedIn, setToken } from '../data/auth.js';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = await loginAdmin({ username, password });
      setToken(payload.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 id="login-title">Admin Login</h1>
        <label htmlFor="admin-username">Username</label>
        <input
          id="admin-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        {error ? <div className="notice notice--error">{error}</div> : null}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}
