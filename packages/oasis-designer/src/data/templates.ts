export interface Decoration {
  id: string;
  type: 'tape' | 'light-leak' | 'texture' | 'image' | 'gradient-fade';
  url?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'cover' | 'absolute';
  style?: Record<string, any>;
  blendMode?: string;
  opacity?: number;
  zIndex?: number;
  color?: string;
}

export interface FormData {
  templateId?: string;
  format: string;
  title: string; title2: string; title3: string;
  speaker: string; tag: string; date: string; time: string; location: string; content: string;
  bibleRef?: string; bibleText?: string;
  bgMode: string; bgImage: string | null; bgPosX: number; bgPosY: number;
  imageUrl: string | null;
  gradientStart: string; gradientEnd: string;
  blendGradient: boolean; blendOpacity: number; bgOpacity: number;
  showLogoOasis: boolean; showLogoIasd: boolean; showRrss: boolean;
  logoOasisSize: number; logoIasdSize: number; rrssSize: number;
  titleFont: string; title2Font: string; title3Font: string;
  speakerFont: string; tagFont: string; dateFont: string;
  titleColor: string; title2Color: string; title3Color: string;
  speakerColor: string; tagColor: string; dateColor: string; locationColor: string;
  titleSize: number; title2Size: number; title3Size: number;
  speakerSize: number; tagSize: number; dateSize: number; locationSize: number;
  titleOpacity: number; title2Opacity: number; title3Opacity: number;
  titleBold: boolean; titleItalic: boolean; titleUnderline: boolean;
  shapes: any[];
  customLogos: any[];
  shapeType: string; shapeGradFrom: string; shapeGradTo: string;
  shapeGradAngle: number; shapeWidth: number; shapeHeight: number; shapeOpacity: number; shapeRadius: number;
  logoColor: string;
  logoGotaColor?: string;
  logoGotaColor2?: string;
  logoShadow?: number;
  logoGlow?: number;
  logoBrightness?: number;
  layoutMode?: 'centered' | 'left' | 'bottom';
  decorations?: Decoration[];
}

export const DEFAULT_FORM: FormData = {
  templateId: 'default',
  format: 'instagram',
  title: 'Título del Anuncio', title2: 'Subtítulo', title3: '',
  speaker: '', tag: 'ESPECIAL', date: 'Próximo Sábado', time: '', location: 'Templo Oasis', content: '',
  bgMode: 'gradient', bgImage: null, bgPosX: 50, bgPosY: 50, imageUrl: null,
  gradientStart: '#5b2ea6', gradientEnd: '#16213e',
  blendGradient: false, blendOpacity: 0.5, bgOpacity: 1,
  showLogoOasis: true, showLogoIasd: false, showRrss: false,
  logoOasisSize: 60, logoIasdSize: 60, rrssSize: 80,
  titleFont: "'Modern Age', 'Orbitron', sans-serif", title2Font: "'Advent Sans', 'Advent Pro', sans-serif", title3Font: "'Advent Sans', 'Advent Pro', sans-serif",
  speakerFont: "'Blacksword', 'Dancing Script', cursive", tagFont: "'Modern Age', 'Orbitron', sans-serif", dateFont: "'Modern Age', 'Orbitron', sans-serif",
  titleColor: '#ffffff', title2Color: '#e2e8f0', title3Color: '#cbd5e1',
  speakerColor: '#ffffff', tagColor: '#ffffffff', dateColor: '#e2e8f0', locationColor: '#e2e8f0',
  titleSize: 1.2, title2Size: 1.1, title3Size: 0.9,
  speakerSize: 0.9, tagSize: 0.75, dateSize: 0.85, locationSize: 0.8,
  titleOpacity: 100, title2Opacity: 100, title3Opacity: 100,
  titleBold: false, titleItalic: false, titleUnderline: false,
  shapes: [], customLogos: [],
  shapeType: 'rect', shapeGradFrom: '#5b2ea6', shapeGradTo: '#a78bfa',
  shapeGradAngle: 135, shapeWidth: 80, shapeHeight: 80, shapeOpacity: 1, shapeRadius: 8,
  logoColor: 'auto',
  logoGotaColor: '#683cde',
  logoGotaColor2: '#000000',
  logoShadow: 0.4,
  logoGlow: 0,
  logoBrightness: 1,
  layoutMode: 'centered',
  decorations: [],
};

export interface Template {
  id: string;
  name: string;
  description: string;
  colors: string[];
  formData: Partial<FormData>;
}

export const TEMPLATES: Template[] = [
  {
    id: 'default',
    name: 'Plantilla Predeterminada',
    description: 'El diseño clásico morado con texto centrado.',
    colors: ['#5b2ea6', '#16213e'],
    formData: { ...DEFAULT_FORM, templateId: 'default' },
  },
  {
    id: 'elegant',
    name: 'Elegancia Clásica',
    description: 'Fuentes serif y fondo oscuro con detalles dorados.',
    colors: ['#1a1a2e', '#d4af37'],
    formData: {
      ...DEFAULT_FORM,
      templateId: 'elegant',
      gradientStart: '#0f0f1b',
      gradientEnd: '#1a1a2e',
      titleColor: '#d4af37',
      title2Color: '#f1e5ac',
      titleFont: "'Playfair Display', serif",
      title2Font: "'Playfair Display', serif",
      speakerFont: "'Playfair Display', serif",
      speakerColor: '#ffffff',
      tagColor: '#d4af37',
      logoColor: 'white',
      shapeGradFrom: '#d4af37',
      shapeGradTo: '#aa8c2c',
      layoutMode: 'bottom',
    },
  },
  {
    id: 'modern',
    name: 'Moderno y Vibrante',
    description: 'Colores neón, fuentes gruesas y sin serifa.',
    colors: ['#ff007f', '#7928ca'],
    formData: {
      ...DEFAULT_FORM,
      templateId: 'modern',
      gradientStart: '#ff007f',
      gradientEnd: '#7928ca',
      titleColor: '#ffffff',
      title2Color: '#ffeb3b',
      titleFont: "'Montserrat', sans-serif",
      title2Font: "'Montserrat', sans-serif",
      titleBold: true,
      speakerFont: "'Montserrat', sans-serif",
      logoColor: 'white',
      shapeGradFrom: '#ffeb3b',
      shapeGradTo: '#ff9800',
      layoutMode: 'left',
    },
  },
  {
    id: 'youth',
    name: 'Jóvenes / Dinámico',
    description: 'Estilo dinámico, ideal para eventos juveniles.',
    colors: ['#00f2fe', '#4facfe'],
    formData: {
      ...DEFAULT_FORM,
      templateId: 'youth',
      gradientStart: '#4facfe',
      gradientEnd: '#00f2fe',
      titleColor: '#ffffff',
      title2Color: '#1a2a6c',
      titleFont: "'Oswald', sans-serif",
      title2Font: "'Oswald', sans-serif",
      speakerFont: "'Permanent Marker', cursive",
      speakerColor: '#1a2a6c',
      tagColor: '#1a2a6c',
      logoColor: 'white',
      layoutMode: 'centered',
    },
  },
  {
    id: 'culto-oracion-tape',
    name: 'Culto de Oración',
    description: 'Estilo grunge con cinta adhesiva para un look contemporáneo.',
    colors: ['#e2e8f0', '#0f172a'],
    formData: {
      ...DEFAULT_FORM,
      templateId: 'culto-oracion-tape',
      bgMode: 'gradient',
      gradientStart: '#f8fafc',
      gradientEnd: '#cbd5e1',
      titleColor: '#0f172a',
      title2Color: '#334155',
      titleFont: "'Oswald', sans-serif",
      title2Font: "'Playfair Display', serif",
      speakerColor: '#0f172a',
      tagColor: '#0f172a',
      dateColor: '#0f172a',
      locationColor: '#0f172a',
      logoColor: 'black',
      layoutMode: 'centered',
      decorations: [
        {
          id: 'dec-1',
          type: 'tape',
          style: { top: '35%', left: '50%', transform: 'translate(-50%, -50%) rotate(-3deg)', width: '45%' },
          opacity: 0.9,
          zIndex: 1
        },
        {
          id: 'dec-2',
          type: 'texture',
          style: { inset: 0 },
          blendMode: 'multiply',
          opacity: 0.3,
          zIndex: 6
        }
      ]
    }
  },
  {
    id: 'santa-cena-fade',
    name: 'Santa Cena',
    description: 'Diseño solemne con superposición de degradado inferior.',
    colors: ['#3e1f2b', '#1a0b13'],
    formData: {
      ...DEFAULT_FORM,
      templateId: 'santa-cena-fade',
      gradientStart: '#1a0b13',
      bgMode: 'image',
      titleColor: '#1a1a2e',
      title2Color: '#1a1a2e',
      titleFont: "'Playfair Display', serif",
      title2Font: "'Playfair Display', serif",
      speakerColor: '#1a1a2e',
      tagColor: '#1a1a2e',
      dateColor: '#1a1a2e',
      locationColor: '#1a1a2e',
      logoColor: 'black',
      layoutMode: 'bottom',
      decorations: [
        {
          id: 'dec-1',
          type: 'gradient-fade',
          style: { bottom: 0, left: 0, right: 0, height: '60%' },
          color: 'rgba(255,251,245, 1)',
          zIndex: 1
        }
      ]
    }
  },
  {
    id: 'conferencia-lights',
    name: 'Conferencia Destellos',
    description: 'Iluminación espectacular con destellos traseros.',
    colors: ['#000000', '#f59e0b'],
    formData: {
      ...DEFAULT_FORM,
      templateId: 'conferencia-lights',
      bgMode: 'color',
      gradientStart: '#000000',
      gradientEnd: '#000000',
      titleColor: '#ffffff',
      title2Color: '#fcd34d',
      titleFont: "'Orbitron', sans-serif",
      title2Font: "'Montserrat', sans-serif",
      layoutMode: 'centered',
      decorations: [
        {
          id: 'dec-1',
          type: 'light-leak',
          style: { top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%' },
          color: 'rgba(245, 158, 11, 0.8)',
          blendMode: 'screen',
          zIndex: 1
        },
        {
          id: 'dec-2',
          type: 'light-leak',
          style: { bottom: '-20%', left: '-10%', width: '100%', height: '100%' },
          color: 'rgba(59, 130, 246, 0.5)',
          blendMode: 'screen',
          zIndex: 1
        }
      ]
    }
  }
];
