
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ItineraryOption {
    id: string;
    title: string;
    description: string;
    hotel: {
        name: string | { es: string; en: string };
        city: string;
        images: string[];
        image?: string;
    };
    activities: any[];
    totalPrice: number;
    originalPrice: number;
    savings: number;
    badge?: string;
}

interface ItinerarySelectionStepProps {
    options: ItineraryOption[];
    onSelect: (option: ItineraryOption) => void;
    onBack: () => void;
    currency: 'UYU' | 'USD';
}

export const ItinerarySelectionStep: React.FC<ItinerarySelectionStepProps> = ({
    onSelect,
    options,
    currency,
    onBack
}) => {
    const { t, i18n } = useTranslation();
    const currencySymbol = currency === 'USD' ? 'U$S' : '$';
    const exchangeRate = 42;

    const formatPrice = (price: number) => {
        // If currency is USD, assuming input price is in UYU (from generator)
        const val = currency === 'USD' ? price / exchangeRate : price;
        return `${currencySymbol} ${Math.round(val).toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-2">{t('adn.weDesigned', 'Hemos diseñado')} {options.length} {t('adn.experiencesForYou', 'experiencias para ti')}</h2>
                <p className="text-gray-500">{t('adn.aiOptimized', 'La IA ha optimizado tu presupuesto y preferencias. Elige tu viaje ideal.')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {options.map((opt) => (
                    <motion.div
                        key={opt.id}
                        whileHover={{ y: -5 }}
                        className={`border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative flex flex-col ${opt.id === 'discovery' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                            }`}
                    >
                        {opt.badge && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                                {opt.badge}
                            </div>
                        )}

                        <div className="h-40 bg-gray-200 relative overflow-hidden group">
                            {/* Collage Effect logic fix */}
                            {(() => {
                                const validActivities = opt.activities?.flatMap(d => Object.values(d) as any[])
                                    .filter(a => a.activity && !a.resting && a.activity.images && a.activity.images.length > 0) || [];

                                if (validActivities.length > 0) {
                                    return (
                                        <div className="grid grid-cols-2 h-full">
                                            {validActivities.slice(0, 2).map((a, i) => (
                                                <img key={i} src={a.activity.images[0]} alt="" className="w-full h-full object-cover" />
                                            ))}
                                            {/* If only 1 activity, fill second slot with hotel or same activity zoomed? Let's just use hotel as filler if needed or span full */}
                                            {validActivities.length === 1 && (
                                                <img src={opt.hotel.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    );
                                } else {
                                    // Fallback to Hotel Image
                                    return (
                                        <img src={opt.hotel.images?.[0] || ''} alt={typeof opt.hotel.name === 'string' ? opt.hotel.name : opt.hotel.name.es} className="w-full h-full object-cover" />
                                    );
                                }
                            })()}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                                <div>
                                    <p className="text-white font-bold text-xl leading-tight mb-1">{opt.title}</p>
                                    <div className="flex items-center gap-1 text-white/90 text-xs">
                                        <Building2 className="w-3 h-3" />
                                        <span className="truncate max-w-[200px]">{typeof opt.hotel.name === 'string' ? opt.hotel.name : opt.hotel.name.es}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <p className="text-sm text-gray-500 mb-4">{opt.description}</p>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{typeof opt.hotel.name === 'string' ? opt.hotel.name : opt.hotel.name.es}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span>
                                        {opt.activities.reduce((acc: number, day: any) =>
                                            acc + Object.values(day).filter((v: any) => v.activityId && !v.resting).length
                                            , 0)} {t('adn.experiences', 'Experiencias')}
                                    </span>
                                </div>
                                {/* Activity List Preview */}
                                <div className="text-xs text-gray-500 space-y-1 pl-1">
                                    {opt.activities?.flatMap(d => Object.values(d) as any[])
                                        .filter(a => a.activity && !a.resting)
                                        .slice(0, 3)
                                        .map((a, idx) => (
                                            <div key={idx} className="flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                                                <span className="truncate">{typeof a.activity.name === 'string' ? a.activity.name : a.activity.name.es}</span>
                                            </div>
                                        ))}
                                </div>
                                {opt.savings > 0 && (
                                    <div className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center justify-center gap-1">
                                        <span>💰 {t('adn.taxSavings', 'Ahorro Fiscal:')} {formatPrice(opt.savings)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">{t('adn.totalInvestment', 'Inversión Total')}</p>
                                        {opt.originalPrice > opt.totalPrice && (
                                            <p className="text-xs text-gray-400 line-through">{formatPrice(opt.originalPrice)}</p>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{formatPrice(opt.totalPrice)}</p>
                                </div>

                                <button
                                    onClick={() => onSelect(opt)}
                                    className={`w-full py-3 rounded-xl font-bold transition-colors ${opt.id === 'discovery'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {t('adn.chooseOption', 'Elegir esta Opción')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center mt-6">
                <button onClick={onBack} className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-800">
                    <ArrowLeft className="w-4 h-4" /> {t('adn.backAndAdjust', 'Volver y ajustar preferencias')}
                </button>
            </div>
        </div>
    );
};
