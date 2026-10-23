const FORMAT_BY_RATIO = { '9:16': 'whatsapp', '16:9': 'youtube', '4:5': 'instagram' };

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Payload del flyer → datos iniciales de @oasis/designer: cada texto queda como capa editable,
 * con los colores y tipografías que entrega el motor en /flyers/options (sin tablas duplicadas aquí).
 */
export function toDesignerData(payload, options) {
    // Otras categorías: colores de su plantilla; culto: paleta y degradado de siempre
    const kindSpec = payload.kind && payload.kind !== 'culto' ? options?.kinds?.find((k) => k.id === payload.kind) : undefined;
    const style = kindSpec?.styles.find((st) => st.id === payload.styleId) ?? kindSpec?.styles[0];
    const palette = options?.templates?.find((t) => t.id === payload.templateId)?.palette;
    const gradient = style ? style.bg : options?.gradients?.find((g) => g.id === payload.gradientId)?.colors;
    const fonts = style ? undefined : options?.fontPairs?.find((f) => f.id === payload.fontPairId);
    const start = gradient?.[0] ?? palette?.background ?? '#0A192F';
    const end = gradient?.[1] ?? palette?.accent ?? '#1E3A8A';
    const accent = style?.accent ?? palette?.accent ?? end;
    const bgImage = payload.backgroundId ? `/backgrounds/${payload.backgroundId}` : null;

    // La palabra resaltada va en su propia capa: se quita del título para no duplicarla
    const script = payload.sermonTitleScript?.trim() || '';
    let title = payload.sermonTitleMain?.trim() || 'Título del anuncio';
    if (script) {
        const stripped = title.replace(new RegExp(`\\b${escapeRegExp(script)}\\b`, 'i'), '').replace(/\s+/g, ' ').trim();
        if (stripped) title = stripped;
    }

    const date = (payload.dateText || '').replace(/^\s*\d{4}\s*\|\s*/, '');
    const time = (payload.timeText || '').replace(/^\s*desde\s+/i, '');
    const titleFont = fonts ? `'${fonts.title}', 'Inter', sans-serif` : "'Montserrat', 'Inter', sans-serif";
    const scriptFont = fonts ? `'${fonts.script}', 'Dancing Script', cursive` : "'Above The Beyond', 'Dancing Script', cursive";
    const bodyFont = "'Inter', 'Montserrat', sans-serif";

    return {
        format: FORMAT_BY_RATIO[payload.aspectRatio] ?? 'instagram',
        templateId: 'oasis-flyer',
        bgImage,
        // El PNG del motor no va de fondo: sus textos quedarían duplicados bajo las capas editables
        imageUrl: null,
        bgMode: bgImage ? 'image' : 'gradient',
        gradientStart: start,
        gradientEnd: end,
        blendGradient: Boolean(bgImage),
        blendOpacity: 0.65,
        bgOpacity: 1,
        title,
        title2: script,
        title3: '',
        speaker: payload.preacherName || '',
        tag: payload.serviceType || kindSpec?.eyebrow || '',
        date,
        time,
        location: payload.place || '',
        bibleRef: payload.bibleReference || '',
        bibleText: payload.bibleVerse || '',
        content: payload.bibleVerse || '',
        titleVisible: true,
        title2Visible: true,
        speakerVisible: Boolean(payload.preacherName),
        tagVisible: Boolean(payload.serviceType || kindSpec?.eyebrow),
        dateVisible: Boolean(date),
        timeVisible: Boolean(time),
        locationVisible: Boolean(payload.place),
        contentVisible: Boolean(payload.bibleVerse || payload.bibleReference),
        showLogoOasis: true,
        showLogoIasd: true,
        showRrss: true,
        titleFont,
        title2Font: scriptFont,
        speakerFont: bodyFont,
        tagFont: bodyFont,
        dateFont: bodyFont,
        titleColor: '#FFFFFF',
        title2Color: accent,
        speakerColor: '#FFFFFF',
        tagColor: accent,
        dateColor: '#FFFFFF',
        locationColor: '#FFFFFF',
    };
}
