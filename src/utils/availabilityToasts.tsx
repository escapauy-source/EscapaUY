import { toast } from 'react-hot-toast';
import type { TimeSlot } from './availabilityValidator';

/**
 * Sistema de notificaciones elegantes para disponibilidad de partners
 * Vocabulario de lujo y experiencia premium
 */

// Paleta de colores EscapaUY
const COLORS = {
    navy: '#1A2B48',
    cream: '#F8F7F4',
    gold: '#D4AF37',
    oroViejo: '#C5A059',
    ocean: '#0EA5E9',
    amber: '#F59E0B',
};

// Traduce los días de la semana a español con artículo
const getDayName = (day: string): string => {
    const days: Record<string, string> = {
        monday: 'los lunes',
        tuesday: 'los martes',
        wednesday: 'los miércoles',
        thursday: 'los jueves',
        friday: 'los viernes',
        saturday: 'los sábados',
        sunday: 'los domingos',
    };
    return days[day] || day;
};

// Traduce los time slots a español elegante
const getTimeSlotName = (slot: TimeSlot): string => {
    const slots: Record<TimeSlot, string> = {
        morning: 'la mañana',
        afternoon: 'la tarde',
        evening: 'la noche',
    };
    return slots[slot];
};

interface ToastOptions {
    onSuggestAlternative?: () => void;
    partnerName?: string;
    dayOfWeek?: string;
    timeSlot?: TimeSlot;
}

/**
 * Toast cuando el partner descansa ese día completo
 */
export const showClosedDayToast = (options: ToastOptions) => {
    const { onSuggestAlternative, partnerName, dayOfWeek } = options;
    const dayName = dayOfWeek ? getDayName(dayOfWeek) : 'ese día';
    const locationName = partnerName || 'este rincón de Colonia';

    const message = `Pausa de Lujo: ${locationName} descansa ${dayName} para recibirte con más energía mañana. ¿Te gustaría que la IA te sugiera una alternativa para hoy?`;

    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto border-2 border-amber-200`}
            >
                <div className="p-5">
                    <div className="flex items-start gap-3">
                        {/* Icon - Calendar con pausa */}
                        <div className="flex-shrink-0">
                            <svg
                                className="w-7 h-7"
                                style={{ color: COLORS.amber }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p
                                className="text-sm font-bold mb-1"
                                style={{ color: COLORS.navy }}
                            >
                                Pausa de Lujo
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>

                            {/* Botones de acción */}
                            {onSuggestAlternative && (
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => {
                                            onSuggestAlternative();
                                            toast.dismiss(t.id);
                                        }}
                                        className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
                                        style={{
                                            color: COLORS.cream,
                                            backgroundColor: COLORS.ocean,
                                        }}
                                    >
                                        Sí, buscar alternativa
                                    </button>
                                    <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                                    >
                                        No, gracias
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        ),
        { duration: 7000 }
    );
};

/**
 * Toast cuando el horario específico no está disponible
 */
export const showWrongTimeSlotToast = (options: ToastOptions) => {
    const { timeSlot, partnerName } = options;
    const slotName = timeSlot ? getTimeSlotName(timeSlot) : 'ese horario';
    const locationName = partnerName || 'el establecimiento';

    const message = `Cita Exclusiva: ${locationName} opera en turnos de mañana y tarde. Por favor, ajusta tu itinerario para asegurar tu lugar en esta experiencia.`;

    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto border-2`}
                style={{ borderColor: COLORS.gold }}
            >
                <div className="p-5">
                    <div className="flex items-start gap-3">
                        {/* Icon - Clock */}
                        <div className="flex-shrink-0">
                            <svg
                                className="w-7 h-7"
                                style={{ color: COLORS.gold }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p
                                className="text-sm font-bold mb-1"
                                style={{ color: COLORS.navy }}
                            >
                                Cita Exclusiva
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        ),
        { duration: 6000 }
    );
};

/**
 * Toast cuando se activa Plan B por clima
 */
export const showPlanBActivatedToast = (planBLocation: string) => {
    const message = `Resiliencia EscapaUY: El pronóstico sugiere actividades techadas. Hemos activado tu Plan B en ${planBLocation} para que nada detenga tu escapada.`;

    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto border-2`}
                style={{ borderColor: COLORS.ocean }}
            >
                <div className="p-5">
                    <div className="flex items-start gap-3">
                        {/* Icon - Shield Check (resiliencia) */}
                        <div className="flex-shrink-0">
                            <svg
                                className="w-7 h-7"
                                style={{ color: COLORS.ocean }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p
                                className="text-sm font-bold mb-1"
                                style={{ color: COLORS.navy }}
                            >
                                Resiliencia EscapaUY
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        ),
        { duration: 5000 }
    );
};

/**
 * Toast genérico de disponibilidad con mensaje personalizado
 */
export const showAvailabilityToast = (
    message: string,
    options?: ToastOptions
) => {
    const { onSuggestAlternative } = options || {};

    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto border border-amber-200`}
            >
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-amber-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                Pausa de Lujo
                            </p>
                            <p className="text-sm text-gray-700">{message}</p>
                            {onSuggestAlternative && (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => {
                                            onSuggestAlternative();
                                            toast.dismiss(t.id);
                                        }}
                                        className="text-sm font-medium text-ocean-600 hover:text-ocean-700"
                                    >
                                        Sí, buscar alternativa
                                    </button>
                                    <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="text-sm text-gray-500 hover:text-gray-600"
                                    >
                                        No, gracias
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-500"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        ),
        { duration: 6000 }
    );
};
