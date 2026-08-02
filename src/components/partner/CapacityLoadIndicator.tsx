import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { CapacityLevel } from '@/utils/mockPartnerData';

interface CapacityLoadIndicatorProps {
    level: CapacityLevel;
    percentage: number;
    maxCapacity?: number;
    currentOccupancy?: number;
}

/**
 * Indicador de Capacidad de Carga
 * Niveles 0-3 con colores semafóricos
 */
export function CapacityLoadIndicator({
    level,
    percentage,
    maxCapacity = 100,
    currentOccupancy = Math.round((percentage / 100) * maxCapacity)
}: CapacityLoadIndicatorProps) {

    const getLevelConfig = () => {
        switch (level) {
            case 0:
                return {
                    label: 'Óptimo',
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/20',
                    borderColor: 'border-green-500/30',
                    barColor: 'bg-green-500',
                    icon: CheckCircle2,
                };
            case 1:
                return {
                    label: 'Normal',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500/20',
                    borderColor: 'border-blue-500/30',
                    barColor: 'bg-blue-500',
                    icon: AlertCircle,
                };
            case 2:
                return {
                    label: 'Alerta',
                    color: 'text-orange-400',
                    bgColor: 'bg-orange-500/20',
                    borderColor: 'border-orange-500/30',
                    barColor: 'bg-orange-500',
                    icon: AlertTriangle,
                };
            case 3:
                return {
                    label: 'Saturado',
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/20',
                    borderColor: 'border-red-500/30',
                    barColor: 'bg-red-500',
                    icon: XCircle,
                };
        }
    };

    const config = getLevelConfig();
    const Icon = config.icon;

    return (
        <div className={cn(
            "rounded-xl p-4 border",
            config.bgColor,
            config.borderColor
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", config.color)} />
                    <span className="text-sm font-medium text-white">
                        Capacidad de Carga
                    </span>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", config.bgColor, config.color)}>
                    NIVEL {level}
                </span>
            </div>

            <div className="space-y-2">
                {/* Barra de progreso */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500", config.barColor)}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                        {currentOccupancy} / {maxCapacity} personas
                    </span>
                    <span className={cn("font-bold", config.color)}>
                        {percentage}%
                    </span>
                </div>

                {/* Status label */}
                <div className="pt-2 border-t border-white/10">
                    <span className={cn("text-sm font-medium", config.color)}>
                        {config.label}
                    </span>
                    {level >= 2 && (
                        <p className="text-xs text-white/50 mt-1">
                            {level === 2 ? 'Considera limitar nuevas reservas' : 'No aceptar más derivaciones'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
