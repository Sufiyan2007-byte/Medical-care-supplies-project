/**
 * authService.js
 * Centralised API module for all authentication endpoints.
 * Reads base URL from VITE_API_URL env var (defaults to localhost:5000).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Generic fetch wrapper — throws a structured error object on non-2xx responses.
 * @param {string} path  - endpoint path (e.g. '/api/auth/login')
 * @param {object} opts  - fetch options
 */
async function request(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Attach http status so callers can branch on specific codes (e.g. 403)
    const err = new Error(data.message || 'An unexpected error occurred.');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ── Auth endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: object }}
 */
export async function login({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * GET /api/auth/me
 * @param {string} token
 * @returns {{ user: object }}
 */
export async function getMe(token) {
  return request('/api/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * POST /api/auth/signup  (stub — implemented in a future issue)
 */
export async function signup({ name, email, password }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * POST /api/auth/logout  (stub — implemented in a future issue)
 */
export async function logout(token) {
  return request('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * POST /api/auth/forgot-password  (stub — implemented in a future issue)
 */
export async function forgotPassword({ email }) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /api/auth/reset-password  (stub — implemented in a future issue)
 */
export async function resetPassword({ token, newPassword }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

/**
 * POST /api/auth/verify-email or GET /api/auth/verify-email?token=...
 */
export async function verifyEmail({ token }) {
  return request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
}

/**
 * POST /api/auth/resend-verification
 * @param {{ email: string }} payload
 * @returns {{ message: string }}
 */
export async function resendVerification({ email }) {
  return request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

