import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createTheme } from './styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('oasis_theme_mode') || 'light';
    });

    const theme = useMemo(() => createTheme(mode), [mode]);

    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    // Valor estable: evita re-renderizar a todos los consumidores en cada render del provider.
    const value = useMemo(() => ({ mode, toggleMode, theme }), [mode, toggleMode, theme]);

    useEffect(() => {
        localStorage.setItem('oasis_theme_mode', mode);
        document.body.style.backgroundColor = theme.colors.background;
    }, [mode, theme.colors.background]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
