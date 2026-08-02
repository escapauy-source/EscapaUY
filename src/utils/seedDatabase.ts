import { supabaseNode as supabase } from './supabaseNode';
import { partners, activities, hotels } from '@/data/mockData';

export const seedDatabase = async () => {
    console.log('🌱 Starting Database Seed...');

    const errors: string[] = [];

    try {
        // 1. Seed Partners
        console.log(`Processing ${partners.length} partners...`);
        for (const p of partners) {
            // Check if exists
            const { data: existing, error: fetchError } = await supabase.from('partners').select('id').eq('id', p.id).single();
            // Ignore fetch error, likely 406 or not found which is fine

            if (!existing) {
                const { error } = await supabase.from('partners').insert({
                    id: p.id,
                    business_name: p.razonSocial || p.name,
                    rut: p.rut,
                    mintur_registration: `2024-${p.id.substring(0, 8)}`, // Unique registration
                    contact_email: `contacto-${p.id.substring(24)}@demo.com`, // Unique contact email
                    contact_phone: p.phone,
                    email: `partner-${p.id.substring(24)}@demo.com`, // Generated email based on unique suffix
                    name: p.name
                });
                if (error) {
                    console.error(`Error inserting partner ${p.name}:`, error);
                    errors.push(`Partner ${p.name}: ${error.message} (${error.details || ''})`);
                } else {
                    console.log(`✅ Partner inserted: ${p.name}`);
                }
            } else {
                console.log(`ℹ️ Partner already exists: ${p.name}`);
            }
        }

        // 2. Seed Services (Hotels as Services + Activities)
        const allServices = [
            ...hotels.map(h => ({
                id: h.id,
                partner_id: h.partnerId,
                name: h.name,
                description: h.description, // Removed category
                price: h.pricePerNight,
                capacity: h.rooms,
                images: h.images,
                contact_info: { address: h.address, city: h.city },
                schedule: 'Check-in: 14:00',
                active: true,
                // Add missing fields for compatibility
                category: 'hotel',
                type: 'indoor',
                weather_resilient: true,
                kids_friendly: h.childrenFriendly || false,
                rating: h.rating,
                reviews_count: h.reviewsCount || 0,
                best_time: 'any',
                min_age: 0,
                max_age: 100,
                is_free: false,
                duration: 'N/A',
                coordinates: h.coordinates
            })),
            ...activities.map(a => ({
                id: a.id,
                partner_id: a.partnerId,
                name: a.name,
                description: a.description,
                category: a.category,
                type: a.type || 'outdoor', // Default fallback
                weather_resilient: a.weatherResilient || false,
                kids_friendly: a.kidsFriendly || false,
                rating: a.rating || 0,
                reviews_count: 0,
                best_time: a.bestTime,
                min_age: a.minAge,
                max_age: a.maxAge,
                is_free: a.isFree || false,
                duration: a.duration,
                coordinates: a.coordinates,
                price: a.price,
                capacity: a.capacity,
                images: a.images,
                contact_info: { city: a.city },
                schedule: a.duration,
                active: true
            }))
        ];

        console.log(`Processing ${allServices.length} services...`);
        for (const s of allServices) {
            // Check if exists
            const { data: existing } = await supabase.from('partner_services').select('id').eq('id', s.id).single();

            if (!existing) {
                const { error } = await supabase.from('partner_services').insert({
                    id: s.id,
                    partner_id: s.partner_id,
                    name: s.name,
                    description: s.description,
                    category: s.category,
                    type: s.type,
                    weather_resilient: s.weather_resilient,
                    kids_friendly: s.kids_friendly,
                    rating: s.rating,
                    reviews_count: s.reviews_count,
                    best_time: s.best_time,
                    min_age: s.min_age,
                    max_age: s.max_age,
                    is_free: s.is_free,
                    duration: s.duration,
                    coordinates: s.coordinates,
                    price: s.price,
                    capacity: s.capacity,
                    images: s.images,
                    contact_info: s.contact_info,
                    schedule: s.schedule,
                    active: s.active
                    // active default is true usually
                });

                if (error) {
                    console.error(`Error inserting service ${s.name}:`, error);
                    errors.push(`Service ${s.name}: ${error.message}`);
                } else {
                    console.log(`✅ Service inserted: ${s.name}`);
                }
            }
        }

        if (errors.length > 0) {
            return { success: false, message: `Failed with ${errors.length} errors`, details: errors };
        }

        return { success: true, message: 'Database seeded successfully' };

    } catch (err: any) {
        console.error('Seed fatal error:', err);
        return { success: false, message: 'Seeding failed', details: [err.message] };
    }
};
