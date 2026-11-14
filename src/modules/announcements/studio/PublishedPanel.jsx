import React, { useEffect, useState } from 'react';
import { CalendarClock, Loader2, Pencil, Send, Trash2, X } from 'lucide-react';

/** formData del anuncio: texto JSON u objeto según el origen */
export const flyerOf = (ann) => {
    try {
        const form = typeof ann?.formData === 'string' ? JSON.parse(ann.formData) : ann?.formData;
        return form?.flyer ? form : null;
    } catch {
        return null;
    }
};

/**
 * Anuncios publicados: editar (vuelve al asistente con sus datos) o eliminar.
 * Los que no salieron del motor (diseño libre) solo se pueden eliminar desde aquí.
 */
export default function PublishedPanel({ items, loading, editingId, onEdit, onDelete, onClose }) {
    const [confirmId, setConfirmId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const remove = async (ann) => {
        setDeletingId(ann.id);
        try {
            await onDelete(ann);
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    return (
        <div className="ann-drawer-backdrop" onClick={onClose}>
            <aside className="ann-drawer" role="dialog" aria-modal="true" aria-label="Anuncios publicados" onClick={(e) => e.stopPropagation()}>
                <div className="ann-panel-head">
                    <h3>Publicados {items.length > 0 && `(${items.length})`}</h3>
                    <button type="button" className="ann-btn ann-btn-ghost" onClick={onClose} aria-label="Cerrar">
                        <X size={16} />
                    </button>
                </div>

                <div className="ann-drawer-list">
                    {loading && <div className="ann-note" style={{ padding: 16 }}><Loader2 size={14} className="ann-spin" /> Cargando anuncios…</div>}
                    {!loading && items.length === 0 && <div className="ann-note" style={{ padding: 16 }}>Aún no hay anuncios publicados.</div>}

                    {items.map((ann) => {
                        const form = flyerOf(ann);
                        const fromTelegram = form?.source === 'telegram';
                        const isEditing = editingId === ann.id;
                        return (
                            <article key={ann.id} className="ann-pub-item" data-editing={isEditing || undefined}>
                                {ann.imageUrl ? <img src={ann.imageUrl} alt="" className="ann-pub-thumb" loading="lazy" /> : <div className="ann-pub-thumb" />}
                                <div className="ann-pub-body">
                                    {ann.tag && <span className="ann-pub-tag">{ann.tag}</span>}
                                    <strong className="ann-pub-title">{ann.title || 'Anuncio'}</strong>
                                    <span className="ann-pub-meta">
                                        {fromTelegram && <><Send size={11} /> Telegram · </>}
                                        {ann.date ? <><CalendarClock size={11} /> Visible hasta {ann.date}</> : 'Sin vencimiento'}
                                    </span>

                                    {confirmId === ann.id ? (
                                        <div className="ann-pub-actions">
                                            <span className="ann-pub-confirm">¿Eliminarlo de la web?</span>
                                            <button type="button" className="ann-btn ann-btn-sm ann-btn-danger" onClick={() => remove(ann)} disabled={deletingId === ann.id}>
                                                {deletingId === ann.id ? <Loader2 size={12} className="ann-spin" /> : <Trash2 size={12} />} Eliminar
                                            </button>
                                            <button type="button" className="ann-btn ann-btn-sm" onClick={() => setConfirmId(null)}>Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="ann-pub-actions">
                                            <button
                                                type="button"
                                                className="ann-btn ann-btn-sm"
                                                onClick={() => onEdit(ann, form)}
                                                disabled={!form || isEditing}
                                                title={form ? 'Abrir en el asistente para cambiarlo' : 'Hecho en diseño libre: no se puede editar aquí'}
                                            >
                                                <Pencil size={12} /> {isEditing ? 'Editando' : 'Editar'}
                                            </button>
                                            <button type="button" className="ann-btn ann-btn-sm ann-btn-ghost-danger" onClick={() => setConfirmId(ann.id)} aria-label={`Eliminar ${ann.title}`}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
                <p className="ann-drawer-foot">Se muestran los anuncios vigentes en la web.</p>
            </aside>
        </div>
    );
}
