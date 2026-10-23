# Nueva estructura recomendada para frontend

- src/
  - components/         # Componentes React reutilizables
  - context/            # Contextos globales (ThemeContext, etc)
  - assets/
    - logos/            # Imágenes de logotipos
  - utils/              # Utilidades y helpers
  - App.tsx             # Componente raíz
  - main.tsx            # Entry point
  - index.css           # Estilos globales
- public/
  - index.html          # HTML principal
- package.json, tsconfig.json, vite.config.ts, etc. en la raíz

Coloca los archivos de imagen en src/assets/logos/ y ajusta los imports en los componentes.

Para migrar:
- Mueve los componentes a src/components/
- Mueve ThemeContext a src/context/
- Mueve utilidades a src/utils/
- Mueve imágenes a src/assets/logos/
- Ajusta los imports en todo el código
- Usa src/App.tsx y src/main.tsx como entry

Esto hará el frontend independiente y ordenado.