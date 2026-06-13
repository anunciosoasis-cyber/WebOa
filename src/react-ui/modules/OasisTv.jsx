import { useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';

const OasisTv = () => {
    const { setShowPip } = usePlayer();

    useEffect(() => {
        // Al entrar a Oasis TV, nos aseguramos de que el PiP quede habilitado 
        // para cuando el usuario salga de esta ruta.
        setShowPip(true);
    }, [setShowPip]);

    // La interfaz gráfica de Oasis TV ahora se renderiza completamente dentro 
    // de PersistentPlayer.jsx para garantizar que el iframe del video no se recargue
    // al cambiar de ruta.
    return null;
};

export default OasisTv;
