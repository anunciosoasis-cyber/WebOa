// Helper functions for AdminAnnouncements

/**
 * Convierte una URL remota a base64.
 * Si la URL ya es base64 o es local (empieza con / o blob:) la devuelve sin cambios.
 */
export const toBase64 = async (url) => {
    if (!url) return null;
    // Ya es data URL o es una ruta local bundleada por Vite — no necesita conversión
    if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) return url;
    try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result);
            r.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

export const loadImg = (src) => new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});
