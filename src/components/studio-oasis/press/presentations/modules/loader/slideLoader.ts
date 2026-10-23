/**
 * slideLoader.ts
 * Fachada unificada (Facade Pattern) para la carga y obtención de Presentaciones
 * Módulo de Carga de Presentaciones de Estudio Oasis
 */

import { PresentationAST } from '../../types/slide.types';
import { PPTXParser } from './pptxParser';

export class SlideLoaderModule {
  private pptxParser: PPTXParser;

  constructor() {
    this.pptxParser = new PPTXParser();
  }

  /**
   * Carga una presentación desde un objeto File (PPTX, PDF, JSON o Imágenes)
   */
  public async loadFromFile(file: File): Promise<PresentationAST> {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo para cargar.');
    }
    return this.pptxParser.parseFile(file);
  }

  /**
   * Carga una presentación desde una cadena de texto JSON
   */
  public async loadFromJSON(jsonString: string): Promise<PresentationAST> {
    return this.pptxParser.parseJSON(jsonString);
  }

  /**
   * Genera una plantilla predeterminada de presentación para cultos o reuniones
   */
  public createDefaultTemplate(title: string = 'Culto Divino Oasis'): PresentationAST {
    return {
      id: `tmpl-${Date.now()}`,
      title,
      aspectRatio: '16:9',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: [
        {
          id: 'slide-1',
          index: 0,
          title: 'Bienvenida',
          background: { type: 'gradient', value: 'linear-gradient(135deg, #2a144a 0%, #1b0d36 100%)' },
          elements: [
            {
              id: 'el-1-1',
              type: 'heading',
              content: 'Bienvenida al Culto Divino',
              style: { color: '#F59E0B', fontSize: '3rem', fontWeight: 900, textAlign: 'center', top: '35%' },
              animationRule: { step: 0, buildIn: 'slide-in-down' }
            },
            {
              id: 'el-1-2',
              type: 'text',
              content: 'Iglesia Adventista del Séptimo Día — Oasis',
              style: { color: '#FFFFFF', fontSize: '1.4rem', textAlign: 'center', top: '55%' },
              animationRule: { step: 1, buildIn: 'fade-in' }
            }
          ]
        },
        {
          id: 'slide-2',
          index: 1,
          title: 'Himno de Alabanza',
          background: { type: 'gradient', value: 'linear-gradient(135deg, #1b0d36 0%, #08050D 100%)' },
          elements: [
            {
              id: 'el-2-1',
              type: 'heading',
              content: 'Himno #12 — Señor mi Dios',
              style: { color: '#F59E0B', fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', top: '25%' },
              animationRule: { step: 0, buildIn: 'zoom-in' }
            },
            {
              id: 'el-2-2',
              type: 'text',
              content: 'Señor mi Dios, al contemplar los cielos,\nel firmamento y las estrellas mil...',
              style: { color: '#E2E8F0', fontSize: '1.5rem', textAlign: 'center', top: '48%' },
              animationRule: { step: 1, buildIn: 'slide-in-up' }
            }
          ]
        }
      ]
    };
  }
}
