import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Make sure you have a Redux action to logout or clear token, for example:
const logout = () => ({ type: 'auth/logout' });

const Notes = () => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const handleLogout = () => {
    dispatch(logout());
  };

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setError('Session expired or unauthorized. Please login again.');
        dispatch(logout());
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const res = await fetch('http://localhost:5000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.status === 401 || res.status === 403) {
        setFormError('Session expired or unauthorized. Please login again.');
        dispatch(logout());
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create note');
      }

      setTitle('');
      setContent('');
      setFormSuccess('Note created successfully!');
      await fetchNotes(); // Refresh list
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h2>Your Notes</h2>
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={formLoading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Content
          </label>
          <textarea
            id="content"
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={formLoading}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={formLoading}>
          {formLoading ? 'Saving...' : 'Create Note'}
        </button>

        {formError && <div className="mt-3 alert alert-danger">{formError}</div>}
        {formSuccess && <div className="mt-3 alert alert-success">{formSuccess}</div>}
      </form>

      {loading ? (
        <p>Loading notes...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : notes.length === 0 ? (
        <p>No notes found. Create some!</p>
      ) : (
        <ul className="list-group">
          {notes.map((note) => (
            <li key={note.id} className="list-group-item">
              <h5>{note.title}</h5>
              <p>{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notes;
