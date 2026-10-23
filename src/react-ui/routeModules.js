/**
 * Importadores de módulos por ruta. App.jsx los usa con lazy() y el prefetch
 * los llama al detectar intención (hover/focus/touch) sobre un enlace interno,
 * así el chunk ya está en caché cuando el usuario hace clic.
 */
export const routeModules = {
    '/about': () => import('./modules/About'),
    '/peticiones': () => import('./modules/Peticiones'),
    '/inscripciones': () => import('./modules/Inscripciones'),
    '/recursos': () => import('./modules/Recursos'),
    '/recursos/pdf/': () => import('./modules/PdfReader'),
    '/login': () => import('../components/Login'),
    '/tv': () => import('./modules/OasisTv'),
    '/admin': () => import('../components/Dashboard'),
    '/admin/requests': () => import('../components/Solicitudes'),
    '/admin/recursos': () => import('../components/AdminRecursos'),
    '/admin/announcements': () => import('../modules/announcements/AnnouncementsAdminPage'),
    '/admin/users': () => import('../components/AdminUsers'),
    '/admin/inscripciones': () => import('../components/AdminForms'),
    '/admin/ajustes': () => import('../components/AdminAjustes'),
    '/admin/about': () => import('../components/AdminAbout'),
    '/admin/culto': () => import('../components/studio-oasis/StudioOasisOrchestrator'),
    '/admin/junta': () => import('../modules/church-board/ChurchBoardApp'),
    '/admin/plantilla-correo': () => import('../components/AdminEmailTemplate'),
};
routeModules['/admin/solicitudes'] = routeModules['/admin/requests'];
routeModules['/admin/creator'] = routeModules['/admin/announcements'];

const findImporter = (pathname) =>
    routeModules[pathname] || (pathname.startsWith('/recursos/pdf/') ? routeModules['/recursos/pdf/'] : null);

const prefetched = new Set();

export const prefetchRoute = (pathname) => {
    const importer = findImporter(pathname);
    if (!importer || prefetched.has(importer)) return;
    prefetched.add(importer);
    importer().catch(() => prefetched.delete(importer)); // reintenta en el próximo hover si falló la red
};

/** Un único listener delegado: cubre todos los <Link> internos sin tocar cada componente. */
export const installRoutePrefetch = () => {
    if (navigator.connection?.saveData) return () => {}; // respeta el ahorro de datos
    const onIntent = (e) => {
        const a = e.target.closest?.('a[href]');
        if (!a || a.origin !== window.location.origin || a.target === '_blank') return;
        prefetchRoute(a.pathname);
    };
    const opts = { passive: true, capture: true };
    const events = ['pointerover', 'focusin', 'touchstart'];
    events.forEach((ev) => document.addEventListener(ev, onIntent, opts));
    return () => events.forEach((ev) => document.removeEventListener(ev, onIntent, opts));
};
