import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ── Layouts (Síncronos) ──────────────────────────────
import LayoutMaestro from './components/LayoutMaestro';
import AdminLayout from '../components/AdminLayout';

// ── Componentes Core (Síncronos) ─────────────────────
import ProtectedRoute from '../components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './ThemeContext';
import { PlayerProvider } from '../context/PlayerContext';

// ── Módulos Públicos (Lazy Loading) ──────────────────
const Home = lazy(() => import('./modules/Home'));
const About = lazy(() => import('./modules/About'));
const Inscripciones = lazy(() => import('./modules/Inscripciones'));
const Peticiones = lazy(() => import('./modules/Peticiones'));
const Recursos = lazy(() => import('./modules/Recursos'));
const PdfReader = lazy(() => import('./modules/PdfReader'));
const Login = lazy(() => import('../components/Login'));
const PWAGateway = lazy(() => import('./components/PWAGateway'));
const OasisTv = lazy(() => import('./modules/OasisTv'));

// ── Módulos Admin (Lazy Loading) ─────────────────────
const Dashboard = lazy(() => import('../components/Dashboard'));
const Solicitudes = lazy(() => import('../components/Solicitudes'));
const AdminRecursos = lazy(() => import('../components/AdminRecursos'));
const AdminAnnouncements = lazy(() => import('../components/AdminAnnouncements'));
const AdminUsers = lazy(() => import('../components/AdminUsers'));
const AdminAjustes = lazy(() => import('../components/AdminAjustes'));
const AdminForms = lazy(() => import('../components/AdminForms'));
const AdminAbout = lazy(() => import('../components/AdminAbout'));
const StudioOasisOrchestrator = lazy(() => import('../components/studio-oasis/StudioOasisOrchestrator'));
const AdminEmailTemplate = lazy(() => import('../components/AdminEmailTemplate'));
const YoutubeCallback = lazy(() => import('../components/YoutubeCallback'));
const CountdownPage = lazy(() => import('../components/CountdownPage'));
const ObsOverlay = lazy(() => import('./modules/ObsOverlay'));
const ProyectorOverlay = lazy(() => import('./modules/ProyectorOverlay'));

// ──────────────────────────────────────────────────────

const SuspenseLoader = () => (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'transparent' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando módulo...</span>
        </div>
    </div>
);

const App = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <PlayerProvider>
                    <Router>
                        <ScrollToTop />
                        <Suspense fallback={<SuspenseLoader />}>
                            <Routes>
                                {/* Página standalone de countdown (sin layout, sin auth) */}
                                <Route path="/countdown-live" element={<CountdownPage />} />
                                <Route path="/transmision/overlay" element={<ObsOverlay />} />
                                <Route path="/transmision/proyector" element={<ProyectorOverlay />} />

                                {/* ... existing routes ... */}
                                <Route element={<LayoutMaestro />}>
                                    <Route path="/" element={<PWAGateway />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/peticiones" element={<Peticiones />} />
                                    <Route path="/inscripciones" element={<Inscripciones />} />
                                    <Route path="/recursos" element={<Recursos />} />
                                    <Route path="/recursos/pdf/:id" element={<PdfReader />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/tv" element={<OasisTv />} />
                                </Route>

                                <Route element={<ProtectedRoute adminOnly={true} />}>
                                    <Route element={<AdminLayout />}>
                                        <Route path="/admin" element={<Dashboard />} />
                                        <Route path="/admin/solicitudes" element={<Solicitudes />} />
                                        <Route path="/admin/requests" element={<Solicitudes />} />
                                        <Route path="/admin/recursos" element={<AdminRecursos />} />
                                        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                                        <Route path="/admin/users" element={<AdminUsers />} />
                                        <Route path="/admin/inscripciones" element={<AdminForms />} />
                                        <Route path="/admin/ajustes" element={<AdminAjustes />} />
                                        <Route path="/admin/about" element={<AdminAbout />} />
                                        <Route path="/admin/culto" element={<StudioOasisOrchestrator />} />
                                        <Route path="/admin/settings/youtube/callback" element={<YoutubeCallback />} />
                                        <Route path="/admin/plantilla-correo" element={<AdminEmailTemplate />} />
                                        <Route path="/admin/creator" element={<AdminAnnouncements />} />
                                    </Route>
                                </Route>
                            </Routes>
                        </Suspense>
                    </Router>
                </PlayerProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
