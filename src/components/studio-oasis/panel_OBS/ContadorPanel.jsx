import React, { useState, useRef, useEffect } from 'react';
import { Play, FastForward, Sliders, Check, X, Image as ImageIcon, Upload, Grid3X3, Monitor, Tv, LayoutTemplate } from 'lucide-react';

const ContadorPanel = ({
    timeMetrics,
    studioMode,
    setStudioMode,
    startService,
    endService,
    updateCountdownConfig,
    pushToOBS,
    countdownTemplate,
    setCountdownTemplate
}) => {
    // Estado para controlar la pantalla emergente modal con Blur
    const [isConfigMode, setIsConfigMode] = useState(false);

    // Estados locales para la personalización de la cuenta regresiva
    const [customMinutes, setCustomMinutes] = useState('5');
    const [countdownTitle, setCountdownTitle] = useState('EL CULTO INICIA EN');

    // ESTADOS AVANZADOS PARA PERSONALIZACIÓN DE FONDO
    const [selectedPattern, setSelectedPattern] = useState('none'); // 'dots', 'grid', 'stripes', etc.
    const [uploadedImage, setUploadedImage] = useState(null);
    const fileInputRef = useRef(null); // Referencia al input de archivo invisible

    const estilosGraficos = ['CLASSIC', 'MINIMAL', 'SIDEBAR', 'CINEMATIC'];
    const patronesFondo = ['none', 'dots', 'grid', 'stripes', 'waves'];

    // Manejador para la subida de imágenes de fondo (Con Compresión Automática para no saturar el Websocket)
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1280;
                    const MAX_HEIGHT = 720;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width = Math.round((width * MAX_HEIGHT) / height);
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Comprimir a WEBP con calidad media (0.5) para mantener el payload pequeño
                    const compressedBase64 = canvas.toDataURL('image/webp', 0.5);
                    setUploadedImage(compressedBase64);
                    setSelectedPattern('none');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const [localRemaining, setLocalRemaining] = useState(5 * 60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning) {
            setLocalRemaining((parseInt(customMinutes) || 5) * 60);
        }
    }, [customMinutes, isRunning]);

    useEffect(() => {
        let interval;
        if (isRunning && localRemaining > 0) {
            interval = setInterval(() => {
                setLocalRemaining(prev => prev - 1);
            }, 1000);
        } else if (localRemaining <= 0) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, localRemaining]);

    const formatTimer = () => {
        const absoluteSeconds = Math.abs(localRemaining);
        const mins = Math.floor(absoluteSeconds / 60);
        const secs = absoluteSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlay = (target = 'all') => {
        if (localRemaining <= 0) return;
        setIsRunning(true);
        if (pushToOBS) {
            pushToOBS('countdown', countdownTitle.toUpperCase(), '', {
                targetTime: Date.now() + (localRemaining * 1000),
                template: countdownTemplate,
                customBg: uploadedImage,
                target: target // Enviar bandera de destino ('all', 'obs', 'proyector')
            });
        }
    };
    
    const handleStop = () => {
        setIsRunning(false);
        setLocalRemaining((parseInt(customMinutes) || 5) * 60);
        if (pushToOBS) {
            pushToOBS('hidden', '', '', { target: 'all' });
        }
    };

    // Manejador para guardar y aplicar la nueva configuración
    const handleSaveConfig = () => {
        if (updateCountdownConfig) {
            updateCountdownConfig({
                minutes: parseInt(customMinutes) || 5,
                title: countdownTitle.toUpperCase(),
                style: countdownTemplate,
                pattern: selectedPattern,
                backgroundImage: uploadedImage
            });
        }
        setIsConfigMode(false);
    };

    return (
        <div className="w-full max-w-[320px] select-none text-gray-900 relative h-full" data-purpose="independent-countdown-panel">
            {/* CUADRO PRINCIPAL DEL CONTADOR */}
            <div className="bg-ui-bg shadow-neumorph rounded-[2.5rem] p-5 border border-white/60 flex flex-col items-center justify-between h-full relative z-10 overflow-hidden">

                {/* FONDO PERSONALIZADO DEL CONTADOR (Pattern o Imagen) */}
                <div className={`absolute inset-0 z-0 ${uploadedImage ? '' : `bg-ui-pattern-${selectedPattern} opacity-[0.03]`}`} style={uploadedImage ? { backgroundImage: `url(${uploadedImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05 } : {}}></div>

                {/* CABECERA SIMPLIFICADA: TÍTULO TOTALMENTE CENTRADO */}
                <div className="w-full text-center mt-2 mb-2 shrink-0 z-10">
                    <h2 className="font-moonrising text-[18px] font-bold tracking-wider text-gray-950 uppercase">
                        CONTADOR
                    </h2>
                </div>

                {/* ZONA CENTRAL: CÍRCULO PERFECTO REDONDO */}
                <div className="w-full flex-1 flex items-center justify-center my-1 z-10 relative">
                    <div className="relative w-full max-w-[185px] aspect-square flex flex-col items-center justify-center bg-oasis-yellow rounded-full shadow-[inset_0_4px_10px_rgba(0,0,0,0.15),0_12px_30px_rgba(245,158,11,0.35)] border border-white/20">
                        {/* Números del contador renderizados estrictamente con tipografía Moonrising */}
                        <span className="font-moonrising font-bold text-[42px] tracking-tight text-black leading-none mt-1">
                            {formatTimer()}
                        </span>
                        {timeMetrics?.title && (
                            <span className="absolute bottom-5 font-moonrising text-[6.5px] font-black text-black/40 tracking-wider text-center max-w-[80%] truncate">
                                {timeMetrics.title}
                            </span>
                        )}
                    </div>
                </div>

                {/* BLOQUE MULTIMEDIA 1: CONTROLES DE REPRODUCCIÓN */}
                <div className="bg-ui-bg shadow-neumorph rounded-2xl flex items-center justify-center p-1.5 h-[46px] w-full max-w-[240px] border border-white/50 shrink-0 mb-2 z-10 relative">
                    <div className="bg-ui-bg shadow-neumorph-inset rounded-xl flex-1 h-[30px] flex items-center justify-between px-4 relative border border-white/20">
                        <button onClick={handleStop} className="w-7 h-7 flex items-center justify-center z-10 group" title="Detener cronómetro"><div className="w-3.5 h-3.5 bg-black rounded-[4px] group-hover:bg-oasis-red active:scale-95 transition-all"></div></button>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            {isRunning ? (
                                <div className="w-8 h-8 bg-oasis-red rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(239,68,68,0.4)] border border-white/40 cursor-default">
                                    <span className="w-2 h-2 bg-white rounded-sm animate-pulse"></span>
                                </div>
                            ) : (
                                <button onClick={() => handlePlay('all')} className="w-8 h-8 bg-oasis-yellow rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(245,158,11,0.4)] text-white hover:scale-105 active:scale-95 transition-all border border-white/40" title="Reproducir en TODAS las pantallas"><Play size={12} fill="currentColor" className="ml-0.5" /></button>
                            )}
                        </div>
                        <button onClick={() => {}} className="text-black hover:text-oasis-orange active:scale-90 transition-all z-10 w-7 h-7 flex items-center justify-center" title="Avance Rápido"><FastForward size={13} fill="currentColor" /></button>
                    </div>
                </div>

                {/* BLOQUE INTERMEDIO: BOTÓN AJUSTES DE CONSOLA */}
                <div className="w-full max-w-[240px] shrink-0 mb-3 z-10 relative">
                    <button type="button" onClick={() => setIsConfigMode(true)} className="w-full h-[36px] bg-white shadow-sm hover:shadow-md rounded-xl border border-gray-100/70 text-gray-500 hover:text-oasis-orange text-[9.5px] font-moonrising font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99]"><Sliders size={12} strokeWidth={2.5} />Personalizar Parámetros</button>
                </div>

                {/* SELECTORES DE SALIDA AL AIRE (ENVÍO INDIVIDUAL) */}
                <div className="grid grid-cols-2 gap-3 w-full mt-auto mb-1 shrink-0 z-10 relative">
                    <button onClick={() => handlePlay('obs')} className={`font-moonrising text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${isRunning ? 'bg-ui-bg text-gray-400 border-gray-200 opacity-70' : 'bg-white text-gray-700 shadow-sm border-gray-100 hover:scale-[1.02] hover:border-oasis-green hover:text-oasis-green'}`} disabled={isRunning}>
                        <Monitor size={12} />
                        OBS
                    </button>
                    <button onClick={() => handlePlay('proyector')} className={`font-moonrising text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${isRunning ? 'bg-ui-bg text-gray-400 border-gray-200 opacity-70' : 'bg-white text-gray-700 shadow-sm border-gray-100 hover:scale-[1.02] hover:border-oasis-yellow hover:text-oasis-yellow'}`} disabled={isRunning}>
                        <Tv size={12} />
                        PROYECTOR
                    </button>
                </div>
            </div>

            {/* PANTALLA EMERGENTE (MODAL): EXPANDIDA, SIN BORDE BRILLANTE, CON AJUSTES DE FONDO */}
            <div className={`absolute inset-0 bg-slate-900/30 backdrop-blur-md rounded-[2.5rem] z-50 flex items-center justify-center transition-all duration-300 overflow-hidden ${isConfigMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Contenedor Modal Plano (Sin border ni shadow extra) */}
                <div className="w-full h-full bg-ui-bg flex flex-col gap-3 relative p-6 pt-10">

                    {/* Botón Cerrar Modal */}
                    <button type="button" onClick={() => setIsConfigMode(false)} className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 transition-colors z-20"><X size={16} strokeWidth={2.5} /></button>

                    <span className="block text-center text-[10px] font-moonrising font-bold text-gray-400 uppercase tracking-widest mt-1">AJUSTES CONTADOR</span>

                    {/* SECCIÓN 1: AJUSTES DE TEXTO Y TIEMPO (Grupo Simétrico) */}
                    <div className="space-y-3">
                        <div className="bg-white shadow-sm rounded-full h-[32px] flex items-center border border-gray-100 px-3.5"><input value={countdownTitle} onChange={e => setCountdownTitle(e.target.value)} className="w-full bg-transparent border-none text-[9px] font-sans font-bold text-gray-800 placeholder-gray-400 p-0 focus:ring-0 text-center uppercase" placeholder="TÍTULO DEL CONTADOR" type="text" /></div>
                        <div className="bg-white shadow-sm rounded-full h-[32px] flex items-center border border-gray-100 px-3.5"><span className="text-[8.5px] font-moonrising font-bold text-gray-400 mr-2 shrink-0">MINUTOS:</span><input value={customMinutes} onChange={e => setCustomMinutes(e.target.value)} className="w-full bg-transparent border-none text-[11px] font-sans font-bold text-gray-950 p-0 focus:ring-0 text-left" type="number" min="1" max="60" /></div>
                    </div>

                    {/* SECCIÓN 2: AJUSTES VISUALES AVANZADOS (ESTILO Y FONDO) */}
                    <div className="space-y-3.5 mt-1.5 flex-1 flex flex-col">

                        {/* A. Selector de Estilo Gráfico */}
                        <div className="space-y-1 mt-4">
                            <div className="flex justify-between items-center px-1">
                                <h4 className="font-moonrising text-[8px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
                                    <LayoutTemplate size={10} /> Estilo Visual (Contador)
                                </h4>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {estilosGraficos.map((estilo) => (
                                    <button
                                        key={estilo}
                                        onClick={() => setCountdownTemplate(estilo)}
                                        className={`h-[28px] rounded-lg border flex items-center justify-center transition-all ${countdownTemplate === estilo
                                                ? 'bg-oasis-yellow border-oasis-yellow text-white shadow-md font-black'
                                                : 'bg-white border-gray-100 text-gray-400 hover:text-oasis-yellow hover:border-oasis-yellow/30 font-bold'
                                            }`}
                                    >
                                        <span className="font-moonrising text-[6.5px] uppercase tracking-wider">{estilo}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* B. Selector de Trama de Fondo (Patrón Predefinido) */}
                        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                            <span className="block text-left text-[8px] font-moonrising font-bold text-gray-400 uppercase tracking-widest pl-2 flex items-center gap-1.5"><Grid3X3 size={11} />Trama de Fondo Predefinida</span>
                            <div className="bg-white shadow-sm rounded-2xl h-[42px] w-full border border-gray-100 relative flex items-center gap-1.5 px-2">
                                {patronesFondo.map((patron) => (
                                    <button key={patron} type="button" onClick={() => { setSelectedPattern(patron); setUploadedImage(null); }} className={`w-7 aspect-square rounded-lg transition-all border flex items-center justify-center relative overflow-hidden ${selectedPattern === patron ? 'border-oasis-yellow shadow-md scale-105' : 'border-gray-100'}`} title={`Patrón ${patron}`}>
                                        <div className={`absolute inset-0 bg-oasis-yellow ${patron === 'none' ? 'bg-transparent' : `bg-ui-pattern-${patron}`}`}></div>
                                        {patron === 'none' && <X size={12} className="text-gray-300 relative z-10" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* C. Subida de Imagen de Fondo (Personalizada) */}
                        <div className="space-y-1.5 shrink-0">
                            <span className="block text-left text-[8px] font-moonrising font-bold text-gray-400 uppercase tracking-widest pl-2 flex items-center gap-1.5"><ImageIcon size={11} />Imagen de Fondo Personalizada</span>
                            {/* Input de archivo invisible */}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="flex-1 h-[32px] bg-ui-bg shadow-sm rounded-full border border-gray-100 text-gray-600 font-moonrising text-[8.5px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-[0.98]"><Upload size={12} />{uploadedImage ? 'Cambiar Imagen' : 'Subir Imagen'}</button>
                                {uploadedImage && (
                                    <button type="button" onClick={() => setUploadedImage(null)} className="w-8 aspect-square bg-white shadow-sm rounded-full border border-gray-100 text-oasis-red flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Eliminar imagen"><X size={14} /></button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botón Aplicar Ajustes (Fijado abajo) */}
                    <button type="button" onClick={handleSaveConfig} className="w-full h-[36px] bg-oasis-green text-white rounded-full flex items-center justify-center font-moonrising text-[9.5px] font-bold tracking-wider gap-1.5 shadow-md transition-transform active:scale-[0.98] mt-3 sticky bottom-0 z-10"><Check size={12} strokeWidth={3} /> APLICAR CAMBIOS</button>
                </div>
            </div>
        </div>
    );
};

export default ContadorPanel;