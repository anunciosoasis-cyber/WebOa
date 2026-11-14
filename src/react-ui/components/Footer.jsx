"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Clock, MapPin, PlayCircle, HeartHandshake } from 'lucide-react';
import logoImg from '../../img/logos/LOGO1.png';
import oasisCommunityImg from '../../img/comunidad-oasis.jpg';
import { usePlayer } from '../../context/PlayerContext';
import { nextService, SERVICE_LABEL } from '../../utils/nextService';

const LINK_GROUPS = [
    {
        title: 'Iglesia',
        links: [
            { to: '/', label: 'Inicio' },
            { to: '/about', label: 'Quiénes somos' },
            { to: '/tv', label: 'Oasis TV' },
            { to: '/recursos', label: 'Biblioteca' },
        ],
    },
    {
        title: 'Participa',
        links: [
            { to: '/peticiones', label: 'Peticiones de oración' },
            { to: '/inscripciones', label: 'Eventos e inscripciones' },
            { href: 'https://alfoliadventista.org/', label: 'Diezmos y ofrendas' },
            { to: '/login', label: 'Acceso miembros' },
        ],
    },
];

// En móvil la BottomNav ya cubre la navegación: solo mostramos los accesos que no están ahí
const MOBILE_CHIPS = [
    { to: '/inscripciones', label: 'Eventos' },
    { to: '/tv', label: 'Oasis TV' },
    { href: 'https://alfoliadventista.org/', label: 'Diezmos' },
];

const renderLink = (l, className) =>
    l.href ? (
        <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={className}>
            {l.label} <ArrowUpRight size={12} aria-hidden="true" />
        </a>
    ) : (
        <Link key={l.label} to={l.to} className={className}>{l.label}</Link>
    );

const countdownText = (now) => {
    const diff = nextService(now) - now;
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    if (d > 0) return `Faltan ${d}d ${h}h`;
    if (h > 0) return `Faltan ${h}h ${m}min`;
    return `Comienza en ${m} min`;
};

const reveal = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const Footer = () => {
    const { isLive, publicSettings = {} } = usePlayer() || {};
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const socials = [
        ['Instagram', 'bi-instagram', publicSettings.instagram_url],
        ['Facebook', 'bi-facebook', publicSettings.facebook_url],
        ['YouTube', 'bi-youtube', publicSettings.youtube_url],
    ].filter(([, , url]) => url);

    return (
        <footer className="oft">
            <motion.img
                src={oasisCommunityImg}
                alt=""
                aria-hidden="true"
                className="oft-photo"
                initial={{ scale: 1.15 }}
                whileInView={{ scale: 1.04 }}
                viewport={{ once: true }}
                transition={{ duration: 14, ease: 'easeOut' }}
            />
            <div className="oft-veil" aria-hidden="true" />

            <motion.div className="oft-inner" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
                {/* 1. Llamada dinámica: en vivo o próximo culto */}
                <motion.div className="oft-cta" variants={reveal}>
                    <div>
                        <span className={`oasis-tag ${isLive ? 'oasis-tag--live' : ''}`}>
                            <span className="oasis-tag__dot" />
                            {isLive ? 'En vivo ahora' : countdownText(now)}
                        </span>
                        <h2 className="oft-cta-title">
                            {isLive ? <>Estamos <span>en vivo</span></> : <>Te esperamos <span>este sábado</span></>}
                        </h2>
                        <p className="oft-cta-sub">
                            <Clock size={14} aria-hidden="true" /> {SERVICE_LABEL} · Culto central
                            <span className="oft-dot" aria-hidden="true" />
                            <MapPin size={14} aria-hidden="true" /> Medellín
                        </p>
                    </div>
                    <div className="oft-cta-actions">
                        <Link to="/tv" className="oft-btn oft-btn--gold">
                            <PlayCircle size={16} aria-hidden="true" /> {isLive ? 'Ver transmisión' : 'Oasis TV'}
                        </Link>
                        <Link to="/peticiones" className="oft-btn">
                            <HeartHandshake size={16} aria-hidden="true" /> Pedir oración
                        </Link>
                    </div>
                </motion.div>

                {/* 2. Cuadrícula: cuatro columnas iguales, todas encabezadas igual */}
                <motion.div className={`oft-grid ${socials.length ? '' : 'oft-grid--nosocial'}`} variants={reveal}>
                    {LINK_GROUPS.map((g) => (
                        <nav key={g.title} className="oft-col oft-col--links" aria-label={g.title}>
                            <p className="oft-heading">{g.title}</p>
                            {g.links.map((l) => renderLink(l, 'oft-link'))}
                        </nav>
                    ))}

                    <div className="oft-col oft-tile">
                        <p className="oft-heading">Horario</p>
                        <p className="oft-strong">Sábado · 9:30 AM</p>
                        <p className="oft-soft">Culto central</p>
                        <p className="oft-soft"><MapPin size={13} aria-hidden="true" /> Medellín, Antioquia</p>
                    </div>

                    <div className="oft-col oft-tile oft-col--social">
                        <p className="oft-heading">{socials.length ? 'Síguenos' : 'Comunidad'}</p>
                        <p className="oft-soft oft-desc">Un refugio de paz para la familia, conectados por la fe y el servicio.</p>
                        {socials.length > 0 && (
                            <div className="oft-socials">
                                {socials.map(([label, icon, url]) => (
                                    <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="oft-social">
                                        <i className={`bi ${icon}`} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <nav className="oft-chips" aria-label="Accesos rápidos">
                        {MOBILE_CHIPS.map((l) => renderLink(l, 'oft-chip'))}
                    </nav>
                </motion.div>

                {/* 3. Marca con brillo */}
                <div className="oft-wordmark" aria-hidden="true">OASIS</div>

                <div className="oft-bottom">
                    <Link to="/" className="oft-logo" aria-label="Iglesia Adventista Oasis, inicio">
                        <img src={logoImg} alt="" />
                        <span>Iglesia Adventista</span>
                    </Link>
                    <small>© {now.getFullYear()} Iglesia Adventista Oasis · Medellín</small>
                    <button type="button" className="oft-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        Subir <ArrowUp size={13} aria-hidden="true" />
                    </button>
                </div>
            </motion.div>

            <style>{`
                .oft {
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                    background: #08050D;
                    color: #fff;
                    font-family: 'Inter', system-ui, sans-serif;
                    padding: 92px 24px 24px;
                }
                .oft-photo {
                    position: absolute; inset: 0; width: 100%; height: 100%;
                    object-fit: cover; object-position: center 40%;
                    filter: saturate(0.85) brightness(0.55);
                    z-index: -2;
                }
                .oft-veil {
                    position: absolute; inset: 0; z-index: -1;
                    background:
                        linear-gradient(180deg, #F8F9FC 0%, rgba(8,5,13,0.6) 16%, rgba(8,5,13,0.93) 42%, #08050D 72%),
                        radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.12), transparent 60%);
                }
                .oft-inner { max-width: 1180px; margin: 0 auto; }

                .oft-cta {
                    display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; flex-wrap: wrap;
                    padding-bottom: 32px; margin-bottom: 36px;
                    border-bottom: 1px solid transparent;
                    border-image: linear-gradient(90deg, rgba(245,158,11,0.6), rgba(255,255,255,0.08) 60%, transparent) 1;
                }
                .oft-cta-title {
                    font-family: 'Moonrising', sans-serif;
                    font-size: clamp(1.9rem, 4.6vw, 3.2rem);
                    line-height: 1.05; letter-spacing: 1px; margin: 18px 0 12px; color: #fff;
                }
                .oft-cta-title span { color: #F59E0B; }
                .oft-cta-sub {
                    display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin: 0;
                    color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight: 300;
                }
                .oft-cta-sub svg { color: #F59E0B; }
                .oft-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.4); margin: 0 6px; }
                .oft-cta-actions { display: flex; gap: 10px; flex-wrap: wrap; }
                .oft-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 12px 22px; border-radius: 999px; text-decoration: none;
                    font-size: 0.86rem; font-weight: 500; color: #fff;
                    border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04);
                    backdrop-filter: blur(10px);
                    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                }
                .oft-btn:hover { transform: translateY(-2px); border-color: rgba(245,158,11,0.6); color: #fff; }
                .oft-btn--gold { background: #F59E0B; border-color: #F59E0B; color: #120C1F; font-weight: 600; }
                .oft-btn--gold:hover { color: #120C1F; box-shadow: 0 14px 30px -10px rgba(245,158,11,0.6); }

                .oft-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; align-items: start; }
                .oft-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
                .oft-heading {
                    font-size: 0.66rem; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase;
                    color: #F59E0B; margin: 0 0 4px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .oft-strong { margin: 0; font-size: 0.95rem; font-weight: 600; color: #fff; }
                .oft-soft { margin: 0; display: flex; align-items: center; gap: 6px; font-size: 0.86rem; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.62); }
                .oft-soft svg { color: #F59E0B; flex-shrink: 0; }
                .oft-socials { display: flex; gap: 8px; margin-top: 4px; }
                .oft-social {
                    width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
                    color: #fff; text-decoration: none; border: 1px solid rgba(255,255,255,0.14);
                    transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
                }
                .oft-social:hover { background: #F59E0B; color: #120C1F; transform: translateY(-3px); }
                .oft-link {
                    position: relative; width: fit-content; display: inline-flex; align-items: center; gap: 4px;
                    color: rgba(255,255,255,0.82); text-decoration: none; font-size: 0.9rem; font-weight: 400;
                    transition: color 0.2s ease;
                }
                .oft-link::after {
                    content: ''; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px;
                    background: #F59E0B; transform: scaleX(0); transform-origin: left; transition: transform 0.3s ease;
                }
                .oft-link:hover { color: #fff; }
                .oft-link:hover::after { transform: scaleX(1); }
                .oft-chips { display: none; }

                .oft-wordmark {
                    margin: 28px 0 12px;
                    font-family: 'Moonrising', sans-serif;
                    font-size: clamp(2.6rem, 8vw, 6rem);
                    line-height: 1; letter-spacing: 0.18em; text-align: center; user-select: none;
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(255,255,255,0.1);
                    background: linear-gradient(100deg, transparent 35%, rgba(245,158,11,0.55) 50%, transparent 65%) no-repeat;
                    background-size: 40% 100%;
                    -webkit-background-clip: text; background-clip: text;
                    animation: oft-shine 7s ease-in-out infinite;
                }
                @keyframes oft-shine { 0% { background-position: -60% 0; } 60%, 100% { background-position: 160% 0; } }

                .oft-bottom {
                    position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px;
                    padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.45); font-size: 0.76rem;
                }
                .oft-bottom small { text-align: center; }
                .oft-logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: rgba(255,255,255,0.7); font-size: 0.66rem; letter-spacing: 0.22em; text-transform: uppercase; width: fit-content; }
                .oft-logo img { height: 26px; filter: brightness(0) invert(1); }
                .oft-top { justify-self: end;
                    display: inline-flex; align-items: center; gap: 6px; background: none; cursor: pointer;
                    color: rgba(255,255,255,0.75); font-size: 0.76rem; border: 1px solid rgba(255,255,255,0.14);
                    border-radius: 999px; padding: 6px 13px; transition: color 0.2s ease, border-color 0.2s ease;
                }
                .oft-top:hover { color: #F59E0B; border-color: #F59E0B; }

                @media (max-width: 992px) {
                    .oft-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 28px; }
                }
                /* Móvil: versión corta — sin columnas de enlaces (las cubre la BottomNav) */
                @media (max-width: 640px) {
                    .oft { padding: 84px 18px 22px; }
                    .oft-cta { padding-bottom: 26px; margin-bottom: 22px; gap: 18px; }
                    .oft-cta-title { margin: 14px 0 8px; }
                    .oft-cta-sub { font-size: 0.8rem; }
                    .oft-cta-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
                    .oft-btn { justify-content: center; padding: 11px 12px; font-size: 0.8rem; }
                    .oft-grid { gap: 10px; }
                    .oft-col--links, .oft-desc { display: none; }
                    .oft-grid--nosocial .oft-col--social { display: none; }
                    .oft-grid--nosocial .oft-tile { grid-column: 1 / -1; }
                    .oft-tile {
                        gap: 4px; padding: 14px; border-radius: 16px;
                        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                    }
                    .oft-heading { font-size: 0.6rem; padding-bottom: 8px; margin-bottom: 4px; }
                    .oft-strong { font-size: 0.85rem; }
                    .oft-soft { font-size: 0.76rem; }
                    .oft-social { width: 34px; height: 34px; }
                    .oft-chips { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 4px; }
                    .oft-chip {
                        display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 9px 6px;
                        border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.85);
                        text-decoration: none; font-size: 0.78rem;
                    }
                    .oft-wordmark { margin: 22px 0 10px; font-size: 2.6rem; }
                    .oft-bottom { grid-template-columns: 1fr auto; font-size: 0.66rem; }
                    .oft-bottom small { grid-column: 1 / -1; grid-row: 2; text-align: left; }
                }
                @media (prefers-reduced-motion: reduce) { .oft-wordmark { animation: none; } }
            `}</style>
        </footer>
    );
};

export default Footer;
