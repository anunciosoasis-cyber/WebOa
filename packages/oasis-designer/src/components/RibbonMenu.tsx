import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type RibbonTab = 'inicio' | 'insertar' | 'diseño' | 'marca' | 'formato';

import RibbonTabInicio from './ribbon/RibbonTabInicio';
import RibbonTabInsertar from './ribbon/RibbonTabInsertar';
import RibbonTabDiseno from './ribbon/RibbonTabDiseno';
import RibbonTabMarca from './ribbon/RibbonTabMarca';
import RibbonTabFormato from './ribbon/RibbonTabFormato';


const TAB_LABELS: Record<RibbonTab, string> = {
  inicio:   'Inicio',
  insertar: 'Insertar',
  'diseño': 'Diseño',
  marca:    'Marca',
  formato:  'Formato',
};

// New interface for component props
/**
 * Props for the RibbonMenu component.
 *
 * @typedef {Object} RibbonMenuProps
 * @property {RibbonTab} activeRibbonTab - Currently selected tab.
 * @property {(tab: RibbonTab) => void} setActiveRibbonTab - Callback to change the active tab.
 * @property {'light' | 'dark'} [theme='light'] - Optional theme, defaults to "light".
 * @property {Record<string, any>} [key] - Additional props forwarded to tab components.
 */
export interface RibbonMenuProps {
  /** Currently selected tab */
  activeRibbonTab: RibbonTab;
  /** Callback to change the active tab */
  setActiveRibbonTab: (tab: RibbonTab) => void;
  /** Optional theme, defaults to 'light' */
  theme?: 'light' | 'dark';
  /** Solo el contenido de la pestaña, en columnas que se ajustan (panel deslizable móvil) */
  sheetMode?: boolean;
  /** Additional props passed down to tab components */
  [key: string]: any;
}

import '../styles/designTokens.css'; // import shared tokens
import styles from './RibbonMenu.module.css';
import LoadingSpinner from './LoadingSpinner';

const RibbonMenu: React.FC<RibbonMenuProps> = (props) => {
  const { activeRibbonTab, setActiveRibbonTab, theme, sheetMode } = props;
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Transición Orgánica: Deslizamiento suave sin deformación
  const tabVariants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 },
  };

  const handleKeyDown = (e: React.KeyboardEvent, tab: RibbonTab) => {
    const tabs = Object.keys(TAB_LABELS) as RibbonTab[];
    const idx = tabs.indexOf(tab);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveRibbonTab(tab);
    } else if (e.key === 'ArrowRight') {
      const next = tabs[(idx + 1) % tabs.length];
      setActiveRibbonTab(next);
    } else if (e.key === 'ArrowLeft') {
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      setActiveRibbonTab(prev);
    }
  };

  const renderTabContent = () => {
    switch (activeRibbonTab) {
      case 'inicio':
        return <RibbonTabInicio {...props} />;
      case 'insertar':
        return (
          <RibbonTabInsertar
            formData={props.formData}
            set={props.set}
            selectedElementId={props.selectedElementId}
            setSelectedElementId={props.setSelectedElementId}
            onOpenImageLibrary={props.onOpenImageLibrary}
          />
        );
      case 'diseño':
        return <RibbonTabDiseno formData={props.formData} set={props.set} />;
      case 'marca':
        return <RibbonTabMarca {...props} />;
      case 'formato':
        return <RibbonTabFormato formData={props.formData} set={props.set} />;
      default:
        return null;
    }
  };

  if (sheetMode) {
    return (
      <div className={`${styles.wrapper} ${theme === 'dark' ? styles.dark : styles.light} ${styles.sheet}`}>
        <div className={styles.sheetContent}>{renderTabContent()}</div>
      </div>
    );
  }

  return (!activeRibbonTab || typeof setActiveRibbonTab !== 'function') ? (
    <div className={styles.fallback}>
      <p>⚠️ Error: RibbonMenu recibió props inválidos.</p>
    </div>
  ) : (
    <div className={`${styles.wrapper} ${theme === 'dark' ? styles.dark : styles.light}`}> 
      {/* ── Navegación (Tabs) ── */}
      {isMobile ? (
        <div style={{ padding: '8px 16px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8f9fa', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <select 
            value={activeRibbonTab} 
            onChange={(e) => setActiveRibbonTab(e.target.value as RibbonTab)}
            style={{ 
              width: '100%', padding: '8px 12px', borderRadius: '8px', 
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#dee2e6'}`,
              background: theme === 'dark' ? '#2c1858' : '#fff',
              color: theme === 'dark' ? '#e2e8f0' : '#475569',
              fontWeight: 600, fontSize: '0.8rem', outline: 'none'
            }}
          >
            {(Object.keys(TAB_LABELS) as RibbonTab[]).map(tab => (
              <option key={tab} value={tab}>{TAB_LABELS[tab]}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className={styles.tabList} role="tablist">
          {(Object.keys(TAB_LABELS) as RibbonTab[]).map(tab => {
            const isActive = activeRibbonTab === tab;
            return (
              <motion.button
                key={tab}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveRibbonTab(tab)}
                onKeyDown={e => handleKeyDown(e, tab)}
                className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                whileHover={{ scale: 1.05 }}
              >
                {TAB_LABELS[tab]}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className={styles.activeUnderline}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Zona de Contenido Amplia (Canvas de Herramientas) ── */}
      <div className={styles.contentArea}>
        {renderTabContent()}
      </div>

      {/* Sombra inferior de profundidad */}
      <div className={styles.bottomShadow} />
    </div>
  );
};

export default RibbonMenu;