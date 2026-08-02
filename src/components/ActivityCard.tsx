import { Link } from 'react-router-dom';
import { Sun, Umbrella, MapPin, Info } from 'lucide-react';
import { Activity } from '@/types';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';
import { StarRating } from './StarRating';
import { PriceDisplay } from './PriceDisplay';
import { useCurrency } from '@/hooks/useCurrency';
import { ImageWithFallback } from './ui/ImageWithFallback';

import { useState } from 'react';
// translateText and getTranslatedContent removed as they are no longer used

interface ActivityCardProps {
  activity: Activity;
  showPlanB?: boolean;
  isAlternative?: boolean;
}

export function ActivityCard({ activity, showPlanB = true, isAlternative = false }: ActivityCardProps) {
  const { t, i18n } = useTranslation();
  const { isNonResident } = useCurrency(); // Removed unused exchangeRate, currency

  const isEnglish = i18n.language === 'en';

  // 1. Resolve Content from Object Structure (Deep Refactor)
  const currentLang = (i18n.language?.split('-')[0] || 'es');

  // Helper to safely extract string from LocalizedString or string
  const getLocalized = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      return content[currentLang] || content['es'] || content['en'] || JSON.stringify(content);
    }
    return String(content);
  };

  const displayName = getLocalized(activity.name);
  const displayDescription = getLocalized(activity.description);
  const displayCategory = getLocalized(activity.category);

  // Legacy dynamic content state removed as per new architecture requirements.



  // Deposit Logic (15% Web / 85% Local)
  const originalPrice = activity.price;

  const IVA_RATE = 0.22;
  const taxFreePrice = originalPrice / (1 + IVA_RATE);

  const baseAmount = isNonResident ? taxFreePrice : originalPrice;
  const depositAmount = baseAmount * 0.15;
  const localBalance = baseAmount * 0.85;

  return (
    <Link
      to={`/actividad/${activity.id}`}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border relative",
        isAlternative ? "border-ocean-200 bg-ocean-50/30" : "border-gray-100"
      )}
    >
      {/* Trust Badge at Top Right */}
      <div className="absolute top-0 right-0 z-20 bg-[#2D2D2D] text-[#D4AF37] text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
        {t('activity_card.guaranteed_badge', 'Garantizado por EscapaUY')}
      </div>

      {/* Image Container 16:9 Aspect Ratio */}
      <div className="relative aspect-video overflow-hidden">
        {/* Resilience Badge (Left) - Interactive Tooltip */}
        <div className="absolute top-3 left-3 z-30 group/tooltip">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-help transition-all hover:scale-105",
            activity.weatherResilient
              ? "bg-ocean-500 text-white"
              : "bg-white text-gray-900"
          )}>
            {activity.weatherResilient ? <Umbrella className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {activity.weatherResilient ? t('activity_card.plan_b', 'Indoor / Plan B') : t('activity_card.plan_a', 'Outdoor')}
          </div>

          {/* Tooltip Content */}
          <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 shadow-xl z-40">
            {activity.weatherResilient
              ? t('activity_card.tooltip_resilient', 'Actividad segura contra lluvia. ¡Tu plan no se cancela!')
              : t('activity_card.tooltip_outdoor', 'Actividad al aire libre. Sujeta a condiciones climáticas.')
            }
          </div>
        </div>

        {/* Main Image */}
        <ImageWithFallback
          src={activity.images[0]}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Plan B Overlay (Hover Reveal) */}
        {showPlanB && activity.planBAlternativeId && !activity.weatherResilient && (
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/95 via-ocean-900/80 to-transparent flex flex-col items-center justify-end text-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] pointer-events-none pb-8 translate-y-4 group-hover:translate-y-0">
            <div className="bg-white/10 p-3 rounded-full mb-3 backdrop-blur-md">
              <Umbrella className="w-6 h-6 text-sky-200" />
            </div>
            <h4 className="text-white font-playfair font-bold text-lg mb-2">{t('activity_card.resilience_title', 'Garantía de Clima')}</h4>
            <p className="text-sky-100 text-xs leading-relaxed max-w-[200px]">
              {t('activity_card.resilience_desc', 'Si llueve, activamos automáticamente tu Plan B en interior.')}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header: Name + Category */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-ocean-600 uppercase tracking-wider mb-0.5 block">
                {t(`categories.${displayCategory}`, displayCategory)}
              </span>
              <h3 className="font-playfair text-lg font-bold text-gray-900 group-hover:text-ocean-600 transition-colors line-clamp-1">
                {displayName}
              </h3>
            </div>
            <StarRating rating={activity.rating} size="sm" />
          </div>
        </div>

        {/* Identity & Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100">
          <MapPin className="w-3.5 h-3.5 text-ocean-500" />
          <span className="font-medium text-gray-700">{activity.partnerName || "Partner Verificado"}</span>
          <span className="text-gray-300 mx-1">•</span>
          <span>{activity.city || "Colonia del Sacramento"}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed h-[2.5em]">
          {displayDescription}
        </p>

        {/* Pricing & Deposit Breakdown */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">{t('activity_card.total_price', 'Precio Total')}</span>
            <PriceDisplay amount={originalPrice} />
          </div>

          {/* Split Breakdown */}
          <div className="flex gap-2 mt-2">
            <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-1">
              <p className="text-[9px] text-gray-400 uppercase font-bold">{t('activity_card.deposit', 'Seña Web (15%)')}</p>
              <PriceDisplay amount={depositAmount} showTaxBenefit={false} className="text-xs" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-1">
              <p className="text-[9px] text-gray-400 uppercase font-bold">{t('activity_card.balance', 'Saldo Local (85%)')}</p>
              <PriceDisplay amount={localBalance} showTaxBenefit={false} className="text-xs text-gray-700" />
            </div>
          </div>

          {/* Fiscal Benefit Warning (System Order Restriction) */}
          {isNonResident && (
            <div className="mt-2 text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" />
              <span>{t('activity_card.tax_benefit_info', 'IVA CERO incluido para no residentes')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
