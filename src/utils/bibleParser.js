/**
 * Busca un versículo basado en una abreviación (Ej: "jn 3 16" o "Salmos 119:105")
 * 
 * @param {string} query - El input rápido del administrador
 * @param {Array} bibliaJSON - El JSON de la Biblia pre-cargado desde LocalStorage o import
 * @returns {Object} { error } o { libro, capitulo, versiculo, texto, referencia }
 */
export const buscarVersiculoLocal = (query, bibliaJSON) => {
    if (!bibliaJSON || !Array.isArray(bibliaJSON)) {
        return { error: "El archivo de la Biblia no está cargado." };
    }

    // Normalizar query: quitar acentos, pasar a minúsculas y reemplazar ":" por espacio
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(':', ' ').trim();
    
    // Regex para extraer: [Libro] [Capítulo] [Versículo]
    const regex = /^([a-z\s]+)\s+(\d+)\s+(\d+)$/i;
    const match = normalizedQuery.match(regex);

    if (!match) return { error: "Formato no válido. Ejemplo: 'Jn 3 16'" };

    const inputLibro = match[1].trim();
    const inputCapitulo = parseInt(match[2], 10);
    const inputVersiculo = parseInt(match[3], 10);

    // Mapeo básico de abreviaturas comunes a nombres completos
    const abreviaturas = {
        "gn": "genesis", "gen": "genesis", 
        "ex": "exodo",
        "lv": "levitico", "lev": "levitico",
        "nm": "numeros", "num": "numeros",
        "dt": "deuteronomio", "deut": "deuteronomio",
        "js": "josue", "jos": "josue",
        "jue": "jueces",
        "rt": "rut",
        "1 sm": "1 samuel", "1sam": "1 samuel",
        "2 sm": "2 samuel", "2sam": "2 samuel",
        "1 re": "1 reyes", "1rey": "1 reyes",
        "2 re": "2 reyes", "2rey": "2 reyes",
        "1 cr": "1 cronicas", "1cron": "1 cronicas",
        "2 cr": "2 cronicas", "2cron": "2 cronicas",
        "esd": "esdras",
        "neh": "nehemias",
        "est": "ester",
        "job": "job",
        "sal": "salmos", "sl": "salmos",
        "pr": "proverbios", "prov": "proverbios",
        "ec": "eclesiastes", "ecl": "eclesiastes",
        "cnt": "cantares", "can": "cantares",
        "is": "isaias",
        "jr": "jeremias", "jer": "jeremias",
        "lm": "lamentaciones", "lam": "lamentaciones",
        "ez": "ezequiel", "eze": "ezequiel",
        "dn": "daniel", "dan": "daniel",
        "os": "oseas",
        "jl": "joel",
        "am": "amos",
        "abd": "abdias",
        "jon": "jonas",
        "miq": "miqueas",
        "nah": "nahum",
        "hab": "habacuc",
        "sof": "sofonias",
        "hag": "hageo",
        "zac": "zacarias",
        "mal": "malaquias",
        "mt": "mateo", "mat": "mateo",
        "mr": "marcos", "mar": "marcos",
        "lc": "lucas", "luc": "lucas",
        "jn": "juan",
        "hch": "hechos",
        "ro": "romanos", "rom": "romanos",
        "1 co": "1 corintios", "1cor": "1 corintios",
        "2 co": "2 corintios", "2cor": "2 corintios",
        "ga": "galatas", "gal": "galatas",
        "ef": "efesios",
        "flp": "filipenses",
        "col": "colosenses",
        "1 ts": "1 tesalonicenses", "1tes": "1 tesalonicenses",
        "2 ts": "2 tesalonicenses", "2tes": "2 tesalonicenses",
        "1 ti": "1 timoteo", "1tim": "1 timoteo",
        "2 ti": "2 timoteo", "2tim": "2 timoteo",
        "tit": "tito",
        "flm": "filemon",
        "heb": "hebreos",
        "stg": "santiago",
        "1 p": "1 pedro", "1pe": "1 pedro",
        "2 p": "2 pedro", "2pe": "2 pedro",
        "1 jn": "1 juan",
        "2 jn": "2 juan",
        "3 jn": "3 juan",
        "jud": "judas",
        "ap": "apocalipsis", "apo": "apocalipsis"
    };

    const libroBuscado = abreviaturas[inputLibro] || inputLibro;

    // Buscar el libro en el JSON local
    const libroEncontrado = bibliaJSON.find(b => {
        const nombreLimpio = b.libro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombreLimpio.includes(libroBuscado);
    });

    if (!libroEncontrado) return { error: `Libro no encontrado: ${inputLibro}` };

    const capitulo = libroEncontrado.capitulos.find(c => parseInt(c.numero) === inputCapitulo);
    if (!capitulo) return { error: `Capítulo ${inputCapitulo} no encontrado en ${libroEncontrado.libro}` };

    const versiculo = capitulo.versiculos.find(v => parseInt(v.numero) === inputVersiculo);
    if (!versiculo) return { error: `Versículo ${inputVersiculo} no encontrado en ${libroEncontrado.libro} ${inputCapitulo}` };

    return {
        libro: libroEncontrado.libro,
        capitulo: inputCapitulo,
        versiculo: inputVersiculo,
        texto: versiculo.texto,
        referencia: `${libroEncontrado.libro} ${inputCapitulo}:${inputVersiculo}`
    };
};
