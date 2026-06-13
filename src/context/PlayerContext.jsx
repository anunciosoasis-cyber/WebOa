import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [youtubeUrl, setYoutubeUrl] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showPip, setShowPip] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [setRes, ytRes, liveRes] = await Promise.all([
                    apiClient.get('/public/settings'),
                    apiClient.get('/youtube/public/uploads'),
                    apiClient.get('/youtube/public/live-status')
                ]);
                
                const s = setRes.data || {};
                const liveData = liveRes.data || { active: false };

                const streamIsLive = liveData.active;
                const liveVideoId = liveData.broadcastId;
                const playlistId = s['youtube_playlist_id'] || ytRes.data?.playlistId;
                const latestVideoId = ytRes.data?.latestVideoId;

                setIsLive(streamIsLive);

                if (streamIsLive && liveVideoId) {
                    setYoutubeUrl(`https://www.youtube.com/embed/${liveVideoId}?autoplay=1`);
                } else if (latestVideoId) {
                    setYoutubeUrl(`https://www.youtube.com/embed/${latestVideoId}`);
                } else if (playlistId) {
                    setYoutubeUrl(`https://www.youtube.com/embed/videoseries?list=${playlistId}`);
                }

                if (ytRes.data?.error && !playlistId) {
                    setErrorMsg(ytRes.data.error === 'NO_CHANNEL' ? 'La cuenta vinculada no tiene canal de YouTube.' : 'Error al conectar con YouTube.');
                }
            } catch (error) {
                console.error("Error loading Player data", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();

        // Verificar automáticamente cada 2 minutos sin recargar la página (Ahorra recursos y detecta en tiempo real)
        const interval = setInterval(async () => {
            try {
                const liveRes = await apiClient.get('/youtube/public/live-status');
                if (liveRes.data && liveRes.data.active) {
                    if (!isLive) {
                        setIsLive(true);
                        setYoutubeUrl(`https://www.youtube.com/embed/${liveRes.data.broadcastId}?autoplay=1`);
                    }
                } else {
                    if (isLive) {
                        loadData(); // Si dejó de estar en vivo, recarga la data normal
                    }
                }
            } catch (e) {}
        }, 120000);

        return () => clearInterval(interval);
    }, [isLive]);

    return (
        <PlayerContext.Provider value={{ youtubeUrl, isLive, loading, errorMsg, showPip, setShowPip }}>
            {children}
        </PlayerContext.Provider>
    );
};
