/**
 * htmlConverter.ts
 * Transformador de AST a Nodos HTML5 Semánticos y Asignador de Reglas de Animación
 * Módulo de Conversión de Presentaciones de Estudio Oasis
 */

import { PresentationAST, SlideNode, SlideElement, ElementStyle } from '../../types/slide.types';

export class SlideConverterModule {
  
  /**
   * Transforma una presentación AST completa a una cadena de marcado HTML5 compatible con motores de presentación
   */
  public convertASTToHTML(ast: PresentationAST): string {
    const slidesHTML = ast.slides
      .map(slide => this.convertSlideToHTML(slide))
      .join('\n');

    return `<div className="reveal-viewport-container" data-aspect-ratio="${ast.aspectRatio}">
      <div className="slides">
        ${slidesHTML}
      </div>
    </div>`;
  }

  /**
   * Transforma un nodo SlideNode a una sección HTML `<section>`
   */
  public convertSlideToHTML(slide: SlideNode): string {
    const bgStyle = this.getBackgroundStyle(slide);
    const elementsHTML = slide.elements
      .map(element => this.convertElementToHTML(element))
      .join('\n');

    const transitionAttr = slide.transition ? `data-transition="${slide.transition}"` : 'data-transition="slide"';

    return `<section 
      id="${slide.id}" 
      data-slide-index="${slide.index}" 
      style="${bgStyle}" 
      ${transitionAttr}
      className="slide-section-node relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      ${elementsHTML}
    </section>`;
  }

  /**
   * Transforma un SlideElement a un elemento de DOM HTML5 con atributos data-fragment-index y clases de animación
   */
  public convertElementToHTML(element: SlideElement): string {
    const inlineStyle = this.styleToCSSString(element.style);
    const animationClasses = this.buildAnimationClasses(element);
    const fragmentAttrs = this.buildFragmentAttributes(element);

    const classNames = `slide-element-node ${animationClasses}`.trim();

    switch (element.type) {
      case 'heading':
        return `<h2 id="${element.id}" className="${classNames}" style="${inlineStyle}" ${fragmentAttrs}>
          ${this.sanitizeContent(element.content)}
        </h2>`;

      case 'text':
        return `<div id="${element.id}" className="${classNames}" style="${inlineStyle}" ${fragmentAttrs}>
          <p>${this.sanitizeContent(element.content).replace(/\n/g, '<br/>')}</p>
        </div>`;

      case 'image':
        return `<img id="${element.id}" src="${element.content}" alt="${element.altText || 'Diapositiva'}" className="${classNames} object-contain" style="${inlineStyle}" ${fragmentAttrs} />`;

      case 'shape':
        return `<div id="${element.id}" className="${classNames}" style="${inlineStyle}" ${fragmentAttrs}>
          ${this.sanitizeContent(element.content)}
        </div>`;

      case 'video':
        return `<video id="${element.id}" src="${element.content}" controls className="${classNames}" style="${inlineStyle}" ${fragmentAttrs}></video>`;

      case 'container':
      default:
        const childrenHTML = element.children ? element.children.map(c => this.convertElementToHTML(c)).join('') : this.sanitizeContent(element.content);
        return `<div id="${element.id}" className="${classNames}" style="${inlineStyle}" ${fragmentAttrs}>
          ${childrenHTML}
        </div>`;
    }
  }

  /**
   * Construye las clases de animación (Reveal.js fragment / Animate.css) a partir de la regla de animación
   */
  private buildAnimationClasses(element: SlideElement): string {
    if (!element.animationRule) return '';

    const classes: string[] = ['fragment'];
    const rule = element.animationRule;

    if (rule.buildIn) {
      switch (rule.buildIn) {
        case 'fade-in': classes.push('fade-in'); break;
        case 'slide-in-left': classes.push('slide-right'); break;
        case 'slide-in-right': classes.push('slide-left'); break;
        case 'slide-in-up': classes.push('slide-up'); break;
        case 'slide-in-down': classes.push('slide-down'); break;
        case 'zoom-in': classes.push('grow'); break;
        case 'bounce-in': classes.push('fade-in-then-semi-out'); break;
      }
    }

    if (rule.buildOut) {
      switch (rule.buildOut) {
        case 'fade-out': classes.push('fade-out'); break;
        case 'slide-out-left': classes.push('fade-out'); break;
        case 'slide-out-right': classes.push('fade-out'); break;
        case 'zoom-out': classes.push('shrink'); break;
      }
    }

    return classes.join(' ');
  }

  /**
   * Atributos data-fragment-index para la secuencia ordenada de animaciones por pasos
   */
  private buildFragmentAttributes(element: SlideElement): string {
    if (!element.animationRule) return '';
    return `data-fragment-index="${element.animationRule.step}"`;
  }

  private getBackgroundStyle(slide: SlideNode): string {
    if (!slide.background) {
      return 'background: linear-gradient(135deg, #2a144a 0%, #1b0d36 100%); color: #ffffff;';
    }
    if (slide.background.type === 'color' || slide.background.type === 'gradient') {
      return `background: ${slide.background.value}; color: #ffffff;`;
    }
    if (slide.background.type === 'image') {
      return `background-image: url("${slide.background.value}"); background-size: cover; background-position: center; color: #ffffff;`;
    }
    return '';
  }

  private styleToCSSString(style?: ElementStyle): string {
    if (!style) return 'width: 100%; box-sizing: border-box;';
    const cssPairs: string[] = ['box-sizing: border-box;'];

    for (const [key, value] of Object.entries(style)) {
      if (value !== undefined && value !== null) {
        const kebabKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        cssPairs.push(`${kebabKey}: ${value};`);
      }
    }
    return cssPairs.join(' ');
  }

  private sanitizeContent(content: string): string {
    if (!content) return '';
    return content;
  }
}
