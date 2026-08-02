import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity } from '@/types';
import { activities as mockActivities } from '@/data/mockData';

export function useActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('partner_services')
                .select(`
                    *,
                    partners (
                        name
                    )
                `)
                .eq('active', true);

            if (error) throw error;

            if (data) {
                const mappedActivities: Activity[] = data.map((item: any) => ({
                    id: item.id,
                    partnerId: item.partner_id,
                    partnerName: item.partners?.name || 'Unknown Partner',
                    name: typeof item.name === 'string' ? { es: item.name, en: item.name } : item.name, // Handle potential legacy string data
                    description: typeof item.description === 'string' ? { es: item.description, en: item.description } : item.description,
                    city: item.contact_info?.city || 'Colonia', // Fallback or extract from contact_info
                    type: item.type || 'indoor',
                    weatherResilient: item.weather_resilient || false,
                    capacity: item.capacity,
                    currentOccupancy: 0, // Not tracked in DB yet
                    images: item.images || [],
                    price: item.price,
                    price_adult: item.price, // Assumption
                    price_child: item.price * 0.5, // Assumption/Simplification if not in DB
                    rating: item.rating || 0,
                    reviewsCount: item.reviews_count || 0,
                    duration: item.duration || item.schedule,
                    bestTime: item.best_time,
                    category: item.category,
                    kidsFriendly: item.kids_friendly,
                    minAge: item.min_age,
                    maxAge: item.max_age,
                    isFree: item.is_free,
                    coordinates: item.coordinates,
                    planBAlternativeId: undefined // Not yet associated in DB
                }));
                setActivities(mappedActivities);
            }
        } catch (err: any) {
            console.error('Error fetching activities:', err);
            if (err.message?.includes('Failed to fetch') || !import.meta.env.VITE_SUPABASE_URL) {
                console.warn('⚠️ Usando datos locales de prueba (mockData) porque falló conexión a Supabase.');
                setActivities(mockActivities);
                setError(null);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return { activities, loading, error, refetch: fetchActivities };
}
