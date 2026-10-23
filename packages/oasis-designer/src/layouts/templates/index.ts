import TemplateLegacyWrapper from './TemplateLegacyWrapper';
import TemplateCultoAdoracion from './TemplateCultoAdoracion';
import TemplateOasisFlyer from './TemplateOasisFlyer';

export const TemplateRegistry: Record<string, React.FC<any>> = {
  'default': TemplateOasisFlyer,
  'adoracion': TemplateOasisFlyer,
  'matutino': TemplateOasisFlyer,
  'oracion': TemplateOasisFlyer,
  'oasis-flyer': TemplateOasisFlyer,
  'culto-oracion-tape': TemplateCultoAdoracion,
  'elegant': TemplateLegacyWrapper,
  'modern': TemplateLegacyWrapper,
  'youth': TemplateLegacyWrapper,
  'minimal': TemplateLegacyWrapper,
  'nature': TemplateLegacyWrapper,
  'worship': TemplateLegacyWrapper,
  'sunset': TemplateLegacyWrapper
};

export { TemplateLegacyWrapper, TemplateOasisFlyer };

