/**
 * cloudinaryDirectUpload.js
 * ──────────────────────────────────────────────────────────────────────────
 * Sube archivos directamente a Cloudinary desde el Frontend (Opción A).
 * El Backend NUNCA toca el binario — sólo genera la firma.
 *
 * Uso:
 *   import { uploadToCloudinary } from '@/api/cloudinaryDirectUpload';
 *
 *   const result = await uploadToCloudinary(file);
 *   // result.secure_url → URL lista para guardar en el backend
 *
 * Requisito: el usuario debe estar autenticado (token en localStorage).
 */

import apiClient from './apiClient';   // tu axios con interceptor JWT

const MAX_FILE_SIZE_MB = 10;

/**
 * @param {File} file  Objeto File del <input type="file">
 * @returns {Promise<{secure_url: string, public_id: string, width: number, height: number}>}
 */
export async function uploadToCloudinary(file) {
  if (!(file instanceof File)) {
    throw new Error('Se requiere un objeto File válido.');
  }

  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB (${sizeMB.toFixed(1)} MB).`);
  }

  // 1. Obtener firma del backend (requiere JWT)
  const { data: sigData } = await apiClient.get('/cloudinary/signature');
  const { timestamp, signature, folder, api_key, cloud_name } = sigData;

  // 2. Construir FormData para Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', api_key);
  formData.append('folder', folder);

  // 3. Subir directamente a Cloudinary (NO pasa por el backend)
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;
  const response = await fetch(uploadUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Cloudinary error ${response.status}`);
  }

  const result = await response.json();
  return {
    secure_url: result.secure_url,   // URL pública HTTPS
    public_id: result.public_id,     // ID interno para borrar/transformar
    width: result.width ?? null,
    height: result.height ?? null,
    format: result.format ?? null,
  };
}

/**
 * Hook React sencillo para usar en componentes.
 *
 * Ejemplo:
 *   const { upload, loading, error } = useCloudinaryUpload();
 *   <input type="file" onChange={e => upload(e.target.files[0]).then(r => setUrl(r.secure_url))} />
 */
export function useCloudinaryUpload() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const upload = React.useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadToCloudinary(file);
      return result;
    } catch (err) {
      setError(err.message ?? 'Error al subir archivo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, loading, error };
}

// Añadir import de React solo cuando se usa el hook
import React from 'react';
