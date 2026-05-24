import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';
import '../styles/custom.css';
import './styles/responsive.css';
import { AuthProvider } from '../context/AuthContext';

const rootElement = document.getElementById('root');

// Registrar Service Worker para PWA
const updateSW = registerSW({
    onNeedRefresh() {
        console.log('Nueva versión disponible. Recarga para actualizar.');
        if (confirm('Hay una nueva versión de OASIS disponible. ¿Deseas actualizar ahora?')) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log('La aplicación está lista para funcionar offline.');
    },
});

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
    console.log('React app rendered successfully');
} else {
    console.warn('React root element not found. Skipping React render.');
}
