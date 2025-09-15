const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function fetchNotes(token) {
  const res = await fetch(`${API_BASE_URL}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function createNote(token, title, content) {
  const res = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to create note');
  }
  return res.json();
}

export async function upgradeTenant(token, tenantSlug) {
  const res = await fetch(`${API_BASE_URL}/tenants/${tenantSlug}/upgrade`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Upgrade failed');
  return res.json();
}
