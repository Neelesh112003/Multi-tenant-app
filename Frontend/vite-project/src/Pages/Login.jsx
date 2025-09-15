import React, { useState, useEffect } from 'react';

// Login Component
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
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
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

// Notes List Component
function NotesList({ refreshTrigger }) {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotes() {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Login required');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/notes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
          setError('');
        } else {
          setError('Failed to load notes');
        }
      } catch {
        setError('Network error');
      }
    }
    fetchNotes();
  }, [refreshTrigger]);

  if (error)
    return (
      <div className="container mt-3">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );

  return (
    <div className="container mt-4 login" style={{ maxWidth: 700 }}>
      <h2>Your Notes</h2>
      {notes.length === 0 ? (
        <p>No notes found</p>
      ) : (
        <div className="list-group">
          {notes.map(note => (
            <div key={note.id} className="list-group-item">
              <strong>{note.title}</strong>
              <p>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create Note Component
function CreateNote({ onNoteCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setShowUpgradePrompt(false);
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Login required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Note created!');
        setTitle('');
        setContent('');
        onNoteCreated();
      } else {
        if (data.message && data.message.toLowerCase().includes('note limit')) {
          setShowUpgradePrompt(true);
          setMessage(data.message);
        } else {
          setMessage(data.message || 'Failed to create note');
        }
      }
    } catch {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Login required');
      return;
    }

    try {
      // Replace tenantSlug with actual tenant slug if available in your app context
      const tenantSlug = 'tenant1'; // Example tenant slug
      const res = await fetch(`http://localhost:5000/tenants/${tenantSlug}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Upgraded to Pro! You can now create unlimited notes.');
        setShowUpgradePrompt(false);
        setMessage('');
        onNoteCreated();
      } else {
        setMessage('Upgrade failed');
      }
    } catch {
      setMessage('Network error during upgrade');
    }
  }

  return (
    <div className="container mt-3" style={{ maxWidth: 700 }}>
      <h3>Create Note</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Title"
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <textarea
            placeholder="Content"
            className="form-control"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={4}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Add'}
        </button>
      </form>

      {message && <p className={`mt-3 ${showUpgradePrompt ? 'text-warning' : 'text-success'}`}>{message}</p>}

      {showUpgradePrompt && (
        <div className="mt-3">
          <p>Note limit reached. Please upgrade your subscription.</p>
          <button className="btn btn-warning" onClick={handleUpgrade}>
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [refreshNotes, setRefreshNotes] = useState(false);

  function onLoginSuccess() {
    setLoggedIn(true);
  }

  function onNoteCreated() {
    setRefreshNotes(r => !r);
  }

  function logout() {
    localStorage.removeItem('token');
    setLoggedIn(false);
  }

  if (!loggedIn)
    return (
      <div>
        <Login onLoginSuccess={onLoginSuccess} />
      </div>
    );

  return (
    <div className="container mt-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1>Multi-Tenant Notes App</h1>
        <button className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </header>
      <CreateNote onNoteCreated={onNoteCreated} />
      <NotesList refreshTrigger={refreshNotes} />
    </div>
  );
}
