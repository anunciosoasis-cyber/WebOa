import React from 'react';
import { Calendar, MapPin, Mic } from 'lucide-react';

/*
 * SlideCanvasView — una sola forma de pintar las diapositivas: vista previa, tira, editor y proyector.
 * Todo se mide en unidades del contenedor (cqw = 1% del ancho del marco), así el proyector a 1920 px es
 * exactamente la vista previa ampliada. El estilo que elige el usuario viaja en `slide.style`.
 */

export const SLIDE_FONTS = {
  Moonrising: "'Moonrising', sans-serif",
  'Advent Pro': "'Advent Pro', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Bebas Neue': "'Bebas Neue', sans-serif",
  'Cinzel Decorative': "'Cinzel Decorative', serif",
  'Dancing Script': "'Dancing Script', cursive",
};
export const DEFAULT_SLIDE_STYLE = { bgColor: '#120C1F', textColor: '#FFFFFF', accentColor: '#FBBF24', fontFamily: 'Moonrising', bold: true, italic: false, underline: false };

const isVideoMedia = (slide, url) => slide.mediaType === 'video' || (typeof url === 'string' && /\.(mp4|webm)$/i.test(url));
export const isHybridSlide = (s) => s?.type === 'hybrid_announcement'
  || (s?.type !== 'styled' && !!(s?.eventData && (s.eventData.speaker || s.eventData.eventDate || s.eventData.description)));

const titleFont = (st) => ({
  fontFamily: SLIDE_FONTS[st.fontFamily] || SLIDE_FONTS.Moonrising,
  fontWeight: st.bold === false ? 500 : 900,
  fontStyle: st.italic ? 'italic' : 'normal',
  textDecoration: st.underline ? 'underline' : 'none',
  textUnderlineOffset: '0.18em',
});

/** Imagen o vídeo completo; si no tiene la proporción del marco, el hueco se rellena con la misma imagen desenfocada. */
const MediaFit = ({ src, alt, video }) => (
  <div className="relative w-full h-full overflow-hidden bg-black">
    {!video && (
      <img src={src} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110 opacity-60" style={{ filter: 'blur(3.5cqw) saturate(1.15)' }} />
    )}
    {video ? (
      <video src={src} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain" />
    ) : (
      <img src={src} alt={alt} className="relative w-full h-full object-contain" style={{ filter: 'drop-shadow(0 1.2cqw 3cqw rgba(0,0,0,0.55))' }} />
    )}
  </div>
);

/** Fondo: imagen (con velo para leer), color elegido (con viñeta suave) o el sobrio por defecto. */
const Backdrop = ({ background, bgColor, gradientClass }) => {
  if (background) {
    return (
      <>
        <img src={background} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
      </>
    );
  }
  if (gradientClass && !bgColor) return <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />;
  const c = bgColor || DEFAULT_SLIDE_STYLE.bgColor;
  return (
    <div className="absolute inset-0" style={{
      background: `radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, ${c} 75%, white 12%) 0%, ${c} 55%, color-mix(in srgb, ${c} 55%, black) 100%)`,
    }} />
  );
};

const InfoRow = ({ icon: Icon, children, tone, style }) => (
  <div className={`flex items-center gap-[1.2cqw] min-w-0 shrink-0 rounded-[1cqw] px-[1.6cqw] py-[1cqw] border text-[1.75cqw] font-bold leading-tight ${tone}`} style={style}>
    <Icon className="shrink-0 w-[2.1cqw] h-[2.1cqw]" aria-hidden="true" />
    <span className="line-clamp-2 [overflow-wrap:anywhere]">{children}</span>
  </div>
);

const Body = ({ slide, isBlank, background }) => {
  if (!slide) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-[1.4cqw] uppercase tracking-widest">
        No hay diapositiva seleccionada
      </div>
    );
  }
  if (isBlank) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <span className="text-slate-700 font-mono text-[1.3cqw] uppercase tracking-widest">[ Pantalla negra ]</span>
      </div>
    );
  }

  const st = { ...DEFAULT_SLIDE_STYLE, ...(slide.style || {}) };
  const hidden = slide.hidden || {};
  const media = slide.mediaUrl || slide.fileUrl;
  const ev = slide.eventData || {};
  const show = (key, value) => !hidden[key] && !!value;

  // 1. ANUNCIO HÍBRIDO: afiche/vídeo + datos del evento
  if (isHybridSlide(slide)) {
    const subtitle = slide.subtitle && slide.subtitle !== ev.eventDate ? slide.subtitle : null;
    return (
      <div className="relative w-full h-full">
        <Backdrop background={background} bgColor={slide.style?.bgColor} />
        <div className="relative w-full h-full grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-[1.6cqw] p-[1.6cqw]">
          <div className="rounded-[1.4cqw] overflow-hidden">
            {media ? (
              <MediaFit src={media} alt={slide.title || 'Anuncio'} video={isVideoMedia(slide, media)} />
            ) : (
              <div className="w-full h-full grid place-items-center bg-black/40 text-white/40 font-mono text-[1.4cqw] uppercase tracking-widest">Sin multimedia</div>
            )}
          </div>
          <div className="relative flex flex-col min-w-0 min-h-0 rounded-[1.4cqw] p-[2.2cqw] pl-[2.8cqw] bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden" style={{ color: st.textColor }}>
            <span className="absolute left-0 top-[2cqw] bottom-[2cqw] w-[0.5cqw] rounded-full" style={{ background: st.accentColor }} aria-hidden="true" />
            {show('tag', ev.tag || 'Anuncio Oasis') && (
              <span className="self-start shrink-0 max-w-full truncate text-[1.25cqw] leading-none font-black uppercase tracking-[0.2em] px-[1.6cqw] py-[0.9cqw] rounded-full border"
                style={{ color: st.accentColor, borderColor: `color-mix(in srgb, ${st.accentColor} 40%, transparent)`, background: `color-mix(in srgb, ${st.accentColor} 12%, transparent)` }}>
                {ev.tag || 'Anuncio Oasis'}
              </span>
            )}
            {show('title', slide.title) && (
              <h3 className="mt-[1.4cqw] min-h-0 pb-[0.3cqw] uppercase leading-[1.05] tracking-wide text-[3.4cqw] line-clamp-3 [overflow-wrap:anywhere]" style={{ ...titleFont(st), color: st.accentColor }}>
                {slide.title}
              </h3>
            )}
            {show('subtitle', subtitle) && <p className="mt-[0.6cqw] shrink-0 text-[1.8cqw] font-semibold line-clamp-2 opacity-90">{subtitle}</p>}
            {ev.description && <p className="mt-[1cqw] shrink-0 text-[1.5cqw] leading-snug whitespace-pre-line line-clamp-2 opacity-75">{ev.description}</p>}
            <div className="mt-auto pt-[1.4cqw] space-y-[1cqw] shrink-0">
              {show('speaker', ev.speaker) && <InfoRow icon={Mic} tone="bg-white/5 border-white/10">{ev.speaker}</InfoRow>}
              {show('eventDate', ev.eventDate) && <InfoRow icon={Calendar} tone="text-amber-200 bg-amber-500/10 border-amber-500/25">{ev.eventDate}</InfoRow>}
              {show('location', ev.location) && <InfoRow icon={MapPin} tone="text-emerald-200 bg-emerald-500/10 border-emerald-500/25">{ev.location}</InfoRow>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. ELEMENTOS ESTRUCTURADOS (.pptx / JSON con títulos o texto)
  const hasTextElements = slide.elements?.some((el) => el.type === 'heading' || el.type === 'text');
  if (hasTextElements) {
    return (
      <div className="relative w-full h-full">
        <Backdrop background={background} bgColor={slide.style?.bgColor} gradientClass={slide.bg} />
        <div className="relative w-full h-full p-[6cqw] flex flex-col items-center justify-center text-center" style={{ color: st.textColor }}>
          {slide.elements.map((el, idx) => {
            if (el.type === 'heading') {
              return (
                <h2 key={el.id || idx} className="text-[4.6cqw] mb-[2cqw] tracking-wider leading-tight max-w-[85%] [overflow-wrap:anywhere]" style={{ ...titleFont(st), color: st.accentColor }}>
                  {el.content}
                </h2>
              );
            }
            if (el.type === 'text') {
              return <div key={el.id || idx} className="text-[2.2cqw] font-semibold max-w-[75%] my-[0.8cqw] leading-relaxed whitespace-pre-line">{el.content}</div>;
            }
            if (el.type === 'image' && el.content) {
              return <img key={el.id || idx} src={el.content} alt="Imagen de diapositiva" className="max-h-[45%] w-auto my-[1.5cqw] rounded-[1cqw] object-contain" />;
            }
            return <div key={el.id || idx} className="text-[1.5cqw] font-black my-[0.5cqw] uppercase tracking-[0.25em]" style={{ color: st.accentColor }}>{el.content}</div>;
          })}
        </div>
      </div>
    );
  }

  // 2. VÍDEO / 3. IMAGEN O PÁGINA DE PDF: a pantalla completa con relleno desenfocado
  if (media) {
    return <MediaFit src={media} alt={slide.title || 'Diapositiva'} video={isVideoMedia(slide, media)} />;
  }

  // 5. CARTEL / TARJETA DE TEXTO
  const chips = [
    show('speaker', ev.speaker) && { icon: Mic, text: ev.speaker },
    show('eventDate', ev.eventDate) && { icon: Calendar, text: ev.eventDate },
    show('location', ev.location) && { icon: MapPin, text: ev.location },
  ].filter(Boolean);
  return (
    <div className="relative w-full h-full">
      <Backdrop background={background} bgColor={slide.style?.bgColor} gradientClass={slide.bg} />
      <div className="relative w-full h-full p-[6cqw] flex flex-col items-center justify-center text-center gap-[1.6cqw]" style={{ color: st.textColor }}>
        {show('tag', ev.tag) && (
          <span className="text-[1.5cqw] font-black uppercase tracking-[0.3em] px-[1.8cqw] py-[0.8cqw] rounded-full border"
            style={{ color: st.accentColor, borderColor: `color-mix(in srgb, ${st.accentColor} 45%, transparent)` }}>
            {ev.tag}
          </span>
        )}
        {show('title', slide.title) && (
          <h2 className="text-[5cqw] tracking-wider leading-tight max-w-[90%] [overflow-wrap:anywhere]" style={{ ...titleFont(st), textShadow: '0 0.4cqw 2cqw rgba(0,0,0,0.45)' }}>
            {slide.title}
          </h2>
        )}
        {show('subtitle', slide.subtitle && slide.subtitle !== ev.eventDate ? slide.subtitle : null) && (
          <p className="font-bold text-[2.3cqw] max-w-[70%] whitespace-pre-line leading-relaxed" style={{ color: st.accentColor }}>
            {slide.subtitle}
          </p>
        )}
        {chips.length > 0 && (
          <div className="mt-[1.4cqw] flex flex-wrap justify-center gap-[1.2cqw]">
            {chips.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-[0.8cqw] text-[1.7cqw] font-bold px-[1.6cqw] py-[0.8cqw] rounded-full bg-white/10 border border-white/15">
                <Icon className="w-[1.9cqw] h-[1.9cqw]" style={{ color: st.accentColor }} aria-hidden="true" /> {text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const SlideCanvasView = ({ slide, isBlank, background = null, rounded = true }) => (
  <div className={`relative w-full h-full overflow-hidden bg-black [container-type:size] ${rounded ? 'rounded-2xl' : ''}`}>
    <Body slide={slide} isBlank={isBlank} background={slide?.background || background} />
  </div>
);

export default SlideCanvasView;
