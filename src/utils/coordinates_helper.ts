// coordinates_helper.ts - Script temporal para agregar coordenadas a mockData
// Este archivo se puede eliminar después de usarlo

import { Coordinates } from '../types';

// Coordenadas aproximadas de ciudades en Uruguay (Departamento de Colonia)
export const CITY_COORDINATES: Record<string, Coordinates> = {
    'Colonia del Sacramento': { lat: -34.4631, lng: -57.8403 },
    'Carmelo': { lat: -33.9897, lng: -58.2839 },
    'Juan Lacaze': { lat: -34.4361, lng: -57.4431 },
    'Rosario': { lat: -34.3167, lng: -57.3500 },
    'Nueva Helvecia': { lat: -34.3000, lng: -57.2333 },
};

// Función helper para generar coordenadas con pequeñas variaciones
// para diferentes POIs en la misma ciudad
export function getCoordinatesForCity(city: string, variant: number = 0): Coordinates {
    const baseCoords = CITY_COORDINATES[city];
    if (!baseCoords) {
        console.warn(`No coordinates found for city: ${city}`);
        return { lat: -34.4631, lng: -57.8403 }; // Default to Colonia
    }

    // Agrega pequeña variación para simular diferentes ubicaciones en la misma ciudad
    // 0.01 grados ≈ 1km
    const latVariation = (variant * 0.005) - 0.0025;
    const lngVariation = (variant * 0.005) - 0.0025;

    return {
        lat: baseCoords.lat + latVariation,
        lng: baseCoords.lng + lngVariation,
    };
}
