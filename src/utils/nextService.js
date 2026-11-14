// shortcut: culto fijo sábado 9:30 hora local (igual que Oasis TV y el footer); leer de settings cuando el admin exponga el horario.
export const SERVICE_LABEL = 'Sábado · 9:30 AM';

export const nextService = (now) => {
    const d = new Date(now);
    d.setHours(9, 30, 0, 0);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
    if (d <= now) d.setDate(d.getDate() + 7);
    return d;
};
