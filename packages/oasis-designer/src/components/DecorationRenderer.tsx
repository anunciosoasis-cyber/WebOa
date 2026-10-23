import React from 'react';
import { Decoration } from '../data/templates';

interface DecorationRendererProps {
  decorations?: Decoration[];
}

const DecorationRenderer: React.FC<DecorationRendererProps> = ({ decorations }) => {
  if (!decorations || decorations.length === 0) return null;

  return (
    <>
      {decorations.map((dec) => {
        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: dec.zIndex ?? 1,
          opacity: dec.opacity ?? 1,
          mixBlendMode: (dec.blendMode as any) ?? 'normal',
          ...dec.style
        };

        if (dec.type === 'tape') {
          return (
            <div key={dec.id} style={baseStyle}>
              <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.25))' }}>
                <path 
                  d="M0,5 Q10,0 20,5 T40,5 T60,5 T80,5 T100,5 T120,5 T140,5 T160,5 T180,5 T200,5 L195,35 Q185,40 175,35 T155,35 T135,35 T115,35 T95,35 T75,35 T55,35 T35,35 T15,35 Z" 
                  fill={dec.color || 'rgba(240, 235, 215, 0.9)'} 
                />
                <rect x="0" y="0" width="200" height="40" fill="url(#tape-texture)" style={{ mixBlendMode: 'multiply' }} opacity="0.3" />
                <defs>
                  <pattern id="tape-texture" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#000" opacity="0.1" />
                  </pattern>
                </defs>
              </svg>
            </div>
          );
        }

        if (dec.type === 'light-leak') {
          return (
            <div key={dec.id} style={{
              ...baseStyle,
              background: `radial-gradient(circle, ${dec.color || 'rgba(255,255,255,0.8)'} 0%, rgba(0,0,0,0) 70%)`,
              filter: 'blur(40px)'
            }} />
          );
        }

        if (dec.type === 'gradient-fade') {
          return (
            <div key={dec.id} style={{
              ...baseStyle,
              background: `linear-gradient(to top, ${dec.color || 'rgba(0,0,0,0.9)'} 0%, rgba(0,0,0,0) 100%)`
            }} />
          );
        }

        if (dec.type === 'texture' || dec.type === 'image') {
          return (
             <div key={dec.id} style={{
                ...baseStyle,
                backgroundImage: dec.url ? `url(${dec.url})` : 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                backgroundSize: dec.url ? 'cover' : 'auto',
                backgroundPosition: 'center',
                backgroundColor: dec.url ? 'transparent' : 'rgba(0,0,0,0.1)'
             }} />
          );
        }

        return null;
      })}
    </>
  );
};

export default DecorationRenderer;
