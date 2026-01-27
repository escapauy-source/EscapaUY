import { Clock } from 'lucide-react';
import type { TimeSlot } from '@/utils/availabilityValidator';

interface AvailabilityBadgeProps {
    isAvailable: boolean;
    reason?: string;
    timeSlot?: TimeSlot;
    size?: 'sm' | 'md' | 'lg';
}

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    evening: 'Noche',
};

/**
 * Badge visualmente elegante que indica si un partner está disponible o cerrado
 * Diseño premium con sombreado gris seda para estados deshabilitados
 */
export function AvailabilityBadge({
    isAvailable,
    reason,
    timeSlot,
    size = 'md'
}: AvailabilityBadgeProps) {

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    if (isAvailable) {
        return (
            <div
                className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
                style={{
                    backgroundColor: '#E8F5F1',
                    color: '#047857',
                }}
            >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Disponible
            </div>
        );
    }

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]}`}
            style={{
                backgroundColor: '#F3F4F6', // Gris seda suave
                color: '#6B7280',
                border: '1px solid #E5E7EB',
            }}
        >
            <Clock className="w-3.5 h-3.5" />
            <span>
                {reason ? 'Cerrado' : 'No disponible'}
                {timeSlot && ` - ${TIME_SLOT_LABELS[timeSlot]}`}
            </span>
        </div>
    );
}

/**
 * Wrapper para una card de actividad que muestra overlay cuando está deshabilitada
 */
interface DisabledSlotOverlayProps {
    children: React.ReactNode;
    isDisabled: boolean;
    reason?: string;
}

export function DisabledSlotOverlay({
    children,
    isDisabled,
    reason
}: DisabledSlotOverlayProps) {

    if (!isDisabled) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Content with reduced opacity */}
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>

            {/* Overlay with elegant message */}
            <div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl cursor-not-allowed"
                style={{
                    border: '2px dashed #D1D5DB',
                }}
            >
                <div className="text-center px-6 py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                        Horario No Disponible
                    </p>
                    {reason && (
                        <p className="text-xs text-gray-500 max-w-xs">
                            {reason}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
