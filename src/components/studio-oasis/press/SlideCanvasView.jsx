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

  // 1. ANUNCIO HÍBRIDO, estilo cinemático: la imagen ocupa el cuadro y se funde en un velo oscuro
  //    donde va el texto. Sin tarjetas ni bordes de color: el acento solo marca etiqueta e iconos.
  if (isHybridSlide(slide)) {
    const subtitle = slide.subtitle && slide.subtitle !== ev.eventDate ? slide.subtitle : null;
    const video = media && isVideoMedia(slide, media);
    const infos = [
      show('speaker', ev.speaker) && { icon: Mic, text: ev.speaker },
      show('eventDate', ev.eventDate) && { icon: Calendar, text: ev.eventDate },
      show('location', ev.location) && { icon: MapPin, text: ev.location },
    ].filter(Boolean);
    const fade = 'linear-gradient(to right, black 0%, black 58%, transparent 100%)';
    // La palabra más larga debe caber entera en la columna (~38cqw): el título se achica en vez de partirla
    const longestWord = Math.max(1, ...String(slide.title || '').split(/\s+/).map((w) => w.length));
    const titleSize = `${Math.min(4.4, 38 / (longestWord * 0.8)).toFixed(2)}cqw`;
    return (
      <div className="relative w-full h-full bg-black">
        {/* Capa 1: ambiente (la misma imagen, desenfocada y oscura) o el fondo elegido */}
        {media && !video ? (
          <img src={media} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: 'blur(4cqw) brightness(0.35) saturate(1.2)' }} />
        ) : (
          <Backdrop background={background} bgColor={slide.style?.bgColor} />
        )}

        {/* Capa 2: la imagen nítida a la izquierda, fundida hacia la derecha (sin borde) */}
        {media && (
          <div className="absolute inset-y-0 left-0 w-[66%]" style={{ WebkitMaskImage: fade, maskImage: fade }}>
            {video ? (
              <video src={media} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={media} alt={slide.title || 'Anuncio'} className="w-full h-full object-contain" />
            )}
          </div>
        )}

        {/* Capa 3: velo cinematográfico y viñeta */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
          background: 'linear-gradient(to right, rgba(4,4,10,0) 30%, rgba(4,4,10,0.72) 58%, rgba(4,4,10,0.92) 100%), radial-gradient(130% 100% at 30% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* Capa 4: texto */}
        <div className="absolute inset-y-0 right-0 w-[46%] flex flex-col justify-center min-w-0 py-[5cqw] pl-[1cqw] pr-[5cqw]" style={{ color: st.textColor }}>
          {show('tag', ev.tag || 'Anuncio Oasis') && (
            <div className="flex items-center gap-[1.2cqw] shrink-0 min-w-0">
              <span className="w-[3.2cqw] h-[0.22cqw] rounded-full shrink-0" style={{ background: st.accentColor }} aria-hidden="true" />
              <span className="truncate text-[1.2cqw] font-bold uppercase tracking-[0.35em]" style={{ color: st.accentColor }}>
                {ev.tag || 'Anuncio Oasis'}
              </span>
            </div>
          )}
          {show('title', slide.title) && (
            <h3 className="mt-[1.6cqw] min-h-0 uppercase leading-[1.02] tracking-wide line-clamp-3 [overflow-wrap:break-word]"
              style={{ ...titleFont(st), fontSize: titleSize, color: st.textColor, textShadow: '0 0.5cqw 2.5cqw rgba(0,0,0,0.6)' }}>
              {slide.title}
            </h3>
          )}
          {show('subtitle', subtitle) && <p className="mt-[1cqw] shrink-0 text-[1.9cqw] font-semibold line-clamp-2 opacity-85">{subtitle}</p>}
          {ev.description && <p className="mt-[1cqw] shrink-0 text-[1.5cqw] leading-snug whitespace-pre-line line-clamp-3 opacity-70">{ev.description}</p>}
          {infos.length > 0 && (
            <div className="mt-[2.6cqw] pt-[2cqw] border-t border-white/15 space-y-[1.1cqw] shrink-0">
              {infos.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-[1.2cqw] min-w-0 text-[1.75cqw] font-semibold leading-tight">
                  <Icon className="shrink-0 w-[2cqw] h-[2cqw]" style={{ color: st.accentColor }} aria-hidden="true" />
                  <span className="line-clamp-2 [overflow-wrap:anywhere] opacity-90">{text}</span>
                </div>
              ))}
            </div>
          )}
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
