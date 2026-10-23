import React from 'react';
import { Baby, BookOpen, Church, Flame, Heart, Megaphone, OctagonAlert, Sparkles, Flower2 } from 'lucide-react';

const ICONS = {
    culto: Church,
    infantil: Baby,
    matrimonio: Heart,
    memorial: Flower2,
    especial: Sparkles,
    versiculo: BookOpen,
    cancelacion: OctagonAlert,
    campana: Flame,
};

/**
 * Categorías de anuncio en barra superior compacta (fija, no altera la altura del lienzo ni de los campos).
 */
export default function KindPicker({ kinds, kind, onKind }) {
    return (
        <div className="ann-kinds">
            <div className="ann-kind-row" role="tablist" aria-label="Tipo de anuncio">
                {kinds.map((k) => {
                    const Icon = ICONS[k.id] ?? Megaphone;
                    return (
                        <button
                            key={k.id}
                            type="button"
                            role="tab"
                            aria-selected={k.id === kind}
                            className="ann-kind"
                            onClick={() => onKind(k.id)}
                        >
                            <Icon size={15} /> {k.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

