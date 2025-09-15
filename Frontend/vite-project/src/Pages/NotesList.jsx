import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Example logout action, adjust as needed
const logout = () => ({ type: 'auth/logout' });

export default function NotesList({ refreshKey }) {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotes() {
      // Clear notes immediately if not authenticated
      if (!token) {
        setNotes([]);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setError('Session expired or unauthorized. Please login again.');
          dispatch(logout());
          setNotes([]);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data = await res.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [token, dispatch, refreshKey]); // refetch on token or refreshKey change

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (notes.length === 0) return <p>No notes found.</p>;

  return (
    <ul className="list-group">
      {notes.map((note) => (
        <li key={note.id} className="list-group-item">
          <h5>{note.title}</h5>
          <p>{note.content}</p>
        </li>
      ))}
    </ul>
  );
}
