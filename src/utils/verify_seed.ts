
import { supabaseNode as supabase } from './supabaseNode';

async function verifySeed() {
    console.log('🔍 Verifying Seed Data...');

    // Check Partners
    const { count: partnerCount, error: pError } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true });

    if (pError) console.error('Error counting partners:', pError);
    console.log(`Partners Count: ${partnerCount}`);

    // Check Specific New Partner
    const { data: monPetit } = await supabase
        .from('partners')
        .select('name')
        .eq('name', 'Mon Petit Hotel de Campo')
        .single();

    console.log(`Mon Petit Found: ${monPetit ? 'YES' : 'NO'}`);

    // Check Services
    const { count: serviceCount, error: sError } = await supabase
        .from('partner_services')
        .select('*', { count: 'exact', head: true });

    if (sError) console.error('Error counting services:', sError);
    console.log(`Services Count: ${serviceCount}`);

    // Check Specific New Service
    const { data: fondue } = await supabase
        .from('partner_services')
        .select('name')
        .ilike('name', '%Fondue%')
        .single();

    console.log(`Fondue Service Found: ${fondue ? 'YES' : 'NO'}`);
}

verifySeed();
