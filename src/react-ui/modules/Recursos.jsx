"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import apiClient from '../../api/client';
import PdfReader from '../components/PdfReader';

const Recursos = () => {
    const [filter, setFilter] = useState('all');
    const [viewerOpen, setViewerOpen] = useState(null);
    const [audioPlaying, setAudioPlaying] = useState(null); // Para Audio
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        softBg: '#F8F9FC',
        shadow: 'rgba(0, 0, 0, 0.12)'
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

    const filteredResources = mappedResources.filter(item => filter === 'all' || item.category === filter);

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

    return (
        <div style={{ backgroundColor: colors.softBg, minHeight: '100vh', paddingBottom: '100px' }}>
            {/* 1. HEADER EDITORIAL */}
            <header style={{ padding: '160px 20px 60px', textAlign: 'center', background: `linear-gradient(to bottom, #fff 0%, ${colors.softBg} 100%)` }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <span style={{ color: colors.accent, fontWeight: '900', letterSpacing: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>Recursos Multidepartamentales</span>
                    <h2 style={{ fontFamily: 'Moonrising, sans-serif', color: colors.deepPurple, fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginTop: '15px' }}>
                        BIBLIOTECA <span style={{ color: colors.accent }}>OASIS</span>
                    </h2>
                    <div style={{ width: '60px', height: '4px', background: colors.accent, margin: '25px auto', borderRadius: '10px' }} />
                    <p style={{ color: '#64748b', margin: 0 }}>Recursos conectados al gestor: archivos, enlaces y contenido informativo.</p>
                </div>
            </header>

            {/* 2. SELECTOR DE CATEGORÍAS (ISLA CRISTAL) */}
            <div className="container mb-5" style={{ maxWidth: '1100px' }}>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '15px', background: '#fff', borderRadius: '25px', boxShadow: `0 10px 30px ${colors.shadow}` }} className="hide-scrollbar">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                            padding: '12px 25px', borderRadius: '15px', border: 'none', whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer', transition: '0.3s',
                            backgroundColor: filter === cat.id ? colors.deepPurple : 'transparent', color: filter === cat.id ? '#fff' : '#888'
                        }}>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. GRILLA DE RECURSOS */}
            <div className="container" style={{ maxWidth: '1100px' }}>
                <div className="row g-4">
                    <AnimatePresence>
                        {loading ? (
                            <div className="col-12">
                                <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', textAlign: 'center', color: '#64748b' }}>Cargando recursos...</div>
                            </div>
                        ) : null}
                        {filteredResources.map(item => {
                            const Icon = LucideIcons[item.icon] || LucideIcons.File;
                            return (
                                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-12 col-md-6 col-lg-4">
                                    <div style={{
                                        borderRadius: '24px', height: '380px', display: 'flex', flexDirection: 'column',
                                        boxShadow: `0 15px 40px -10px ${colors.shadow}`, transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        overflow: 'hidden', position: 'relative',
                                        background: item.thumbnailUrl ? '#000' : '#fff'
                                    }} className="resource-card group">
                                        {item.thumbnailUrl && (
                                            <img 
                                                src={item.thumbnailUrl} 
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s', opacity: 0.85 }} 
                                                className="book-cover-img" 
                                                alt={item.title} 
                                            />
                                        )}
                                        
                                        <div style={{ position: 'relative', zIndex: 2, padding: '25px', display: 'flex', flexDirection: 'column', height: '100%', background: item.thumbnailUrl ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.9) 100%)' : 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                {!item.thumbnailUrl && (
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${colors.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}>
                                                        <Icon size={24} />
                                                    </div>
                                                )}
                                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: item.thumbnailUrl ? '#fff' : colors.accent, textTransform: 'uppercase', background: item.thumbnailUrl ? 'rgba(0,0,0,0.5)' : colors.midnight, padding: '6px 12px', borderRadius: '10px', backdropFilter: 'blur(10px)', marginLeft: 'auto', letterSpacing: '0.5px' }}>
                                                    {item.dept}
                                                </span>
                                            </div>
                                            
                                            <div style={{ marginTop: 'auto' }}>
                                                <h4 style={{ color: item.thumbnailUrl ? '#fff' : colors.deepPurple, fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', lineHeight: 1.2 }}>{item.title}</h4>
                                                {item.description ? <p style={{ color: item.thumbnailUrl ? 'rgba(255,255,255,0.7)' : '#64748b', fontSize: '0.8rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p> : null}
                                                
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => openResource(item)} className="btn-action primary" disabled={item.resourceType === 'info' || !item.url} style={{ flex: 1, padding: '14px', background: item.thumbnailUrl ? colors.accent : colors.deepPurple, color: item.thumbnailUrl ? colors.midnight : '#fff', fontSize: '0.8rem' }}>
                                                        {item.resourceType === 'info'
                                                            ? 'INFO'
                                                            : item.isDownloadable
                                                            ? 'DESCARGAR'
                                                            : 'LEER'}
                                                    </button>
                                                    {item.url && !item.isDownloadable && item.resourceType !== 'info' && (
                                                        <a href={item.url} target="_blank" rel="noreferrer" className="btn-action secondary" aria-label="Abrir enlace" style={{ width: '50px', background: item.thumbnailUrl ? 'rgba(255,255,255,0.15)' : colors.softBg, color: item.thumbnailUrl ? '#fff' : colors.deepPurple, backdropFilter: 'blur(5px)' }}>
                                                            <LucideIcons.ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>            {/* 4. LECTOR ONLINE EMERGENTE */}
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
                            <div className="playing-icon"><LucideIcons.Music size={18} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>{audioPlaying.title}</div>
                                <audio autoPlay controls style={{ height: '30px', width: '100%', marginTop: '5px' }}>
                                    <source src={audioPlaying.url} type="audio/mpeg" />
                                </audio>
                            </div>
                            <button onClick={() => setAudioPlaying(null)} className="close-audio"><LucideIcons.X size={16} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .resource-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 30px 60px -15px rgba(0,0,0,0.3) !important; }
                .resource-card:hover .book-cover-img { transform: scale(1.08); opacity: 1 !important; }
                .btn-action { border: none; border-radius: 12px; font-weight: 800; font-size: 0.7rem; letter-spacing: 1px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
                .btn-action.primary { flex: 1; background: ${colors.deepPurple}; color: #fff; padding: 12px; }
                .btn-action.primary:hover { background: ${colors.accent}; color: ${colors.midnight}; }
                .btn-action.primary:disabled { opacity: 0.55; cursor: not-allowed; }
                .btn-action.secondary { width: 45px; background: ${colors.softBg}; color: ${colors.deepPurple}; }
                
                .viewer-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(8, 5, 13, 0.95); backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; padding: 40px; }
                .viewer-content { width: 100%; maxWidth: 1500px; height: 92vh; background: #fff; border-radius: 24px; overflow: hidden; position: relative; }
                .viewer-header { background: ${colors.midnight}; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
                .close-btn { background: none; border: none; color: #fff; cursor: pointer; }
                .book-viewer-shell { height: calc(100% - 116px); display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top, #f6f7fb 0%, #eceff5 100%); overflow: hidden; }
                .book-loading { color: #475467; font-weight: 700; }
                .pdf-flip-book { margin: 10px auto; }
                .pdf-book-page { background: linear-gradient(180deg, #fff 0%, #f7f8fb 100%); display: flex; align-items: center; justify-content: center; border: 1px solid #e4e7ec; }
                .pdf-book-page-inner { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 8px; }
                .pdf-page-number { position: absolute; bottom: 8px; right: 12px; color: #667085; font-size: 0.72rem; font-weight: 700; }

                .react-pdf__Page { box-shadow: 0 18px 35px rgba(16, 24, 40, 0.18); border-radius: 6px; overflow: hidden; background: #fff; }
                .react-pdf__Page canvas { max-width: 100% !important; height: auto !important; }

                .audio-player { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); width: 90%; maxWidth: 500px; background: ${colors.deepPurple}; padding: 15px 25px; borderRadius: 25px; boxShadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 9999; border: 1px solid rgba(255,255,255,0.1); }
                .playing-icon { color: ${colors.accent}; animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .close-audio { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; }

                .hide-scrollbar::-webkit-scrollbar { display: none; }
                @font-face { font-family: 'Moonrising'; src: url('/fonts/Moonrising.ttf'); }
                @media (max-width: 1024px) {
                    .viewer-overlay { padding: 16px; }
                    .viewer-content { height: 95vh; }
                }
            `}</style>
        </div>
    );
};

export default Recursos;