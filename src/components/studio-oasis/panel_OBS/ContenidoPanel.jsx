import React, { useState } from 'react';
import { Play, ChevronLeft, ChevronRight, Book, Music, Search } from 'lucide-react';

const ContenidoPanel = ({
    activeTab, setActiveTab, setActivePreviewSource,
    selectedBook, setSelectedBook, BIBLE_BOOKS,
    selectedChapter, setSelectedChapter,
    selectedVerseObj, setSelectedVerseObj, verses,
    handlePrevVerse, handleNextVerse, pushToOBS,
    hymnSearchTerm, setHymnSearchTerm,
    handleHymnNavigate, selectedHymn,
    selectedStanza, setSelectedStanza,
    himnarioList, setSelectedHymn,
    handlePrevStanza, handleNextStanza,
    globalTemplate
}) => {
    // Estado interno para el input de búsqueda global en la Biblia si se necesita filtrar
    const [bibleSearch, setBibleSearch] = useState('');
    const [hymnSearch, setHymnSearch] = useState('');
    const [verseInput, setVerseInput] = useState(selectedVerseObj?.verse || '');
    const [pendingVerse, setPendingVerse] = useState(null);

    React.useEffect(() => {
        setVerseInput(selectedVerseObj?.verse || '');
    }, [selectedVerseObj?.verse]);

    React.useEffect(() => {
        if (pendingVerse && verses.length > 0) {
            const vObj = verses.find(v => v.verse === pendingVerse);
            if (vObj) {
                setSelectedVerseObj(vObj);
                setPendingVerse(null);
                setTimeout(() => {
                    const el = document.getElementById(`verse-${pendingVerse}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, [verses, pendingVerse, setSelectedVerseObj]);

    return (
        <div
            className="bg-ui-bg shadow-neumorph rounded-[2.5rem] p-6 border border-white/60 h-auto xl:h-full flex flex-col justify-between w-full select-none text-gray-900 min-h-0"
            data-purpose="production-content-switcher"
        >
            {/* ENCABEZADO CON PESTAÑAS (TABS) */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-center font-moonrising font-bold text-gray-950 tracking-wider text-[13px] uppercase flex-1">
                    CONTENIDO
                </h3>
                <div className="text-gray-400 text-[9px]">
                    {activeTab === 'biblia' ? <Book size={12} /> : <Music size={12} />}
                </div>
            </div>

            {/* SEGMENTADOR SUPERIOR (Cápsula Horizontal Neumórfica de Alta Gama) */}
            <div className="bg-ui-bg shadow-neumorph-inset rounded-full p-1 h-[44px] w-full max-w-[260px] mx-auto relative flex flex-row items-center border border-white/30 mb-4">
                {/* Píldora Desplazable Amarilla de Selección Activa */}
                <div
                    className={`absolute top-1 bottom-1 w-[47%] bg-oasis-yellow rounded-full shadow-sm transition-all duration-300 ease-out z-10 ${activeTab === 'biblia' ? 'left-1' : 'left-[51%]'
                        }`}
                />
                <button
                    onClick={() => { setActiveTab('biblia'); setActivePreviewSource('biblia'); }}
                    className={`flex-1 h-full text-[10px] uppercase font-moonrising font-bold tracking-wider z-20 transition-colors duration-300 relative ${activeTab === 'biblia' ? 'text-gray-950 font-black' : 'text-gray-400 hover:text-slate-600'
                        }`}
                >
                    BIBLIA
                </button>
                <button
                    onClick={() => { setActiveTab('himnario'); setActivePreviewSource('himnario'); }}
                    className={`flex-1 h-full text-[10px] uppercase font-moonrising font-bold tracking-wider z-20 transition-colors duration-300 relative ${activeTab === 'himnario' ? 'text-gray-950 font-black' : 'text-gray-400 hover:text-slate-600'
                        }`}
                >
                    HIMNARIO
                </button>
            </div>

            {/* LAYOUT DE TRABAJO EN DOS COLUMNAS REJILLA COMPACTA */}
            <div className="flex flex-col md:flex-row items-stretch gap-4 flex-grow min-h-0">

                {/* COLUMNA IZQUIERDA: Selectores de Datos Mecánicos */}
                <div className="flex flex-col gap-3 w-full md:w-[55%] h-max min-h-0 shrink-0">

                    {/* BÚSQUEDA INTELIGENTE */}
                    <div className="bg-ui-bg shadow-neumorph-inset rounded-xl h-[38px] flex items-center border border-white/20 px-3 gap-2">
                        <Search size={12} className="text-gray-400" />
                        {activeTab === 'biblia' ? (
                            <input
                                type="text"
                                value={bibleSearch}
                                onChange={(e) => setBibleSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const query = bibleSearch.trim().toLowerCase();
                                        if (!query) return;
                                        
                                        // Match: Juan, Juan 3, Juan 3:16, 1 Juan 2 5
                                        const match = query.match(/^(\d?\s*[a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)(?:\s+(\d+)(?:[:\s]+(\d+))?)?$/i);
                                        if (match) {
                                            const bookName = match[1].trim();
                                            const chapter = match[2] ? parseInt(match[2]) : 1;
                                            const verse = match[3] ? parseInt(match[3]) : null;

                                            const bookStr = bookName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                                            const book = BIBLE_BOOKS.find(b => {
                                                const normalizedName = b.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                                                return normalizedName.includes(bookStr) || bookStr.includes(normalizedName);
                                            });

                                            if (book) {
                                                setSelectedBook(book);
                                                setSelectedChapter(Math.min(chapter, book.chapters || 150));
                                                if (verse) {
                                                    setPendingVerse(verse);
                                                }
                                                setBibleSearch('');
                                            }
                                        }
                                    }
                                }}
                                placeholder="Ej: Juan 3:16"
                                className="w-full bg-transparent border-none text-[10px] font-moonrising font-bold text-gray-950 placeholder-gray-400 p-0 focus:ring-0 outline-none"
                            />
                        ) : (
                            <input
                                type="text"
                                value={hymnSearch}
                                onChange={(e) => setHymnSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const query = hymnSearch.trim().toLowerCase();
                                        if (!query || !himnarioList) return;
                                        
                                        const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                        
                                        // Buscar por número exacto o por texto
                                        const hymn = himnarioList.find(h => 
                                            h.number.toString() === query || 
                                            h.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery)
                                        );

                                        if (hymn) {
                                            setSelectedHymn(hymn);
                                            setHymnSearch('');
                                        }
                                    }
                                }}
                                placeholder="Nombre o número"
                                className="w-full bg-transparent border-none text-[10px] font-moonrising font-bold text-gray-950 placeholder-gray-400 p-0 focus:ring-0 outline-none"
                            />
                        )}
                    </div>

                    {/* SELECTORES ESPECÍFICOS POR TIPO */}
                    {activeTab === 'biblia' ? (
                        <div className="grid grid-cols-[1.8fr,0.9fr,0.8fr] gap-2 w-full">
                            {/* Libro Selector Dropdown */}
                            <div className="bg-ui-bg shadow-neumorph rounded-xl h-[36px] flex items-center border border-white/50 px-2 overflow-hidden hover:border-white/70 transition-colors">
                                <select
                                    value={selectedBook?.id || 1}
                                    onChange={e => {
                                        const book = BIBLE_BOOKS.find(b => b.id === parseInt(e.target.value));
                                        setSelectedBook(book);
                                        setSelectedChapter(1);
                                    }}
                                    className="w-full bg-transparent border-none text-[9px] font-moonrising font-bold text-gray-700 p-0 focus:ring-0 text-center appearance-none cursor-pointer"
                                >
                                    {BIBLE_BOOKS.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                                </select>
                            </div>

                            {/* Input de Capítulo */}
                            <div className="bg-ui-bg shadow-neumorph rounded-xl h-[36px] flex items-center border border-white/50 px-1 hover:border-white/70 transition-colors relative">
                                <label className="absolute -top-2 left-2 text-[7px] font-moonrising text-gray-500 uppercase tracking-wider">Cap</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedBook?.chapters || 1}
                                    value={selectedChapter}
                                    onChange={e => {
                                        const val = parseInt(e.target.value) || 1;
                                        if (val >= 1 && val <= (selectedBook?.chapters || 150)) {
                                            setSelectedChapter(val);
                                        }
                                    }}
                                    className="w-full bg-transparent border-none text-[10px] font-moonrising font-bold text-gray-950 p-0 focus:ring-0 text-center outline-none"
                                />
                            </div>

                            {/* Input de Versículo EDITABLE */}
                            <div className="bg-ui-bg shadow-neumorph rounded-xl h-[36px] flex items-center border border-white/50 px-1 hover:border-white/70 transition-colors relative">
                                <label className="absolute -top-2 left-2 text-[7px] font-moonrising text-gray-500 uppercase tracking-wider">Ver</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={verses.length}
                                    value={verseInput}
                                    onChange={(e) => {
                                        setVerseInput(e.target.value);
                                        const val = parseInt(e.target.value);
                                        if (val > 0 && verses.length > 0) {
                                            const vObj = verses.find(v => v.verse === val);
                                            if (vObj) setSelectedVerseObj(vObj);
                                        }
                                    }}
                                    className="w-full bg-transparent border-none text-[10px] font-moonrising font-bold text-gray-950 p-0 focus:ring-0 text-center outline-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-ui-bg shadow-neumorph rounded-xl h-[36px] flex items-center justify-center border border-white/50 px-3 w-full hover:border-white/70 transition-colors">
                            <span className="text-[9.5px] font-moonrising font-bold text-gray-700 truncate tracking-wider">
                                {selectedHymn && selectedStanza 
                                    ? `#${selectedHymn.number} - ${selectedStanza.type === 'chorus' ? 'CORO' : `ESTROFA ${selectedStanza.number || ''}`}`
                                    : (selectedHymn ? `#${selectedHymn.number} - ${selectedHymn.title.toUpperCase()}` : "SELECCIONE HIMNO")}
                            </span>
                        </div>
                    )}

                    {/* CÁPSULA MULTIMEDIA NEUMÓRFICA FLOTANTE (Igual al estilo CtrlCulto de la maqueta) */}
                    <div className="bg-ui-bg shadow-neumorph rounded-2xl flex items-center justify-center p-1.5 h-[45px] w-full border border-white/50 hover:border-white/70 transition-colors">
                        <div className="bg-ui-bg shadow-neumorph-inset rounded-full flex-1 h-[26px] flex items-center justify-between px-3 relative border border-white/20">

                            {/* Botón Navegar Atrás */}
                            <button
                                id={activeTab === 'biblia' ? 'btn-prev-verse' : 'btn-prev-stanza'}
                                onClick={activeTab === 'biblia' ? handlePrevVerse : handlePrevStanza}
                                className="text-gray-600 hover:text-oasis-orange hover:bg-white/10 active:scale-90 transition-all z-10 w-5 h-5 flex items-center justify-center rounded-full"
                                title={activeTab === 'biblia' ? 'Versículo anterior' : 'Estrofa anterior'}
                            >
                                <ChevronLeft size={14} strokeWidth={3} />
                            </button>

                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                <button
                                    id={activeTab === 'biblia' ? 'btn-project-bible' : 'btn-project-hymn'}
                                    onClick={() => {
                                        if (activeTab === 'biblia') {
                                            if (selectedVerseObj) pushToOBS('bible', `${selectedBook?.name} ${selectedChapter}:${selectedVerseObj.verse}`, selectedVerseObj.text, { template: globalTemplate });
                                        } else {
                                            if (selectedStanza) pushToOBS('himno', `Himno ${selectedHymn?.number}`, selectedStanza.text, { template: globalTemplate, subText: selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro' });
                                        }
                                    }}
                                    className="w-8 h-8 bg-oasis-yellow rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(245,158,11,0.4)] text-white hover:scale-110 active:scale-95 transition-all border border-white/40 hover:shadow-[0_4px_12px_rgba(245,158,11,0.6)]"
                                    title="Proyectar contenido"
                                >
                                    <Play size={11} fill="currentColor" className="ml-0.5" />
                                </button>
                            </div>

                            {/* Botón Navegar Adelante */}
                            <button
                                id={activeTab === 'biblia' ? 'btn-next-verse' : 'btn-next-stanza'}
                                onClick={activeTab === 'biblia' ? handleNextVerse : handleNextStanza}
                                className="text-gray-600 hover:text-oasis-orange hover:bg-white/10 active:scale-90 transition-all z-10 w-5 h-5 flex items-center justify-center rounded-full"
                                title={activeTab === 'biblia' ? 'Siguiente versículo' : 'Siguiente estrofa'}
                            >
                                <ChevronRight size={14} strokeWidth={3} />
                            </button>

                        </div>
                    </div>

                </div>

                {/* COLUMNA DERECHA: Monitor Escroleable en Negro / PREVIEW (Maqueta Fiel) */}
                <div className="relative w-full md:w-[45%] min-h-[160px] md:min-h-0 mt-4 md:mt-0 shrink-0">
                    <div className="absolute inset-0 bg-black rounded-3xl p-3 border border-slate-900 overflow-hidden flex flex-col items-center justify-center shadow-xl">

                        {/* Contenido Dinámico de Texto de la Biblia o Himnario (Vista Previa de 1 elemento) */}
                        <div className="w-full max-h-full overflow-y-auto custom-scrollbar px-3 py-2 text-center select-text relative z-10">
                        {activeTab === 'biblia' ? (
                            selectedVerseObj ? (
                                <div className="animate-in fade-in zoom-in duration-300 w-full">
                                    <span className="block text-oasis-yellow text-[8.5px] font-moonrising font-bold mb-2 tracking-widest uppercase">
                                        {selectedBook?.name} {selectedChapter}:{selectedVerseObj.verse}
                                    </span>
                                    <p className="text-white text-[11px] leading-snug font-serif italic drop-shadow-md">
                                        "{selectedVerseObj.text}"
                                    </p>
                                </div>
                            ) : (
                                <div className="text-white/40 font-moonrising text-[10px] tracking-widest">
                                    {verses.length > 0 ? "SELECCIONE UN VERSÍCULO" : "CARGANDO ESCRITURAS..."}
                                </div>
                            )
                        ) : (
                            selectedHymn && selectedStanza ? (
                                <div className="animate-in fade-in zoom-in duration-300 w-full">
                                    <span className="block text-oasis-yellow text-[8.5px] font-moonrising font-bold mb-2 tracking-widest uppercase">
                                        HIMNO {selectedHymn.number} • {selectedStanza.type === 'chorus' ? 'CORO' : `ESTROFA ${selectedStanza.number || ''}`}
                                    </span>
                                    <p className="text-white text-[11px] leading-snug font-sans font-medium whitespace-pre-line drop-shadow-md">
                                        {selectedStanza.text}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-white/40 font-moonrising text-[10px] tracking-widest">
                                    BUSQUE UN HIMNO
                                </div>
                            )
                        )}
                    </div>

                    {/* Marca de agua / Indicador PREVIEW inferior de la maqueta */}
                    <div className="absolute bottom-2 right-3 pointer-events-none select-none z-10 bg-black/40 px-2 py-0.5 rounded backdrop-blur-[2px]">
                        <span className="font-moonrising text-[8px] font-bold text-white/30 tracking-widest uppercase">
                            PREVIEW
                        </span>
                    </div>

                </div>
            </div>
        </div>
        </div>
    );
};

export default ContenidoPanel;