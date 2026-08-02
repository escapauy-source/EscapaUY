import { Activity, Hotel, BigFiveScores } from '@/types';

interface FilterOptions {
  hotel: Hotel | null;
  numberOfChildren: number;
  childrenAges: number[];
  numberOfAdults: number;
  bigFiveScores: BigFiveScores | null;
  arrivalTime?: 'morning' | 'afternoon' | 'evening';
}

/**
 * Filtra actividades según perfil del usuario, hotel, edad de niños y personalidad
 */
export function filterActivities(
  activities: Activity[],
  options: FilterOptions
): Activity[] {
  // if (!options.hotel) {
  //   return [];
  // }

  return activities.filter((activity) => {
    // 1. Filtro por ubicación: solo actividades en la misma ciudad que el hotel
    // 1. Filtro por ubicación: solo actividades en la misma ciudad que el hotel (si hay hotel seleccionado)
    if (options.hotel && activity.city !== options.hotel.city) {
      return false;
    }

    // 2. Filtro por niños - Si hay niños, debe ser kid-friendly
    if (options.numberOfChildren > 0) {
      if (!activity.kidsFriendly) {
        return false;
      }

      // 3. Validar que todos los niños estén dentro del rango de edad
      const hasValidAge = options.childrenAges.every((age) => {
        const minAge = activity.minAge || 0;
        const maxAge = activity.maxAge || 100;
        return age >= minAge && age <= maxAge;
      });

      if (!hasValidAge) {
        return false;
      }
    }

    // 4. Filtro de personalidad: alinear actividades con Big Five scores
    if (options.bigFiveScores) {
      const activity_score = calculateActivityPersonalityMatch(
        activity,
        options.bigFiveScores,
        options.numberOfChildren,
        options.numberOfAdults
      );

      // Mostrar solo actividades con match > 40% (más adelante se puede ordenar)
      if (activity_score < 40) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calcula qué tan bien una actividad se alinea con la personalidad del usuario
 * Retorna un score de 0-100
 */
function calculateActivityPersonalityMatch(
  activity: Activity,
  scores: BigFiveScores,
  numberOfChildren: number,
  numberOfAdults: number
): number {
  let match = 50; // Puntuación base neutral

  // Análisis por categoría de actividad
  const category = activity.category.toLowerCase();

  // OPENNESS (Apertura a experiencias)
  // Actividades nuevas/únicas: bodegas, experiencias, eventos
  if (['bodega', 'experiencia', 'evento'].includes(category)) {
    match += (scores.openness - 50) * 0.2; // Más peso a openness
  }
  // Actividades seguras/probadas: playas, parques, museos
  else if (['playa', 'parque', 'museo', 'paseo'].includes(category)) {
    match += (50 - scores.openness) * 0.2; // Menos openness = mejor match
  }

  // EXTRAVERSION (Extroversión)
  // Actividades sociales: tours, eventos, restaurantes
  if (['paseo', 'evento', 'restaurante'].includes(category)) {
    match += (scores.extraversion - 50) * 0.15;
  }
  // Actividades tranquilas: yoga, spa, parques naturales
  const nameStr = typeof activity.name === 'string'
    ? activity.name.toLowerCase()
    : (activity.name['es'] || activity.name['en'] || '').toLowerCase();

  if (['experiencia', 'parque'].includes(category) && nameStr.includes('yoga')) {
    match += (50 - scores.extraversion) * 0.15;
  }

  // CONSCIENTIOUSNESS (Conciencia/Planificación)
  // Actividades con estructura/horario: tours guiados, clases
  if (['paseo', 'museo', 'experiencia'].includes(category)) {
    match += (scores.conscientiousness - 50) * 0.1;
  }

  // AGREEABLENESS (Amabilidad)
  // Actividades familiares: playas, eventos, parques
  if (numberOfChildren > 0 && ['playa', 'evento', 'parque'].includes(category)) {
    match += Math.min(scores.agreeableness - 50, 20) * 0.1; // Bonus para familias
  }

  // NEUROTICISM (Neuroticismo - inverso)
  // Actividades relajantes vs. aventureras

  if (nameStr.includes('relax') || nameStr.includes('yoga')) {
    match += (100 - scores.neuroticism - 50) * 0.1; // Mayor neuroticism = preferir relax
  } else if (['experiencia', 'bodega'].includes(category)) {
    match += (scores.neuroticism - 50) * 0.05; // Mejor para menos neuroticism
  }

  // Bonus para actividades apropiadas para grupos
  if (numberOfAdults > 1 && ['experiencia', 'restaurante', 'bodega'].includes(category)) {
    match += 10;
  }

  // Bonus para actividades al aire libre (outdoor)
  if (activity.type === 'outdoor' && scores.openness > 50) {
    match += 5;
  }

  // Normalizar score a 0-100
  return Math.max(0, Math.min(100, Math.round(match)));
}

/**
 * Ordena actividades por relevancia (personalidad + disponibilidad)
 */
export function sortActivitiesByRelevance(
  activities: Activity[],
  scores: BigFiveScores | null,
  numberOfChildren: number,
  numberOfAdults: number
): Activity[] {
  return [...activities].sort((a, b) => {
    if (!scores) {
      return 0; // Sin scores, mantener orden original
    }

    const scoreA = calculateActivityPersonalityMatch(a, scores, numberOfChildren, numberOfAdults);
    const scoreB = calculateActivityPersonalityMatch(b, scores, numberOfChildren, numberOfAdults);

    // Ordenar descendente (mejor match primero)
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // Si scores iguales, priorizar por disponibilidad (ocupancy)
    const availabilityA = a.capacity - a.currentOccupancy;
    const availabilityB = b.capacity - b.currentOccupancy;
    return availabilityB - availabilityA;
  });
}

/**
 * Agrupa actividades por categoría
 */
export function groupActivitiesByCategory(activities: Activity[]) {
  return activities.reduce(
    (acc, activity) => {
      const category = activity.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(activity);
      return acc;
    },
    {} as Record<string, Activity[]>
  );
}

/**
 * Filtra actividades por horario
 */
export function filterActivitiesByTime(
  activities: Activity[],
  time: 'morning' | 'afternoon' | 'evening'
): Activity[] {
  return activities.filter((activity) => {
    if (activity.bestTime === 'any') {
      return true;
    }
    return activity.bestTime === time;
  });
}
