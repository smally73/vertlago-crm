const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: (token) => request('/auth/me', { token }),

  getClients: (token, params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/clients${qs ? `?${qs}` : ''}`, { token });
  },
  getClient: (token, id) => request(`/clients/${id}`, { token }),
  createClient: (token, payload) => request('/clients', { method: 'POST', body: payload, token }),
  updateClient: (token, id, payload) => request(`/clients/${id}`, { method: 'PUT', body: payload, token }),
  deleteClient: (token, id) => request(`/clients/${id}`, { method: 'DELETE', token }),
  addInteraction: (token, id, payload) =>
    request(`/clients/${id}/interactions`, { method: 'POST', body: payload, token }),
  updateInteraction: (token, clientId, interactionId, payload) =>
    request(`/clients/${clientId}/interactions/${interactionId}`, { method: 'PUT', body: payload, token }),
  deleteInteraction: (token, clientId, interactionId) =>
    request(`/clients/${clientId}/interactions/${interactionId}`, { method: 'DELETE', token }),
};
