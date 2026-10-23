// Simple API client for announcements
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL.replace(/\/$/, '')
  : `${RAW_API_URL.replace(/\/$/, '')}/api`;

// Misma resolución que frontend/src/api/client.js (resolveCurrentTenant): mantener ambas en sync.
export function resolveTenantId() {
  const stored = localStorage.getItem('active_tenant_id') || localStorage.getItem('tenant_id');
  if (stored) return stored;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return 'default';
  const parts = hostname.split('.');
  return parts.length >= 3 ? parts[0] : 'default';
}

export function getAuthHeaders(json = true) {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'X-Tenant-ID': resolveTenantId() };
  if (json) headers['Content-Type'] = 'application/json';
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function getErrorMessage(res, fallback) {
  try {
    const body = await res.json();
    if (body?.message) return Array.isArray(body.message) ? body.message.join(', ') : body.message;
  } catch {
    // ignore json parse errors
  }
  return `${fallback} (HTTP ${res.status})`;
}

export async function fetchAnnouncements() {
  const res = await fetch(`${API_URL}/announcements`, { headers: getAuthHeaders(false) });
  if (!res.ok) throw new Error('Error fetching announcements');
  return res.json();
}

export async function createAnnouncement(data) {
  const res = await fetch(`${API_URL}/announcements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Error creating announcement'));
  return res.json();
}

export async function updateAnnouncement(id, data) {
  const res = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Error updating announcement'));
  return res.json();
}

export async function deleteAnnouncement(id) {
  const res = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Error deleting announcement'));
  return res.json();
}
