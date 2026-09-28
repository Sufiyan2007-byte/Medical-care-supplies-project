/**
 * orderService.js — customer order endpoints.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** POST /api/orders — prices are decided by the server, only sku/name/quantity are sent. */
export function placeOrder(payload, token) {
  return request('/api/orders', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}

/** GET /api/orders/mine */
export function getMyOrders(token) {
  return request('/api/orders/mine', { headers: { Authorization: `Bearer ${token}` } });
}
