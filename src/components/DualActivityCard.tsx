import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, TimeSlot } from '@/types';
import {
    Sun, Cloud, RefreshCw, Coffee,
    Users, MapPin, Clock, Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useItineraryStore } from '@/store/itineraryStore';

interface DualActivityCardProps {
    planA: Activity | null;
    planB: Activity | null;
    timeSlot: TimeSlot;
    isResting: boolean;
    weatherTriggered: boolean;
    isForeigner: boolean;
    planBEnabled: boolean; // NUEVO: Plan B activado por usuario
    onSelectActivity: (id: string) => void;
    onSelectRest: () => void;
    onRemove: () => void;
    onOpenSelector: () => void;
    onTogglePlanB: (enabled: boolean) => void; // NUEVO: Toggle Plan B
}

export function DualActivityCard({
    planA,
    planB,
    isResting,
    weatherTriggered,
    isForeigner,
    planBEnabled,
    onSelectRest,
    onRemove,
    onOpenSelector,
    onTogglePlanB,
}: DualActivityCardProps) {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState<'A' | 'B'>(weatherTriggered ? 'B' : 'A');
    const [isFlipped, setIsFlipped] = useState(false);

    const adults = useItineraryStore((state) => state.numberOfAdults);
    const kids = useItineraryStore((state) => state.numberOfChildren);

    const { i18n } = useTranslation();
    const currentLang = (i18n.language?.split('-')[0] || 'es');

    // Helper to safely extract string from LocalizedString or string
    const getLocalized = (content: any): string => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        if (typeof content === 'object') {
            return content[currentLang] || content['es'] || content['en'] || '';
        }
        return String(content);
    };

    const currentActivity = selectedPlan === 'A' ? planA : planB;

    // Calculate total price for group
    const calculateTotalPrice = (activity: Activity | null) => {
        if (!activity) return 0;
        const pAdult = activity.price_adult ?? activity.price ?? 0;
        const pChild = activity.price_child ?? activity.price ?? 0;
        return (adults * pAdult) + (kids * pChild);
    };

    const totalPrice = calculateTotalPrice(currentActivity);

    // Calculate IVA benefit v2.0 (18.03% reduction for foreigners/gastronomy)
    const calculateIVA = (price: number) => {
        if (!isForeigner) return 0;
        // 18.03% matches the v2.0 requirement for total IVA exoneration
        return Math.round(price * 0.180327);
    };

    // Get capacity indicator
    const getCapacityStatus = (activity: Activity | null) => {
        if (!activity) return 'unknown';
        const percentage = (activity.currentOccupancy / activity.capacity) * 100;
        if (percentage >= 90) return 'high';
        if (percentage >= 70) return 'medium';
        return 'low';
    };

    const getCapacityColor = (status: string) => {
        switch (status) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-amber-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    // Rest state
    if (isResting) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl"
            >
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md" />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

                <div className="relative p-8 border-2 border-blue-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Coffee className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-900">{t('itinerary.card.free_time')}</p>
                                <p className="text-sm text-gray-600">{t('itinerary.card.free_time_desc')}</p>
                            </div>
                        </div>
                        <button
                            onClick={onRemove}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            {t('itinerary.card.change')}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // No activity selected
    if (!planA && !planB) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl"
            >
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50" />
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300" />

                <div className="relative p-8">
                    <p className="text-center text-gray-500 mb-4">{t('itinerary.card.no_activity')}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onOpenSelector}
                            className="px-6 py-3 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 transition-colors flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {t('itinerary.card.choose_activity')}
                        </button>
                        <button
                            onClick={onSelectRest}
                            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            {t('itinerary.card.prefer_rest')}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const capacityStatus = getCapacityStatus(currentActivity);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            style={{ perspective: '1000px' }}
        >
            {/* Background Image with Overlay */}
            {currentActivity && (
                <div className="absolute inset-0">
                    <img
                        src={currentActivity.images[0]}
                        alt={getLocalized(currentActivity.name)}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                </div>
            )}

            {/* Glassmorphism Content */}
            <div className="relative">
                {/* Header with Plan Toggle */}
                {planA && planB && (
                    <div className="p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
                                    selectedPlan === 'A'
                                        ? "bg-amber-500/90 text-white shadow-lg"
                                        : "bg-white/20 text-white/70 hover:bg-white/30"
                                )}
                                    onClick={() => {
                                        setSelectedPlan('A');
                                        setIsFlipped(!isFlipped);
                                    }}
                                    role="button"
                                >
                                    <Sun className="w-4 h-4" />
                                    Plan A
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
                                    selectedPlan === 'B'
                                        ? "bg-ocean-500/90 text-white shadow-lg"
                                        : "bg-white/20 text-white/70 hover:bg-white/30"
                                )}
                                    onClick={() => {
                                        setSelectedPlan('B');
                                        setIsFlipped(!isFlipped);
                                    }}
                                    role="button"
                                >
                                    <Cloud className="w-4 h-4" />
                                    Plan B
                                </div>
                            </div>

                            {/* Weather Alert */}
                            {weatherTriggered && (
                                <div className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    {t('itinerary.card.weather_plan_b')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Card Content with Flip Animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedPlan}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 bg-white/10 backdrop-blur-md"
                    >
                        {currentActivity && (
                            <>
                                {/* Activity Type Badge */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-semibold",
                                        currentActivity.type === 'outdoor'
                                            ? "bg-amber-500/90 text-white"
                                            : "bg-ocean-500/90 text-white"
                                    )}>
                                        {currentActivity.type === 'outdoor' ? `🌤️ ${t('itinerary.card.outdoor')}` : `🏠 ${t('itinerary.card.indoor')}`}
                                    </span>

                                    {/* Capacity Indicator */}
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                        <div className={cn("w-2 h-2 rounded-full", getCapacityColor(capacityStatus))} />
                                        <Users className="w-3 h-3 text-white" />
                                        <span className="text-xs text-white font-medium">
                                            {currentActivity.currentOccupancy}/{currentActivity.capacity}
                                        </span>
                                    </div>

                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {currentActivity.duration}
                                    </span>
                                </div>

                                {/* Activity Name */}
                                <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                                    {getLocalized(currentActivity.name)}
                                </h3>

                                {/* Partner & Location */}
                                <div className="flex items-center gap-4 mb-4">
                                    <p className="text-white/90 text-sm">{currentActivity.partnerName}</p>
                                    <div className="flex items-center gap-1 text-white/80 text-sm">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {currentActivity.city}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-white/90 text-sm mb-4 line-clamp-2">
                                    {getLocalized(currentActivity.description)}
                                </p>

                                {/* Plan B Toggle - Only show if activity is outdoor */}
                                {planA && planA.type === 'outdoor' && planB && (
                                    <div className="mb-4 p-3 rounded-xl border"
                                        style={{
                                            backgroundColor: planBEnabled ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                                            borderColor: planBEnabled ? '#C5A059' : 'rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={planBEnabled}
                                                    onChange={(e) => onTogglePlanB(e.target.checked)}
                                                    className="w-5 h-5 rounded accent-amber-500"
                                                    style={{ accentColor: '#C5A059' }}
                                                />
                                                <div>
                                                    <span className="text-white font-medium text-sm">
                                                        🏠 {t('itinerary.card.activate_plan_b')}
                                                    </span>
                                                    <p className="text-white/70 text-xs">
                                                        {t('itinerary.card.plan_b_desc')}
                                                    </p>
                                                </div>
                                            </div>
                                            {planBEnabled && (
                                                <span className="text-xs px-2 py-1 rounded-full font-semibold"
                                                    style={{ backgroundColor: '#C5A059', color: '#1A1F2C' }}
                                                >
                                                    {t('itinerary.card.active')}
                                                </span>
                                            )}
                                        </label>

                                        {planBEnabled && (
                                            <div className="mt-2 pt-2 border-t border-white/20">
                                                <p className="text-xs text-white/80">
                                                    <strong>{t('itinerary.card.plan_b_label')}</strong> {getLocalized(planB.name)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Price & IVA */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                    <div>
                                        {currentActivity.isFree ? (
                                            <span className="text-2xl font-bold text-green-400">{t('itinerary.card.free')}</span>
                                        ) : (
                                            <>
                                                <span className="text-3xl font-bold text-white">
                                                    ${totalPrice.toLocaleString()}
                                                </span>
                                                <span className="text-white/60 text-sm ml-2">UYU</span>
                                            </>
                                        )}
                                        {isForeigner && !currentActivity.isFree && (
                                            <p className="text-xs mt-1" style={{ color: '#C5A059' }}>
                                                {t('itinerary.card.iva_savings', { savings: calculateIVA(totalPrice).toLocaleString() })}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={onRemove}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        {t('itinerary.card.change')}
                                    </button>
                                </div>

                                {/* Legal Disclaimer */}
                                <p className="text-white/50 text-xs mt-3 italic">
                                    {t('itinerary.card.legal_notice')}
                                </p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
