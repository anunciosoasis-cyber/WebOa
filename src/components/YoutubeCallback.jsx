import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import GlassCard from '../react-ui/components/GlassCard';

const YoutubeCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Verificando código de acceso...');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (!code) {
            setStatus('No se encontró el código de autorización en la URL.');
            setTimeout(() => navigate('/admin/culto'), 3000);
            return;
        }

        const verifyCode = async () => {
            try {
                setStatus('Vinculando cuenta de YouTube...');
                await apiClient.post('/youtube/callback', { code });
                setStatus('¡Vinculación exitosa! Redirigiendo a la consola...');
                setTimeout(() => navigate('/admin/culto'), 2000);
            } catch (error) {
                console.error(error);
                setStatus('Ocurrió un error al vincular la cuenta. Verifica que los credenciales sean correctos.');
                setTimeout(() => navigate('/admin/culto'), 4000);
            }
        };

        verifyCode();
    }, [location, navigate]);

    return (
        <div className="d-flex align-items-center justify-content-center h-100 p-4">
            <GlassCard className="p-5 text-center d-flex flex-column align-items-center gap-4" style={{ maxWidth: '500px', borderRadius: '30px' }}>
                <Loader2 size={48} color="#FF0000" className="animate-spin" />
                <h4 style={{ fontFamily: 'Moonrising' }}>YOUTUBE <span style={{ color: '#F59E0B' }}>STUDIO</span></h4>
                <p className="opacity-75">{status}</p>
            </GlassCard>
        </div>
    );
};

export default YoutubeCallback;
