import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import apiClient from '../../api/client';

const PdfReader = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [resource, setResource] = useState(location.state?.resource || null);
    const [loading, setLoading] = useState(!location.state?.resource);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const apiBase = (apiClient.defaults.baseURL || '').replace(/\/$/, '');

    useEffect(() => {
        const loadResource = async () => {
            if (resource) return;
            try {
                const { data } = await apiClient.get('/resources');
                const found = (data || []).find((item) => String(item.id) === String(id));
                if (!found) {
                    setError('No se encontró el recurso PDF.');
                    return;
                }
                setResource({
                    id: found.id,
                    title: found.title,
                    downloadUrl: found.downloadUrl || found.download_url || '',
                    isDownloadable: found.isDownloadable ?? found.is_downloadable ?? found.actionType === 'download',
                    contentType: found.contentType || found.content_type || 'other',
                });
            } catch {
                setError('No se pudo cargar el recurso PDF.');
            } finally {
                setLoading(false);
            }
        };

        loadResource();
    }, [id, resource]);

    const viewerUrl = useMemo(() => {
        if (!resource?.downloadUrl) return '';
        const hasHash = resource.downloadUrl.includes('#');
        const pageHash = `page=${page}&view=FitH`;
        return `${resource.downloadUrl}${hasHash ? '&' : '#'}${pageHash}`;
    }, [resource, page]);

    const onDownload = () => {
        if (!resource?.id) return;
        const link = document.createElement('a');
        link.href = `${apiBase}/resources/${resource.id}/download`;
        link.setAttribute('download', resource.title || `recurso-${resource.id}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div style={{ padding: '120px 20px', textAlign: 'center' }}>Cargando lector PDF...</div>;
    }

    if (error || !resource?.downloadUrl) {
        return (
            <div style={{ padding: '120px 20px', textAlign: 'center' }}>
                <p>{error || 'No hay URL de PDF para visualizar.'}</p>
                <button onClick={() => navigate('/recursos')}>Volver a Recursos</button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f6f7fb', paddingBottom: '32px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/recursos')} style={btnGhost}>
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#101828', fontWeight: 700 }}>
                        <FileText size={18} />
                        <span>{resource.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onDownload} style={btnPrimary}>
                            <Download size={16} /> Descargar PDF
                        </button>
                        <a href={resource.downloadUrl} target="_blank" rel="noreferrer" style={btnGhostLink}>
                            <ExternalLink size={16} /> Abrir externo
                        </a>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <button style={btnGhost} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        <ChevronLeft size={16} /> Pagina anterior
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '88px', textAlign: 'center' }}>Pagina {page}</span>
                    <button style={btnGhost} onClick={() => setPage((p) => p + 1)}>
                        Pagina siguiente <ChevronRight size={16} />
                    </button>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 15px 50px rgba(0,0,0,0.09)', overflow: 'hidden', border: '1px solid #e8ebf3' }}>
                    <iframe
                        src={viewerUrl}
                        title={resource.title}
                        style={{ width: '100%', height: 'calc(100vh - 220px)', border: 'none', minHeight: '640px' }}
                    />
                </div>
            </div>
        </div>
    );
};

const btnPrimary = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    background: '#f59e0b',
    color: '#141118',
    borderRadius: '999px',
    padding: '10px 16px',
    fontWeight: 800,
    cursor: 'pointer',
};

const btnGhost = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #d8deea',
    background: '#fff',
    color: '#263041',
    borderRadius: '999px',
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
};

const btnGhostLink = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #d8deea',
    background: '#fff',
    color: '#263041',
    borderRadius: '999px',
    padding: '10px 14px',
    fontWeight: 700,
    textDecoration: 'none',
};

export default PdfReader;
