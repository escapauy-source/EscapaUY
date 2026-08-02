import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity } from '@/types';

/**
 * Hook to fetch services with bilingual support.
 * Simplifies the data acquisition for the Explore page.
 */
export function useServices() {
    const [services, setServices] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            // In a real app, this would query the 'services' table.
            // Since we are currently using mockData for the UI, I'll simulate the bridge.
            // But the Order explicitly asked to "Modifica la consulta...".

            // Hypothetical Fetch:
            const { data, error } = await supabase
                .from('services')
                .select(`
                    *,
                    name_en,
                    description_en,
                    category_en,
                    plan_a_desc_en,
                    plan_b_desc_en
                `)
                .eq('status', 'active');

            if (error) throw error;

            // Map to Activity type if needed
            setServices(data || []);

        } catch (err: any) {
            console.error('Error in useServices:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { services, loading, error, refetch: fetchServices };
}
