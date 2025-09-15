import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setMessage('Login successful!');
        onLoginSuccess();
      } else {
        setMessage(data.message || 'Login failed');
        setPassword('');
      }
    } catch {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-signin mx-auto mt-5" style={{ maxWidth: 350 }}>
      <img
        className="mb-4 mx-auto d-block"
        src="https://getbootstrap.com/docs/5.3/assets/brand/bootstrap-logo.svg"
        alt="Bootstrap logo"
        width="72"
        height="57"
      />
      <h1 className="h3 mb-3 fw-normal text-center">Please sign in</h1>

      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="floatingInput"
          placeholder="name@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
        <label htmlFor="floatingInput">Email address</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>

      <div className="form-check text-start mb-3">
        <input className="form-check-input" type="checkbox" value="remember-me" id="checkDefault" />
        <label className="form-check-label" htmlFor="checkDefault">
          Remember me
        </label>
      </div>

      <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Sign in'}
      </button>

      {message && <div className="mt-3 text-center text-danger">{message}</div>}

      <p className="mt-5 mb-3 text-muted text-center">© 2017–2025</p>
    </form>
  );
}

export default Login;
