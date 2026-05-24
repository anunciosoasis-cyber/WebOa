
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import AboutHero from './AboutHero';
import AboutValues from './AboutValues';
import AboutTimeline from './AboutTimeline';
import AboutBoard from './AboutBoard';
import AboutGallery from './AboutGallery';
import MemberModal from './MemberModal';

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [settings, setSettings] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    Promise.all([
      apiClient.get('/public/settings'),
      apiClient.get('/board-members'),
      apiClient.get('/gallery-items')
    ]).then(([settingsRes, boardRes, galleryRes]) => {
      setSettings(settingsRes.data);
      setBoardMembers(boardRes.data);
      setGalleryItems(galleryRes.data);
    }).catch(err => console.error(err));
  }, []);

  const timelineEvents = settings?.about_timeline ? JSON.parse(settings.about_timeline) : undefined;

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${apiBase}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  return (
    <div>
      <AboutHero 
        title={settings?.about_hero_title || "¿Quiénes Somos?"}
        content={settings?.about_hero_content || "Oasis Medellín es una comunidad vibrante dedicada a la fe, la familia y el servicio. Descubre nuestra historia, valores y el equipo que hace posible este sueño."} 
      />
      <AboutValues settings={settings} />
      <AboutTimeline historyBrief={settings?.about_history_content} timeline={timelineEvents} />
      <AboutBoard boardMembers={boardMembers} onSelectMember={setSelectedMember} getImageUrl={getImageUrl} />
      <AboutGallery galleryItems={galleryItems} getImageUrl={getImageUrl} />
      <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} getImageUrl={getImageUrl} />
    </div>
  );
};

export default About;