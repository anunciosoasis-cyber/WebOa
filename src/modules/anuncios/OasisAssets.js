/**
 * OASIS ASSETS LIBRARY
 * Biblioteca de recursos gráficos y plantillas con ADN Adventista.
 */

export const OASIS_LIBRARY = {
    images: {
        naturaleza: [
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
            'https://images.unsplash.com/photo-1501854140801-50d01674aa3e?w=1200',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200'
        ],
        familia: [
            'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
            'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=1200'
        ],
        jovenes: [
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200'
        ]
    },
    templates: [
        {
            id: 'culto-central',
            name: 'Culto de Adoración',
            bg: '#1e293b',
            accent: '#f59e0b',
            elements: [
                { type: 'text', text: 'CUERNAVACA CENTRAL', size: 24, y: 15, font: 'Montserrat' },
                { type: 'text', text: 'CULTA DE ADORACIÓN', size: 48, y: 35, font: 'MoonRising' },
                { type: 'text', text: 'SÁBADO 11:00 AM', size: 20, y: 80, font: 'Montserrat' }
            ]
        },
        {
            id: 'sociedad-jovenes',
            name: 'Sociedad de Jóvenes',
            bg: '#10b981',
            accent: '#ffffff',
            elements: [
                { type: 'text', text: 'SOCIEDAD DE JÓVENES', size: 42, y: 40, font: 'MoonRising' },
                { type: 'text', text: 'Oasis Youth', size: 22, y: 55, font: 'Montserrat' }
            ]
        }
    ],
    fonts: [
        { label: 'Montserrat', value: 'Montserrat' },
        { label: 'Moon Rising', value: 'MoonRising' },
        { label: 'Advent Sans', value: 'AdventSans' }
    ],
    canvasSizes: [
        { id: 'story', label: 'Historia (9:16)', width: 1080, height: 1920, aspect: 9/16 },
        { id: 'post', label: 'Post (1:1)', width: 1080, height: 1080, aspect: 1/1 },
        { id: 'youtube', label: 'YouTube (16:9)', width: 1920, height: 1080, aspect: 16/9 }
    ]
};
