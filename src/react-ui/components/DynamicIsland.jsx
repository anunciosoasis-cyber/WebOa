import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QuickFormModal from './QuickFormModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const DynamicIsland = ({ settings }) => {
    const navigate = useNavigate();
    const { isLive } = usePlayer();
    const scrollContainerRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('prayer');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

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
            // The scroll event listener will handle updating the button states
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
            icon: 'bi-wallet2',
            title: 'Diezmos y',
            subtitle: 'Ofrendas',
            action: () => window.open('https://alfoliadventista.org/', '_blank')
        },
        {
            id: 'envivos',
            icon: 'bi-broadcast',
            title: 'En',
            subtitle: 'Vivos',
            action: () => navigate('/tv')
        },
        {
            id: 'oracion',
            icon: 'bi-chat-heart',
            title: 'Peticiones de',
            subtitle: 'Oración',
            action: () => handleOpenModal('prayer')
        },
        {
            id: 'nuevo',
            icon: 'bi-person-heart',
            title: 'Soy',
            subtitle: 'Nuevo',
            action: () => handleOpenModal('connect')
        },
        {
            id: 'agenda',
            icon: 'bi-calendar-event',
            title: 'Nuestra',
            subtitle: 'Agenda',
            action: handleScrollToAgenda
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { delayChildren: 0.2, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } }
    };

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                style={{
                    width: '100%',
                    maxWidth: '1240px',
                    margin: '30px auto 10px auto',
                    position: 'relative',
                    zIndex: 10,
                    padding: '0 20px'
                }}
            >
                {/* Scroll Buttons */}
                {canScrollLeft && (
                    <button 
                        onClick={() => scrollBy(-200)}
                        style={{
                            position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)',
                            zIndex: 20, width: '40px', height: '40px', borderRadius: '50%',
                            background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)', cursor: 'pointer'
                        }}
                    >
                        <ChevronLeft size={24} color="#120C1F" />
                    </button>
                )}
                {canScrollRight && (
                    <button 
                        onClick={() => scrollBy(200)}
                        style={{
                            position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)',
                            zIndex: 20, width: '40px', height: '40px', borderRadius: '50%',
                            background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)', cursor: 'pointer'
                        }}
                    >
                        <ChevronRight size={24} color="#120C1F" />
                    </button>
                )}

                <div 
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    style={{
                        display: 'flex',
                        gap: '15px',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        paddingBottom: '25px',
                        paddingTop: '10px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        scrollSnapType: 'x mandatory'
                    }}
                    className="dynamic-island-container"
                >
                    <style>{`
                        .dynamic-island-container::-webkit-scrollbar {
                            display: none;
                        }
                        /* En computador los centramos, en móvil los dejamos fluir a la izquierda para el scroll */
                        @media (min-width: 768px) {
                            .dynamic-island-container {
                                justify-content: center;
                            }
                            .dynamic-island-item {
                                width: 170px !important;
                                height: 130px !important;
                            }
                            .dynamic-island-icon {
                                font-size: 2.5rem !important;
                            }
                            .dynamic-island-text {
                                font-size: 0.95rem !important;
                            }
                        }
                    `}</style>

                    {items.map((item) => {
                        const isEnVivoActive = item.id === 'envivos' && isLive;
                        return (
                        <motion.div
                            key={item.id}
                            className="dynamic-island-item"
                            variants={itemVariants}
                            whileHover={{ y: -8, boxShadow: isEnVivoActive ? '0 20px 40px rgba(255,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.action}
                            style={{
                                scrollSnapAlign: 'center',
                                flex: '0 0 auto',
                                width: '130px', /* Restaurado el tamaño original */
                                height: '110px',
                                backgroundColor: isEnVivoActive ? '#FF0000' : '#FFFFFF',
                                borderRadius: '24px',
                                border: isEnVivoActive ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '15px 10px',
                                cursor: 'pointer',
                                boxShadow: isEnVivoActive ? '0 10px 25px rgba(255,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div
                                className="dynamic-island-icon"
                                style={{
                                    color: isEnVivoActive ? '#FFFFFF' : '#120C1F',
                                    fontSize: '1.8rem',
                                    marginBottom: '10px',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseOver={e => { if(!isEnVivoActive) e.currentTarget.style.color = '#F59E0B' }}
                                onMouseOut={e => { if(!isEnVivoActive) e.currentTarget.style.color = '#120C1F' }}
                            >
                                <i className={`bi ${item.icon}`}></i>
                            </div>
                            <div
                                className="dynamic-island-text"
                                style={{
                                    color: isEnVivoActive ? '#FFFFFF' : '#120C1F',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    lineHeight: '1.3'
                                }}>
                                {item.title}<br />{item.subtitle}
                            </div>
                        </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <QuickFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                type={modalType}
            />
        </>
    );
};

export default DynamicIsland;
