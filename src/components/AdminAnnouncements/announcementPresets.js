/* ─────────────────────────────────────────────────
    PLANTILLAS CON ESTRUCTURA DE EVENTO COMPLETA
   ──────────────────────────────────────────────────*/
export const TEMPLATES = [
    {
        id: 'oasis-glass-pro',
        name: 'Oasis Glass Pro',
        gradientStart: '#1E1B4B',
        gradientEnd: '#020617',
        bgImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&q=90',
        bgOpacity: 0.5,
        titleColor: '#F59E0B',
        accentColor: '#F59E0B',
        elements: {
            title: { text: 'CONGRESO OBREROS', size: 58, font: 'MoonRising', y: 38 },
            location: { text: 'Auditorio Central Oasis', size: 20, font: 'Montserrat', y: 78 },
            date: { text: 'SÁBADO 24 OCT', size: 22, font: 'AdventSans', y: 84 },
            time: { text: '19:00 HRS', size: 22, font: 'AdventSans', y: 89 }
        }
    },
    {
        id: 'spirit-aura-v2',
        name: 'Aura Worship',
        gradientStart: '#312E81',
        gradientEnd: '#1E1B4B',
        bgImage: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1200&q=90',
        bgOpacity: 0.4,
        titleColor: '#FFFFFF',
        accentColor: '#C084FC',
        elements: {
            title: { text: 'NOCHE DE ADORACIÓN', size: 52, font: 'MoonRising', y: 40 },
            location: { text: 'Campus Principal Oasis', size: 18, font: 'Montserrat', y: 75 },
            date: { text: '12 DE NOVIEMBRE', size: 20, font: 'Montserrat', y: 82 },
            time: { text: '18:30 PM', size: 20, font: 'Montserrat', y: 88 }
        }
    },
    {
        id: 'kids-joy',
        name: 'Kids Joy Festival',
        gradientStart: '#FCD34D',
        gradientEnd: '#F59E0B',
        bgImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&q=90',
        bgOpacity: 0.3,
        titleColor: '#1E293B',
        accentColor: '#EF4444',
        elements: {
            title: { text: 'DÍA DEL NIÑO', size: 60, font: 'MoonRising', y: 35 },
            location: { text: 'Zona de Juegos Oasis', size: 22, font: 'Montserrat', y: 75 },
            date: { text: 'DOMINGO 30 MAY', size: 24, font: 'Montserrat', y: 82 },
            time: { text: '10:00 AM', size: 24, font: 'Montserrat', y: 88 }
        }
    },
    {
        id: 'youth-impact',
        name: 'Youth Impact',
        gradientStart: '#10B981',
        gradientEnd: '#065F46',
        bgImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=90',
        bgOpacity: 0.5,
        titleColor: '#FFFFFF',
        accentColor: '#10B981',
        elements: {
            title: { text: 'JÓVENES OASIS', size: 55, font: 'ModernAge', y: 38 },
            location: { text: 'Auditorio Central', size: 20, font: 'Montserrat', y: 75 },
            date: { text: 'SÁBADO 15 JUN', size: 22, font: 'Montserrat', y: 82 },
            time: { text: '18:00 PM', size: 22, font: 'Montserrat', y: 88 }
        }
    }
];

export const STOCK_CATEGORIES = {
    'Naturaleza': [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        'https://images.unsplash.com/photo-1501854140801-50d01674aa3e?w=800',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800'
    ],
    'Familia': [
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
        'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=800',
        'https://images.unsplash.com/photo-1536640712247-c7553b382d41?w=800'
    ],
    'Niños': [
        'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800',
        'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'
    ],
    'Jóvenes': [
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800'
    ],
    'Abstractos Pro': [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800'
    ]
};

export const FONTS = [
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Advent Sans', value: 'AdventSans' },
    { label: 'Modern Age', value: 'ModernAge' },
    { label: 'Moon Rising', value: 'MoonRising' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Playfair Display', value: 'Playfair Display' }
];

export const CANVAS_SIZES = [
    { id: 'story', label: 'Historia / Reels', width: 1080, height: 1920, icon: 'Smartphone', aspect: 9/16 },
    { id: 'square', label: 'Post Cuadrado', width: 1080, height: 1080, icon: 'Square', aspect: 1/1 },
    { id: 'portrait', label: 'Post Retrato', width: 1080, height: 1350, icon: 'Layout', aspect: 4/5 },
    { id: 'youtube', label: 'YouTube / Banner', width: 1920, height: 1080, icon: 'Tv', aspect: 16/9 },
    { id: 'pinterest', label: 'Pinterest / A4', width: 1000, height: 1500, icon: 'Columns', aspect: 2/3 },
    { id: 'web-header', label: 'Web Header', width: 2100, height: 900, icon: 'Monitor', aspect: 21/9 }
];

export const CATEGORIES = Object.keys(STOCK_CATEGORIES);