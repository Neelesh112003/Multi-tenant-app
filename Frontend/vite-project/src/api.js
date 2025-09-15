const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function login(email, password) {
  return fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(res => res.json());
}

// You can export other API functions similarly.
