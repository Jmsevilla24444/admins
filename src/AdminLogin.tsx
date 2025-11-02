import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // Placeholder submit. Replace with real auth.
    console.log({ email, password, remember });
    // Navigate to dashboard
    window.location.hash = '#/dashboard';
  };

  return (
    <div className="admin-login-page">
      <div className="admin-card">
        <h1 className="admin-title">Admin Login</h1>
        <form onSubmit={onSubmit} className="admin-form" autoComplete="on">
          <label className="admin-label" htmlFor="email">Email</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon" aria-hidden>✉️</span>
            <input
              id="email"
              type="email"
              className="admin-input"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="admin-label" htmlFor="password">Password</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon" aria-hidden>🔒</span>
            <input
              id="password"
              type="password"
              className="admin-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-remember">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="admin-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
