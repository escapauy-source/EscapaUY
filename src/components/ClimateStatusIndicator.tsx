import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ClimateStatusIndicatorProps {
    rainProbability: number;
    temperature: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    isPlanBActive: boolean;
}

export function ClimateStatusIndicator({
    rainProbability,
    temperature,
    condition,
    isPlanBActive,
}: ClimateStatusIndicatorProps) {
    const getIcon = () => {
        if (isPlanBActive) return <CloudRain className="w-6 h-6" />;
        switch (condition) {
            case 'sunny':
                return <Sun className="w-6 h-6" />;
            case 'cloudy':
            case 'rainy':
            case 'stormy':
                return <Cloud className="w-6 h-6" />;
            default:
                return <Sun className="w-6 h-6" />;
        }
    };

    const getStatusText = () => {
        if (isPlanBActive) {
            return 'Plan B Activado (Lluvia Detectada)';
        }
        return rainProbability >= 70
            ? 'Alerta: Alta Prob. de Lluvia'
            : 'Plan A Activo (Condiciones Favorables)';
    };

    const getStatusColor = () => {
        if (isPlanBActive || rainProbability >= 70) {
            return {
                bg: 'from-amber-500 to-orange-600',
                text: 'text-white',
                icon: 'text-white',
                border: 'border-amber-300',
            };
        }
        return {
            bg: 'from-green-500 to-emerald-600',
            text: 'text-white',
            icon: 'text-white',
            border: 'border-green-300',
        };
    };

    const colors = getStatusColor();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-30"
        >
            <div className={cn(
                "relative overflow-hidden rounded-2xl border-2 shadow-2xl",
                colors.border
            )}>
                {/* Animated Background */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    colors.bg
                )}>
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                               radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Icon with Animation */}
                            <motion.div
                                animate={isPlanBActive ? { rotate: 360 } : {}}
                                transition={{ duration: 2, repeat: isPlanBActive ? Infinity : 0, ease: "linear" }}
                                className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm",
                                    colors.icon
                                )}
                            >
                                {getIcon()}
                            </motion.div>

                            {/* Status Text */}
                            <div>
                                <p className={cn("text-sm font-medium opacity-90", colors.text)}>
                                    Estado del Clima
                                </p>
                                <p className={cn("text-xl font-bold", colors.text)}>
                                    {getStatusText()}
                                </p>
                            </div>
                        </div>

                        {/* Weather Details */}
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className={cn("text-sm opacity-90", colors.text)}>Temperatura</p>
                                <p className={cn("text-2xl font-bold", colors.text)}>{temperature}°</p>
                            </div>
                            <div className="text-right">
                                <p className={cn("text-sm opacity-90", colors.text)}>Prob. Lluvia</p>
                                <p className={cn("text-2xl font-bold", colors.text)}>{rainProbability}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Plan B Explanation */}
                    {isPlanBActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-white/30"
                        >
                            <div className="flex items-start gap-3">
                                <RefreshCw className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-white/95">
                                    <strong>Sistema de Resiliencia Activado:</strong> Las actividades outdoor han sido
                                    reemplazadas automáticamente por alternativas indoor premium para proteger tu inversión.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
