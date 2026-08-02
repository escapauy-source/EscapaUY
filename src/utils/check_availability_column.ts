
import { supabaseNode as supabase } from './supabaseNode';

async function checkColumn() {
    try {
        console.log('Checking for availability_settings column in partners table...');
        // Try to select the column. If it doesn't exist, it should throw an error.
        const { data, error } = await supabase.from('partners').select('availability_settings').limit(1);

        if (error) {
            console.error('Error selecting column:', error.message);
            if (error.message.includes('does not exist')) {
                console.log('Column availability_settings DOES NOT EXIST.');
                process.exit(1);
            }
        } else {
            console.log('Column availability_settings EXISTS.');
            process.exit(0);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

checkColumn();
