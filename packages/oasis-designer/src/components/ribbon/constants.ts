export const FORMATS: Record<string, { label: string; icon: string; desc: string }> = {
  instagram: { label: 'Instagram', icon: 'bi-instagram', desc: 'Vertical 4:5' },
  square:    { label: 'Cuadrado',  icon: 'bi-square',    desc: 'Cuadrado 1:1' },
  youtube:   { label: 'YouTube',   icon: 'bi-youtube',   desc: 'Horizontal 16:9' },
  whatsapp:  { label: 'WhatsApp',  icon: 'bi-whatsapp',  desc: 'Estado 9:16' },
};

export const FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: "'Moonrising', serif", label: 'Moonrising' },
  { value: "'Modern Age', 'Orbitron', sans-serif", label: 'Modern Age' },
  { value: "'Advent Sans', 'Advent Pro', sans-serif", label: 'Advent Sans' },
  { value: "'Above The Beyond', cursive", label: 'Above The Beyond' },
];

export const ONLINE_IMAGES = [
  'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=100',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1920&q=100',
];

export const TEMPLATES = [
  { id: 'purple-night', name: 'Noche Púrpura', gradientStart: '#5b2ea6', gradientEnd: '#16213e', textColor: '#ffffff' },
  { id: 'ocean-blue',   name: 'Océano',        gradientStart: '#0f4c75', gradientEnd: '#1b262c', textColor: '#00d2f3' },
  { id: 'sunset',       name: 'Atardecer',     gradientStart: '#f7971e', gradientEnd: '#ffd200', textColor: '#1a1a2e' },
  { id: 'emerald',      name: 'Esmeralda',     gradientStart: '#11998e', gradientEnd: '#38ef7d', textColor: '#ffffff' },
  { id: 'rose',         name: 'Rosa',          gradientStart: '#f953c6', gradientEnd: '#b91d73', textColor: '#ffffff' },
  { id: 'midnight',     name: 'Medianoche',    gradientStart: '#232526', gradientEnd: '#414345', textColor: '#e2e8f0' },
  { id: 'gold',         name: 'Dorado',        gradientStart: '#c6a840', gradientEnd: '#2c1f0e', textColor: '#ffd700' },
  { id: 'sky',          name: 'Cielo',         gradientStart: '#56ccf2', gradientEnd: '#2f80ed', textColor: '#ffffff' },
];

export const SHADOW_OPTIONS = [
  { value: 'none',                            label: 'Sin Sombra' },
  { value: '0 2px 4px rgba(0,0,0,0.5)',       label: 'Suave' },
  { value: '0 4px 8px rgba(0,0,0,0.8)',       label: 'Fuerte' },
  { value: '0 0 10px rgba(255,255,255,0.5)',  label: 'Brillo Claro' },
  { value: '0 0 10px rgba(0,210,243,0.8)',    label: 'Brillo Oasis' },
];

export const QUICK_COLORS = ['#ffffff', '#000000', '#5b2ea6', '#00d2f3', '#ef4444', '#f59e0b'];

// ── BIBLIOTECA DE IMÁGENES (thumb = 300px para previsualización, full = 1920px para uso) ──
const UNS = (id: string, w: number, q: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
const img = (id: string) => ({ thumb: UNS(id, 300, 75), full: UNS(id, 1920, 100) });

export const BIBLIOTECA_FONDOS: Record<string, {
  label: string;
  icon: string;
  images: Array<{ thumb: string; full: string }>;
}> = {
  naturaleza: {
    label: 'Naturaleza',
    icon: 'bi-tree',
    images: [
      img('1464822759023-fed622ff2c3b'), // montañas con lago
      img('1469474968028-56623f02e42e'), // montañas / cielo
      img('1449844908441-8829872d2607'), // montañas / niebla
      img('1472214103451-9374bd1c798e'), // bosque / agua
      img('1507525428034-b723cf961d3e'), // playa / océano
      img('1506905925346-21bda4d32df4'), // alpes / lago
      img('1501854140801-50d01698950b'), // montañas verdes
      img('1441974231531-c6227db76b6e'), // bosque de luz
    ],
  },
  cielo: {
    label: 'Cielo & Luz',
    icon: 'bi-cloud-sun',
    images: [
      img('1431440869543-efaf3388c585'), // nubes dramáticas
      img('1504701954957-2010ec3bcec1'), // cielo azul vibrante
      img('1518020382113-a7ef8d876160'), // amanecer
      img('1519389950473-47ba0277781c'), // efecto de luz
      img('1557683311-eac922347aa1'), // fondo abstracto cielo
      img('1432821596592-e2c18b78144f'), // escritura / luz
      img('1497366216548-37526070297c'), // espacio de trabajo / luz
    ],
  },
  biblia: {
    label: 'Biblia',
    icon: 'bi-book',
    images: [
      img('1504052434569-70ad581650b9'), // libro abierto
      img('1456513080510-7bf3a84b82f8'), // páginas de libro
      img('1491854498039-68fedd1c1bc2'), // libro antiguo
      img('1501504905252-473c47e087f8'), // estudio / libros
      img('1485546246426-74ae53854d64'), // biblia con luz
      img('1476275598599-b1e8e41abb71'), // escritura sagrada
    ],
  },
  adoracion: {
    label: 'Adoración',
    icon: 'bi-music-note-beamed',
    images: [
      img('1544427928-c49cdfebf194'), // figura Cristo / adoración
      img('1515600465060-da00806121f1'), // luz divina
      img('1493225457124-a3eb161ffa5f'), // concierto / música
      img('1518611540400-6b85a576a567'), // manos levantadas
      img('1522071820081-009f0129c71c'), // comunidad / alabanza
      img('1511379938547-c1f69419868d'), // piano / música
    ],
  },
  jovenes: {
    label: 'Jóvenes',
    icon: 'bi-people',
    images: [
      img('1529070532779-d85ee652514d'), // jóvenes / alegría
      img('1507035895480-2b3156c31fc8'), // comunidad
      img('1491438590914-bc09fcaaf77a'), // jóvenes / risa
      img('1529156069898-4e09b5823fe0'), // grupo jóvenes
      img('1521737604082-1e26d7d7e3e4'), // personas juntas
      img('1515562141207-7a88fb7ce338'), // amigos / outdoor
    ],
  },
  abstracto: {
    label: 'Abstracto',
    icon: 'bi-stars',
    images: [
      img('1534796636912-3b584f69bf50'), // abstracto púrpura
      img('1579546929518-9e396f3cc809'), // gradiente pastel
      img('1618005182384-a83a8bd57fbe'), // abstracto geométrico
      img('1635070041078-e363dbe005cb'), // partículas / espacio
      img('1419242902214-272b3f66ee7a'), // galaxia / espacio
      img('1446776811953-b23d57bd21aa'), // cosmos / estrellas
    ],
  },
};
