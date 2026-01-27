import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Sun, Umbrella, MapPin, Sparkles, CheckCircle } from 'lucide-react';
import { ActivityCard } from '@/components/ActivityCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useTranslation } from 'react-i18next';
import { activities } from '@/data/mockData';
import { useItineraryStore } from '@/store/itineraryStore';
import {
  filterActivities,
  sortActivitiesByRelevance,
  groupActivitiesByCategory,
  filterActivitiesByTime
} from '@/utils/filterActivities';
import { cn } from '@/utils/cn';

type FilterType = 'all' | 'indoor' | 'outdoor';
type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening';

// Mock weather data (in production, from API)
const mockWeather = {
  temp: 22,
  condition: 'sunny' as const,
  rainProbability: 20,
  humidity: 65,
  wind: 12,
};

export function ExplorePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ==================== ZUSTAND STORE ====================
  const bigFiveScores = useItineraryStore((state) => state.bigFiveScores);
  const selectedHotel = useItineraryStore((state) => state.selectedHotel);
  const numberOfChildren = useItineraryStore((state) => state.numberOfChildren);
  const childrenAges = useItineraryStore((state) => state.childrenAges);
  const numberOfAdults = useItineraryStore((state) => state.numberOfAdults);
  const arrivalTime = useItineraryStore((state) => state.arrivalTime);

  // Guard: if no hotel selected, show message
  if (!selectedHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-amber-200">
          <MapPin className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('explore.no_hotel_title')}</h2>
          <p className="text-gray-600 mb-4">{t('explore.no_hotel_desc')}</p>
          <button onClick={() => navigate('/')} className="inline-block px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700">
            {t('explore.back_home')}
          </button>
        </div>
      </div>
    );
  }

  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar actividades según perfil del usuario
  const personalizedActivities = filterActivities(activities, {
    hotel: selectedHotel,
    numberOfChildren,
    childrenAges,
    numberOfAdults,
    bigFiveScores,
    arrivalTime: (arrivalTime as 'morning' | 'afternoon' | 'evening') || 'afternoon',
  });

  // Ordenar por relevancia (personalidad + disponibilidad)
  const sortedActivities = sortActivitiesByRelevance(
    personalizedActivities,
    bigFiveScores,
    numberOfChildren,
    numberOfAdults
  );

  // Aplicar filtros adicionales (tipo, hora, búsqueda)
  let filtered = sortedActivities.filter(activity => {
    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'indoor' && activity.type === 'indoor') ||
      (typeFilter === 'outdoor' && activity.type === 'outdoor');

    const matchesTime = timeFilter === 'all' || activity.bestTime === 'any' || activity.bestTime === timeFilter;

    const matchesSearch = searchQuery === '' ||
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesTime && matchesSearch;
  });

  // Agrupar por categoría para mejor presentación
  const groupedActivities = groupActivitiesByCategory(filtered);

  const showRainWarning = mockWeather.rainProbability >= 70;
  const totalActivities = filtered.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
                {t('explore.title')}
              </h1>
              <p className="text-ocean-100 max-w-xl">
                {t('explore.subtitle')}
                {bigFiveScores && (
                  <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-ocean-500/30 rounded-full text-sm">
                    <Sparkles className="w-3 h-3" />
                    {t('explore.personalized')}
                  </span>
                )}
              </p>

              {/* Hotel Selection Info */}
              {selectedHotel && (
                <div className="mt-4 p-3 bg-ocean-500/20 rounded-lg border border-ocean-300/30 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ocean-200" />
                  <div>
                    <p className="text-sm text-ocean-100">Ubicación del hotel:</p>
                    <p className="font-semibold text-white">{selectedHotel.name} - {selectedHotel.city}</p>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mt-6 relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('explore.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-ocean-300"
                />
              </div>
            </div>

            <div className="lg:w-80">
              <WeatherWidget showDetails />
            </div>
          </div>
        </div>
      </section>

      {/* Weather Alert */}
      {showRainWarning && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Umbrella className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">
                  {t('explore.weather_alert.title')}
                </p>
                <p className="text-sm text-amber-700">
                  {t('explore.weather_alert.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Type & Time Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      typeFilter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                    )}
                  >
                    {t('explore.filters.all')}
                  </button>
                  <button
                    onClick={() => setTypeFilter('outdoor')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      typeFilter === 'outdoor' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                    )}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    {t('explore.filters.outdoor')}
                  </button>
                  <button
                    onClick={() => setTypeFilter('indoor')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      typeFilter === 'indoor' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                    )}
                  >
                    <Umbrella className="w-4 h-4 text-ocean-500" />
                    {t('explore.filters.indoor')}
                  </button>
                </div>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">{t('explore.filters.time_label')}</span>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  {['all', 'morning', 'afternoon', 'evening'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeFilter(time as TimeFilter)}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        timeFilter === time ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                      )}
                    >
                      {time === 'all' ? t('explore.filters.all') : t(`explore.filters.${time}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('explore.filters.search_alt')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-ocean-300 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info Bar */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📍 {t('explore.info_bar.showing')} <span className="font-semibold">{totalActivities}</span> {t('explore.info_bar.activities')}
              {selectedHotel && <span> {t('explore.info_bar.for')} <strong>{selectedHotel.city}</strong></span>}
              {numberOfChildren > 0 && <span> {t('explore.info_bar.children_filter')}</span>}
              {bigFiveScores && <span> {t('explore.info_bar.profile_filter')}</span>}
            </p>
          </div>

          {totalActivities > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
                >
                  {/* Category Header */}
                  <div className="mb-6">
                    <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-2 capitalize">
                      {t(`explore.categories.${category}`)}
                    </h2>
                    <p className="text-gray-600">{categoryActivities.length} {t('explore.categories.available')}</p>
                  </div>

                  {/* Activities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryActivities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <ActivityCard activity={activity} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('explore.empty.title')}
              </h3>
              <p className="text-gray-500">
                {t('explore.empty.desc')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/itinerary-builder')}
        className="fixed bottom-8 right-8 bg-ocean-600 text-white rounded-full p-4 shadow-lg hover:bg-ocean-700 transition-colors flex items-center gap-2"
      >
        <CheckCircle className="w-6 h-6" />
        <span className="hidden sm:inline font-semibold">{t('explore.cta_itinerary')}</span>
      </motion.button>
    </div>
  );
}
