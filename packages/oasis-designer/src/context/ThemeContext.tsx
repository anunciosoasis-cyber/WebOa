import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Mode = 'light' | 'dark';

const lightTheme = {
  colors: {
    background: '#ffffff',
    surface: '#F9FAFB',
    primary: '#5b2ea6',   // Morado OASIS
    secondary: '#F59E0B', // Dorado OASIS
    border: 'rgba(42, 20, 74, 0.10)',
    canvas: '#E9E5F2',
    text: {
      primary: '#1B0D36',
      secondary: '#6B6385',
    }
  },
  fonts: {
    primary: "'Poppins', sans-serif",
    accent: "'Modern Age', 'Orbitron', sans-serif",
  }
};

const darkTheme = {
  colors: {
    background: '#1b0d36', // Midnight del admin
    surface: '#24124a',
    primary: '#F59E0B',
    secondary: '#A78BFA',
    border: 'rgba(255, 255, 255, 0.08)',
    canvas: '#140a2a',
    text: {
      primary: '#F5F3FF',
      secondary: '#A79FC4',
    }
  },
  fonts: {
    primary: "'Poppins', sans-serif",
    accent: "'Modern Age', 'Orbitron', sans-serif",
  }
};

interface ThemeContextType {
  mode: Mode;
  theme: typeof lightTheme;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * `mode` + `onToggleMode` lo controlan desde fuera (la app anfitriona comparte su modo claro/oscuro).
 * Sin ellos funciona en modo autónomo, guardando la preferencia propia.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode; mode?: Mode; onToggleMode?: () => void }> = ({ children, mode: controlledMode, onToggleMode }) => {
  const [ownMode, setOwnMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('oasis-theme-mode');
    return (saved as Mode) || 'light';
  });
  const mode = controlledMode ?? ownMode;

  const toggleMode = () => {
    if (onToggleMode) return onToggleMode();
    const newMode = mode === 'light' ? 'dark' : 'light';
    setOwnMode(newMode);
    localStorage.setItem('oasis-theme-mode', newMode);
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(mode);

    // Inyectar Poppins SOLO para la interfaz (UI), no para los elementos del diseño
    let styleTag = document.getElementById('global-font-override');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'global-font-override';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      /* Aplicar Poppins a toda la UI pero NO al contenedor del diseño */
      body, 
      header, 
      footer, 
      nav, 
      aside, 
      button, 
      input:not(#preview-container input), 
      select:not(#preview-container select), 
      textarea:not(#preview-container textarea),
      [role="tablist"],
      [class*="Ribbon"],
      [class*="Panel"],
      [class*="drawer"] {
        font-family: 'Poppins', sans-serif !important;
      }

      /* Asegurar que los elementos dentro del canvas mantengan su libertad tipográfica */
      #preview-container, #preview-container * {
        font-family: unset; /* Permite que las inline styles del renderizado ganen */
      }
      
      /* Reset para el body pero sin !important para permitir herencia controlada */
      body {
        font-family: 'Poppins', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
    `;
    return () => {
      styleTag?.remove();
      document.body.removeAttribute('data-theme');
      document.body.classList.remove('light', 'dark');
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
