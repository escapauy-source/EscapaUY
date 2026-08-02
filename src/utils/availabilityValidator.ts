/**
 * Availability Validator - Lógica Centralizada de Validación
 * 
 * Valida si un partner está disponible en un día/horario específico
 * Protege la experiencia premium evitando errores de reserva
 */

export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DayAvailability {
    open: boolean;
    slots: TimeSlot[];
    hours?: {
        morning?: { start: string; end: string };
        afternoon?: { start: string; end: string };
        evening?: { start: string; end: string };
    };
    note?: string;
}

export interface AvailabilitySettings {
    days: Record<DayOfWeek, DayAvailability>;
    specialDates?: Record<string, DayAvailability>; // Format: 'YYYY-MM-DD'
    timezone: string;
    lastUpdated?: string;
}

/**
 * Convierte Date a nombre del día de la semana
 */
function getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

/**
 * Formatea fecha a string YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Valida si un partner está disponible en una fecha y franja horaria
 */
export function isPartnerAvailable(
    availabilitySettings: AvailabilitySettings | null,
    date: Date,
    timeSlot: TimeSlot
): boolean {
    // Si no hay configuración, asumir abierto (default)
    if (!availabilitySettings) {
        return true;
    }

    const dateKey = formatDateKey(date);

    // 1. Verificar fechas especiales (override)
    if (availabilitySettings.specialDates?.[dateKey]) {
        const specialDay = availabilitySettings.specialDates[dateKey];
        return specialDay.open && specialDay.slots.includes(timeSlot);
    }

    // 2. Verificar día de la semana
    const dayOfWeek = getDayOfWeek(date);
    const dayConfig = availabilitySettings.days[dayOfWeek];

    if (!dayConfig || !dayConfig.open) {
        return false;
    }

    // 3. Verificar si la franja horaria está disponible
    return dayConfig.slots.includes(timeSlot);
}

/**
 * Obtiene la razón por la cual un partner no está disponible
 */
export function getUnavailabilityReason(
    availabilitySettings: AvailabilitySettings | null,
    date: Date,
    timeSlot: TimeSlot
): string | null {
    if (!availabilitySettings) return null;

    const dateKey = formatDateKey(date);
    const dayOfWeek = getDayOfWeek(date);
    const dayNames: Record<DayOfWeek, string> = {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábados',
        sunday: 'Domingos',
    };

    // Verificar fecha especial
    if (availabilitySettings.specialDates?.[dateKey]) {
        const specialDay = availabilitySettings.specialDates[dateKey];
        if (!specialDay.open) {
            return specialDay.note || 'Cerrado este día';
        }
        if (!specialDay.slots.includes(timeSlot)) {
            return `No disponible en este horario`;
        }
    }

    // Verificar día de la semana
    const dayConfig = availabilitySettings.days[dayOfWeek];

    if (!dayConfig?.open) {
        return `Este establecimiento descansa los ${dayNames[dayOfWeek]}`;
    }

    if (!dayConfig.slots.includes(timeSlot)) {
        const slotNames = {
            morning: 'mañana',
            afternoon: 'tarde',
            evening: 'noche',
        };
        return `No abre en horario de ${slotNames[timeSlot]}`;
    }

    return null;
}

/**
 * Filtra partners disponibles para un día específico
 */
export function getAvailablePartners<T extends { availabilitySettings?: AvailabilitySettings | null }>(
    partners: T[],
    date: Date,
    timeSlot: TimeSlot
): T[] {
    return partners.filter(partner =>
        isPartnerAvailable(partner.availabilitySettings || null, date, timeSlot)
    );
}

/**
 * Obtiene todos los días que un partner está cerrado en una semana
 */
export function getClosedDays(availabilitySettings: AvailabilitySettings | null): DayOfWeek[] {
    if (!availabilitySettings) return [];

    const closedDays: DayOfWeek[] = [];
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
        if (!availabilitySettings.days[day]?.open) {
            closedDays.push(day);
        }
    }

    return closedDays;
}

/**
 * Obtiene las franjas horarias disponibles para un día específico
 */
export function getAvailableTimeSlots(
    availabilitySettings: AvailabilitySettings | null,
    date: Date
): TimeSlot[] {
    if (!availabilitySettings) {
        return ['morning', 'afternoon', 'evening']; // Default: todo el día
    }

    const dateKey = formatDateKey(date);

    // Verificar fecha especial
    if (availabilitySettings.specialDates?.[dateKey]) {
        const specialDay = availabilitySettings.specialDates[dateKey];
        return specialDay.open ? specialDay.slots : [];
    }

    // Verificar día de la semana
    const dayOfWeek = getDayOfWeek(date);
    const dayConfig = availabilitySettings.days[dayOfWeek];

    return dayConfig?.open ? dayConfig.slots : [];
}

/**
 * Crea configuración de disponibilidad por defecto
 */
export function createDefaultAvailability(): AvailabilitySettings {
    const defaultDay: DayAvailability = {
        open: true,
        slots: ['morning', 'afternoon'],
        hours: {
            morning: { start: '09:00', end: '12:00' },
            afternoon: { start: '14:00', end: '18:00' },
        },
    };

    return {
        days: {
            monday: defaultDay,
            tuesday: defaultDay,
            wednesday: defaultDay,
            thursday: defaultDay,
            friday: { ...defaultDay, slots: ['morning', 'afternoon', 'evening'] },
            saturday: { ...defaultDay, slots: ['morning', 'afternoon', 'evening'] },
            sunday: { open: false, slots: [], note: 'Cerrado los domingos' },
        },
        specialDates: {},
        timezone: 'America/Montevideo',
        lastUpdated: new Date().toISOString(),
    };
}
