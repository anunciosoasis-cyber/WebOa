import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QuickFormModal from './QuickFormModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

/* -------------------------------------------------------------------------- */
/*  Cinematic Animated Icons — Unified Oasis Palette (#120C1F + #F59E0B)     */
/* -------------------------------------------------------------------------- */

const WalletDynamicIcon = ({ hovered }) => (
    <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <motion.svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: 'visible' }}
            animate={hovered ? { rotate: [-3, 2, 0], scale: 1.08 } : { rotate: [-1.2, 1.2, -1.2], scale: 1 }}
            transition={{ duration: hovered ? 0.5 : 4.2, repeat: hovered ? 0 : Infinity, ease: 'easeInOut' }}
        >
            {/* Subtle descending gold coin */}
            <motion.circle
                cx="13"
                cy="4.5"
                r="2.1"
                fill="#F59E0B"
                stroke="#F59E0B"
                strokeWidth="0.6"
                animate={{
                    y: [-6, 2.5, 2.5, -6],
                    opacity: [0, 0.95, 0, 0],
                    scale: [0.6, 1, 0.45, 0.6]
                }}
                transition={{
                    duration: hovered ? 1.35 : 2.6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />

            {/* Wallet silhouette */}
            <path
                d="M19 7.5V5.2A1.2 1.2 0 0 0 17.8 4H5.2A2.2 2.2 0 0 0 3 6.2a2.2 2.2 0 0 0 2.2 2.2H19.5a1 1 0 0 1 1 1v3h-3.2a2 2 0 0 0 0 4h3.2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
                stroke="#120C1F"
                strokeWidth="1.65"
            />
            <path
                d="M3 6.2v12.3A2.5 2.5 0 0 0 5.5 21h13.8a1.2 1.2 0 0 0 1.2-1.2V16.4"
                stroke="#120C1F"
                strokeWidth="1.65"
            />
            {/* Warm gold clasp dot */}
            <motion.circle
                cx="17.8"
                cy="14.4"
                r="1.05"
                fill="#F59E0B"
                animate={{ scale: [1, 1.35, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '17.8px 14.4px' }}
            />
        </motion.svg>
    </motion.div>
);

const BroadcastDynamicIcon = ({ isLive, hovered }) => {
    const coreColor = isLive ? '#FEF08A' : '#F59E0B';
    const innerColor = isLive ? '#FFFFFF' : '#120C1F';
    const outerColor = isLive ? '#FDE047' : '#120C1F';
    const ringBorder = isLive ? '#FEF08A' : 'rgba(245, 158, 11, 0.55)';

    return (
        <motion.div
            animate={isLive ? { scale: [1, 1.06, 1] } : { y: [0, -3, 0] }}
            transition={{ duration: isLive ? 1.25 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {/* Expanding radar ring */}
            <motion.div
                aria-hidden="true"
                animate={{
                    scale: isLive ? [0.55, 1.55] : [0.6, 1.32],
                    opacity: isLive ? [0.85, 0] : [0.4, 0]
                }}
                transition={{
                    duration: isLive ? 1.15 : 2.3,
                    repeat: Infinity,
                    ease: 'easeOut'
                }}
                style={{
                    position: 'absolute',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: `1.75px solid ${ringBorder}`,
                    pointerEvents: 'none'
                }}
            />
            {isLive && (
                <motion.div
                    aria-hidden="true"
                    animate={{ scale: [0.55, 1.6], opacity: [0.7, 0] }}
                    transition={{ duration: 1.15, repeat: Infinity, ease: 'easeOut', delay: 0.55 }}
                    style={{
                        position: 'absolute',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '1.75px solid #FFFFFF',
                        pointerEvents: 'none'
                    }}
                />
            )}

            <motion.svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ overflow: 'visible', position: 'relative', zIndex: 2 }}
                animate={hovered ? { scale: 1.08 } : { scale: 1 }}
            >
                {/* Outer arcs */}
                <motion.path
                    d="M4.93 19.07a10 10 0 0 1 0-14.14"
                    stroke={outerColor}
                    strokeWidth={isLive ? '2' : '1.65'}
                    animate={{
                        opacity: isLive ? [0.35, 1, 0.35] : [0.3, 0.85, 0.3],
                        scale: isLive ? [0.93, 1.07, 0.93] : [0.96, 1.03, 0.96]
                    }}
                    transition={{ duration: isLive ? 1.0 : 2.2, repeat: Infinity, delay: 0.25 }}
                    style={{ transformOrigin: '12px 12px' }}
                />
                <motion.path
                    d="M19.07 4.93a10 10 0 0 1 0 14.14"
                    stroke={outerColor}
                    strokeWidth={isLive ? '2' : '1.65'}
                    animate={{
                        opacity: isLive ? [0.35, 1, 0.35] : [0.3, 0.85, 0.3],
                        scale: isLive ? [0.93, 1.07, 0.93] : [0.96, 1.03, 0.96]
                    }}
                    transition={{ duration: isLive ? 1.0 : 2.2, repeat: Infinity, delay: 0.25 }}
                    style={{ transformOrigin: '12px 12px' }}
                />

                {/* Inner arcs */}
                <motion.path
                    d="M7.76 16.24a6 6 0 0 1 0-8.48"
                    stroke={innerColor}
                    strokeWidth={isLive ? '2.1' : '1.75'}
                    animate={{
                        opacity: [0.45, 1, 0.45],
                        scale: [0.97, 1.04, 0.97]
                    }}
                    transition={{ duration: isLive ? 1.0 : 2.2, repeat: Infinity }}
                    style={{ transformOrigin: '12px 12px' }}
                />
                <motion.path
                    d="M16.24 7.76a6 6 0 0 1 0 8.48"
                    stroke={innerColor}
                    strokeWidth={isLive ? '2.1' : '1.75'}
                    animate={{
                        opacity: [0.45, 1, 0.45],
                        scale: [0.97, 1.04, 0.97]
                    }}
                    transition={{ duration: isLive ? 1.0 : 2.2, repeat: Infinity }}
                    style={{ transformOrigin: '12px 12px' }}
                />

                {/* Signal Core */}
                <motion.circle
                    cx="12"
                    cy="12"
                    r={isLive ? '2.7' : '2.3'}
                    fill={coreColor}
                    animate={{
                        scale: isLive ? [1, 1.4, 1] : [1, 1.22, 1],
                        opacity: [0.85, 1, 0.85]
                    }}
                    transition={{ duration: isLive ? 0.9 : 1.7, repeat: Infinity }}
                    style={{ transformOrigin: '12px 12px' }}
                />
            </motion.svg>
        </motion.div>
    );
};

const PrayerDynamicIcon = ({ hovered }) => (
    <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <motion.svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: 'visible' }}
            animate={hovered ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        >
            {/* Subtle rising warm-gold light spark */}
            <motion.circle
                cx="18.2"
                cy="4.8"
                r="0.95"
                fill="#F59E0B"
                animate={{ y: [3, -4.5], opacity: [0, 0.9, 0], scale: [0.5, 1.1, 0.4] }}
                transition={{ duration: 2.3, repeat: Infinity, ease: 'easeOut' }}
            />

            {/* Speech bubble */}
            <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                stroke="#120C1F"
                strokeWidth="1.65"
            />

            {/* Beating heart */}
            <motion.path
                d="M12 15.1s-3.4-2.15-3.4-4.4a1.95 1.95 0 0 1 3.4-1.25 1.95 1.95 0 0 1 3.4 1.25c0 2.25-3.4 4.4-3.4 4.4z"
                fill={hovered ? '#F59E0B' : '#120C1F'}
                animate={{
                    scale: hovered
                        ? [1, 1.32, 1.04, 1.24, 1]
                        : [1, 1.18, 1.02, 1.12, 1]
                }}
                transition={{
                    duration: hovered ? 0.95 : 1.7,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{ transformOrigin: '12px 11.9px' }}
            />
        </motion.svg>
    </motion.div>
);

const NewHereDynamicIcon = ({ hovered }) => (
    <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <motion.svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: 'visible' }}
            animate={hovered ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        >
            {/* Subtle rotating warm-gold halo */}
            <motion.circle
                cx="9.5"
                cy="7.5"
                r="5.2"
                stroke="#F59E0B"
                strokeWidth="1"
                strokeDasharray="2.5 3"
                animate={{ rotate: [0, 360], opacity: [0.3, 0.7, 0.3] }}
                transition={{
                    rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
                    opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{ transformOrigin: '9.5px 7.5px' }}
            />

            {/* Person */}
            <circle
                cx="9.5"
                cy="7.5"
                r="3.3"
                fill="#120C1F"
            />
            <path
                d="M3.2 20c0-3.2 2.8-5.3 6.3-5.3s6.3 2.1 6.3 5.3z"
                fill="#120C1F"
            />

            {/* Floating warm-gold / charcoal heart */}
            <motion.path
                d="M19 9.7s-2.55-1.6-2.55-3.2a1.45 1.45 0 0 1 2.55-.95 1.45 1.45 0 0 1 2.55.95c0 1.6-2.55 3.2-2.55 3.2z"
                fill="#F59E0B"
                animate={{
                    y: hovered ? [-1.5, -4.5, -1.5] : [0, -2.5, 0],
                    rotate: [-6, 6, -6],
                    scale: [1, 1.16, 1]
                }}
                transition={{
                    duration: hovered ? 1.0 : 2.1,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{ transformOrigin: '19px 7.6px' }}
            />
        </motion.svg>
    </motion.div>
);

const AgendaDynamicIcon = ({ hovered }) => (
    <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <motion.svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: 'visible' }}
            animate={hovered ? { rotate: [0, -3, 3, 0], scale: 1.08 } : { rotate: [-1, 1, -1] }}
            transition={{ duration: hovered ? 0.55 : 4.4, repeat: hovered ? 0 : Infinity, ease: 'easeInOut' }}
        >
            {/* Calendar outline */}
            <rect
                x="3"
                y="4.5"
                width="18"
                height="16.5"
                rx="2.6"
                stroke="#120C1F"
                strokeWidth="1.65"
            />
            <path
                d="M3 7.3a2.6 2.6 0 0 1 2.6-2.8h12.8A2.6 2.6 0 0 1 21 7.3V9.5H3V7.3z"
                fill="#120C1F"
            />
            <path d="M8 2.5v3.2M16 2.5v3.2" stroke="#120C1F" strokeWidth="1.8" />

            {/* Subtle sequential date highlights with warm gold focal day */}
            <motion.rect
                x="6.6"
                y="12.4"
                width="2.5"
                height="2.5"
                rx="0.6"
                fill="#120C1F"
                animate={{ opacity: [0.18, 0.55, 0.18] }}
                transition={{ duration: 2.0, repeat: Infinity, delay: 0 }}
            />
            <motion.rect
                x="10.75"
                y="12.4"
                width="2.5"
                height="2.5"
                rx="0.6"
                fill="#120C1F"
                animate={{ opacity: [0.18, 0.55, 0.18] }}
                transition={{ duration: 2.0, repeat: Infinity, delay: 0.45 }}
            />
            <motion.rect
                x="14.9"
                y="12.4"
                width="2.7"
                height="2.7"
                rx="0.7"
                fill="#F59E0B"
                animate={{
                    scale: [1, 1.32, 1],
                    opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.85 }}
                style={{ transformOrigin: '16.25px 13.75px' }}
            />
            <motion.rect
                x="6.6"
                y="16.1"
                width="2.5"
                height="2.5"
                rx="0.6"
                fill="#120C1F"
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 2.0, repeat: Infinity, delay: 1.2 }}
            />
            <motion.rect
                x="10.75"
                y="16.1"
                width="2.5"
                height="2.5"
                rx="0.6"
                fill="#120C1F"
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 2.0, repeat: Infinity, delay: 1.5 }}
            />
        </motion.svg>
    </motion.div>
);

/* -------------------------------------------------------------------------- */
/*  DynamicIsland Component — Unified Cinematic Church Palette                */
/* -------------------------------------------------------------------------- */

const DynamicIsland = ({ settings }) => {
    const navigate = useNavigate();
    const { isLive } = usePlayer();
    const scrollContainerRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('prayer');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scrollBy = (amount) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleScrollToAgenda = () => {
        const agendaEl = document.getElementById('calendario') || document.getElementById('novedades');
        if (agendaEl) {
            agendaEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const items = [
        {
            id: 'diezmos',
            title: 'Diezmos y',
            subtitle: 'Ofrendas',
            renderIcon: (hovered) => <WalletDynamicIcon hovered={hovered} />,
            action: () => window.open('https://alfoliadventista.org/', '_blank')
        },
        {
            id: 'envivos',
            title: 'En',
            subtitle: 'Vivos',
            renderIcon: (hovered, activeLive) => (
                <BroadcastDynamicIcon isLive={activeLive} hovered={hovered} />
            ),
            action: () => navigate('/tv')
        },
        {
            id: 'oracion',
            title: 'Peticiones de',
            subtitle: 'Oración',
            renderIcon: (hovered) => <PrayerDynamicIcon hovered={hovered} />,
            action: () => handleOpenModal('prayer')
        },
        {
            id: 'nuevo',
            title: 'Soy',
            subtitle: 'Nuevo',
            renderIcon: (hovered) => <NewHereDynamicIcon hovered={hovered} />,
            action: () => handleOpenModal('connect')
        },
        {
            id: 'agenda',
            title: 'Nuestra',
            subtitle: 'Agenda',
            renderIcon: (hovered) => <AgendaDynamicIcon hovered={hovered} />,
            action: handleScrollToAgenda
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { delayChildren: 0.12, staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16, scale: 0.94 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 220, damping: 20 }
        }
    };

    return (
        <>
            <motion.section
                aria-label="Accesos rápidos"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                style={{
                    width: '100%',
                    maxWidth: '1240px',
                    margin: '26px auto 16px auto',
                    position: 'relative',
                    zIndex: 10,
                    padding: '0 20px'
                }}
            >
                <style>{`
                    .dynamic-island-container::-webkit-scrollbar {
                        display: none;
                    }
                    .di-card {
                        position: relative;
                        overflow: hidden;
                        isolation: isolate;
                    }
                    .di-shimmer {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(
                            115deg,
                            transparent 20%,
                            rgba(245, 158, 11, 0.12) 48%,
                            rgba(255, 255, 255, 0.7) 52%,
                            transparent 80%
                        );
                        transform: translateX(-135%);
                        transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                        pointer-events: none;
                        z-index: 2;
                    }
                    .di-card:hover .di-shimmer {
                        transform: translateX(135%);
                    }
                    .di-card-live .di-shimmer {
                        background: linear-gradient(
                            115deg,
                            transparent 20%,
                            rgba(255, 255, 255, 0.25) 50%,
                            transparent 80%
                        );
                    }
                    @keyframes di-live-pulse {
                        0% {
                            box-shadow: 0 14px 32px rgba(220, 38, 38, 0.38), 0 0 0 0 rgba(220, 38, 38, 0.55);
                        }
                        70% {
                            box-shadow: 0 18px 40px rgba(220, 38, 38, 0.52), 0 0 0 12px rgba(220, 38, 38, 0);
                        }
                        100% {
                            box-shadow: 0 14px 32px rgba(220, 38, 38, 0.38), 0 0 0 0 rgba(220, 38, 38, 0);
                        }
                    }
                    .di-card-live {
                        animation: di-live-pulse 2.1s infinite cubic-bezier(0.4, 0, 0.6, 1);
                    }
                    @media (min-width: 768px) {
                        .dynamic-island-container {
                            justify-content: center;
                        }
                        .dynamic-island-item {
                            width: 180px !important;
                            height: 144px !important;
                        }
                        .dynamic-island-text {
                            font-size: 0.94rem !important;
                        }
                    }
                `}</style>

                {/* Scroll Buttons */}
                <AnimatePresence>
                    {canScrollLeft && (
                        <motion.button
                            type="button"
                            aria-label="Desplazar a la izquierda"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => scrollBy(-220)}
                            style={{
                                position: 'absolute',
                                left: '4px',
                                top: '50%',
                                transform: 'translateY(-55%)',
                                zIndex: 20,
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(18, 12, 31, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(18, 12, 31, 0.14)',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={22} color="#120C1F" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {canScrollRight && (
                        <motion.button
                            type="button"
                            aria-label="Desplazar a la derecha"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => scrollBy(220)}
                            style={{
                                position: 'absolute',
                                right: '4px',
                                top: '50%',
                                transform: 'translateY(-55%)',
                                zIndex: 20,
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(18, 12, 31, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(18, 12, 31, 0.14)',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronRight size={22} color="#120C1F" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    style={{
                        display: 'flex',
                        gap: '18px',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        paddingBottom: '30px',
                        paddingTop: '14px',
                        paddingLeft: '6px',
                        paddingRight: '6px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        scrollSnapType: 'x mandatory'
                    }}
                    className="dynamic-island-container"
                >
                    {items.map((item, idx) => {
                        const isEnVivoActive = item.id === 'envivos' && Boolean(isLive);
                        const isHovered = hoveredId === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`${item.title} ${item.subtitle}${isEnVivoActive ? ' (Transmisión en vivo activa)' : ''}`}
                                className={`dynamic-island-item di-card ${isEnVivoActive ? 'di-card-live' : ''}`}
                                variants={itemVariants}
                                onHoverStart={() => setHoveredId(item.id)}
                                onHoverEnd={() => setHoveredId(null)}
                                whileHover={{
                                    y: -9,
                                    scale: 1.03,
                                    boxShadow: isEnVivoActive
                                        ? '0 24px 48px rgba(220, 38, 38, 0.5)'
                                        : '0 24px 44px -12px rgba(18, 12, 31, 0.2), 0 10px 24px -8px rgba(245, 158, 11, 0.18)'
                                }}
                                whileTap={{ scale: 0.96 }}
                                onClick={item.action}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        item.action();
                                    }
                                }}
                                style={{
                                    scrollSnapAlign: 'center',
                                    flex: '0 0 auto',
                                    width: '140px',
                                    height: '126px',
                                    background: isEnVivoActive
                                        ? 'linear-gradient(145deg, #DC2626 0%, #B91C1C 55%, #7F1D1D 100%)'
                                        : 'linear-gradient(165deg, #FFFFFF 0%, #F7F8FC 100%)',
                                    borderRadius: '26px',
                                    border: isEnVivoActive
                                        ? '1.5px solid rgba(254, 240, 138, 0.65)'
                                        : isHovered
                                            ? '1.5px solid rgba(245, 158, 11, 0.55)'
                                            : '1px solid rgba(18, 12, 31, 0.07)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px 12px',
                                    cursor: 'pointer',
                                    boxShadow: isEnVivoActive
                                        ? '0 14px 34px rgba(220, 38, 38, 0.4)'
                                        : '0 14px 32px -12px rgba(18, 12, 31, 0.14), 0 4px 12px -4px rgba(18, 12, 31, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                                    transition: 'border-color 0.3s ease'
                                }}
                            >
                                {/* Cinematic light sweep on hover */}
                                <div className="di-shimmer" />

                                {/* Subtle warm-gold cinematic ambient glow behind icon */}
                                <motion.div
                                    aria-hidden="true"
                                    animate={{
                                        x: [-10, 10, -10],
                                        y: [-4, 6, -4],
                                        scale: isHovered || isEnVivoActive ? [1.05, 1.25, 1.05] : [0.9, 1.1, 0.9],
                                        opacity: isEnVivoActive ? 0.48 : isHovered ? 0.32 : 0.12
                                    }}
                                    transition={{
                                        duration: 6 + idx * 0.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        width: '74px',
                                        height: '74px',
                                        borderRadius: '50%',
                                        background: isEnVivoActive
                                            ? 'radial-gradient(circle, rgba(254, 240, 138, 0.7) 0%, transparent 72%)'
                                            : 'radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, transparent 72%)',
                                        filter: 'blur(16px)',
                                        pointerEvents: 'none',
                                        zIndex: 0
                                    }}
                                />

                                {/* Live indicator badge when broadcast is active */}
                                {isEnVivoActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '3px 8px',
                                            borderRadius: '999px',
                                            backgroundColor: 'rgba(18, 12, 31, 0.52)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(254, 240, 138, 0.55)',
                                            zIndex: 3
                                        }}
                                    >
                                        <motion.span
                                            animate={{ opacity: [1, 0.25, 1], scale: [1, 1.3, 1] }}
                                            transition={{ duration: 0.95, repeat: Infinity }}
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: '#FEF08A',
                                                boxShadow: '0 0 8px #FEF08A'
                                            }}
                                        />
                                        <span
                                            style={{
                                                color: '#FEF08A',
                                                fontSize: '0.58rem',
                                                fontWeight: 900,
                                                letterSpacing: '0.08em',
                                                lineHeight: 1
                                            }}
                                        >
                                            EN VIVO
                                        </span>
                                    </motion.div>
                                )}

                                {/* Animated Icon */}
                                <div
                                    style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        marginBottom: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {item.renderIcon(isHovered, isEnVivoActive)}
                                </div>

                                {/* Label */}
                                <div
                                    className="dynamic-island-text"
                                    style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        color: isEnVivoActive ? '#FFFFFF' : '#120C1F',
                                        fontSize: '0.82rem',
                                        fontWeight: 800,
                                        textAlign: 'center',
                                        lineHeight: '1.24',
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    {item.title}
                                    <br />
                                    {item.subtitle}
                                </div>

                                {/* Subtle warm-gold cinematic accent bar */}
                                <motion.div
                                    aria-hidden="true"
                                    animate={{
                                        width: isEnVivoActive ? '40px' : isHovered ? '34px' : '14px',
                                        opacity: isEnVivoActive || isHovered ? 1 : 0.35
                                    }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        height: '3px',
                                        borderRadius: '999px',
                                        backgroundColor: isEnVivoActive ? '#FEF08A' : '#F59E0B',
                                        zIndex: 2
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            <QuickFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                type={modalType}
            />
        </>
    );
};

export default DynamicIsland;
