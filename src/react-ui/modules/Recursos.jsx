"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Solo los iconos que se buscan por nombre: `import *` arrastraba toda la librería al bundle.
import {
    BookOpen,
    Download,
    ExternalLink,
    File as FileIcon,
    FileText,
    FolderOpen,
    Image as ImageIcon,
    Link as LinkIcon,
    Music,
    Search,
    X
} from 'lucide-react';
import apiClient from '../../api/client';
import PdfReader from '../components/PdfReader';
import PageHero from '../components/PageHero';

const LucideIcons = {
    BookOpen,
    ExternalLink,
    File: FileIcon,
    FileText,
    Image: ImageIcon,
    Link: LinkIcon,
    Music,
    X
};

const Recursos = () => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewerOpen, setViewerOpen] = useState(null);
    const [audioPlaying, setAudioPlaying] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        softBg: '#F8F9FC',
        shadow: 'rgba(18, 12, 31, 0.12)'
    };

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const { data } = await apiClient.get('/resources');
                const normalized = (data || []).map((item) => ({
                    ...item,
                    resourceType: item.resourceType || item.resource_type || 'link',
                    contentType: item.contentType || item.content_type || 'other',
                    isDownloadable: item.isDownloadable ?? item.is_downloadable ?? item.actionType === 'download',
                    downloadUrl: item.downloadUrl || item.download_url || '',
                    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || '',
                    description: item.description || '',
                }));
                setResources(normalized);
            } catch (error) {
                console.error('Error loading resources', error);
                setResources([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    const getIcon = (item) => {
        if (item.contentType === 'image') return 'Image';
        if (item.contentType === 'pdf') return 'FileText';
        if (item.resourceType === 'info') return 'BookOpen';
        if (item.resourceType === 'link') return 'Link';
        return 'File';
    };

    const mappedResources = useMemo(() => {
        return resources.map((item) => ({
            id: item.id,
            title: item.title,
            dept: item.category,
            category: item.category,
            contentType: item.contentType,
            type: item.contentType,
            size: item.fileSizeBytes ? `${(Number(item.fileSizeBytes) / 1024 / 1024).toFixed(2)} MB` : '',
            url: item.downloadUrl,
            icon: getIcon(item),
            thumbnailUrl: item.thumbnailUrl,
            resourceType: item.resourceType,
            isDownloadable: item.isDownloadable,
            description: item.description,
            createdAt: item.createdAt,
        }));
    }, [resources]);

    const categories = useMemo(() => {
        const distinct = Array.from(new Set(mappedResources.map((item) => item.category).filter(Boolean)));
        return [{ id: 'all', label: 'Todo' }, ...distinct.map((cat) => ({ id: cat, label: cat }))];
    }, [mappedResources]);

    const filteredResources = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return mappedResources.filter((item) => {
            const matchesCat = filter === 'all' || item.category === filter;
            if (!matchesCat) return false;
            if (!q) return true;
            return (
                (item.title || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q) ||
                (item.category || '').toLowerCase().includes(q)
            );
        });
    }, [mappedResources, filter, searchQuery]);

    const onlinePdfResources = useMemo(() => {
        return mappedResources
            .filter((item) => item.contentType === 'pdf' && !item.isDownloadable && item.url)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [mappedResources]);

    const apiBase = (apiClient.defaults.baseURL || '').replace(/\/$/, '');

    const downloadViaBackend = (item) => {
        const link = document.createElement('a');
        link.href = `${apiBase}/resources/${item.id}/download`;
        link.setAttribute('download', item.title || `recurso-${item.id}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openResource = (item) => {
        if (item.resourceType === 'info') return;
        if (!item.url) return;
        if (item.isDownloadable) {
            downloadViaBackend(item);
            return;
        }
        if (item.contentType === 'pdf' && !item.isDownloadable) {
            setViewerOpen(item);
            return;
        }
        window.open(item.url, '_blank', 'noopener,noreferrer');
    };

    const getFormatBadge = (item) => {
        if (item.resourceType === 'info') return 'INFORMATIVO';
        if (item.contentType === 'pdf') return 'PDF';
        if (item.contentType === 'image') return 'IMAGEN';
        if (item.isDownloadable) return 'ARCHIVO';
        return 'ENLACE';
    };

    return (
        <div style={{ backgroundColor: colors.softBg, minHeight: '100vh', paddingBottom: '110px' }}>
            {/* 1. HERO CINEMATOGRÁFICO */}
            <PageHero
                id="recursos"
                eyebrow="Recursos multidepartamentales"
                title="BIBLIOTECA"
                accent="OASIS"
                subtitle="Archivos, guías de estudio, enlaces y material oficial de los departamentos de nuestra iglesia."
            />

            {/* 2. BARRA FLOTANTE DE FILTROS Y BÚSQUEDA */}
            <div className="container mb-5" style={{ maxWidth: '1160px', marginTop: '-44px', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '26px',
                        padding: '14px 18px',
                        boxShadow: '0 22px 48px -14px rgba(18, 12, 31, 0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
                        border: '1px solid rgba(18, 12, 31, 0.07)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                    }}
                >
                    {/* Category pills */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            flex: '1 1 auto',
                            padding: '2px'
                        }}
                        className="hide-scrollbar"
                    >
                        {categories.map((cat) => {
                            const active = filter === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '14px',
                                        border: active ? 'none' : '1px solid rgba(18, 12, 31, 0.06)',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.8px',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        backgroundColor: active ? colors.deepPurple : '#F8F9FC',
                                        color: active ? '#FFFFFF' : 'rgba(18, 12, 31, 0.65)',
                                        boxShadow: active ? '0 8px 18px rgba(18, 12, 31, 0.2)' : 'none'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search input + counter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 1 320px', width: '100%' }}>
                        <div
                            style={{
                                position: 'relative',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Search
                                size={16}
                                color="rgba(18, 12, 31, 0.45)"
                                style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar recurso..."
                                aria-label="Buscar recurso"
                                style={{
                                    width: '100%',
                                    padding: '10px 36px 10px 38px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(18, 12, 31, 0.08)',
                                    backgroundColor: '#F8F9FC',
                                    color: colors.deepPurple,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    outline: 'none'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Limpiar búsqueda"
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(18, 12, 31, 0.45)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: colors.deepPurple,
                                backgroundColor: 'rgba(245, 158, 11, 0.14)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {filteredResources.length}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* 3. GRILLA DE RECURSOS */}
            <div className="container" style={{ maxWidth: '1160px' }}>
                <div className="row g-4">
                    <AnimatePresence>
                        {loading ? (
                            [0, 1, 2].map((skeleton) => (
                                <div key={`sk-${skeleton}`} className="col-12 col-md-6 col-lg-4">
                                    <div
                                        style={{
                                            height: '360px',
                                            borderRadius: '26px',
                                            background: 'linear-gradient(110deg, #FFFFFF 30%, #F1F3F9 50%, #FFFFFF 70%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'recursos-skeleton 1.5s infinite linear',
                                            border: '1px solid rgba(18, 12, 31, 0.05)',
                                            boxShadow: '0 14px 34px -12px rgba(18, 12, 31, 0.08)'
                                        }}
                                    />
                                </div>
                            ))
                        ) : filteredResources.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="col-12"
                            >
                                <div
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '28px',
                                        padding: '64px 24px',
                                        textAlign: 'center',
                                        border: '1px solid rgba(18, 12, 31, 0.06)',
                                        boxShadow: '0 18px 44px -14px rgba(18, 12, 31, 0.1)'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '68px',
                                            height: '68px',
                                            borderRadius: '22px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                            border: '1px solid rgba(245, 158, 11, 0.28)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '18px'
                                        }}
                                    >
                                        <FolderOpen size={30} color={colors.accent} />
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: 'Moonrising, sans-serif',
                                            color: colors.deepPurple,
                                            fontSize: '1.3rem',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        {searchQuery || filter !== 'all'
                                            ? 'Sin coincidencias en la biblioteca'
                                            : 'Biblioteca en preparación'}
                                    </h3>
                                    <p
                                        style={{
                                            color: 'rgba(18, 12, 31, 0.62)',
                                            fontSize: '0.94rem',
                                            maxWidth: '420px',
                                            margin: '0 auto'
                                        }}
                                    >
                                        {searchQuery || filter !== 'all'
                                            ? 'No encontramos recursos con ese filtro. Intenta limpiar la búsqueda.'
                                            : 'Pronto encontrarás aquí guías, documentos y materiales de nuestros departamentos.'}
                                    </p>
                                    {(searchQuery || filter !== 'all') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilter('all');
                                                setSearchQuery('');
                                            }}
                                            style={{
                                                marginTop: '20px',
                                                padding: '10px 22px',
                                                borderRadius: '999px',
                                                border: 'none',
                                                backgroundColor: colors.deepPurple,
                                                color: '#FFFFFF',
                                                fontWeight: 800,
                                                fontSize: '0.78rem',
                                                letterSpacing: '1px',
                                                textTransform: 'uppercase',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Ver todos los recursos
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            filteredResources.map((item) => {
                                const Icon = LucideIcons[item.icon] || LucideIcons.File;
                                const formatBadge = getFormatBadge(item);
                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="col-12 col-md-6 col-lg-4"
                                    >
                                        <div
                                            style={{
                                                borderRadius: '26px',
                                                height: '380px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                boxShadow: '0 18px 42px -12px rgba(18, 12, 31, 0.14)',
                                                transition: 'all 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                border: item.thumbnailUrl
                                                    ? '1px solid rgba(255, 255, 255, 0.12)'
                                                    : '1px solid rgba(18, 12, 31, 0.07)',
                                                background: item.thumbnailUrl ? colors.midnight : '#FFFFFF'
                                            }}
                                            className="resource-card group"
                                        >
                                            <div className="resource-shimmer" />

                                            {item.thumbnailUrl && (
                                                <img
                                                    src={item.thumbnailUrl}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        transition: '0.6s',
                                                        opacity: 0.85
                                                    }}
                                                    className="book-cover-img"
                                                    alt={item.title}
                                                />
                                            )}

                                            <div
                                                style={{
                                                    position: 'relative',
                                                    zIndex: 2,
                                                    padding: '26px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    height: '100%',
                                                    background: item.thumbnailUrl
                                                        ? 'linear-gradient(180deg, rgba(8,5,13,0.18) 0%, rgba(18,12,31,0.94) 100%)'
                                                        : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                                    {!item.thumbnailUrl ? (
                                                        <div
                                                            style={{
                                                                width: '54px',
                                                                height: '54px',
                                                                borderRadius: '16px',
                                                                background: colors.deepPurple,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: colors.accent,
                                                                boxShadow: '0 8px 20px rgba(18, 12, 31, 0.16)'
                                                            }}
                                                        >
                                                            <Icon size={24} />
                                                        </div>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                fontSize: '0.62rem',
                                                                fontWeight: 900,
                                                                color: colors.midnight,
                                                                backgroundColor: colors.accent,
                                                                padding: '5px 10px',
                                                                borderRadius: '8px',
                                                                letterSpacing: '0.8px'
                                                            }}
                                                        >
                                                            {formatBadge}
                                                        </span>
                                                    )}

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                                        {!item.thumbnailUrl && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.6rem',
                                                                    fontWeight: 900,
                                                                    color: colors.deepPurple,
                                                                    background: 'rgba(245, 158, 11, 0.16)',
                                                                    padding: '5px 9px',
                                                                    borderRadius: '8px',
                                                                    letterSpacing: '0.6px'
                                                                }}
                                                            >
                                                                {formatBadge}
                                                            </span>
                                                        )}
                                                        {item.dept && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.62rem',
                                                                    fontWeight: 900,
                                                                    color: item.thumbnailUrl ? '#fff' : colors.accent,
                                                                    textTransform: 'uppercase',
                                                                    background: item.thumbnailUrl ? 'rgba(18, 12, 31, 0.65)' : colors.midnight,
                                                                    padding: '6px 11px',
                                                                    borderRadius: '10px',
                                                                    backdropFilter: 'blur(10px)',
                                                                    letterSpacing: '0.5px'
                                                                }}
                                                            >
                                                                {item.dept}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 'auto' }}>
                                                    <h4
                                                        style={{
                                                            color: item.thumbnailUrl ? '#fff' : colors.deepPurple,
                                                            fontSize: '1.2rem',
                                                            fontWeight: 800,
                                                            marginBottom: '8px',
                                                            lineHeight: 1.25
                                                        }}
                                                    >
                                                        {item.title}
                                                    </h4>

                                                    {item.description ? (
                                                        <p
                                                            style={{
                                                                color: item.thumbnailUrl ? 'rgba(255,255,255,0.74)' : 'rgba(18, 12, 31, 0.65)',
                                                                fontSize: '0.84rem',
                                                                lineHeight: 1.5,
                                                                marginBottom: '16px',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {item.description}
                                                        </p>
                                                    ) : (
                                                        <div style={{ marginBottom: '16px' }} />
                                                    )}

                                                    {item.size && (
                                                        <div
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                color: item.thumbnailUrl ? 'rgba(255,255,255,0.58)' : 'rgba(18, 12, 31, 0.45)',
                                                                marginBottom: '12px'
                                                            }}
                                                        >
                                                            Tamaño: {item.size}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button
                                                            onClick={() => openResource(item)}
                                                            className="btn-action primary"
                                                            disabled={item.resourceType === 'info' || !item.url}
                                                            style={{
                                                                flex: 1,
                                                                padding: '13px 16px',
                                                                background: item.thumbnailUrl ? colors.accent : colors.deepPurple,
                                                                color: item.thumbnailUrl ? colors.midnight : '#fff',
                                                                fontSize: '0.78rem',
                                                                gap: '8px'
                                                            }}
                                                        >
                                                            {item.isDownloadable && <Download size={15} />}
                                                            {item.resourceType === 'info'
                                                                ? 'INFORMATIVO'
                                                                : item.isDownloadable
                                                                    ? 'DESCARGAR'
                                                                    : 'LEER ONLINE'}
                                                        </button>

                                                        {item.url && !item.isDownloadable && item.resourceType !== 'info' && (
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn-action secondary"
                                                                aria-label="Abrir enlace externo"
                                                                style={{
                                                                    width: '48px',
                                                                    background: item.thumbnailUrl ? 'rgba(255,255,255,0.16)' : colors.softBg,
                                                                    color: item.thumbnailUrl ? '#fff' : colors.deepPurple,
                                                                    backdropFilter: 'blur(6px)'
                                                                }}
                                                            >
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 4. LECTOR ONLINE EMERGENTE */}
            <PdfReader
                isOpen={!!viewerOpen}
                initialResource={viewerOpen}
                onlinePdfResources={onlinePdfResources}
                onClose={() => setViewerOpen(null)}
                downloadViaBackend={downloadViaBackend}
            />

            {/* 5. REPRODUCTOR DE AUDIO FLOTANTE */}
            <AnimatePresence>
                {audioPlaying && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="audio-player">
                        <div className="d-flex align-items-center gap-3">
                            <div className="playing-icon">
                                <Music size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{audioPlaying.title}</div>
                                <audio autoPlay controls style={{ height: '30px', width: '100%', marginTop: '5px' }}>
                                    <source src={audioPlaying.url} type="audio/mpeg" />
                                </audio>
                            </div>
                            <button onClick={() => setAudioPlaying(null)} className="close-audio" aria-label="Cerrar audio">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .resource-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        115deg,
                        transparent 20%,
                        rgba(245, 158, 11, 0.12) 50%,
                        transparent 80%
                    );
                    transform: translateX(-135%);
                    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                    pointer-events: none;
                    z-index: 3;
                }
                .resource-card:hover .resource-shimmer {
                    transform: translateX(135%);
                }
                .resource-card:hover {
                    transform: translateY(-8px) scale(1.015);
                    border-color: rgba(245, 158, 11, 0.45) !important;
                    box-shadow: 0 28px 56px -14px rgba(18, 12, 31, 0.25) !important;
                }
                .resource-card:hover .book-cover-img {
                    transform: scale(1.07);
                    opacity: 0.95 !important;
                }
                .btn-action {
                    border: none;
                    border-radius: 14px;
                    font-weight: 800;
                    font-size: 0.75rem;
                    letter-spacing: 0.8px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                }
                .btn-action.primary:hover:not(:disabled) {
                    background: ${colors.accent} !important;
                    color: ${colors.midnight} !important;
                }
                .btn-action.primary:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                .viewer-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: rgba(8, 5, 13, 0.95);
                    backdrop-filter: blur(15px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }
                .viewer-content {
                    width: 100vw;
                    max-width: none;
                    height: 100vh;
                    background: #fff;
                    border-radius: 0;
                    overflow: hidden;
                    position: relative;
                }
                .viewer-header {
                    background: ${colors.midnight};
                    padding: 15px 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                }
                .book-viewer-shell {
                    height: calc(100% - 116px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top, #f6f7fb 0%, #eceff5 100%);
                    overflow: hidden;
                }
                .book-loading {
                    color: #475467;
                    font-weight: 700;
                }
                .pdf-flip-book { margin: 10px auto; }
                .pdf-book-page {
                    background: linear-gradient(180deg, #fff 0%, #f7f8fb 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e4e7ec;
                }
                .pdf-book-page-inner {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    padding: 8px;
                }
                .pdf-page-number {
                    position: absolute;
                    bottom: 8px;
                    right: 12px;
                    color: #667085;
                    font-size: 0.72rem;
                    font-weight: 700;
                }

                .react-pdf__Page {
                    box-shadow: 0 18px 35px rgba(16, 24, 40, 0.18);
                    border-radius: 6px;
                    overflow: hidden;
                    background: #fff;
                }
                .react-pdf__Page canvas {
                    max-width: 100% !important;
                    height: auto !important;
                }

                .audio-player {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 500px;
                    background: ${colors.deepPurple};
                    padding: 15px 25px;
                    border-radius: 25px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .playing-icon {
                    color: ${colors.accent};
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                @keyframes recursos-skeleton {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .close-audio {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                }

                .hide-scrollbar::-webkit-scrollbar { display: none; }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
                @media (max-width: 1024px) {
                    .viewer-overlay { padding: 16px; }
                    .viewer-content { height: 95vh; }
                }
            `}</style>
        </div>
    );
};

export default Recursos;
