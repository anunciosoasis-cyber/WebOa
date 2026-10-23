import React, { useState, useEffect, useRef } from 'react';

const COVERR_API_KEY = '80e09202317775e1635c576428be4852';
const CACHE_KEY = 'oasis_pure_nature_videos_v3';
const CACHE_EXPIRY = 'oasis_pure_nature_expiry_v3';

// Catálogo curado de videos 100% seguros y verificados: solo montañas, ríos, cataratas y bosques de pinos
const VERIFIED_NATURE_VIDEOS = [
    {
        video: 'https://cdn.coverr.co/videos/aerial-view-of-a-river-in-a-forest-8857/1080p.mp4',
        poster: 'https://cdn.coverr.co/videos/aerial-view-of-a-river-in-a-forest-8857/thumbnail?width=1920'
    },
    {
        video: 'https://cdn.coverr.co/videos/aerial-view-of-pine-trees-in-a-forest-5544/1080p.mp4',
        poster: 'https://cdn.coverr.co/videos/aerial-view-of-pine-trees-in-a-forest-5544/thumbnail?width=1920'
    },
    {
        video: 'https://cdn.coverr.co/videos/waterfall-in-a-lush-green-forest-5788/1080p.mp4',
        poster: 'https://cdn.coverr.co/videos/waterfall-in-a-lush-green-forest-5788/thumbnail?width=1920'
    },
    {
        video: 'https://cdn.coverr.co/videos/foggy-mountains-in-the-morning-8664/1080p.mp4',
        poster: 'https://cdn.coverr.co/videos/foggy-mountains-in-the-morning-8664/thumbnail?width=1920'
    },
    {
        video: 'https://cdn.coverr.co/videos/sunrise-over-the-mountain-peaks-8869/1080p.mp4',
        poster: 'https://cdn.coverr.co/videos/sunrise-over-the-mountain-peaks-8869/thumbnail?width=1920'
    },
    {
        video: 'https://cdn.coverr.co/videos/mountain-stream-flowing-over-stones-5790/1080p.mp4',
        poster: 'https://cdn.coverr.co/videos/mountain-stream-flowing-over-stones-5790/thumbnail?width=1920'
    }
];

// LISTA NEGRA ESTRICTA: Bloquea personas, partes del cuerpo, animales, dinosaurios, ciudades y temas inapropiados
const FORBIDDEN_WORDS = [
    // Personas, rostros, cuerpos, vestimentas, modelos, multitudes
    'person', 'people', 'human', 'man', 'men', 'woman', 'women', 'girl', 'boy', 'kid', 'child', 'baby',
    'couple', 'family', 'crowd', 'face', 'portrait', 'hand', 'hands', 'feet', 'body', 'model',
    'bikini', 'swim', 'swimmer', 'swimming', 'beach', 'nude', 'naked', 'underwear', 'topless', 'dress', 'dance', 'dancer',
    'walk', 'walking', 'run', 'running', 'singer', 'concert', 'party', 'gym', 'fitness', 'sport',
    // Animales y criaturas (dinosaurios, fauna, mascotas)
    'animal', 'animals', 'dog', 'dogs', 'cat', 'cats', 'bird', 'birds', 'fish', 'dinosaur', 'dino', 'jurassic',
    'wildlife', 'mammal', 'insect', 'bear', 'lion', 'tiger', 'snake', 'reptile', 'horse', 'monkey',
    // Elementos artificiales, urbanos y temáticas no sacras
    'city', 'urban', 'car', 'cars', 'vehicle', 'traffic', 'building', 'buildings', 'house', 'street', 'road',
    'highway', 'technology', 'computer', 'phone', 'interior', 'office', 'room',
    'halloween', 'horror', 'creepy', 'scary', 'spooky', 'war', 'fight', 'weapon', 'gun', 'blood',
    'monster', 'animation', 'cgi', 'cartoon', 'fantasy', 'alien', 'sci-fi'
];

// LISTA BLANCA OBLIGATORIA: El video DEBE ser explícitamente un paisaje natural puro
const REQUIRED_NATURE_WORDS = [
    'mountain', 'mountains', 'river', 'rivers', 'waterfall', 'waterfalls', 'forest', 'forests',
    'valley', 'creek', 'stream', 'trees', 'nature', 'aerial', 'landscape', 'clouds', 'fog',
    'pine', 'greenery', 'woods', 'scenic', 'cascading'
];

// Consultas ultra-específicas de geografía natural pura
const SAFE_NATURE_QUERIES = [
    'mountain river aerial nature',
    'pine forest landscape aerial',
    'waterfall river peaceful nature',
    'scenic mountain valley clouds nature',
    'river stream stones mountains nature',
    'aerial forest mountains landscape'
];

const isPureNatureHit = (hit) => {
    if (!hit) return false;
    const textToCheck = [
        hit.title || '',
        hit.description || '',
        hit.base_filename || '',
        ...(Array.isArray(hit.tags) ? hit.tags : [])
    ].join(' ').toLowerCase();

    // 1. Descartar si coincide con CUALQUIER palabra prohibida
    for (const forbidden of FORBIDDEN_WORDS) {
        const regex = new RegExp(`\\b${forbidden}\\b`, 'i');
        if (regex.test(textToCheck)) {
            return false;
        }
    }

    // 2. Exigir presencia de al menos un elemento natural de paisaje
    return REQUIRED_NATURE_WORDS.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(textToCheck);
    });
};

const BackgroundManager = ({ mode }) => {
    const isHimno = mode === 'himno';
    
    // Iniciar con un video verificado seguro
    const defaultItem = VERIFIED_NATURE_VIDEOS[0];
    const [videoUrl, setVideoUrl] = useState(defaultItem.video);
    const [imageUrl, setImageUrl] = useState(defaultItem.poster);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    
    const cachedVideos = useRef([]);

    useEffect(() => {
        if (!isHimno) return;
        let isMounted = true;
        
        const fetchPureNatureVideo = async () => {
            // 1. Revisar si ya están en memoria en esta sesión
            if (cachedVideos.current.length > 0) {
                const randomHit = cachedVideos.current[Math.floor(Math.random() * cachedVideos.current.length)];
                const vUrl = randomHit.video || `https://cdn.coverr.co/videos/${randomHit.base_filename}/1080p.mp4`;
                const pUrl = randomHit.poster || (randomHit.base_filename ? `https://cdn.coverr.co/videos/${randomHit.base_filename}/thumbnail?width=1920` : null);
                setVideoUrl(vUrl);
                if (pUrl) setImageUrl(pUrl);
                return;
            }

            // 2. Revisar si están guardados en localStorage filtrados y vigentes
            try {
                const localData = localStorage.getItem(CACHE_KEY);
                const expiry = localStorage.getItem(CACHE_EXPIRY);
                if (localData && expiry && Date.now() < parseInt(expiry)) {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const verifiedFiltered = parsed.filter(isPureNatureHit);
                        if (verifiedFiltered.length > 0) {
                            cachedVideos.current = verifiedFiltered;
                            const randomHit = verifiedFiltered[Math.floor(Math.random() * verifiedFiltered.length)];
                            const vUrl = randomHit.video || `https://cdn.coverr.co/videos/${randomHit.base_filename}/1080p.mp4`;
                            const pUrl = randomHit.poster || (randomHit.base_filename ? `https://cdn.coverr.co/videos/${randomHit.base_filename}/thumbnail?width=1920` : null);
                            if (isMounted) {
                                setVideoUrl(vUrl);
                                if (pUrl) setImageUrl(pUrl);
                            }
                            return;
                        }
                    }
                }
            } catch(e) {}

            // 3. Consultar la API externa con términos ultra-específicos y filtrado estricto
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000); 

                const randomQuery = SAFE_NATURE_QUERIES[Math.floor(Math.random() * SAFE_NATURE_QUERIES.length)];

                const res = await fetch(`https://api.coverr.co/videos?query=${encodeURIComponent(randomQuery)}&urls=true`, {
                    headers: { 'Authorization': `Bearer ${COVERR_API_KEY}` },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data.hits && data.hits.length > 0) {
                        // FILTRADO ESTRICTO: Solo videos que superen los filtros de pureza natural
                        const pureNatureHits = data.hits.filter(isPureNatureHit);

                        if (pureNatureHits.length > 0) {
                            cachedVideos.current = pureNatureHits;
                            try {
                                localStorage.setItem(CACHE_KEY, JSON.stringify(pureNatureHits));
                                localStorage.setItem(CACHE_EXPIRY, (Date.now() + (24 * 60 * 60 * 1000)).toString());
                            } catch(e) {}

                            const randomHit = pureNatureHits[Math.floor(Math.random() * pureNatureHits.length)];
                            const vUrl = `https://cdn.coverr.co/videos/${randomHit.base_filename}/1080p.mp4`;
                            const pUrl = randomHit.poster || `https://cdn.coverr.co/videos/${randomHit.base_filename}/thumbnail?width=1920`;
                            if (isMounted) {
                                setVideoUrl(vUrl);
                                if (pUrl) setImageUrl(pUrl);
                            }
                            return;
                        }
                    }
                }
            } catch (err) {
                console.log("Coverr API falló o tuvo timeout, usando catálogo verificado de naturaleza pura:", err.message);
            }

            // 4. Fallback 100% seguro: Catálogo curado interno de paisajes (ríos, pinos, montañas)
            const fallback = VERIFIED_NATURE_VIDEOS[Math.floor(Math.random() * VERIFIED_NATURE_VIDEOS.length)];
            cachedVideos.current = VERIFIED_NATURE_VIDEOS;
            if (isMounted) {
                setVideoUrl(fallback.video);
                setImageUrl(fallback.poster);
            }
        };

        fetchPureNatureVideo();

        return () => {
            isMounted = false;
        };
    }, [isHimno]);

    return (
        <>
            {/* Base oscura para el fondo */}
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

            {/* Video de paisaje natural puro en bucle (SOLO en modo himnario) */}
            {isHimno && (
                <video
                    key={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    src={videoUrl}
                    onLoadedData={() => setIsVideoLoaded(true)}
                    onError={() => {
                        // Si falla un enlace, cambia de inmediato a uno verificado
                        const safe = VERIFIED_NATURE_VIDEOS[0];
                        setVideoUrl(safe.video);
                        setImageUrl(safe.poster);
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1,
                        opacity: isVideoLoaded ? 0.65 : 0.25,
                        transition: 'opacity 1s ease-in-out',
                        filter: 'saturate(1.05) contrast(1.05)'
                    }}
                />
            )}

            {/* Capa de oscurecimiento ambiental para máxima legibilidad de las letras */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(9, 14, 23, 0.65)',
                backdropFilter: 'blur(2px)',
                zIndex: 2
            }} />
        </>
    );
};

export default BackgroundManager;
