/**
 * animationManager.ts
 * Gestor del Ciclo de Vida de Animaciones Granulares Build-In y Build-Out
 * Módulo de Animaciones de Estudio Oasis
 */

import { SlideNode, SlideElement } from '../../types/slide.types';

export class AnimationControllerModule {
  private activeSlide: SlideNode | null = null;
  private currentStep: number = 0;
  private totalSteps: number = 0;

  /**
   * Inicializa el controlador para una diapositiva activa
   */
  public initSlideAnimations(slide: SlideNode, container: HTMLElement): void {
    this.activeSlide = slide;
    this.currentStep = 0;
    
    // Contar los pasos de fragmentos únicos
    const steps = new Set<number>();
    slide.elements.forEach(el => {
      if (el.animationRule?.step !== undefined) {
        steps.add(el.animationRule.step);
      }
    });

    this.totalSteps = steps.size;
    this.resetStepVisuals(container);
  }

  /**
   * Avanza un paso de animación (Build-In) dentro de la diapositiva actual.
   * Retorna true si avanzó un paso dentro de la diapositiva, false si se acabaron los pasos.
   */
  public nextStep(container: HTMLElement): boolean {
    if (this.currentStep >= this.totalSteps) {
      return false; // Pasar a la siguiente diapositiva
    }

    const fragmentNodes = container.querySelectorAll<HTMLElement>(`[data-fragment-index="${this.currentStep}"]`);
    fragmentNodes.forEach(node => {
      node.classList.add('visible');
      node.classList.remove('hidden-build');
    });

    this.currentStep++;
    return true;
  }

  /**
   * Retrocede un paso de animación (Build-Out) dentro de la diapositiva actual.
   * Retorna true si retrocedió un paso, false si ya estaba en el inicio.
   */
  public prevStep(container: HTMLElement): boolean {
    if (this.currentStep <= 0) {
      return false; // Retroceder a la diapositiva anterior
    }

    this.currentStep--;
    const fragmentNodes = container.querySelectorAll<HTMLElement>(`[data-fragment-index="${this.currentStep}"]`);
    fragmentNodes.forEach(node => {
      node.classList.remove('visible');
      node.classList.add('hidden-build');
    });

    return true;
  }

  /**
   * Muestra instantáneamente todos los fragmentos (para saltos directos o fin de diapositiva)
   */
  public showAllSteps(container: HTMLElement): void {
    const fragmentNodes = container.querySelectorAll<HTMLElement>('[data-fragment-index]');
    fragmentNodes.forEach(node => {
      node.classList.add('visible');
      node.classList.remove('hidden-build');
    });
    this.currentStep = this.totalSteps;
  }

  /**
   * Restablece el estado inicial de visibilidad de animaciones para la diapositiva
   */
  private resetStepVisuals(container: HTMLElement): void {
    const fragmentNodes = container.querySelectorAll<HTMLElement>('[data-fragment-index]');
    fragmentNodes.forEach(node => {
      const stepIndex = parseInt(node.getAttribute('data-fragment-index') || '0', 10);
      if (stepIndex > 0) {
        node.classList.remove('visible');
        node.classList.add('hidden-build');
      } else {
        node.classList.add('visible');
        node.classList.remove('hidden-build');
      }
    });
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public getTotalSteps(): number {
    return this.totalSteps;
  }
}
