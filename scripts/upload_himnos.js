import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno (asumiendo que están en frontend/.env o similar)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: No se encontraron las credenciales de Supabase en tu archivo .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadHymns() {
    try {
        console.log("Leyendo archivo himnario.json local...");
        const rawData = fs.readFileSync(path.resolve('./src/data/himnario.json'), 'utf-8');
        const himnos = JSON.parse(rawData);

        console.log(`Subiendo ${himnos.length} himnos a Supabase...`);

        const { data, error } = await supabase
            .from('himnos')
            .upsert(himnos, { onConflict: 'number' }); // Actualiza si ya existe el número

        if (error) {
            throw error;
        }

        console.log("✅ ¡Himnos subidos exitosamente a Supabase!");
    } catch (err) {
        console.error("❌ Ocurrió un error:", err.message);
    }
}

uploadHymns();
