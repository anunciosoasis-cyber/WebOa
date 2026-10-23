import React, { useEffect, useState } from 'react';

// Icono por nombre (viene de la BD). El set completo de lucide (~830 KB) se carga
// con import() dinámico solo aquí, para que no viaje en el chunk de la Home.
let lucideModule = null;
let lucidePromise = null;
const loadLucide = () => (lucidePromise ??= import('lucide-react').then((m) => (lucideModule = m)));

const LucideByName = ({ name, fallback: Fallback, ...props }) => {
    const [lib, setLib] = useState(lucideModule);
    useEffect(() => {
        if (!lib) loadLucide().then(setLib);
    }, [lib]);
    const Icon = lib?.[name] || Fallback;
    return <Icon {...props} />;
};

export default LucideByName;
