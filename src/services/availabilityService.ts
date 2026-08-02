import { supabase } from '@/lib/supabase';
import type { AvailabilitySettings } from '@/utils/availabilityValidator';

export async function saveAvailability(
    partnerId: string,
    settings: AvailabilitySettings
) {
    console.log('[availabilityService] Saving settings for:', partnerId);

    try {
        const { data, error } = await supabase
            .from('partners')
            .update({
                availability_settings: settings,
                updated_at: new Date().toISOString()
            })
            .eq('id', partnerId)
            .select()
            .single();

        if (error) throw error;

        console.log('[availabilityService] ✅ Settings saved successfully');
        return { data, error: null };
    } catch (error) {
        console.error('[availabilityService] ❌ Error saving:', error);
        return { data: null, error };
    }
}

export async function getAvailability(partnerId: string) {
    console.log('[availabilityService] Loading settings for:', partnerId);

    try {
        const { data, error } = await supabase
            .from('partners')
            .select('availability_settings')
            .eq('id', partnerId)
            .single();

        if (error) throw error;

        console.log('[availabilityService] ✅ Settings loaded');
        return { data: data?.availability_settings, error: null };
    } catch (error) {
        console.error('[availabilityService] ❌ Error loading:', error);
        return { data: null, error };
    }
}
