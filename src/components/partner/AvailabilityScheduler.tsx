import { useState, useEffect } from 'react';
import { Calendar, Clock, Save, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { AvailabilitySettings, DayOfWeek, TimeSlot } from '@/utils/availabilityValidator';
import { createDefaultAvailability } from '@/utils/availabilityValidator';

interface AvailabilitySchedulerProps {
    partnerId: string;
    initialSettings?: AvailabilitySettings;
    onSave?: (settings: AvailabilitySettings) => void;
}

/**
 * Selector Elegante de Disponibilidad para Partners
 * Permite configurar días de apertura y franjas horarias
 */
export function AvailabilityScheduler({ partnerId, initialSettings, onSave }: AvailabilitySchedulerProps) {
    const [isSaving, setIsSaving] = useState(false);

    // 1. Robust Initial State - Use createDefaultAvailability as fallback
    const [settings, setSettings] = useState<AvailabilitySettings>(() => {
        if (initialSettings?.days) return initialSettings;
        return createDefaultAvailability();
    });

    // 2. Prevent infinite loop - Only update if initialSettings actually changed
    useEffect(() => {
        if (initialSettings?.days && JSON.stringify(initialSettings.days) !== JSON.stringify(settings.days)) {
            setSettings(initialSettings);
        }
    }, [initialSettings]);

    const dayNames: Record<DayOfWeek, string> = {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo',
    };

    const slotNames: Record<TimeSlot, { label: string; icon: string; hours: string }> = {
        morning: { label: 'Mañana', icon: '🌅', hours: '06:00-12:00' },
        afternoon: { label: 'Tarde', icon: '☀️', hours: '12:00-18:00' },
        evening: { label: 'Noche', icon: '🌙', hours: '18:00-24:00' },
    };

    const allDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const allSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];

    const toggleDay = (day: DayOfWeek) => {
        if (!settings?.days?.[day]) return;
        setSettings(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...prev.days[day],
                    open: !prev.days[day]?.open,
                    slots: !prev.days[day]?.open ? prev.days[day]?.slots : [],
                },
            },
        }));
    };

    const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
        const dayConfig = settings?.days?.[day];
        if (!dayConfig) return;
        const hasSlot = dayConfig?.slots?.includes(slot);

        setSettings(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: {
                    ...dayConfig,
                    open: true, // Auto-abrir el día si se selecciona un slot
                    slots: hasSlot
                        ? dayConfig.slots.filter(s => s !== slot)
                        : [...(dayConfig.slots || []), slot],
                },
            },
        }));
    };

    const handleReset = () => {
        console.log('[AvailabilityScheduler] Resetting to defaults');
        setSettings(createDefaultAvailability());
        toast.success('Horarios restablecidos (sin guardar)');
    };

    const handleSave = async () => {
        console.log('[AvailabilityScheduler] Intentando guardar:', settings);
        setIsSaving(true);

        try {
            const updatedSettings = {
                ...settings,
                lastUpdated: new Date().toISOString(),
            };

            const { error: upsertError } = await supabase
                .from('partners')
                .update({ availability_settings: updatedSettings })
                .eq('id', partnerId);

            if (upsertError) throw upsertError;

            setSettings(updatedSettings);
            onSave?.(updatedSettings);
            toast.success('Disponibilidad guardada correctamente');
        } catch (err: any) {
            console.error('[AvailabilityScheduler] Error al guardar:', err);
            alert(`Error al guardar: ${err.message || 'Error desconocido'}`);
            toast.error('No se pudo guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    const getOpenDaysCount = () => {
        if (!settings?.days) return 0;
        return allDays.filter(day => settings.days[day]?.open).length;
    };

    // 4. Loading Bypass / Render Protection
    if (!settings?.days) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-ocean-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Preparando tu calendario de disponibilidad...</p>
                <p className="text-sm text-gray-400 mt-2">Sincronizando con el servidor...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-ocean-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">Configuración de Disponibilidad</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Define tus días y horarios de apertura
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-ocean-600">{getOpenDaysCount()}/7</p>
                        <p className="text-xs text-gray-500">días abiertos</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Vista Semanal */}
                <div className="space-y-3">
                    {allDays.map((day) => {
                        const dayConfig = settings?.days?.[day];

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "border-2 rounded-xl transition-all",
                                    dayConfig?.open
                                        ? "border-ocean-200 bg-ocean-50/50"
                                        : "border-gray-200 bg-gray-50"
                                )}
                            >
                                <div className="p-4">
                                    {/* Header del Día */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleDay(day)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative",
                                                    dayConfig?.open ? "bg-ocean-600" : "bg-gray-300"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                        dayConfig?.open ? "right-1" : "left-1"
                                                    )}
                                                />
                                            </button>
                                            <div>
                                                <p className={cn(
                                                    "font-semibold",
                                                    dayConfig?.open ? "text-gray-900" : "text-gray-400"
                                                )}>
                                                    {dayNames?.[day]}
                                                </p>
                                                {!dayConfig?.open && dayConfig?.note && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{dayConfig.note}</p>
                                                )}
                                            </div>
                                        </div>

                                        {dayConfig?.open && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-ocean-600" />
                                                <span className="text-sm text-ocean-600 font-medium">
                                                    {dayConfig?.slots?.length || 0} franja{dayConfig?.slots?.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Franjas Horarias */}
                                    {dayConfig?.open && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {allSlots.map((slot) => {
                                                const isSelected = dayConfig?.slots?.includes(slot);
                                                const slotInfo = slotNames?.[slot];

                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => toggleSlot(day, slot)}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2 transition-all text-left",
                                                            isSelected
                                                                ? "border-ocean-500 bg-ocean-100 shadow-sm"
                                                                : "border-gray-200 hover:border-ocean-300 bg-white"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-lg">{slotInfo.icon}</span>
                                                            <span className={cn(
                                                                "text-sm font-medium",
                                                                isSelected ? "text-ocean-700" : "text-gray-600"
                                                            )}>
                                                                {slotInfo.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{slotInfo.hours}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Resumen Visual */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-medium text-blue-900 mb-2">📊 Vista Previa de tu Semana</p>
                    <div className="grid grid-cols-7 gap-2">
                        {allDays.map((day) => {
                            const dayConfig = settings?.days?.[day];
                            const shortName = dayNames?.[day]?.slice(0, 3) || 'Day';

                            return (
                                <div
                                    key={day}
                                    className={cn(
                                        "aspect-square rounded-lg flex flex-col items-center justify-center text-center p-2",
                                        dayConfig?.open
                                            ? "bg-green-100 border border-green-300"
                                            : "bg-gray-100 border border-gray-300"
                                    )}
                                >
                                    <p className={cn(
                                        "text-xs font-bold mb-1",
                                        dayConfig?.open ? "text-green-700" : "text-gray-400"
                                    )}>
                                        {shortName}
                                    </p>
                                    <div className="flex gap-0.5">
                                        {allSlots.map((slot) => (
                                            <div
                                                key={slot}
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    dayConfig?.slots?.includes(slot)
                                                        ? "bg-green-600"
                                                        : "bg-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-amber-900 mb-1">💡 Consejo Profesional</p>
                    <p className="text-sm text-amber-700">
                        Los turistas solo verán tu establecimiento disponible en los días y horarios que configures aquí.
                        Mantén esta información actualizada para evitar cancelaciones.
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={handleReset}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restablecer
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1A2B48] text-white font-medium rounded-xl hover:bg-[#142034] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Guardar Disponibilidad
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
