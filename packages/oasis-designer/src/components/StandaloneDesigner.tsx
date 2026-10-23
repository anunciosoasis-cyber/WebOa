import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import AdminAnnouncements from './AdminAnnouncements';
import type { ComponentProps } from 'react';
import '../assets/fonts/fonts.css';
import '../../src/index.css';

/**
 * OasisDesigner - Standalone Component
 * This component includes all necessary providers and global styles.
 */
interface OasisDesignerProps {
  /** Modo claro/oscuro de la app anfitriona; sin él, el editor usa su preferencia propia. */
  mode?: 'light' | 'dark';
  onToggleMode?: () => void;
  /** Alto del editor; por defecto toda la ventana (uso autónomo). */
  height?: string;
  onBack?: () => void;
  /** Datos iniciales del lienzo (p. ej. { imageUrl } con un flyer de plantilla para editarlo a mano). */
  initialData?: ComponentProps<typeof AdminAnnouncements>['initialData'];
}

const OasisDesigner: React.FC<OasisDesignerProps> = ({ mode, onToggleMode, height = '100vh', onBack, initialData }) => {
  return (
    <ThemeProvider mode={mode} onToggleMode={onToggleMode}>
      <div className="oasis-designer-standalone" style={{ width: '100%', height, overflow: 'hidden' }}>
        <AdminAnnouncements onBack={onBack} initialData={initialData} />
      </div>
    </ThemeProvider>
  );
};

export default OasisDesigner;
export { OasisDesigner };
