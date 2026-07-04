import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import apiClient from '../../api/client';

// Configurar el worker de forma segura usando CDN estable
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Componente de página mejorado con estilos explícitos para evitar pantallas en blanco
const FlipPdfPage = React.forwardRef(({ pageNumber, zoom, isVisible }, ref) => {
    return (
        <div
            className="pdf-book-page"
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div className="pdf-book-page-inner" style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                {/* MEJORA VELOCIDAD: Solo renderiza si la página está cerca de ser vista */}
                {isVisible ? (
                    <Page
                        pageNumber={pageNumber}
                        scale={zoom}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        width={450} // Ayuda al cálculo de dimensiones iniciales
                        loading={
                            <div style={{ color: '#667085', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>
                                Cargando...
                            </div>
                        }
                    />
                ) : (
                    <div style={{ color: '#98a2b3', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        Preparando página {pageNumber}...
                    </div>
                )}
                <span className="pdf-page-number" style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '0.75rem', color: '#667085', fontWeight: 600 }}>
                    {pageNumber}
                </span>
            </div>
        </div>
    );
});
FlipPdfPage.displayName = 'FlipPdfPage';

const PdfReader = ({ isOpen, initialResource, onlinePdfResources, onClose, downloadViaBackend }) => {
    const [viewerPage, setViewerPage] = useState(1);
    const [viewerDate, setViewerDate] = useState('');
    const [viewerSelectedId, setViewerSelectedId] = useState('');
    const [viewerTotalPages, setViewerTotalPages] = useState(0);
    const [viewerZoom, setViewerZoom] = useState(1);
    const [viewerIsDouble, setViewerIsDouble] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 960 : true));
    const [viewerLoadError, setViewerLoadError] = useState('');
    const [viewerPdfData, setViewerPdfData] = useState(null);
    const [viewerPdfLoading, setViewerPdfLoading] = useState(false);

    const flipBookRef = useRef(null);
    const viewerWrapperRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (isOpen && initialResource) {
            setViewerSelectedId(String(initialResource.id));
            setViewerPage(1);
            setViewerTotalPages(0);
            setViewerZoom(1);
            setViewerLoadError('');
            setViewerPdfData(null);
            setViewerDate('');
        }
    }, [isOpen, initialResource]);

    useEffect(() => {
        const onResize = () => setViewerIsDouble(window.innerWidth >= 960);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const filteredOnlinePdfs = useMemo(() => {
        if (!viewerDate) return onlinePdfResources;
        return onlinePdfResources.filter((item) => {
            if (!item.createdAt) return false;
            return new Date(item.createdAt).toISOString().slice(0, 10) === viewerDate;
        });
    }, [onlinePdfResources, viewerDate]);

    const currentViewerResource = useMemo(() => {
        if (!viewerSelectedId) return initialResource;
        return onlinePdfResources.find((item) => String(item.id) === String(viewerSelectedId)) || initialResource;
    }, [viewerSelectedId, initialResource, onlinePdfResources]);

    const currentViewerUrl = useMemo(() => {
        if (!currentViewerResource?.url) return '';
        let finalUrl = currentViewerResource.url;
        
        // Corregir URLs hardcodeadas de localhost a la URL de la API real en producción
        const apiBase = (apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
        if (apiBase && finalUrl.includes('localhost:') && !apiBase.includes('localhost:')) {
            finalUrl = finalUrl.replace(/https?:\/\/localhost:\d+/, apiBase);
        }

        // Forzar HTTPS solo si no es localhost
        if (finalUrl.startsWith('http://') && !finalUrl.includes('localhost')) {
            finalUrl = finalUrl.replace('http://', 'https://');
        }

        return finalUrl.replace(/\/upload\/fl_attachment:[^/]+\//, '/upload/');
    }, [currentViewerResource]);

    const currentViewerFile = useMemo(() => {
        if (viewerPdfData) return { data: viewerPdfData };
        return currentViewerUrl || '';
    }, [viewerPdfData, currentViewerUrl]);

    useEffect(() => {
        let isMounted = true;
        const loadPdfBinary = async () => {
            if (!isOpen || !currentViewerResource?.id) return;
            if (isMounted) { setViewerPdfLoading(true); setViewerPdfData(null); }

            try {
                const { data } = await apiClient.get(`/resources/${currentViewerResource.id}/download`, {
                    responseType: 'arraybuffer',
                });
                if (isMounted) setViewerPdfData(new Uint8Array(data));
            } catch (error) {
                console.warn('Usando URL directa por fallo en binario.', error);
                if (isMounted) setViewerPdfData(null);
            } finally {
                if (isMounted) setViewerPdfLoading(false);
            }
        };
        loadPdfBinary();
        return () => { isMounted = false; };
    }, [isOpen, currentViewerResource]);

    const goToPdfPage = (targetPage) => {
        if (!viewerTotalPages) return;
        const safePage = Math.max(1, Math.min(viewerTotalPages, targetPage));
        setViewerPage(safePage);
        const book = flipBookRef.current?.pageFlip?.();
        if (book) book.flip(safePage - 1);
    };

    const pageStep = viewerIsDouble ? 2 : 1;

    const isPageVisible = (index) => {
        const pageNum = index + 1;
        return pageNum >= viewerPage - 2 && pageNum <= viewerPage + 2;
    };

    if (!isOpen || !currentViewerResource) return null;

    return (
        <AnimatePresence>
            {/* ESTILOS INYECTADOS DINÁMICAMENTE PARA SOBREESCRIBIR REACT-PDF */}
            <style>{`
                .pdf-book-page .react-pdf__Page {
                    width: 100% !important;
                    height: 100% !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    background: transparent !important;
                }
                .pdf-book-page .react-pdf__Page__canvas {
                    width: 100% !important;
                    height: 100% !important;
                    max-height: 100% !important;
                    object-fit: contain !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
                }
                .book-loading {
                    color: #475467;
                    font-size: 0.95rem;
                    font-weight: 500;
                    text-align: center;
                }
            `}</style>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="viewer-overlay" style={{ zIndex: 9999 }}>
                <div className="viewer-content" ref={viewerWrapperRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

                    {/* Header */}
                    <div className="viewer-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', minWidth: 0 }}>
                            <LucideIcons.FileText size={18} />
                            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentViewerResource.title}</span>
                        </div>
                        <button onClick={onClose} className="close-btn"><LucideIcons.X /></button>
                    </div>

                    {/* Toolbar Controles */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #edf0f6', flexWrap: 'wrap', background: '#fff' }}>
                        <LucideIcons.Calendar size={14} color="#475467" title="Fecha" />
                        <input
                            type="date"
                            value={viewerDate}
                            onChange={(e) => {
                                const nextDate = e.target.value;
                                setViewerDate(nextDate);
                                const list = nextDate
                                    ? onlinePdfResources.filter((item) => item.createdAt && new Date(item.createdAt).toISOString().slice(0, 10) === nextDate)
                                    : onlinePdfResources;
                                if (list.length > 0) {
                                    setViewerSelectedId(String(list[0].id));
                                    setViewerPage(1);
                                    setViewerTotalPages(0);
                                    setViewerLoadError('');
                                    setViewerPdfData(null);
                                }
                            }}
                            style={{ border: '1px solid #d0d5dd', borderRadius: '6px', padding: '4px 6px', fontSize: '0.8rem', maxWidth: '120px' }}
                        />

                        <LucideIcons.File size={14} color="#475467" title="Documento" />
                        <select
                            value={viewerSelectedId}
                            onChange={(e) => {
                                setViewerSelectedId(e.target.value);
                                setViewerPage(1);
                                setViewerTotalPages(0);
                                setViewerLoadError('');
                                setViewerPdfData(null);
                            }}
                            style={{ border: '1px solid #d0d5dd', borderRadius: '6px', padding: '4px 6px', minWidth: '100px', maxWidth: '100%', flex: 1, fontSize: '0.8rem' }}
                        >
                            {filteredOnlinePdfs.map((pdf) => (
                                <option key={pdf.id} value={String(pdf.id)}>
                                    {pdf.title}
                                </option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button className="btn-action secondary" onClick={() => goToPdfPage(viewerPage - pageStep)}>
                                <LucideIcons.ChevronLeft size={14} />
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={viewerTotalPages || undefined}
                                value={viewerPage}
                                onChange={(e) => goToPdfPage(Number(e.target.value) || 1)}
                                style={{ width: '45px', border: '1px solid #d0d5dd', borderRadius: '6px', padding: '4px', textAlign: 'center', fontSize: '0.8rem' }}
                                title="Página actual"
                            />
                            <span style={{ fontSize: '0.75rem', color: '#667085' }}>/ {viewerTotalPages || '--'}</span>
                            <button className="btn-action secondary" onClick={() => goToPdfPage(viewerPage + pageStep)}>
                                <LucideIcons.ChevronRight size={14} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <button className="btn-action secondary" onClick={() => {
                                if (!document.fullscreenElement) {
                                    viewerWrapperRef.current?.requestFullscreen().catch(err => console.log(err));
                                } else {
                                    document.exitFullscreen();
                                }
                            }} title="Pantalla Completa">
                                {isFullscreen ? <LucideIcons.Shrink size={14} /> : <LucideIcons.Expand size={14} />}
                            </button>

                            <button className="btn-action secondary" onClick={() => setViewerIsDouble((v) => !v)} title={viewerIsDouble ? 'Cambiar a una página' : 'Cambiar a doble página'}>
                                {viewerIsDouble ? <LucideIcons.FileText size={14} /> : <LucideIcons.BookOpen size={14} />}
                            </button>

                            <button className="btn-action primary" onClick={() => downloadViaBackend(currentViewerResource)} title="Descargar" style={{ padding: '4px 8px' }}>
                                <LucideIcons.Download size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Contenedor del Libro con Estilos Inline Completos */}
                    <div
                        className="book-viewer-shell"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '0px',
                            width: '100%',
                            flex: 1,
                            background: '#f2f4f7',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {viewerPdfLoading && <div className="book-loading" style={{ position: 'absolute', zIndex: 5 }}>Descargando archivo pesado...</div>}

                        <Document
                            file={currentViewerFile}
                            onLoadSuccess={({ numPages }) => {
                                setViewerTotalPages(numPages);
                                setViewerPage((p) => Math.min(Math.max(1, p), numPages));
                            }}
                            onLoadError={() => setViewerLoadError('error')}
                            loading={<div className="book-loading">Analizando páginas del PDF...</div>}
                        >
                            {viewerTotalPages > 0 ? (
                                <HTMLFlipBook
                                    key={`${currentViewerResource.id}-${viewerIsDouble}`}
                                    ref={flipBookRef}
                                    width={viewerIsDouble ? 500 : 420}
                                    height={viewerIsDouble ? 700 : 600}
                                    size="stretch"
                                    minWidth={300}
                                    maxWidth={viewerIsDouble ? 1400 : 1000}
                                    minHeight={400}
                                    maxHeight={1800}
                                    maxShadowOpacity={0.15}
                                    showCover={false}
                                    mobileScrollSupport
                                    usePortrait={!viewerIsDouble}
                                    onFlip={(event) => {
                                        const next = (event?.data ?? 0) + 1;
                                        setViewerPage(next);
                                    }}
                                    className="pdf-flip-book"
                                >
                                    {Array.from({ length: viewerTotalPages }, (_, index) => (
                                        <FlipPdfPage
                                            key={`pdf-page-${index + 1}`}
                                            pageNumber={index + 1}
                                            zoom={viewerZoom}
                                            isVisible={isPageVisible(index)}
                                        />
                                    ))}
                                </HTMLFlipBook>
                            ) : null}
                        </Document>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PdfReader;