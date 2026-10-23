import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import apiClient from '../../api/client';
import { loadCurrentRoom } from '../../api/liveChannel';

/**
 * "Emparejar app": genera un código de 6 caracteres (válido 10 min) para que OASIS Studio app
 * se una a la sala del Estudio. El QR lleva { v, api, tenant, room, code }; también se puede teclear el código.
 */
export default function PairAppButton() {
    const [pairing, setPairing] = useState(null);
    const [qr, setQr] = useState('');
    const [error, setError] = useState('');
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!pairing) return undefined;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [pairing]);

    const open = async () => {
        setError('');
        try {
            const room = await loadCurrentRoom();
            const { data } = await apiClient.post(`/rooms/${room.id}/pair-code`);
            setPairing({ ...data, roomName: room.name });
            setQr(await QRCode.toDataURL(data.qr, { width: 320, margin: 1 }));
        } catch (e) {
            setError(e.response?.data?.message || 'No se pudo generar el código');
        }
    };

    const secondsLeft = pairing ? Math.max(0, Math.round((new Date(pairing.expiresAt).getTime() - now) / 1000)) : 0;

    return (
        <>
            <button
                onClick={open}
                title={error || 'Conectar OASIS Studio app como control remoto'}
                className="shrink-0 font-moonrising text-[10px] uppercase tracking-widest bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl hover:text-oasis-orange transition-colors"
            >
                📱 Emparejar app
            </button>

            {pairing && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60" onClick={() => setPairing(null)}>
                    <div className="bg-white rounded-[2rem] p-8 text-center shadow-2xl max-w-sm w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <p className="font-moonrising text-[10px] uppercase tracking-[0.22em] text-gray-500">{pairing.roomName}</p>
                        <h2 className="font-moonrising text-2xl text-gray-950 mt-1">Emparejar app</h2>
                        {qr && <img src={qr} alt="QR de emparejamiento" className="mx-auto my-4 w-64 h-64" />}
                        <p className="text-xs text-gray-500">o escribe el código en la app</p>
                        <p className="font-mono text-4xl tracking-[0.3em] text-gray-950 my-2">{pairing.code}</p>
                        <p className={`text-xs ${secondsLeft ? 'text-gray-500' : 'text-red-500'}`}>
                            {secondsLeft ? `Vence en ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}` : 'Código vencido'}
                        </p>
                        <div className="flex gap-2 justify-center mt-5">
                            {!secondsLeft && (
                                <button onClick={open} className="px-4 py-2 rounded-full bg-oasis-orange text-white text-xs font-bold">Nuevo código</button>
                            )}
                            <button onClick={() => setPairing(null)} className="px-4 py-2 rounded-full border text-xs font-bold">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
