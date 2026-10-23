import React from 'react';
import InstagramLayout from '../InstagramLayout';
import YouTubeLayout from '../YouTubeLayout';
import WhatsAppLayout from '../WhatsAppLayout';
import SquareLayout from '../SquareLayout';
import { BaseLayoutProps } from '../types';

const TemplateLegacyWrapper: React.FC<BaseLayoutProps> = (props) => {
  switch (props.formData.format) {
    case 'youtube': return <YouTubeLayout {...props} />;
    case 'whatsapp': return <WhatsAppLayout {...props} />;
    case 'square': return <SquareLayout {...props} />;
    case 'instagram': 
    default:
      return <InstagramLayout {...props} />;
  }
};

export default TemplateLegacyWrapper;
