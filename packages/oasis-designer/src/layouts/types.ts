import React from 'react';
import { FormData } from '../data/templates';

export interface BaseLayoutProps {
  formData: FormData;
  scales: any;
  assets: {
    iasd?: string;
    oasis?: string;
    logoOasisLetras?: string;
    rrss?: string;
  };
  gotaColor1: string;
  gotaColor2: string;
  layoutStyles: {
    justifyContent: string;
    alignItems: string;
    textAlign: React.CSSProperties['textAlign'];
  };
  layoutMode: 'centered' | 'left' | 'bottom';
  ts: (id: string, def: any) => React.CSSProperties;
  handleElementDoubleClick: (id: string) => void;
  fadeInProps: any;
}
