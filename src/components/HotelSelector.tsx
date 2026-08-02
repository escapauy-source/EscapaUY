import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { Hotel } from '@/types';
import { cn } from '@/utils/cn';
import { StarRating } from './StarRating';

interface HotelSelectorProps {
  hotels: Hotel[];
  selectedHotelId: string | null;
  onSelect: (hotel: Hotel) => void;
}

import { useTranslation } from 'react-i18next';

export function HotelSelector({ hotels, selectedHotelId, onSelect }: HotelSelectorProps) {
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

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-1 gap-4">
        {hotels.map((hotel, index) => (
          <motion.button
            key={hotel.id}
            onClick={() => onSelect(hotel)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
              selectedHotelId === hotel.id
                ? "border-ocean-500 bg-ocean-50 shadow-lg shadow-ocean-200"
                : "border-gray-200 bg-white hover:border-ocean-300"
            )}
          >
            <div className="flex gap-4 p-4">
              {/* Image */}
              <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={hotel.images[0]}
                  alt={getLocalized(hotel.name)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-playfair text-lg font-bold text-gray-900">
                      {getLocalized(hotel.name)}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {hotel.city}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StarRating rating={hotel.rating} size="sm" showText />
                    <span className="text-[10px] text-gray-400">({hotel.reviewsCount || 0} reseñas)</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {getLocalized(hotel.description)}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {hotel.amenities.slice(0, 3).map((amenity, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-ocean-100 text-ocean-700 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Price and Occupancy */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-playfair text-xl font-bold text-gray-900">
                      ${hotel.pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">/noche</span>
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {hotel.rooms - Math.round((hotel.currentOccupancy / hotel.rooms) * hotel.rooms)} habitaciones libres
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedHotelId === hotel.id && (
              <div className="h-1 bg-gradient-to-r from-ocean-500 to-ocean-600" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
