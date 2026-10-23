/**
 * index.ts
 * PresentationManager — Orquestador Principal del Motor de Presentaciones de Estudio Oasis
 * Sigue principios de Clean Architecture / Component-Driven desacoplado.
 */

import { SlideLoaderModule } from './modules/loader/slideLoader';
import { PresentationEngineModule } from './modules/engine/presentationEngine';
import { 
  PresentationAST, 
  EngineConfig, 
  PresentationState, 
  PresentationEventListener 
} from './types/slide.types';

export class PresentationManager {
  private loader: SlideLoaderModule;
  private engine: PresentationEngineModule;
  private currentAST: PresentationAST | null = null;

  constructor(config: EngineConfig = {}) {
    this.loader = new SlideLoaderModule();
    this.engine = new PresentationEngineModule(config);

    // Escuchar comandos del control remoto por cel en tiempo real
    this.listenToRemoteCommands();
  }

  /**
   * Carga una presentación a partir de un archivo subido (.pptx, .pdf, .json o imágenes)
   */
  public async loadFromFile(file: File): Promise<PresentationAST> {
    const ast = await this.loader.loadFromFile(file);
    this.currentAST = ast;
    this.engine.load(ast);
    return ast;
  }

  /**
   * Carga una presentación desde una cadena JSON estructurada
   */
  public async loadFromJSON(jsonString: string): Promise<PresentationAST> {
    const ast = await this.loader.loadFromJSON(jsonString);
    this.currentAST = ast;
    this.engine.load(ast);
    return ast;
  }

  /**
   * Genera y carga una plantilla predeterminada de culto
   */
  public loadDefaultTemplate(title?: string): PresentationAST {
    const ast = this.loader.createDefaultTemplate(title);
    this.currentAST = ast;
    this.engine.load(ast);
    return ast;
  }

  /**
   * Monta la presentación en un elemento del DOM
   */
  public mount(containerElement: HTMLElement): void {
    this.engine.mount(containerElement);
  }

  /**
   * Avanza a la siguiente diapositiva o al siguiente paso de animación (Build In)
   */
  public next(): void {
    this.engine.next();
  }

  /**
   * Retrocede a la diapositiva anterior o al paso de animación previo (Build Out)
   */
  public previous(): void {
    this.engine.previous();
  }

  /**
   * Salta a una diapositiva específica por índice (0-based)
   */
  public goToSlide(index: number): void {
    this.engine.goToSlide(index);
  }

  /**
   * Alterna el modo de Pantalla Negra (Blank Screen)
   */
  public toggleBlank(): void {
    this.engine.toggleBlank();
  }

  /**
   * Alterna el modo Pantalla Completa
   */
  public toggleFullscreen(): void {
    this.engine.toggleFullscreen();
  }

  /**
   * Suscribe un listener para recibir cambios de estado en tiempo real (slide actual, frag, etc.)
   */
  public subscribe(listener: PresentationEventListener): () => void {
    return this.engine.subscribe(listener);
  }

  /**
   * Obtiene el AST actual de la presentación
   */
  public getAST(): PresentationAST | null {
    return this.currentAST;
  }

  /**
   * Escucha de comandos remotos en tiempo real desde celular (/remote)
   */
  private listenToRemoteCommands(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === 'oasis_ppt_command' && e.newValue) {
        try {
          const cmd = JSON.parse(e.newValue);
          if (cmd.action === 'NEXT') {
            this.next();
          } else if (cmd.action === 'PREV') {
            this.previous();
          } else if (cmd.action === 'TOGGLE_BLANK') {
            this.toggleBlank();
          }
        } catch (err) {
          console.error("Error al procesar comando remoto:", err);
        }
      }
    });
  }
}

// Exportar módulos e interfaces públicas
export * from './types/slide.types';
export { SlideLoaderModule } from './modules/loader/slideLoader';
export { SlideConverterModule } from './modules/converter/htmlConverter';
export { AnimationControllerModule } from './modules/animation/animationManager';
export { PresentationEngineModule } from './modules/engine/presentationEngine';
