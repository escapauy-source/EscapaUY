
import { supabaseNode as supabase } from './supabaseNode';

async function getLastVoucher() {
    const { data, error } = await supabase
        .from('partner_bookings')
        .select('voucher_code')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log('LAST_VOUCHER:' + data.voucher_code);
}

getLastVoucher();
