import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, PenTool } from 'lucide-react';
import { OasisDesigner } from '@oasis/designer';
import { useTheme } from '../../react-ui/ThemeContext';
import useAppMode from '../../hooks/useAppMode';
import FlyerStudio from './studio/FlyerStudio';
import { toDesignerData } from './canvas/toDesignerData';
import './announcements.css';

/**
 * Admin → Anuncios: "Diseño automático" (asistente + motor OASIS, el mismo del bot de Telegram)
 * o "Diseño libre" (editor @oasis/designer). AdminLayout lo muestra a pantalla completa (EDITOR_ROUTES).
 */
export default function AnnouncementsAdminPage() {
    const { mode, toggleMode } = useTheme();
    const { isMobile } = useAppMode();
    const navigate = useNavigate();
    const [view, setView] = useState('auto');
    // Flyer automático abierto en el editor libre; la key remonta el editor con esos datos
    const [canvasSeed, setCanvasSeed] = useState(null);

    const openInCanvas = (payload, options) => {
        setCanvasSeed({ key: Date.now(), data: toDesignerData(payload, options) });
        setView('free');
    };

    return (
        <div className="ann" data-mode={mode}>
            <div className="ann-topbar">
                <div className="ann-header-block">
                    <span className="ann-eyebrow">IA HUB</span>
                    <h1 className="ann-title">
                        ANUNCIOS <span className="ann-title-accent">OASIS</span>
                    </h1>
                </div>
                <div className="ann-segmented" role="tablist" aria-label="Modo de diseño">
                    <button type="button" role="tab" aria-selected={view === 'auto'} onClick={() => setView('auto')}>
                        <LayoutTemplate size={14} /> Diseño automático
                    </button>
                    <button type="button" role="tab" aria-selected={view === 'free'} onClick={() => setView('free')}>
                        <PenTool size={14} /> Diseño libre
                    </button>
                </div>
            </div>
            {view === 'auto' ? (
                <FlyerStudio isDark={mode === 'dark'} onOpenInCanvas={openInCanvas} />
            ) : (
                <OasisDesigner
                    key={canvasSeed?.key ?? 'libre'}
                    initialData={canvasSeed?.data}
                    mode={mode}
                    onToggleMode={toggleMode}
                    height={isMobile ? 'calc(100dvh - 64px)' : 'calc(100dvh - 104px)'}
                    onBack={isMobile ? () => navigate('/admin') : undefined}
                />
            )}
        </div>
    );
}
