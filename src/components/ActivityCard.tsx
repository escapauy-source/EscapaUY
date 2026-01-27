import { Link } from 'react-router-dom';
import { Clock, Users, Sun, Umbrella, MapPin, AlertCircle } from 'lucide-react';
import { Activity } from '@/types';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';
import { StarRating } from './StarRating';

interface ActivityCardProps {
  activity: Activity;
  showPlanB?: boolean;
  isAlternative?: boolean;
}

export function ActivityCard({ activity, showPlanB = true, isAlternative = false }: ActivityCardProps) {
  const { t } = useTranslation();
  const occupancyPercent = (activity.currentOccupancy / activity.capacity) * 100;
  const occupancyStatus = occupancyPercent > 80 ? 'high' : occupancyPercent > 50 ? 'medium' : 'low';

  const occupancyColors = {
    low: 'bg-nature-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };

  return (
    <Link
      to={`/actividad/${activity.id}`}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border",
        isAlternative ? "border-ocean-200 bg-ocean-50/30" : "border-gray-100"
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.images[0]}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Weather Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
          activity.weatherResilient
            ? "bg-ocean-500 text-white"
            : "bg-amber-400 text-amber-900"
        )}>
          {activity.weatherResilient ? (
            <>
              <Umbrella className="w-3.5 h-3.5" />
              Indoor
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5" />
              Outdoor
            </>
          )}
        </div>

        {/* Plan B indicator */}
        {isAlternative && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-ocean-600 text-white rounded-full text-xs font-medium">
            Plan B
          </div>
        )}

        {/* Capacity indicator */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{activity.capacity - activity.currentOccupancy} {t('activity_card.available')}</span>
          <span className={cn("w-2 h-2 rounded-full", occupancyColors[occupancyStatus])} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-playfair text-lg font-semibold text-gray-900 group-hover:text-ocean-600 transition-colors">
            {activity.name}
          </h3>
          <div className="flex flex-col items-end">
            <StarRating rating={activity.rating} size="sm" showText />
            {activity.reviewsCount && (
              <span className="text-[10px] text-gray-400">({activity.reviewsCount} reseñas)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{activity.partnerName}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {activity.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {activity.duration}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900">${activity.price.toLocaleString()}</span>
            <span className="text-sm text-gray-500"> UYU</span>
          </div>
        </div>

        {/* Plan B Alternative hint */}
        {showPlanB && activity.planBAlternativeId && !activity.weatherResilient && (
          <div className="mt-3 p-2 bg-ocean-50 rounded-lg flex items-center gap-2 text-xs text-ocean-700">
            <Umbrella className="w-4 h-4" />
            <span>{t('activity_card.plan_b_hint')}</span>
          </div>
        )}
      </div>

      {/* Legal Disclaimer */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-gray-400 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {t('activity_card.legal')}
        </p>
      </div>
    </Link>
  );
}
