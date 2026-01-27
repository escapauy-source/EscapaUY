import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// En modo demo, no lanzamos error, solo avisamos en consola
if (!import.meta.env.VITE_SUPABASE_URL ) {
    console.warn('⚠️ Trabajando en MODO DEMO (Sin conexión a Supabase)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
