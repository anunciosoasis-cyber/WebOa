import React, { useState, useEffect, useRef } from 'react';

const LOCAL_BG_IMAGE = '/assets/projector-bg.jpg';
const LOCAL_BG_VIDEO = '/assets/projector-bg.mp4';
const COVERR_API_KEY = '80e09202317775e1635c576428be4852';
const CACHE_KEY = 'coverr_nature_videos';
const CACHE_EXPIRY = 'coverr_nature_expiry';

const BackgroundManager = ({ mode }) => {
    const isHimno = mode === 'himno';
    
    const [videoUrl, setVideoUrl] = useState(LOCAL_BG_VIDEO);
    const [imageUrl, setImageUrl] = useState(LOCAL_BG_IMAGE);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    
    // Almacenamos videos obtenidos en memoria
    const cachedVideos = useRef([]);

    useEffect(() => {
        if (!isHimno) return;
        let isMounted = true;
        
        const fetchCoverr = async () => {
            // 1. Revisar si ya están en memoria (Evita llamados al cambiar estrofas o himnos)
            if (cachedVideos.current.length > 0) {
                const randomHit = cachedVideos.current[Math.floor(Math.random() * cachedVideos.current.length)];
                setVideoUrl(`https://cdn.coverr.co/videos/${randomHit.base_filename}/1080p.mp4`);
                if (randomHit.poster) setImageUrl(randomHit.poster);
                return;
            }

            // 2. Revisar si están guardados en el navegador (Evita llamados si se recarga la página por error)
            try {
                const localData = localStorage.getItem(CACHE_KEY);
                const expiry = localStorage.getItem(CACHE_EXPIRY);
                if (localData && expiry && Date.now() < parseInt(expiry)) {
                    const parsed = JSON.parse(localData);
                    cachedVideos.current = parsed;
                    const randomHit = parsed[Math.floor(Math.random() * parsed.length)];
                    if (isMounted) {
                        setVideoUrl(`https://cdn.coverr.co/videos/${randomHit.base_filename}/1080p.mp4`);
                        if (randomHit.poster) setImageUrl(randomHit.poster);
                    }
                    return;
                }
            } catch(e) {}

            // 3. Solo si no hay caché, hacer el llamado a la API
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000); 

                const res = await fetch('https://api.coverr.co/videos?query=nature%20landscape&urls=true', {
                    headers: { 'Authorization': `Bearer ${COVERR_API_KEY}` },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!res.ok) throw new Error('API request failed');

                const data = await res.json();
                if (data.hits && data.hits.length > 0) {
                    cachedVideos.current = data.hits;
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(data.hits));
                        localStorage.setItem(CACHE_EXPIRY, (Date.now() + (24 * 60 * 60 * 1000)).toString()); // 24 horas
                    } catch(e) {}

                    const randomHit = data.hits[Math.floor(Math.random() * data.hits.length)];
                    if (isMounted) {
                        setVideoUrl(`https://cdn.coverr.co/videos/${randomHit.base_filename}/1080p.mp4`);
                        if (randomHit.poster) setImageUrl(randomHit.poster);
                    }
                }
            } catch (err) {
                console.log("Coverr API falló o tuvo lag, usando fondo local (offline):", err.message);
                if (isMounted) {
                    setVideoUrl(LOCAL_BG_VIDEO);
                    setImageUrl(LOCAL_BG_IMAGE);
                }
            }
        };

        fetchCoverr();

        return () => {
            isMounted = false;
        };
    }, [isHimno]);

    return (
        <>
            {/* Base oscura por defecto para todos los modos */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#090E17',
                backgroundImage: isHimno 
                    ? `radial-gradient(circle at 50% 20%, rgba(30, 27, 75, 0.6) 0%, rgba(9, 14, 23, 0.95) 100%), url("${imageUrl}")`
                    : 'radial-gradient(circle at 50% 20%, rgba(30, 27, 75, 0.4) 0%, rgba(9, 14, 23, 0.95) 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0,
                transition: 'background-image 1s ease-in-out'
            }} />

            {/* Video de naturaleza en bucle SOLO cuando está en modo himnario */}
            {isHimno && (
                <video
                    key={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    src={videoUrl}
                    onLoadedData={() => {
                        console.log("El video se ha cargado correctamente:", videoUrl);
                        setIsVideoLoaded(true);
                    }}
                    onError={(e) => console.error("Error cargando el video:", videoUrl, e)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1,
                        opacity: isVideoLoaded ? 0.65 : 0.2, // Forzar visibilidad parcial incluso si no dispara el evento
                        transition: 'opacity 1s ease-in-out',
                        filter: 'saturate(1.05) contrast(1.05)'
                    }}
                />
            )}

            {/* Capa de oscurecimiento ambiental para legibilidad de proyector */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(9, 14, 23, 0.65)', // Reducido un poco para que el video resalte más
                backdropFilter: 'blur(2px)',
                zIndex: 2
            }} />
        </>
    );
};

export default BackgroundManager;
