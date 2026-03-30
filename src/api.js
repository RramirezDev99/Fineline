// ═══════════════════════════════════════════════
//  FineLine API Client
//  Maneja todas las llamadas al backend
// ═══════════════════════════════════════════════

const API = '/api';

function getToken() {
  return localStorage.getItem('fineline_token');
}

export function setToken(token) {
  localStorage.setItem('fineline_token', token);
}

export function clearToken() {
  localStorage.removeItem('fineline_token');
  localStorage.removeItem('fineline_user');
}

export function getUser() {
  const u = localStorage.getItem('fineline_user');
  return u ? JSON.parse(u) : null;
}

export function setUser(user) {
  localStorage.setItem('fineline_user', JSON.stringify(user));
}

async function request(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
}

// ─── Auth ───
export const auth = {
  register: (name, email, password) => request('/auth/register', 'POST', { name, email, password }),
  login: (email, password) => request('/auth/login', 'POST', { email, password }),
};

// ─── Learning ───
export const learning = {
  get: () => request('/learning'),
  update: (data) => request('/learning', 'PUT', data),
};

// ─── Finance ───
export const finance = {
  get: () => request('/finance'),
  update: (data) => request('/finance', 'PUT', data),
};

// ─── Projects ───
export const projects = {
  list: () => request('/projects'),
  create: (data) => request('/projects', 'POST', data),
  update: (id, data) => request('/projects', 'PUT', { id, ...data }),
  remove: (id) => request('/projects', 'DELETE', { id }),
};

// ─── Journal ───
export const journal = {
  list: () => request('/journal'),
  create: (data) => request('/journal', 'POST', data),
  remove: (id) => request('/journal', 'DELETE', { id }),
};

// ─── Reminders ───
export const reminders = {
  list: () => request('/reminders'),
  create: (data) => request('/reminders', 'POST', data),
  update: (id, data) => request('/reminders', 'PUT', { id, ...data }),
  remove: (id) => request('/reminders', 'DELETE', { id }),
};

// ─── Roadmap ───
export const roadmap = {
  get: () => request('/roadmap'),
  update: (phases) => request('/roadmap', 'PUT', { phases }),
};
