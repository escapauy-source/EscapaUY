
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkServices() {
    const { data, error } = await supabase.from('partner_services').select('id, name').limit(1);
    if (error) console.error('Error:', error);
    else console.log('Valid Service:', data);
}

checkServices();
