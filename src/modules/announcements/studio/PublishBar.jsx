import React, { useState } from 'react';
import { Copy, Download, FileText, Loader2, MessageCircle, PenTool, RefreshCw, Send, Users } from 'lucide-react';

/** Acciones sobre el flyer: actualizar, descargar PNG, compartir por WhatsApp, editar en el lienzo y publicar. */
export default function PublishBar({
    ready,
    busy,
    pendingAssumptions,
    hasPreview,
    published,
    caption,
    sendOpen,
    onRefresh,
    onDownload,
    onWhatsapp,
    onToggleGroups,
    onOpenCanvas,
    onPublish,
    onCopyCaption,
}) {
    const [showCaption, setShowCaption] = useState(false);

    return (
        <div className="ann-publish-bar">
            <div className="ann-actions">
                <button
                    type="button"
                    className="ann-btn ann-btn-icon"
                    onClick={onRefresh}
                    disabled={!ready || Boolean(busy)}
                    title="Actualizar vista previa"
                    aria-label="Actualizar"
                >
                    <RefreshCw size={15} />
                </button>
                <button
                    type="button"
                    className="ann-btn ann-btn-icon"
                    onClick={onDownload}
                    disabled={!hasPreview}
                    title="Descargar flyer en PNG de alta resolución"
                    aria-label="Descargar"
                >
                    <Download size={15} />
                </button>
                <button
                    type="button"
                    className="ann-btn ann-btn-icon ann-btn-whatsapp"
                    onClick={onWhatsapp}
                    disabled={!hasPreview}
                    title="Compartir por WhatsApp (wa.me con texto e imagen)"
                    aria-label="Compartir por WhatsApp"
                >
                    <MessageCircle size={15} />
                </button>
                {published && (
                    <button
                        type="button"
                        className="ann-btn"
                        onClick={onToggleGroups}
                        aria-pressed={sendOpen}
                        title="Enviar a los grupos de la iglesia registrados vía el bot"
                    >
                        <Users size={14} /> Difundir a grupos
                    </button>
                )}
                <button
                    type="button"
                    className="ann-btn"
                    onClick={onOpenCanvas}
                    disabled={!hasPreview}
                    title="Abre el diseño en el editor libre con los textos como capas editables"
                >
                    <PenTool size={14} /> Editar en lienzo
                </button>
                <button
                    type="button"
                    className="ann-btn ann-btn-primary"
                    onClick={onPublish}
                    disabled={!ready || pendingAssumptions > 0 || Boolean(busy)}
                >
                    {busy === 'publish' ? <Loader2 size={14} className="ann-spin" /> : <Send size={14} />}
                    {busy === 'publish' ? 'Publicando…' : published ? 'Publicar de nuevo' : 'Publicar'}
                </button>
            </div>

            {pendingAssumptions > 0 && ready && (
                <div className="ann-note ann-note-warn">Confirma los datos marcados en «Datos del anuncio» para publicar.</div>
            )}
            {published && <div className="ann-note">Publicado en la web de la iglesia.</div>}

            {caption && (
                <div className="ann-caption-box">
                    <div className="ann-caption-header">
                        <button
                            type="button"
                            className="ann-caption-toggle"
                            onClick={() => setShowCaption((v) => !v)}
                            title={showCaption ? 'Ocultar texto para redes' : 'Ver texto para redes'}
                        >
                            <FileText size={13} />
                            <span>Texto para redes</span>
                            <span className="ann-caption-arrow">{showCaption ? '▲ Ocultar' : '▼ Ver'}</span>
                        </button>
                        <button
                            type="button"
                            className="ann-btn ann-btn-ghost ann-btn-sm ann-caption-copy"
                            onClick={onCopyCaption}
                            title="Copiar texto para redes"
                        >
                            <Copy size={12} /> Copiar
                        </button>
                    </div>
                    {showCaption && (
                        <div className="ann-caption-body">
                            <pre>{caption}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
