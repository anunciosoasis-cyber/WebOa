/**
 * Calcula la luminancia relativa de un color hexadecimal.
 * @param hex Color en formato #RRGGBB
 * @returns Valor entre 0 (negro) y 1 (blanco)
 */
export const getLuminance = (hex: string): number => {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * Determina si un color es oscuro basándose en su luminancia.
 */
export const isDarkColor = (hex: string): boolean => {
  try {
    return getLuminance(hex) < 0.5;
  } catch (e) {
    return true; // Por defecto oscuro si hay error
  }
};

/**
 * Determina el mejor contraste (blanco o negro) para un color de fondo.
 */
export const getContrastColor = (hex: string): 'white' | 'black' => {
  return isDarkColor(hex) ? 'white' : 'black';
};
