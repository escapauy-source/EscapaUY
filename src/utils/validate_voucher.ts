
import { supabaseNode as supabase } from './supabaseNode';

// Get voucher code from command line args
const voucherCode = process.argv[2];
const partnerId = 'd290f1ee-6c54-4b01-90e6-d701748f0856'; // Mar Dulce

if (!voucherCode) {
    console.error('Please provide a voucher code');
    process.exit(1);
}

async function validateVoucher() {
    console.log(`🔍 Scanning voucher: ${voucherCode} for Partner: ${partnerId}`);

    // 1. Find Booking
    const { data: booking, error: fetchError } = await supabase
        .from('partner_bookings')
        .select('*, partner_services(name)')
        .eq('voucher_code', voucherCode)
        .single();

    if (fetchError || !booking) {
        console.error('❌ Voucher not found or error:', fetchError?.message);
        process.exit(1);
    }

    console.log('📖 Booking Found:', booking.partner_services?.name);
    console.log('Current Status:', booking.status);

    // 2. Validate Partner
    if (booking.partner_id !== partnerId) {
        console.error('⛔ Voucher belongs to another partner!');
        process.exit(1);
    }

    // 3. Check Status
    if (booking.status === 'completed') {
        console.log('⚠️ Voucher already used/completed.');
        return;
    }

    // 4. Redeem (Update Status)
    console.log('🚀 Redeeming voucher...');
    const { error: updateError } = await supabase
        .from('partner_bookings')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', booking.id);

    if (updateError) {
        console.error('Error updating status:', updateError);
        process.exit(1);
    }

    console.log('✅ Voucher Validated & Redeemed Successfully!');
}

validateVoucher();
