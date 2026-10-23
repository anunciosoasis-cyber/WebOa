/**
 * slide.types.ts
 * Contratos e Interfaces TypeScript para el AST (Abstract Syntax Tree) de Diapositivas
 * Módulo de Presentaciones de Estudio Oasis
 */

export type BuildInAnimation = 
  | 'fade-in' 
  | 'slide-in-left' 
  | 'slide-in-right' 
  | 'slide-in-up' 
  | 'slide-in-down' 
  | 'zoom-in' 
  | 'bounce-in';

export type BuildOutAnimation = 
  | 'fade-out' 
  | 'slide-out-left' 
  | 'slide-out-right' 
  | 'slide-out-up' 
  | 'slide-out-down' 
  | 'zoom-out';

export type ElementType = 'heading' | 'text' | 'image' | 'shape' | 'video' | 'container';

export interface AnimationRule {
  step: number;                 // Orden secuencial dentro de la diapositiva (fragment index)
  buildIn?: BuildInAnimation;    // Animación de Entrada
  buildOut?: BuildOutAnimation;  // Animación de Salida
  durationMs?: number;           // Duración en milisegundos
  delayMs?: number;              // Retardo en milisegundos
}

export interface ElementStyle {
  position?: 'absolute' | 'relative' | 'static';
  top?: string;
  left?: string;
  width?: string;
  height?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  boxShadow?: string;
  zIndex?: number;
  opacity?: number;
  transform?: string;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string; // Texto, Data URI de imagen, o marcado HTML sanitizado
  style?: ElementStyle;
  animationRule?: AnimationRule;
  altText?: string;
  children?: SlideElement[];
}

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image';
  value: string; // Hex, linear-gradient, o URL
}

export interface SlideNode {
  id: string;
  index: number;
  title?: string;
  background?: SlideBackground;
  elements: SlideElement[];
  transition?: 'slide' | 'fade' | 'convex' | 'concave' | 'zoom' | 'none';
  notes?: string;
}

export interface PresentationAST {
  id: string;
  title: string;
  author?: string;
  aspectRatio: '16:9' | '4:3';
  slides: SlideNode[];
  createdAt: number;
  updatedAt: number;
}

export interface EngineConfig {
  aspectRatio?: '16:9' | '4:3';
  autoScale?: boolean;
  keyboardNav?: boolean;
  touchNav?: boolean;
  loop?: boolean;
  theme?: 'dark' | 'light' | 'custom';
  containerId?: string;
}

export interface PresentationState {
  currentSlideIndex: number;
  totalSlides: number;
  currentFragmentStep: number;
  totalFragmentsInSlide: number;
  isBlank: boolean;
  isFullscreen: boolean;
}

export type PresentationEventListener = (state: PresentationState) => void;
