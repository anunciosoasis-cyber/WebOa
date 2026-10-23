import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { routeModules as m, installRoutePrefetch } from './routeModules';

// ── Layouts (Síncronos) ──────────────────────────────
import LayoutMaestro from './components/LayoutMaestro';
import AdminLayout from '../components/AdminLayout';

// ── Componentes Core (Síncronos) ─────────────────────
import ProtectedRoute from '../components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './ThemeContext';
import { PlayerProvider } from '../context/PlayerContext';

// ── Módulos Públicos (Lazy Loading) ──────────────────
const About = lazy(m['/about']);
const Inscripciones = lazy(m['/inscripciones']);
const Peticiones = lazy(m['/peticiones']);
const Recursos = lazy(m['/recursos']);
const PdfReader = lazy(m['/recursos/pdf/']);
const Login = lazy(m['/login']);
const PWAGateway = lazy(() => import('./components/PWAGateway'));
const OasisTv = lazy(m['/tv']);

// ── Módulos Admin (Lazy Loading) ─────────────────────
const Dashboard = lazy(m['/admin']);
const Solicitudes = lazy(m['/admin/requests']);
const AdminRecursos = lazy(m['/admin/recursos']);
const AdminAnnouncements = lazy(m['/admin/announcements']);
const AdminUsers = lazy(m['/admin/users']);
const AdminAjustes = lazy(m['/admin/ajustes']);
const AdminForms = lazy(m['/admin/inscripciones']);
const AdminAbout = lazy(m['/admin/about']);
const StudioOasisOrchestrator = lazy(m['/admin/culto']);
const AdminEmailTemplate = lazy(m['/admin/plantilla-correo']);
const YoutubeCallback = lazy(() => import('../components/YoutubeCallback'));
const AdminPlatform = lazy(() => import('../components/AdminPlatform'));
const CountdownPage = lazy(() => import('../components/CountdownPage'));
const ObsOverlay = lazy(() => import('./modules/ObsOverlay'));
const ProyectorOverlay = lazy(() => import('./modules/ProyectorOverlay'));
const ChurchBoardApp = lazy(m['/admin/junta']);
const RemoteView = lazy(() => import('../components/studio-oasis/press/RemoteView'));
const MobileVotingView = lazy(() => import('../modules/church-board/voting/MobileVotingView'));

// ──────────────────────────────────────────────────────

const SuspenseLoader = () => (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'transparent' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando módulo...</span>
        </div>
    </div>
);

const App = () => {
    useEffect(installRoutePrefetch, []);

    return (
        <MotionConfig reducedMotion="user">
        <ThemeProvider>
            <ToastProvider>
                <PlayerProvider>
                    <Router>
                        <Suspense fallback={<SuspenseLoader />}>
                            <Routes>
                                {/* Página standalone de countdown (sin layout, sin auth) */}
                                <Route path="/countdown-live" element={<CountdownPage />} />
                                <Route path="/transmision/overlay" element={<ObsOverlay />} />
                                <Route path="/transmision/proyector" element={<ProyectorOverlay />} />
                                
                                {/* Página standalone para votación móvil e ingreso de miembros */}
                                <Route path="/vote" element={<MobileVotingView />} />
                                <Route path="/vote/:pointId" element={<MobileVotingView />} />

                                {/* Control Remoto Móvil de Presentaciones PowerPoint */}
                                <Route path="/remote" element={<RemoteView />} />

                                {/* Login a pantalla completa: sin navbar, footer ni barra inferior */}
                                <Route path="/login" element={<Login />} />

                                {/* ... existing routes ... */}
                                <Route element={<LayoutMaestro />}>
                                    <Route path="/" element={<PWAGateway />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/peticiones" element={<Peticiones />} />
                                    <Route path="/inscripciones" element={<Inscripciones />} />
                                    <Route path="/recursos" element={<Recursos />} />
                                    <Route path="/recursos/pdf/:id" element={<PdfReader />} />
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
                                        <Route path="/admin/plataforma" element={<AdminPlatform />} />
                                        <Route path="/admin/inscripciones" element={<AdminForms />} />
                                        <Route path="/admin/ajustes" element={<AdminAjustes />} />
                                        <Route path="/admin/about" element={<AdminAbout />} />
                                        <Route path="/admin/culto" element={<StudioOasisOrchestrator />} />
                                        <Route path="/admin/junta" element={<ChurchBoardApp />} />
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
        </MotionConfig>
    );
};

export default App;
