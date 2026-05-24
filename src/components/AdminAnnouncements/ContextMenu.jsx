import React from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';

/**
 * Menú contextual dinámico para el editor vectorial
 */
const ContextMenu = ({ x, y, onAction, onClose }) => {
    return (
        <>
            <div className="context-menu-overlay" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="context-menu fluent-glass shadow-2xl"
                style={{ top: y, left: x }}
            >
                <button className="ctx-item" onClick={() => onAction('duplicate')}>
                    <Lucide.Copy size={14} /> <span>Duplicar</span>
                    <span className="shortcut">Ctrl+D</span>
                </button>
                <div className="ctx-divider" />
                <button className="ctx-item" onClick={() => onAction('front')}>
                    <Lucide.ArrowUpCircle size={14} /> <span>Traer al frente</span>
                </button>
                <button className="ctx-item" onClick={() => onAction('back')}>
                    <Lucide.ArrowDownCircle size={14} /> <span>Enviar al fondo</span>
                </button>
                <div className="ctx-divider" />
                <button className="ctx-item delete" onClick={() => onAction('delete')}>
                    <Lucide.Trash2 size={14} /> <span>Eliminar</span>
                    <span className="shortcut">Del</span>
                </button>
            </motion.div>

            <style>{`
                .context-menu-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999;
                }
                .context-menu {
                    position: fixed;
                    z-index: 1000;
                    min-width: 180px;
                    background: rgba(25, 25, 25, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 6px;
                    display: flex;
                    flex-direction: column;
                }
                .ctx-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    border: none;
                    background: transparent;
                    color: #e2e8f0;
                    font-size: 0.75rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 6px;
                    text-align: left;
                    transition: 0.2s;
                }
                .ctx-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
                .ctx-item.delete { color: #f87171; }
                .ctx-item.delete:hover { background: rgba(239, 68, 68, 0.1); }
                .ctx-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 4px 6px; }
                .shortcut { margin-left: auto; font-size: 0.6rem; color: #64748b; font-weight: 700; }
            `}</style>
        </>
    );
};

export default ContextMenu;
