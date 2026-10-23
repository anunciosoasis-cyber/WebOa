import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

const loadGsi = () => new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    const script = existing || Object.assign(document.createElement('script'), { src: GSI_SRC, async: true, defer: true });
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('No se pudo cargar Google')));
    if (!existing) document.head.appendChild(script);
});

/** Botón oficial "Iniciar sesión con Google" con fallback visual de alta fidelidad. */
export default function GoogleSignInButton({ onSuccess, onError, theme = 'outline' }) {
    const { signInWithGoogle } = useAuth();
    const ref = useRef(null);
    const [gsiReady, setGsiReady] = useState(false);

    useEffect(() => {
        if (!CLIENT_ID) return;
        let cancelled = false;
        loadGsi()
            .then(() => {
                if (cancelled || !ref.current) return;
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: async ({ credential }) => {
                        try {
                            onSuccess?.(await signInWithGoogle(credential));
                        } catch (err) {
                            onError?.(err.response?.data?.message || err.message || 'No se pudo iniciar sesión con Google');
                        }
                    },
                });
                window.google.accounts.id.renderButton(ref.current, {
                    theme,
                    size: 'large',
                    width: 320,
                    text: 'continue_with',
                    locale: 'es',
                    shape: 'rectangular',
                });
                setGsiReady(true);
            })
            .catch((err) => onError?.(err.message));
        return () => { cancelled = true; };
    }, [theme]);

    const handleCustomClick = () => {
        if (!CLIENT_ID) {
            onError?.('El acceso con Google requiere configurar VITE_GOOGLE_CLIENT_ID en el servidor.');
            return;
        }
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        }
    };

    return (
        <div className="lg-google-wrap" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {CLIENT_ID && (
                <div
                    ref={ref}
                    style={{
                        display: gsiReady ? 'flex' : 'none',
                        justifyContent: 'center',
                        width: '100%',
                    }}
                />
            )}
            {(!CLIENT_ID || !gsiReady) && (
                <button type="button" className="lg-ref-google-btn" onClick={handleCustomClick}>
                    <svg className="lg-ref-google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuar con Google</span>
                </button>
            )}
        </div>
    );
}
