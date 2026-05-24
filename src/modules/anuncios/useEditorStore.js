import { create } from 'zustand';

/**
 * ZUSTAND STORE PARA OASIS EDITOR
 * Gestiona el historial (Undo/Redo) y el estado global del canvas.
 */
export const useEditorStore = create((set, get) => ({
    history: [],
    currentIndex: -1,
    canUndo: false,
    canRedo: false,

    // Guardar estado en el historial
    pushState: (stateJson) => {
        const { history, currentIndex } = get();
        
        // Limpiar historial futuro si estamos en medio de un undo
        const newHistory = history.slice(0, currentIndex + 1);
        
        // Evitar duplicados consecutivos
        if (newHistory.length > 0 && newHistory[newHistory.length - 1] === stateJson) return;

        newHistory.push(stateJson);
        
        // Limitar historial a 50 pasos
        if (newHistory.length > 50) newHistory.shift();

        set({
            history: newHistory,
            currentIndex: newHistory.length - 1,
            canUndo: newHistory.length > 1,
            canRedo: false
        });
    },

    undo: () => {
        const { currentIndex, history } = get();
        if (currentIndex > 0) {
            const nextIndex = currentIndex - 1;
            set({
                currentIndex: nextIndex,
                canUndo: nextIndex > 0,
                canRedo: true
            });
            return history[nextIndex];
        }
        return null;
    },

    redo: () => {
        const { currentIndex, history } = get();
        if (currentIndex < history.length - 1) {
            const nextIndex = currentIndex + 1;
            set({
                currentIndex: nextIndex,
                canUndo: true,
                canRedo: nextIndex < history.length - 1
            });
            return history[nextIndex];
        }
        return null;
    },

    resetHistory: () => set({ history: [], currentIndex: -1, canUndo: false, canRedo: false })
}));
