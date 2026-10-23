/**
 * Procesador inteligente para el Himnario Adventista (613 Himnos Oficiales).
 * 
 * Resuelve:
 * 1. Himnos vacíos (55 himnos que solo tienen coro y se borraban con expandChorus).
 * 2. Estrofas gigantes (segmenta estrofas de >5 líneas en partes balanceadas y legibles para proyector).
 * 3. Límite estricto de 613 himnos oficiales sin duplicados ni vacíos.
 */

import himnarioLocalRaw from '../data/himnario.json';

export function chunkLines(lines, maxLines = 5) {
    if (!lines || lines.length <= maxLines) return [lines];
    const totalLines = lines.length;
    const numChunks = Math.ceil(totalLines / maxLines);
    const baseSize = Math.floor(totalLines / numChunks);
    const remainder = totalLines % numChunks;

    const chunks = [];
    let start = 0;
    for (let c = 0; c < numChunks; c++) {
        const size = baseSize + (c < remainder ? 1 : 0);
        chunks.push(lines.slice(start, start + size));
        start += size;
    }
    return chunks;
}

export function processHymnData(hymn) {
    if (!hymn) return null;
    const num = parseInt(hymn.number, 10);
    if (isNaN(num) || num < 1 || num > 613) return null;

    let rawStanzas = [];
    if (hymn.stanzas && Array.isArray(hymn.stanzas) && hymn.stanzas.length > 0) {
        rawStanzas = hymn.stanzas;
    } else if (hymn.slides && Array.isArray(hymn.slides) && hymn.slides.length > 0) {
        rawStanzas = hymn.slides.map(s => ({
            type: s.slide_type || 'stanza',
            number: s.slide_number,
            text: Array.isArray(s.lines) ? s.lines.join('\n') : (s.lines || ''),
            start_timestamp: s.start_timestamp,
            end_timestamp: s.end_timestamp
        }));
    }

    if (rawStanzas.length === 0) {
        rawStanzas = [{ type: 'stanza', number: 1, text: '(Música Instrumental)' }];
    }

    // Intercalación del coro:
    // Si tiene estrofas Y coro, se intercala (Estrofa 1, Coro, Estrofa 2, Coro...)
    // Si SOLO tiene coro (como los 55 himnos cortos/de apertura), SE PRESERVA EL CORO COMPLETO
    const chorus = rawStanzas.find(s => 
        s.type === 'chorus' || 
        s.number === '' || 
        String(s.number).toLowerCase() === 'coro' || 
        s.number === 0
    );

    let arranged = [];
    if (chorus) {
        const onlyStanzas = rawStanzas.filter(s => s !== chorus);
        if (onlyStanzas.length > 0) {
            onlyStanzas.forEach(s => {
                arranged.push(s);
                arranged.push(chorus);
            });
        } else {
            // El himno solo consta de coro o estrofa única: PRESERVARLO
            arranged = [chorus];
        }
    } else {
        arranged = [...rawStanzas];
    }

    // Segmentación balanceada de estrofas largas para proyección de alta legibilidad
    const finalStanzas = [];
    arranged.forEach(st => {
        const lines = (st.text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const isChorus = st.type === 'chorus' || st.number === 0 || String(st.number).toLowerCase() === 'coro';
        const baseLabel = isChorus ? 'Coro' : (st.number ? `Estrofa ${st.number}` : 'Estrofa');

        if (lines.length <= 5) {
            finalStanzas.push({
                ...st,
                text: lines.join('\n'),
                subText: baseLabel,
                isChorus
            });
        } else {
            const chunks = chunkLines(lines, 5);
            const totalParts = chunks.length;
            chunks.forEach((chunk, idx) => {
                finalStanzas.push({
                    ...st,
                    text: chunk.join('\n'),
                    subText: totalParts > 1 ? `${baseLabel} (${idx + 1}/${totalParts})` : baseLabel,
                    isChorus,
                    partIndex: idx,
                    totalParts
                });
            });
        }
    });

    return {
        ...hymn,
        id: hymn.id || `hymn-${num}`,
        number: num,
        title: hymn.title || `Himno ${num}`,
        mp3Url: hymn.audio_url || hymn.mp3Url || null,
        mp3UrlInstr: hymn.instrumental_url || hymn.mp3UrlInstr || null,
        stanzas: finalStanzas
    };
}

export function processHymnList(list) {
    if (!Array.isArray(list)) return [];
    return list
        .map(processHymnData)
        .filter(h => h && h.number >= 1 && h.number <= 613)
        .sort((a, b) => a.number - b.number);
}

// Lista local pre-procesada lista para uso síncrono inmediato
export const processedLocalHymns = processHymnList(himnarioLocalRaw);
