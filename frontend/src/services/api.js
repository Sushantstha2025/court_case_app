const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('court_tracker_token');

  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || 'An unexpected error occurred';
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),

  getProfile: () => request('/auth/me'),

  updateProfile: (fullName) =>
    request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify({ fullName }),
    }),

  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Expenses
  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/expenses${queryString}`);
  },

  getExpenseById: (id) => request(`/expenses/${id}`),

  createExpense: (expenseData) =>
    request('/expenses', {
      method: 'POST',
      body: expenseData instanceof FormData ? expenseData : JSON.stringify(expenseData),
    }),

  updateExpense: (id, expenseData) =>
    request(`/expenses/${id}`, {
      method: 'PUT',
      body: expenseData instanceof FormData ? expenseData : JSON.stringify(expenseData),
    }),

  deleteExpense: (id) =>
    request(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  getExpenseDocument: async (id) => {
    const token = localStorage.getItem('court_tracker_token');
    const response = await fetch(`${API_BASE_URL}/expenses/${id}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to retrieve supporting document');
    }
    return response.blob();
  },

  // Events / Timeline
  getEvents: (order = 'asc') => request(`/events?order=${order}`),

  createEvent: (eventData) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (id, eventData) =>
    request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (id) =>
    request(`/events/${id}`, {
      method: 'DELETE',
    }),

  // Dashboard & Reports
  getDashboardSummary: () => request('/dashboard/summary'),
};
