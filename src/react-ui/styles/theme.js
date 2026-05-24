/**
 * OASIS React Design System - PREMIUM GOLD EDITION
 */

export const createTheme = (mode = 'dark') => {
    const isDark = mode === 'dark';

    const shadowColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.05)';

    return {
        mode,
        spacing: (units) => `${units * 8}px`,

        colors: {
            primary: '#F59E0B', // Oasis Premium Gold
            secondary: '#120C1F', // Deep Midnight Purple
            accent: '#F59E0B', // Oasis Gold
            background: isDark ? '#0A0712' : '#FFFFFF', 
            surface: isDark ? '#120C1F' : '#ffffff', 
            surfaceAlt: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            text: {
                primary: isDark ? '#FFFFFF' : '#120C1F',
                secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                inverse: isDark ? '#120C1F' : '#FFFFFF'
            },
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        },

        glass: {
            background: isDark ? 'rgba(18, 12, 31, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(15px) saturate(160%)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '24px',
            boxShadow: `0 8px 32px ${shadowColor}`
        },

        shadows: {
            soft: `0 4px 12px ${shadowColor}`,
            medium: `0 12px 30px ${shadowColor}`,
            floating: `0 30px 60px ${shadowColor}`
        },

        fonts: {
            titles: "'Moonrising', 'Inter', sans-serif",
            body: "'Inter', sans-serif",
            brand: "'Moonrising', sans-serif",
            accent: "'Moonrising', sans-serif",
        }
    };
};

// export const theme = createTheme('light'); // Eliminado para evitar ciclos. Usar useTheme() o createTheme() directamente.
