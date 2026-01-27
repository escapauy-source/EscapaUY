import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Partner {
    id: string;
    email: string;
    name: string;
    business_name?: string;
    location?: string;
    rut?: string;
    mintur_registration?: string;
    legal_address?: string;
    contact_phone?: string;
    contact_email?: string;
    availability_settings?: any;
    created_at?: string;
    updated_at?: string;
}

export function usePartnerData(partnerId: string) {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPartner = useCallback(async () => {
        if (!partnerId) return;

        try {
            setLoading(true);
            console.log('[usePartnerData] Fetching partner:', partnerId);

            const { data, error: fetchError } = await supabase
                .from('partners')
                .select('*')
                .eq('id', partnerId)
                .single();

            if (fetchError) throw fetchError;

            console.log('[usePartnerData] Partner loaded:', data);
            setPartner(data);
        } catch (err) {
            console.error('[usePartnerData] Error:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [partnerId]);

    useEffect(() => {
        fetchPartner();
    }, [fetchPartner]);

    const updatePartner = async (updates: Partial<Partner>) => {
        try {
            const { data, error: updateError } = await supabase
                .from('partners')
                .update(updates)
                .eq('id', partnerId)
                .select()
                .single();

            if (updateError) throw updateError;
            setPartner(data);
            return { data, error: null };
        } catch (err) {
            console.error('[usePartnerData] Update error:', err);
            return { data: null, error: err as Error };
        }
    };

    return { partner, loading, error, refetch: fetchPartner, updatePartner };
}

export function usePartnerServices(partnerId: string) {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchServices = useCallback(async () => {
        if (!partnerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('[usePartnerServices] Fetching services for:', partnerId);

            const { data, error: fetchError } = await supabase
                .from('partner_services')
                .select('*')
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            console.log('[usePartnerServices] Services loaded:', data?.length);
            setServices(data || []);
        } catch (err) {
            console.error('[usePartnerServices] Error:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [partnerId]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const upsertService = async (service: any) => {
        try {
            const { data, error: upsertError } = await supabase
                .from('partner_services')
                .upsert({ ...service, partner_id: partnerId })
                .select()
                .single();

            if (upsertError) throw upsertError;
            await fetchServices(); // Refresh list
            return { data, error: null };
        } catch (err) {
            console.error('[usePartnerServices] Upsert error:', err);
            return { data: null, error: err as Error };
        }
    };

    const deleteService = async (serviceId: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('partner_services')
                .delete()
                .eq('id', serviceId);

            if (deleteError) throw deleteError;
            await fetchServices(); // Refresh list
            return { error: null };
        } catch (err) {
            console.error('[usePartnerServices] Delete error:', err);
            return { error: err as Error };
        }
    };

    return {
        services,
        loading,
        error,
        refetch: fetchServices,
        upsertService,
        deleteService
    };
}
