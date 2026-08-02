
import { supabaseNode as supabase } from './supabaseNode';
import { generateBookingReference } from './bookingUtils';

// Mock generateBookingReference if module not found, but it should be there.
// If bookingUtils is not valid for node, I'll copy the function here.
function generateRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function createTestBooking() {
    const voucherCode = generateRef();
    console.log(`Creating test booking with Voucher Code: ${voucherCode}`);

    const booking = {
        partner_id: 'd290f1ee-6c54-4b01-90e6-d701748f0856', // Mar Dulce
        service_id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b202', // Almuerzo Marinero (Activity)
        booking_date: new Date().toISOString().split('T')[0],
        time_slot: 'midday',
        tourist_name: 'Test Agent',
        tourist_email: 'agent@test.com',
        voucher_code: voucherCode,
        status: 'confirmed',
        amount: 1500,
        deposit_amount: 225,
        balance_amount: 1275,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('partner_bookings')
        .insert(booking)
        .select()
        .single();

    if (error) {
        console.error('Error creating booking:', error);
        process.exit(1);
    }

    console.log('✅ Booking created successfully!');
    console.log('ID:', data.id);
    console.log('Voucher:', data.voucher_code);
    console.log('Status:', data.status);

    // Output the voucher code for the next script to use
    console.log(`OUTPUT_VOUCHER:${data.voucher_code}`);
}

createTestBooking();
