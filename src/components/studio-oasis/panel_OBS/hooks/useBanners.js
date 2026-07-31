import { useState, useEffect } from 'react';
import { useToast } from '../../../../react-ui/components/Toast';

export const useBanners = () => {
    const { showToast } = useToast();

    const [preacher, setPreacher] = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_saved_preacher')) || { name: '', title: '' }; }
        catch { return { name: '', title: '' }; }
    });

    const [announcementsList, setAnnouncementsList] = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_announcements_history')) || []; }
        catch { return []; }
    });

    const [announcement, setAnnouncement] = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_saved_announcement')) || { title: '', content: '' }; }
        catch { return { title: '', content: '' }; }
    });

    useEffect(() => {
        localStorage.setItem('oasis_saved_announcement', JSON.stringify(announcement));
    }, [announcement]);

    useEffect(() => {
        localStorage.setItem('oasis_saved_preacher', JSON.stringify(preacher));
    }, [preacher]);

    const saveToAnnouncementsMemory = (newAnno) => {
        if (!newAnno?.title && !newAnno?.content) return;
        setAnnouncementsList(prev => {
            const filtered = prev.filter(a => a.title !== newAnno.title || a.content !== newAnno.content);
            const updated = [newAnno, ...filtered].slice(0, 15);
            localStorage.setItem('oasis_announcements_history', JSON.stringify(updated));
            return updated;
        });
        showToast('Aviso guardado en memoria', 'success');
    };

    return {
        preacher, setPreacher,
        announcementsList, setAnnouncementsList,
        announcement, setAnnouncement,
        saveToAnnouncementsMemory
    };
};
