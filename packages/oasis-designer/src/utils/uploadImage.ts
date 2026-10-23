// Subida de imágenes a backend (Cloudinary/local)
import { getAuthHeaders } from './apiClient';
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL.replace(/\/$/, '')
  : `${RAW_API_URL.replace(/\/$/, '')}/api`;

export async function uploadAnnouncementImage(imageBase64) {
  const headers = getAuthHeaders();

  const res = await fetch(`${API_URL}/announcements/upload-image`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageBase64 })
  });
  if (!res.ok) throw new Error(`Error uploading image (HTTP ${res.status})`);
  return res.json();
}
