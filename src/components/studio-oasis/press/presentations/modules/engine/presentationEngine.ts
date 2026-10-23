/**
 * presentationEngine.ts
 * Motor de Presentación y Adaptador de Viewport Responsive (16:9 / 4:3)
 * Módulo de Viewport y Reproducción de Estudio Oasis
 */

import { PresentationAST, EngineConfig, PresentationState, PresentationEventListener } from '../../types/slide.types';
import { SlideConverterModule } from '../converter/htmlConverter';
import { AnimationControllerModule } from '../animation/animationManager';

export class PresentationEngineModule {
  private ast: PresentationAST | null = null;
  private config: EngineConfig;
  private container: HTMLElement | null = null;
  private converter: SlideConverterModule;
  private animationManager: AnimationControllerModule;
  
  private currentSlideIndex: number = 0;
  private isBlank: boolean = false;
  private isFullscreen: boolean = false;
  private listeners: PresentationEventListener[] = [];

  constructor(config: EngineConfig = {}) {
    this.config = {
      aspectRatio: '16:9',
      autoScale: true,
      keyboardNav: true,
      touchNav: true,
      ...config
    };

    this.converter = new SlideConverterModule();
    this.animationManager = new AnimationControllerModule();
  }

  /**
   * Carga el AST de la presentación en el motor
   */
  public load(ast: PresentationAST): void {
    this.ast = ast;
    this.currentSlideIndex = 0;
    this.isBlank = false;
    if (this.container) {
      this.mount();
    }
  }

  /**
   * Monta el marcado de la presentación en el contenedor DOM especificado
   */
  public mount(containerElement?: HTMLElement): void {
    if (containerElement) {
      this.container = containerElement;
    }

    if (!this.container || !this.ast) return;

    // Generar marcado HTML5 semántico
    const htmlMarkup = this.converter.convertASTToHTML(this.ast);
    this.container.innerHTML = htmlMarkup;

    // Configurar viewport y escalado responsive
    this.setupViewportScaling();
    
    // Configurar controladores de eventos de teclado y touch
    if (this.config.keyboardNav) {
      this.attachKeyboardListeners();
    }
    if (this.config.touchNav) {
      this.attachTouchListeners();
    }

    // Inicializar diapositiva activa
    this.renderCurrentSlide();
  }

  /**
   * Avanza a la siguiente diapositiva o al siguiente paso de animación
   */
  public next(): void {
    if (!this.ast || !this.container) return;

    const currentSlide = this.ast.slides[this.currentSlideIndex];
    const activeSection = this.container.querySelector<HTMLElement>(`[data-slide-index="${this.currentSlideIndex}"]`);

    if (activeSection && this.animationManager.nextStep(activeSection)) {
      this.notifyStateChange();
      return; // Se ejecutó un paso de animación dentro de la diapositiva
    }

    // Si no hay más pasos, pasar a la siguiente diapositiva
    if (this.currentSlideIndex < this.ast.slides.length - 1) {
      this.currentSlideIndex++;
      this.renderCurrentSlide();
    }
  }

  /**
   * Retrocede a la diapositiva anterior o al paso de animación previo
   */
  public previous(): void {
    if (!this.ast || !this.container) return;

    const activeSection = this.container.querySelector<HTMLElement>(`[data-slide-index="${this.currentSlideIndex}"]`);

    if (activeSection && this.animationManager.prevStep(activeSection)) {
      this.notifyStateChange();
      return; // Se retrocedió un paso de animación
    }

    // Si ya estaba al inicio de la diapositiva, pasar a la anterior
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderCurrentSlide();
      // Mostrar todos los pasos de la diapositiva anterior
      const prevSection = this.container.querySelector<HTMLElement>(`[data-slide-index="${this.currentSlideIndex}"]`);
      if (prevSection) {
        this.animationManager.showAllSteps(prevSection);
      }
    }
  }

  /**
   * Salta directamente a la diapositiva por índice (0-based)
   */
  public goToSlide(index: number): void {
    if (!this.ast || index < 0 || index >= this.ast.slides.length) return;
    this.currentSlideIndex = index;
    this.isBlank = false;
    this.renderCurrentSlide();
  }

  /**
   * Alterna el modo Pantalla Negra (Blank Screen)
   */
  public toggleBlank(): void {
    this.isBlank = !this.isBlank;
    if (this.container) {
      if (this.isBlank) {
        this.container.classList.add('blank-screen-active');
      } else {
        this.container.classList.remove('blank-screen-active');
      }
    }
    this.notifyStateChange();
  }

  /**
   * Alterna el modo Pantalla Completa (Fullscreen)
   */
  public toggleFullscreen(): void {
    if (!this.container) return;

    if (!document.fullscreenElement) {
      this.container.requestFullscreen().then(() => {
        this.isFullscreen = true;
        this.notifyStateChange();
      }).catch(err => console.error("Error fullscreen:", err));
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
        this.notifyStateChange();
      }).catch(err => console.error("Error exit fullscreen:", err));
    }
  }

  public subscribe(listener: PresentationEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Renderiza y activa la diapositiva según currentSlideIndex
   */
  private renderCurrentSlide(): void {
    if (!this.ast || !this.container) return;

    const sections = this.container.querySelectorAll<HTMLElement>('.slide-section-node');
    sections.forEach((sec, idx) => {
      if (idx === this.currentSlideIndex) {
        sec.style.display = 'flex';
        sec.classList.add('active-slide');
        
        const currentSlide = this.ast!.slides[idx];
        this.animationManager.initSlideAnimations(currentSlide, sec);
      } else {
        sec.style.display = 'none';
        sec.classList.remove('active-slide');
      }
    });

    this.notifyStateChange();
  }

  /**
   * Escalado dinámico responsive para mantener relación de aspecto (16:9 o 4:3)
   */
  private setupViewportScaling(): void {
    if (!this.container) return;

    const ratio = this.ast?.aspectRatio === '4:3' ? 4 / 3 : 16 / 9;

    const applyScale = () => {
      if (!this.container) return;
      const parent = this.container.parentElement || document.body;
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;

      let targetWidth = parentWidth;
      let targetHeight = targetWidth / ratio;

      if (targetHeight > parentHeight) {
        targetHeight = parentHeight;
        targetWidth = targetHeight * ratio;
      }

      this.container.style.width = `${targetWidth}px`;
      this.container.style.height = `${targetHeight}px`;
      this.container.style.margin = '0 auto';
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
    };

    applyScale();
    window.addEventListener('resize', applyScale);
  }

  private attachKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'Space', 'PageDown'].includes(e.code)) {
        e.preventDefault();
        this.next();
      } else if (['ArrowLeft', 'PageUp'].includes(e.code)) {
        e.preventDefault();
        this.previous();
      } else if (e.code === 'KeyB') {
        this.toggleBlank();
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
    });
  }

  private attachTouchListeners(): void {
    let touchStartX = 0;
    if (!this.container) return;

    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    this.container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        this.next(); // Swipe izquierda -> Siguiente
      } else if (touchEndX - touchStartX > 50) {
        this.previous(); // Swipe derecha -> Anterior
      }
    });
  }

  private notifyStateChange(): void {
    const state: PresentationState = {
      currentSlideIndex: this.currentSlideIndex,
      totalSlides: this.ast?.slides.length || 0,
      currentFragmentStep: this.animationManager.getCurrentStep(),
      totalFragmentsInSlide: this.animationManager.getTotalSteps(),
      isBlank: this.isBlank,
      isFullscreen: this.isFullscreen
    };

    this.listeners.forEach(l => l(state));
  }
}
