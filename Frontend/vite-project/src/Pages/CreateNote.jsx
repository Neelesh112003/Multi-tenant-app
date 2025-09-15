import React, { useState } from 'react';

export default function CreateNote({ onNoteCreated, tenantSlug }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const token = localStorage.getItem('token'); // Move outside submit for reuse

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setShowUpgradePrompt(false);

    if (!token) {
      setMessage('Login required');
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
        } else {
          setMessage(data.message || 'Failed to create note');
        }
      }
    } catch {
      setMessage('Network error');
    }
  }

  async function handleUpgrade() {
    setMessage('');
    if (!token) {
      setMessage('Login required');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/tenants/${tenantSlug}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Upgraded to Pro! You can now create unlimited notes.');
        setShowUpgradePrompt(false);
        setMessage('');
        onNoteCreated(); // refresh notes or UI
      } else {
        setMessage('Upgrade failed');
      }
    } catch {
      setMessage('Network error during upgrade');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Note</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
      />
      <button type="submit">Add</button>
      {message && <p>{message}</p>}

      {showUpgradePrompt && (
        <div style={{ marginTop: '1rem' }}>
          <p>Note limit reached. Please upgrade your subscription.</p>
          <button type="button" onClick={handleUpgrade}>
            Upgrade to Pro
          </button>
        </div>
      )}
    </form>
  );
}
