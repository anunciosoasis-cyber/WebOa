import React from 'react';
import PageHero from '../../react-ui/components/PageHero';

const AboutHero = ({ title, content }) => (
    <PageHero
        id="about"
        eyebrow="Identidad & Propósito"
        title={title}
        subtitle={content}
        fallbackImage="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2400"
    />
);

export default AboutHero;
