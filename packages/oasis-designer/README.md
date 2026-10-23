# Frontend AdminAnnouncements

## Instalación y ejecución

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env` y ajusta la URL si es necesario.
3. Ejecuta la app:
   ```bash
   npm start
   ```

Esto levantará la app en modo desarrollo en http://localhost:3000

---

Asegúrate de que el backend esté corriendo en http://localhost:3001 para que la app funcione correctamente.

---

## Componentes Destacados

### RibbonMenu (Barra de Herramientas Premium)

El componente `RibbonMenu` es la interfaz principal para editar los elementos en el área de diseño. 

**Características principales:**
- **Lazy Loading & Prefetching:** Las pestañas (`RibbonTabInicio`, etc.) se cargan dinámicamente (`React.lazy`) para mantener el bundle inicial ligero, utilizando un `LoadingSpinner` a través de `React.Suspense` para una mejor UX. Se implementa un mecanismo de `prefetch` en segundo plano para las pestañas más importantes.
- **Tokens de Diseño:** Todo el esquema de colores y estilización centralizados en `src/styles/designTokens.css`.
- **Tema Claro / Oscuro:** Soporta la prop `theme="light" | "dark"`, la cual intercambia los colores base dinámicamente usando variables CSS.
- **Accesibilidad:** Soporte integrado para navegación por teclado (flechas y Enter) y etiquetas ARIA correspondientes para uso con lectores de pantalla.

**Ejemplo de Integración:**
```tsx
import RibbonMenu, { RibbonTab } from './components/RibbonMenu';
import { useState } from 'react';

const AppEditor = () => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('inicio');

  return (
    <RibbonMenu 
      activeRibbonTab={activeTab} 
      setActiveRibbonTab={setActiveTab}
      theme="light" 
      formData={formData} 
      set={setFormData}
      // ...otras props requeridas
    />
  );
};
```
