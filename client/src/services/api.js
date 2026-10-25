const BASE_URL = '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('proofpocket_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: 'Invalid response from server' };
  }

  if (!response.ok) {
    const errorMsg = data.error || (data.details ? `${data.error}: ${data.details}` : 'An unexpected error occurred');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data.details;
    throw err;
  }

  return data;
};

export const api = {
  // Health & DB status
  health: {
    check: () => fetch(`${BASE_URL}/health`).then(handleResponse),
    reconnect: () => fetch(`${BASE_URL}/health/reconnect`, { method: 'POST' }).then(handleResponse),
  },

  // Auth
  auth: {
    register: (userData) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse),

    login: (credentials) =>
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    getMe: () =>
      fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Items
  items: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return fetch(`${BASE_URL}/items?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getById: (id) =>
      fetch(`${BASE_URL}/items/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse),

    create: (formData) =>
      fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      }).then(handleResponse),

    update: (id, formData) =>
      fetch(`${BASE_URL}/items/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: formData,
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Repairs
  repairs: {
    getByItem: (itemId) =>
      fetch(`${BASE_URL}/repairs/item/${itemId}`, {
        headers: getHeaders(),
      }).then(handleResponse),

    create: (itemId, data) =>
      fetch(`${BASE_URL}/repairs/item/${itemId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${BASE_URL}/repairs/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Dashboard
  dashboard: {
    getStats: () =>
      fetch(`${BASE_URL}/dashboard/stats`, {
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Reminders
  reminders: {
    getAll: () =>
      fetch(`${BASE_URL}/reminders`, {
        headers: getHeaders(),
      }).then(handleResponse),
  },
};
