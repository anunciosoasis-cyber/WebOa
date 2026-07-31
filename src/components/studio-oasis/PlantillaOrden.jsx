import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Layers, ArrowRight } from 'lucide-react';

const PlantillaOrden = ({
    showPlantilla,
    setShowPlantilla,
    plantillasDefault,
    plantillasCustom = [],
    selectedDate,
    apiClient,
    fetchOrden,
    showToast
}) => {
    // Unificamos las plantillas del sistema y las creadas por el usuario
    const todasLasPlantillas = [...plantillasDefault, ...plantillasCustom];
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(todasLasPlantillas[0] || null);

    if (!showPlantilla) return null;

    // Acción 1: Inyectar TODOS los elementos de la plantilla (Por Lote)
    const aplicarPorLote = async () => {
        if (!plantillaSeleccionada) return;
        const todosLosItems = plantillaSeleccionada.secciones.flatMap(s => s.items.filter(i => i.actividad.trim()));

        try {
            showToast('Procesando inyección por lote...', 'info');
            // Mapeamos y disparamos las peticiones asíncronas de manera secuencial o en paralelo
            await Promise.all(
                todosLosItems.map(item =>
                    apiClient.post('/orden-culto', {
                        actividad: item.actividad,
                        responsable: item.responsable || '—',
                        hora: item.hora || '09:00',
                        duracionEstimada: item.duracion || 5,
                        fecha: selectedDate,
                    })
                )
            );
            await fetchOrden();
            showToast(`${todosLosItems.length} bloques añadidos con éxito`, 'success');
            setShowPlantilla(false);
        } catch (error) {
            showToast('Error al importar la plantilla completa', 'error');
        }
    };

    // Acción 2: Inyectar un único elemento al itinerario (Individual)
    const aplicarIndividual = async (item) => {
        try {
            await apiClient.post('/orden-culto', {
                actividad: item.actividad,
                responsable: item.responsable || '—',
                hora: item.hora || '09:00',
                duracionEstimada: item.duracion || 5,
                fecha: selectedDate,
            });
            await fetchOrden();
            showToast(`Añadido: ${item.actividad}`, 'success');
        } catch (error) {
            showToast('Error al añadir el bloque', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 select-none animate-fade-in">
            {/* Contenedor Principal del Modal Estilo Estudio Oasis */}
            <div className="bg-ui-bg shadow-2xl rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col border border-white/60 overflow-hidden text-gray-900">

                {/* CABECERA PANTALLA */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <div>
                        <h3 className="font-moonrising text-lg uppercase tracking-wider text-gray-950">
                            Plantillas de <span className="text-oasis-yellow">Culto</span>
                        </h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Selecciona, previsualiza e inyecta bloques al servicio
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPlantilla(false)}
                        className="bg-ui-bg shadow-neumorph w-8 h-8 rounded-full flex items-center justify-center hover:text-oasis-orange active:scale-90 transition-all border border-white/50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* CUERPO DEL PANEL DIVIDIDO EN DOS COLUMNAS */}
                <div className="flex-1 flex flex-row overflow-hidden p-6 gap-6 min-h-0">

                    {/* COLUMNA IZQUIERDA: Selector de Plantillas Disponibles */}
                    <div className="w-[320px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                            Estructuras disponibles
                        </span>
                        {todasLasPlantillas.map(p => {
                            const isSelected = plantillaSeleccionada?.id === p.id;
                            const totalBloques = p.secciones.reduce((acc, sec) => acc + sec.items.length, 0);

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setPlantillaSeleccionada(p)}
                                    className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${isSelected
                                            ? 'bg-ui-bg shadow-neumorph-inset border-oasis-yellow/30'
                                            : 'bg-ui-bg shadow-neumorph border-white/50 hover:scale-[1.01]'
                                        }`}
                                >
                                    <h5 className={`text-[13px] font-bold truncate ${isSelected ? 'text-oasis-yellow' : 'text-gray-900'}`}>
                                        {p.nombre}
                                    </h5>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <Layers size={11} />
                                        <span>{totalBloques} bloques programados</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* COLUMNA DERECHA: Monitor de Previsualización y Carga Atómica */}
                    <div className="flex-1 bg-ui-bg shadow-neumorph-inset rounded-[2rem] border border-white/20 p-5 flex flex-col min-h-0 overflow-hidden">
                        {plantillaSeleccionada ? (
                            <>
                                {/* Cabecera interna del monitor con botón por lote */}
                                <div className="flex items-center justify-between mb-4 shrink-0">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar size={14} />
                                        <span className="text-[11px] font-bold uppercase tracking-wider">
                                            Vista previa del itinerario
                                        </span>
                                    </div>
                                    <button
                                        onClick={aplicarPorLote}
                                        className="bg-oasis-yellow text-white text-[10px] font-bold px-4 py-2 rounded-xl uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Aplicar Plantilla Completa
                                    </button>
                                </div>

                                {/* Listado Escroleable de Capítulos e Items */}
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                    {plantillaSeleccionada.secciones.map(seccion => (
                                        <div key={seccion.id} className="space-y-2">
                                            {/* Cabecera de Sección (Ej: Escuela Sabática) */}
                                            <div className="bg-ui-bg shadow-neumorph px-4 py-1.5 rounded-xl border border-white/40 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-gray-700 truncate tracking-wide">
                                                    {seccion.titulo}
                                                </span>
                                                <span className="font-moonrising text-xs font-bold text-oasis-yellow shrink-0">
                                                    {seccion.horario}
                                                </span>
                                            </div>

                                            {/* Items Individuales */}
                                            <div className="space-y-1.5 pl-2">
                                                {seccion.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-white/70 rounded-xl px-4 py-2 flex items-center justify-between border border-gray-100/60 shadow-sm group hover:bg-white transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden mr-2">
                                                            <span className="text-[10px] font-bold font-mono text-gray-400 shrink-0">
                                                                {item.hora}
                                                            </span>
                                                            <span className="text-[12px] font-bold text-gray-800 truncate">
                                                                {item.actividad}
                                                            </span>
                                                        </div>

                                                        {/* Acciones de Inyección Individual */}
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                                                <Clock size={10} />
                                                                <span>{item.duracion} min</span>
                                                            </div>
                                                            <button
                                                                onClick={() => aplicarIndividual(item)}
                                                                className="bg-ui-bg shadow-neumorph-sm w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-oasis-orange hover:scale-105 active:scale-90 transition-all opacity-70 group-hover:opacity-100 border border-white/40"
                                                                title="Añadir este bloque de forma individual"
                                                            >
                                                                <Plus size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-bold text-sm">
                                Selecciona una plantilla para empezar
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlantillaOrden;