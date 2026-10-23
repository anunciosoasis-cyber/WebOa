import React, { useState } from 'react';
import { BIBLIOTECA_FONDOS } from './ribbon/constants';

type BibliotecaKey = keyof typeof BIBLIOTECA_FONDOS;

interface ImageLibraryProps {
  onSelectImage: (url: string) => void;
  onClose: () => void;
  theme?: any;
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({ onSelectImage, onClose, theme }) => {
  const [catActiva, setCatActiva] = useState<BibliotecaKey>(Object.keys(BIBLIOTECA_FONDOS)[0] as BibliotecaKey);

  const surface = theme?.colors?.surface || '#fff';
  const textPrimary = theme?.colors?.text?.primary || '#1e293b';
  const textSecondary = theme?.colors?.text?.secondary || '#64748b';
  const border = theme?.colors?.border || '#e2e8f0';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)'
    }} onClick={onClose}>
      <div
        style={{
          background: surface, borderRadius: 20, width: '90%', maxWidth: 920,
          maxHeight: '85vh', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Cabecera ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-images" style={{ fontSize: '1.4rem', color: '#5b2ea6' }}></i>
            <div>
              <h4 style={{ margin: 0, color: textPrimary, fontSize: '1rem', fontWeight: 800 }}>
                Biblioteca de Fondos
              </h4>
              <span style={{ fontSize: '0.7rem', color: textSecondary }}>
                Imágenes de alta calidad — click para aplicar al diseño
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.05)', border: 'none', fontSize: '1.1rem', cursor: 'pointer',
            color: textSecondary, width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* ── Tabs de Categoría ── */}
        <div style={{
          display: 'flex', gap: 4, padding: '16px 24px 0',
          borderBottom: `1px solid ${border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none'
        }}>
          {(Object.keys(BIBLIOTECA_FONDOS) as BibliotecaKey[]).map(cat => {
            const isActive = catActiva === cat;
            return (
              <button key={cat} onClick={() => setCatActiva(cat)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: '0.78rem', fontWeight: isActive ? 800 : 500,
                color: isActive ? '#5b2ea6' : textSecondary,
                borderBottom: isActive ? '2px solid #5b2ea6' : '2px solid transparent',
                transition: 'color 0.2s', marginBottom: -1,
              }}>
                <i className={`bi ${BIBLIOTECA_FONDOS[cat].icon}`}></i>
                {BIBLIOTECA_FONDOS[cat].label}
              </button>
            );
          })}
        </div>

        {/* ── Grid de Imágenes ── */}
        <div style={{
          overflowY: 'auto', flex: 1, padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {BIBLIOTECA_FONDOS[catActiva].images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => { onSelectImage(img.full); onClose(); }}
              style={{
                cursor: 'pointer', borderRadius: 14, overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                border: '2px solid transparent', height: 150, position: 'relative',
                background: '#f1f5f9',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(91,46,166,0.25)';
                e.currentTarget.style.borderColor = '#5b2ea6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <img
                src={img.thumb}
                alt={`${BIBLIOTECA_FONDOS[catActiva].label} ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              {/* Overlay al hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(transparent 50%, rgba(91,46,166,0.7))',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                padding: '0 0 10px',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <span style={{
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <i className="bi bi-plus-circle-fill"></i> Aplicar fondo
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer info ── */}
        <div style={{
          padding: '12px 24px', borderTop: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
        }}>
          <i className="bi bi-info-circle" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
          <span style={{ fontSize: '0.7rem', color: textSecondary }}>
            Imágenes de Unsplash — resolución 1920px. Se aplican directamente como fondo del diseño.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageLibrary;
