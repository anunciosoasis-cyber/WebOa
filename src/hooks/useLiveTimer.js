import { useState, useEffect } from 'react';

/**
 * Hook para calcular el tiempo transcurrido localmente en el navegador.
 * Ahorra consultas al servidor basándose en un único timestamp.
 * 
 * @param {string|null} inicioRealISO - Timestamp ISO del momento de inicio
 * @returns {string} Tiempo formateado "HH:MM:SS"
 */
const useLiveTimer = (inicioRealISO) => {
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState('00:00:00');

    useEffect(() => {
        if (!inicioRealISO) {
            setTiempoTranscurrido('00:00:00');
            return;
        }

        const inicioRealMs = new Date(inicioRealISO).getTime();

        const intervalo = setInterval(() => {
            const ahoraMs = new Date().getTime();
            let diffSegundos = Math.floor((ahoraMs - inicioRealMs) / 1000);

            if (diffSegundos < 0) diffSegundos = 0;

            const horas = Math.floor(diffSegundos / 3600);
            const minutos = Math.floor((diffSegundos % 3600) / 60);
            const segundos = diffSegundos % 60;

            const formato = [
                horas.toString().padStart(2, '0'),
                minutos.toString().padStart(2, '0'),
                segundos.toString().padStart(2, '0')
            ].join(':');

            setTiempoTranscurrido(formato);
        }, 1000);

        return () => clearInterval(intervalo);
    }, [inicioRealISO]);

    return tiempoTranscurrido;
};

export default useLiveTimer;
