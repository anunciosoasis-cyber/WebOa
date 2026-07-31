import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const YoutubeLivePanel = () => {
    const [status, setStatus] = useState({ connected: false });
    const [broadcast, setBroadcast] = useState({ active: false, stats: { viewers: 0, likes: 0 } });
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [authError, setAuthError] = useState(false);

    // Solo comprobar el estado inicial al montar el componente
    useEffect(() => {
        checkStatus();
    }, []);

    // Polling del broadcast solo si estamos conectados
    useEffect(() => {
        let interval;
        if (status.connected) {
            fetchBroadcast(); // fetch immediately when connected
            interval = setInterval(() => {
                fetchBroadcast();
            }, 10000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status.connected]);

    const checkStatus = async () => {
        try {
            const res = await apiClient.get('/youtube/status');
            setStatus(res.data);
            if (res.data.connected) fetchBroadcast();
        } catch (e) {
            console.error("No se pudo conectar a Youtube Module", e);
        }
    };

    const fetchBroadcast = async () => {
        try {
            const res = await apiClient.get('/youtube/broadcast');
            setBroadcast(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const loginDirectly = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/youtube/auth-url');
            window.location.href = res.data.url;
        } catch (error) {
            setAuthError(true);
            setLoading(false);
            
            // Ocultar el mensaje después de 3 segundos
            setTimeout(() => {
                setAuthError(false);
            }, 3000);
        }
    };

    const handleDisconnect = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await apiClient.post('/youtube/logout');
        } catch (error) {
            console.warn('Backend logout failed, disconnecting locally anyway.');
        } finally {
            // Forzamos la desconexión a nivel de UI incluso si falló el backend
            setStatus({ connected: false });
            setBroadcast({ active: false, stats: { viewers: 0, likes: 0 } });
            setLoading(false);
        }
    };

    return (
        <div
            className="bg-ui-bg shadow-neumorph rounded-3xl p-5 flex flex-col items-center justify-center w-[165px] h-full min-h-[110px] select-none border border-white/50 relative overflow-hidden"
            data-purpose="yt-status"
        >
            {/* Título unificado en una sola línea (mismo flex) con la palabra STUDIO en bold y rojo */}
            <div className="font-moonrising text-[11px] uppercase tracking-wider text-gray-900 mb-2.5 whitespace-nowrap flex flex-row gap-1 justify-center items-center">
                <span>YOUTUBE</span>
                <span className="text-oasis-red font-bold">STUDIO</span>
            </div>

            {/* OVERLAY DE CONFIRMACIÓN CUSTOM */}
            {showConfirm && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center px-2 py-1">
                    <span className="text-[9px] font-bold text-gray-800 text-center uppercase tracking-wider mb-2 leading-tight">
                        ¿Desconectar canal?
                    </span>
                    <div className="flex gap-2 w-full justify-center">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="bg-gray-200 text-gray-600 text-[9px] font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-all"
                        >
                            NO
                        </button>
                        <button
                            onClick={handleDisconnect}
                            className="bg-oasis-red text-white text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-md hover:bg-red-600 transition-all"
                        >
                            SÍ
                        </button>
                    </div>
                </div>
            )}

            {/* OVERLAY DE ERROR AL CONECTAR */}
            {authError && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center px-2 py-1">
                    <span className="text-[9px] font-bold text-red-600 text-center uppercase tracking-wider mb-1 leading-tight">
                        Error de Conexión
                    </span>
                    <span className="text-[8px] text-gray-600 text-center leading-tight">
                        Revisa las credenciales de YouTube
                    </span>
                </div>
            )}

            {/* ESTADO 2: Cargando/Procesando Auth u Operación */}
            {loading && (
                <div className="w-5 h-5 border-2 border-oasis-red border-t-transparent rounded-full animate-spin"></div>
            )}

            {/* ESTADO 1: Desconectado - Muestra Botón Conectar */}
            {!status.connected && !loading && (
                <button
                    onClick={loginDirectly}
                    className="bg-oasis-red text-white text-[11px] font-bold tracking-widest uppercase py-2.5 px-6 rounded-xl shadow-[0_4px_12px_rgba(255,0,0,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                    CONECTAR
                </button>
            )}

            {/* ESTADO 3: Conectado pero SIN transmisión activa - Botón Desconectar */}
            {status.connected && !broadcast.active && !loading && (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="bg-gray-800 text-white text-[10px] font-bold tracking-widest uppercase py-2.5 px-4 rounded-xl shadow-md hover:bg-gray-950 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                    DESCONECTAR
                </button>
            )}

            {/* ESTADO 4: Conectado y En Vivo (Conserva estadísticas en tamaño micro-compacto) */}
            {status.connected && broadcast.active && !loading && (
                <div className="flex flex-col items-center w-full gap-1">
                    <span className="text-[9px] font-bold bg-oasis-green text-white px-2 py-0.5 rounded-md animate-pulse uppercase tracking-wider">
                        EN VIVO
                    </span>
                    <div className="flex justify-between w-full text-[9px] font-bold text-gray-600 px-1 mt-0.5">
                        <span>Min: {broadcast.stats?.viewers || 0}</span>
                        <span>Likes: {broadcast.stats?.likes || 0}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YoutubeLivePanel;