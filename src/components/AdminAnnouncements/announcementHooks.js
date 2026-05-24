// Custom hooks and logic for AdminAnnouncements
import { useState, useEffect, useRef, useCallback } from 'react';
import DEFAULTS from './announcementDefaults';
import { toBase64 } from './announcementHelpers';

export function useAnnouncementState() {
    const [formData, setFormData] = useState(DEFAULTS);
    const [imageFile, setImageFile] = useState(null);
    const [fontsReady, setFontsReady] = useState(false);
    const [assets, setAssets] = useState({ oasis: null, iasd: null, rrss: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeMode, setActiveMode] = useState('anuncios');
    const [activeRibbonTab, setActiveRibbonTab] = useState('inicio');
    const [activeSidebar, setActiveSidebar] = useState('design');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [shapeMode, setShapeMode] = useState(false);

    // Helpers
    const set = useCallback((key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    }, []);

    const setMany = useCallback((updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    const applyTemplate = useCallback((tpl) => {
        setMany({
            gradientStart: tpl.gradientStart,
            gradientEnd: tpl.gradientEnd,
            titleColor: tpl.titleColor,
            tagBgColor: tpl.tagBgColor,
            // Add other template properties as needed
        });
    }, [setMany]);

    useEffect(() => {
        // Ensure fonts are loaded
        if (document.fonts) {
            document.fonts.ready.then(() => {
                setFontsReady(true);
                setFormData(prev => ({ ...prev }));
            });
        } else {
            setFontsReady(true);
        }
    }, []);

    return {
        formData, setFormData, 
        imageFile, setImageFile, 
        fontsReady, setFontsReady,
        assets, setAssets,
        isSubmitting, setIsSubmitting,
        activeMode, setActiveMode,
        activeRibbonTab, setActiveRibbonTab,
        activeSidebar, setActiveSidebar,
        isSidebarCollapsed, setIsSidebarCollapsed,
        selectedElementId, setSelectedElementId,
        showForm, setShowForm,
        shapeMode, setShapeMode,
        set, setMany, applyTemplate
    };
}


export function useResponsiveSidebar(setIsSidebarCollapsed) {
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsSidebarCollapsed]);
}
