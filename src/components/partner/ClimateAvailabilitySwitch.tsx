import { useState } from 'react';
import { CloudRain, Sun, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ClimateAvailabilitySwitchProps {
    rainProbability: number;
    onToggle?: (forcedState: 'planA' | 'planB' | 'auto') => void;
}

/**
 * Switch de Disponibilidad Climática
 * Permite al partner forzar manualmente Plan A/B independiente del clima
 */
export function ClimateAvailabilitySwitch({ rainProbability, onToggle }: ClimateAvailabilitySwitchProps) {
    const [mode, setMode] = useState<'auto' | 'planA' | 'planB'>('auto');

    // Auto-determinar según clima si está en modo auto
    const isRainy = rainProbability >= 70;
    const effectivePlan = mode === 'auto' ? (isRainy ? 'planB' : 'planA') : mode;

    const handleToggle = () => {
        let newMode: typeof mode;

        if (mode === 'auto') {
            newMode = 'planB'; // Manual forzado a Plan B
        } else if (mode === 'planB') {
            newMode = 'planA'; // Manual forzado a Plan A
        } else {
            newMode = 'auto'; // Volver a automático
        }

        setMode(newMode);
        onToggle?.(newMode);
    };

    return (
        <div className="bg-[#1A2B48] rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {effectivePlan === 'planB' ? (
                        <CloudRain className="w-5 h-5 text-blue-400" />
                    ) : (
                        <Sun className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="text-sm font-medium text-white">
                        Disponibilidad Climática
                    </span>
                </div>
                <button
                    onClick={handleToggle}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                >
                    {mode === 'auto' ? (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ToggleRight className="w-5 h-5 text-[#D4AF37]" />
                    )}
                </button>
            </div>

            <div className="space-y-2">
                <div className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                    effectivePlan === 'planA' ? "bg-nature-500/20 border border-nature-500/30" : "bg-white/5"
                )}>
                    <span className="text-sm text-white/70">Plan A (Outdoor)</span>
                    {effectivePlan === 'planA' && (
                        <span className="text-xs font-medium text-nature-400 px-2 py-0.5 bg-nature-500/20 rounded-full">
                            ACTIVO
                        </span>
                    )}
                </div>

                <div className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                    effectivePlan === 'planB' ? "bg-ocean-500/20 border border-ocean-500/30" : "bg-white/5"
                )}>
                    <span className="text-sm text-white/70">Plan B (Indoor)</span>
                    {effectivePlan === 'planB' && (
                        <span className="text-xs font-medium text-ocean-400 px-2 py-0.5 bg-ocean-500/20 rounded-full">
                            ACTIVO
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">
                        {mode === 'auto' ? 'Modo Automático' : 'Override Manual'}
                    </span>
                    <span className="text-white/70">
                        {rainProbability}% lluvia
                    </span>
                </div>
            </div>
        </div>
    );
}
