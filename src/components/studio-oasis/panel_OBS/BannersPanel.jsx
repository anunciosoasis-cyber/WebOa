import React, { useState } from 'react';
import { Play } from 'lucide-react';

const BannersPanel = ({
    preacher,
    setPreacher,
    setActivePreviewSource,
    pushToOBS,
    announcementsList,
    announcement,
    setAnnouncement,
    saveToAnnouncementsMemory,
    globalTemplate,
    setGlobalTemplate,
    liveOverlay,
    activeTab: activeTab_Content,
    handleTemplateChange,
    bibleTemplate,
    hymnalTemplate,
    preacherStyle,
    announcementStyle
}) => {
    const [activeTab, setActiveTab] = useState('preacher');
    const estilos = ['CLASSIC', 'MINIMAL', 'SIDEBAR', 'CINEMATIC'];

    // Mostrar el template correcto según la pestaña de contenido activa o el tab local si estamos en banners
    let currentDisplayTemplate = globalTemplate;
    if (activeTab_Content === 'biblia') currentDisplayTemplate = bibleTemplate?.toUpperCase?.() || 'CLASSIC';
    else if (activeTab_Content === 'himnario') currentDisplayTemplate = hymnalTemplate?.toUpperCase?.() || 'CLASSIC';
    else if (activeTab === 'preacher') currentDisplayTemplate = preacherStyle?.toUpperCase?.() || 'CLASSIC';
    else if (activeTab === 'anuncio') currentDisplayTemplate = announcementStyle?.toUpperCase?.() || 'CLASSIC';

    const handleTemplateChangeImmediate = (estilo) => {
        if (handleTemplateChange) {
            handleTemplateChange(estilo);
        } else {
            setGlobalTemplate(estilo);
        }
        
        // Si hay algo en vivo, aplicar el template inmediatamente sin esperar al Play
        if (liveOverlay && liveOverlay.mode && liveOverlay.mode !== 'hidden') {
            const extra = { template: estilo };
            if (liveOverlay.subText) extra.subText = liveOverlay.subText;
            if (liveOverlay.accent_color) extra.accent_color = liveOverlay.accent_color;
            if (liveOverlay.bg_color) extra.bg_color = liveOverlay.bg_color;
            if (liveOverlay.customBg) extra.customBg = liveOverlay.customBg;
            if (liveOverlay.pattern) extra.pattern = liveOverlay.pattern;
            pushToOBS(liveOverlay.mode, liveOverlay.title, liveOverlay.content, extra);
        }
    };

    const getLeftPosition = (style) => {
        switch (style) {
            case 'CLASSIC': return 'left-0.5 w-[24%]';
            case 'MINIMAL': return 'left-[25.5%] w-[24%]';
            case 'SIDEBAR': return 'left-[50.5%] w-[24%]';
            case 'CINEMATIC': return 'left-[75.5%] w-[24%]';
            default: return 'left-0.5 w-[24%]';
        }
    };

    return (
        <div
            className="bg-ui-bg shadow-neumorph rounded-[2.5rem] p-4 border border-white/60 w-full h-auto xl:h-full flex flex-col justify-between select-none text-gray-900 min-h-0"
            data-purpose="banners-hardware-panel"
        >
            {/* CABECERA: TÍTULO Y SELECTOR DE ESTILO MAESTRO UNIFICADO */}
            <div className="flex flex-col items-center shrink-0 w-full mb-3 gap-2">
                <h3 className="font-moonrising font-bold text-gray-950 tracking-wider text-[12px] uppercase">
                    ESTILOS GLOBALES & BANNERS
                </h3>

                <div className="bg-white shadow-sm rounded-full p-0.5 h-[26px] w-full border border-gray-100/70 relative flex items-center">
                    <div className={`absolute top-0.5 bottom-0.5 bg-oasis-yellow/90 rounded-full shadow-sm transition-all duration-300 ease-out z-10 ${getLeftPosition(currentDisplayTemplate)}`} />
                    {estilos.map((estilo) => (
                        <button
                            key={estilo}
                            type="button"
                            onClick={() => handleTemplateChangeImmediate(estilo)}
                            className={`flex-1 h-full font-moonrising text-[7.5px] font-bold uppercase tracking-wider z-20 flex items-center justify-center transition-colors ${currentDisplayTemplate === estilo ? 'text-gray-950 font-black' : 'text-gray-400 hover:text-slate-600'
                                }`}
                        >
                            {estilo}
                        </button>
                    ))}
                </div>
            </div>

            {/* SEGMENTADOR DE CONTENIDO (Pestañas Unificadas) */}
            <div className="bg-ui-bg shadow-neumorph-inset rounded-full p-1 h-[34px] w-full relative flex flex-row items-center border border-white/30 mb-2 shrink-0">
                <div
                    className={`absolute top-0.5 bottom-0.5 w-[47%] bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-300 ease-out z-10 ${activeTab === 'preacher' ? 'left-1' : 'left-[51%]'
                        }`}
                />
                <button
                    onClick={() => { setActiveTab('preacher'); setActivePreviewSource('preacher'); }}
                    className={`flex-1 h-full text-[9px] uppercase font-moonrising font-bold tracking-wider z-20 transition-colors duration-300 relative ${activeTab === 'preacher' ? 'text-oasis-yellow font-black' : 'text-gray-400 hover:text-slate-600'
                        }`}
                >
                    PREDICADOR
                </button>
                <button
                    onClick={() => { setActiveTab('anuncio'); setActivePreviewSource('anuncio'); }}
                    className={`flex-1 h-full text-[9px] uppercase font-moonrising font-bold tracking-wider z-20 transition-colors duration-300 relative ${activeTab === 'anuncio' ? 'text-oasis-yellow font-black' : 'text-gray-400 hover:text-slate-600'
                        }`}
                >
                    ANUNCIO
                </button>
            </div>

            {/* ÁREA DE CONTENIDO: REJILLA DE DOS COLUMNAS */}
            <div className="flex-1 flex flex-col justify-center min-h-0 w-full mb-0">

                {/* VISTA 1: FORMULARIO PREDICADOR */}
                {activeTab === 'preacher' && (
                    <div className="flex flex-col gap-3 justify-center h-full w-full min-h-0">
                        <div className="bg-white shadow-sm rounded-full h-[36px] flex items-center border border-gray-100 px-5 w-full">
                            <input
                                value={preacher.name}
                                onChange={e => { setPreacher({ ...preacher, name: e.target.value }); setActivePreviewSource('preacher'); }}
                                className="w-full bg-transparent border-none text-[10.5px] font-sans font-bold text-gray-800 placeholder-gray-400 p-0 focus:ring-0 text-center uppercase"
                                placeholder="NOMBRE PREDICADOR"
                                type="text"
                            />
                        </div>
                        <div className="bg-white shadow-sm rounded-full h-[36px] flex items-center border border-gray-100 px-5 w-full">
                            <input
                                value={preacher.title}
                                onChange={e => { setPreacher({ ...preacher, title: e.target.value }); setActivePreviewSource('preacher'); }}
                                className="w-full bg-transparent border-none text-[10.5px] font-sans font-bold text-gray-800 placeholder-gray-400 p-0 focus:ring-0 text-center uppercase"
                                placeholder="TÍTULO / TEMA DEL SERMÓN"
                                type="text"
                            />
                        </div>
                    </div>
                )}

                {/* VISTA 2: FORMULARIO ANUNCIOS */}
                {activeTab === 'anuncio' && (
                    <div className="grid grid-cols-1 md:grid-cols-[1.1fr,1fr] gap-3 items-stretch h-full w-full min-h-[150px] md:min-h-0">
                        <div className="flex flex-col gap-2 justify-center">
                            <div className="bg-white shadow-sm rounded-full h-[32px] flex items-center border border-gray-100 px-3 overflow-hidden w-full">
                                <select
                                    onChange={e => {
                                        const selected = announcementsList.find(a => a.title === e.target.value);
                                        if (selected) { setAnnouncement(selected); setActivePreviewSource('anuncio'); }
                                    }}
                                    className="w-full bg-transparent border-none text-[9.5px] font-sans font-bold text-gray-700 p-0 focus:ring-0 text-center appearance-none cursor-pointer tracking-wide"
                                >
                                    <option value="">RÁPIDOS (SELECCIONAR)</option>
                                    {announcementsList?.map((a) => (
                                        <option key={a.title} value={a.title}>{a.title.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-white shadow-sm rounded-full h-[32px] flex items-center border border-gray-100 px-4 w-full">
                                <input
                                    value={announcement.title}
                                    onChange={e => { setAnnouncement({ ...announcement, title: e.target.value }); setActivePreviewSource('anuncio'); }}
                                    className="w-full bg-transparent border-none text-[10px] font-sans font-bold text-gray-800 placeholder-gray-400 p-0 focus:ring-0 text-center uppercase"
                                    placeholder="TÍTULO DEL ANUNCIO"
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="bg-black rounded-2xl p-2.5 border border-slate-900 overflow-hidden relative flex flex-col justify-between shadow-inner min-h-[60px]">
                            <textarea
                                value={announcement.content}
                                onChange={e => { setAnnouncement({ ...announcement, content: e.target.value }); setActivePreviewSource('anuncio'); }}
                                className="w-full bg-transparent border-none text-[10px] font-sans font-medium text-white placeholder-white/30 p-0 focus:ring-0 text-center resize-none h-full custom-scrollbar leading-tight"
                                placeholder="ESCRIBE EL TEXTO DEL ANUNCIO AQUÍ..."
                            />
                            <div className="absolute bottom-1 right-2 pointer-events-none select-none">
                                <span className="font-moonrising text-[7px] font-bold text-white/20 tracking-wider">
                                    TEXT
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTONERA MULTIMEDIA FLUIDA: Orgánica en el flujo y del ancho de la barra de estilos */}
            <div className="bg-ui-bg shadow-neumorph rounded-2xl flex items-center justify-center p-1 h-[42px] w-full border border-white/50 shrink-0 mt-3">
                <div className="bg-ui-bg shadow-neumorph-inset rounded-full flex-1 h-[28px] flex items-center justify-between px-6 relative border border-white/20">
                    <button
                        onClick={() => pushToOBS('hidden')}
                        className="text-[9px] font-moonrising font-bold text-oasis-red hover:text-red-600 active:scale-95 transition-all z-10 tracking-wider"
                    >
                        OCULTAR
                    </button>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <button
                            onClick={activeTab === 'preacher'
                                ? () => pushToOBS('preacher', preacher.name, preacher.title, { template: globalTemplate })
                                : () => { saveToAnnouncementsMemory(announcement); pushToOBS('anuncio', announcement.title, announcement.content, { template: globalTemplate }); }
                            }
                            className="w-7 h-7 bg-oasis-yellow rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(245,158,11,0.4)] text-white hover:scale-105 active:scale-95 transition-all border border-white/40"
                        >
                            <Play size={10} fill="currentColor" className="ml-0.5" />
                        </button>
                    </div>

                    <span className="text-[9px] font-moonrising font-bold text-gray-400 select-none z-10 tracking-widest">
                        LIVE
                    </span>
                </div>
            </div>

        </div>
    );
};

export default BannersPanel;