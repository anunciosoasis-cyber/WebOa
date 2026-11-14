// Colores que el admin elige para cada evento (styles.primaryColor) usados como fondo, texto o íconos.

const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

/** Color del evento, salvo que sea casi blanco o inválido: ahí desaparece sobre fondos claros y se usa el de marca. */
export const safeAccent = (color, fallback = '#F59E0B') => (isHex(color) && luminance(color) <= 0.6 ? color : fallback);

/** Texto legible encima de un fondo de ese color. */
export const textOn = (color) => (isHex(color) && luminance(color) > 0.4 ? '#120C1F' : '#FFFFFF');

// Autocomprobación mínima (se ejecuta una vez al importar en desarrollo)
if (import.meta.env?.DEV) {
    console.assert(safeAccent('#fafafa') === '#F59E0B', 'safeAccent: casi blanco → dorado');
    console.assert(safeAccent('#4F46E5') === '#4F46E5', 'safeAccent: color válido se respeta');
    console.assert(safeAccent('rojo') === '#F59E0B', 'safeAccent: valor inválido → dorado');
    console.assert(textOn('#F59E0B') === '#120C1F' && textOn('#4F46E5') === '#FFFFFF', 'textOn: contraste');
}
