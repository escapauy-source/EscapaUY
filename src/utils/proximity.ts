import { Activity, Hotel, Coordinates } from '@/types';

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param coord1 Primera coordenada
 * @param coord2 Segunda coordenada
 * @returns Distancia en kilómetros
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Filtra actividades dentro de un radio específico desde una ubicación base
 * @param activities Lista de actividades
 * @param baseLocation Coordenadas base (típicamente del hotel)
 * @param radiusKm Radio en kilómetros (default: 30km)
 * @returns Actividades filtradas dentro del radio
 */
export function filterActivitiesByProximity(
    activities: Activity[],
    baseLocation: Coordinates,
    radiusKm: number = 30
): Activity[] {
    return activities.filter(activity => {
        // Skip activities without coordinates
        if (!activity.coordinates) {
            return false;
        }

        const distance = calculateDistance(baseLocation, activity.coordinates);
        return distance <= radiusKm;
    });
}

/**
 * Obtiene actividades apropiadas para un día específico del itinerario
 * Para TODOS los días: devuelve todas las actividades de la ciudad del hotel
 * Esto asegura que siempre haya actividades disponibles para días 1-7
 * 
 * @param activities Lista completa de actividades
 * @param hotel Hotel seleccionado
 * @param dayNumber Número de día (1-based)
 * @param radiusKm Radio para búsqueda (no usado actualmente)
 * @returns Actividades filtradas para ese día
 */
export function getActivitiesForDay(
    activities: Activity[],
    hotel: Hotel,
    dayNumber: number,
    radiusKm: number = 30
): Activity[] {
    console.log(`Getting activities for day ${dayNumber}, hotel: ${hotel.name}, city: ${hotel.city}`);

    // SIMPLIFICADO: Siempre devolver actividades de la ciudad del hotel
    // Esto asegura que días 1-7 tengan actividades disponibles
    const cityActivities = activities.filter(a => a.city === hotel.city);

    console.log(`Found ${cityActivities.length} activities in ${hotel.city}`);

    // Si no hay actividades en la ciudad, devolver TODAS las actividades como fallback
    if (cityActivities.length === 0) {
        console.warn(`No activities found for ${hotel.city}, returning all activities as fallback`);
        return activities;
    }

    return cityActivities;
}

/**
 * Filtra actividades por período del día (mañana, tarde, noche)
 * @param activities Lista de actividades
 * @param timeSlot Período del día
 * @returns Actividades filtradas por período
 */
export function filterActivitiesByTimeSlot(
    activities: Activity[],
    timeSlot: 'morning' | 'afternoon' | 'evening'
): Activity[] {
    const filtered = activities.filter(
        a => a.bestTime === timeSlot || a.bestTime === 'any'
    );

    console.log(`Filtering for ${timeSlot}: ${filtered.length} activities available`);

    return filtered;
}

/**
 * Verifica la capacidad actual de una actividad
 * @param activity Actividad a verificar
 * @returns Porcentaje de ocupación (0-100)
 */
export function getOccupancyPercentage(activity: Activity): number {
    return Math.round((activity.currentOccupancy / activity.capacity) * 100);
}

/**
 * Verifica si una actividad está disponible
 * @param activity Actividad a verificar
 * @returns true si tiene cupos disponibles
 */
export function isActivityAvailable(activity: Activity): boolean {
    return activity.currentOccupancy < activity.capacity;
}
