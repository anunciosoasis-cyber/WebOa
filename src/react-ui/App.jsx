import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ── Layouts ──────────────────────────────────────────
import LayoutMaestro from './components/LayoutMaestro';  // nuevo: sidebar / bottom-nav
import AdminLayout from '../components/AdminLayout';    // admin: sin cambios

// ── Módulos Públicos ──────────────────────────────────
import Home from './modules/Home';
import About from './modules/About';
import Inscripciones from './modules/Inscripciones';
import Peticiones from './modules/Peticiones';
import Recursos from './modules/Recursos';
import PdfReader from './modules/PdfReader';
import Login from '../components/Login';
import PWAGateway from './components/PWAGateway';
import ScrollToTop from './components/ScrollToTop';
import OasisTv from './modules/OasisTv';

// ── Módulos Admin ─────────────────────────────────────
import Dashboard from '../components/Dashboard';
import Solicitudes from '../components/Solicitudes';
import AdminRecursos from '../components/AdminRecursos';
import AdminAnnouncements from '../components/AdminAnnouncements';
import AdminUsers from '../components/AdminUsers';
import AdminAjustes from '../components/AdminAjustes';
import AdminForms from '../components/AdminForms';
import AdminAbout from '../components/AdminAbout';
import AdminCulto from '../components/AdminCulto';
import AdminEmailTemplate from '../components/AdminEmailTemplate';
import ProtectedRoute from '../components/ProtectedRoute';
import YoutubeCallback from '../components/YoutubeCallback';
import CountdownPage from '../components/CountdownPage';
import ObsOverlay from './modules/ObsOverlay';

import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './ThemeContext';
import { PlayerProvider } from '../context/PlayerContext';

// ──────────────────────────────────────────────────────

const App = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <PlayerProvider>
                    <Router>
                        <ScrollToTop />
                        <Routes>
                            {/* Página standalone de countdown (sin layout, sin auth) */}
                            <Route path="/countdown-live" element={<CountdownPage />} />
                            <Route path="/transmision/overlay" element={<ObsOverlay />} />

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
                                    <Route path="/admin/culto" element={<AdminCulto />} />
                                    <Route path="/admin/settings/youtube/callback" element={<YoutubeCallback />} />
                                    <Route path="/admin/plantilla-correo" element={<AdminEmailTemplate />} />
                                    <Route path="/admin/creator" element={<AdminAnnouncements />} />
                                </Route>
                            </Route>
                        </Routes>
                    </Router>
                </PlayerProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
