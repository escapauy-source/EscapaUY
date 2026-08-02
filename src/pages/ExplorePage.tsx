import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Umbrella, Sparkles, CheckCircle, Heart, Compass } from 'lucide-react';
import { ActivityCard } from '@/components/ActivityCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useTranslation } from 'react-i18next';
import { useActivities } from '@/hooks/useActivities';
import { useCurrency } from '@/hooks/useCurrency';
import { useItineraryStore } from '@/store/itineraryStore';
import {
  filterActivities,
  sortActivitiesByRelevance,
  groupActivitiesByCategory,
} from '@/utils/filterActivities';
import { cn } from '@/utils/cn';



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
  // ============ ZUSTAND STORE & HOOKS ====================
  const { t } = useTranslation();
  const { isNonResident, toggleNonResident } = useCurrency(); // Global hook
  const bigFiveScores = useItineraryStore((state) => state.bigFiveScores);
  const selectedHotel = useItineraryStore((state) => state.selectedHotel);
  const numberOfChildren = useItineraryStore((state) => state.numberOfChildren);
  const childrenAges = useItineraryStore((state) => state.childrenAges);
  const numberOfAdults = useItineraryStore((state) => state.numberOfAdults);
  const arrivalTime = useItineraryStore((state) => state.arrivalTime);

  // ==================== LOCAL STATE ====================
  const { activities, loading, error } = useActivities();
  const [tripContext, setTripContext] = useState<'all' | 'solo' | 'couple' | 'family' | 'friends'>('all');
  const [pace, setPace] = useState<'all' | 'zen' | 'dynamic' | 'adventure'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock weather data (dynamic trigger)
  const showRainWarning = mockWeather.rainProbability >= 70;

  // Filtrar actividades base (Hotel + Kids + Personality)
  const personalizedActivities = filterActivities(activities, {
    hotel: selectedHotel || null,
    numberOfChildren,
    childrenAges,
    numberOfAdults,
    bigFiveScores,
    arrivalTime: (arrivalTime as 'morning' | 'afternoon' | 'evening') || 'afternoon',
  });

  // Ordenar por relevancia
  let processedActivities = sortActivitiesByRelevance(
    personalizedActivities,
    bigFiveScores,
    numberOfChildren,
    numberOfAdults
  );

  // Climate Orchestration: Prioritize Indoor if Rain > 70%
  if (showRainWarning) {
    processedActivities = [...processedActivities].sort((a, b) => {
      // Prioritize resilient/indoor activities
      if (a.weatherResilient && !b.weatherResilient) return -1;
      if (!a.weatherResilient && b.weatherResilient) return 1;
      return 0;
    });
  }

  // Aplicar Filtros Psicométricos y de Búsqueda
  const filtered = processedActivities.filter(activity => {
    // 1. Text Search
    const searchLower = searchQuery.toLowerCase();
    const nameEs = typeof activity.name === 'object' ? activity.name.es : activity.name;
    const nameEn = typeof activity.name === 'object' ? activity.name.en : activity.name;
    const matchesSearch = searchQuery === '' ||
      nameEs.toLowerCase().includes(searchLower) ||
      nameEn.toLowerCase().includes(searchLower) ||
      activity.partnerName.toLowerCase().includes(searchLower) ||
      activity.category.toLowerCase().includes(searchLower);

    // 2. Trip Context Filter
    let matchesContext = true;
    if (tripContext === 'family') matchesContext = activity.kidsFriendly || false;
    if (tripContext === 'couple') matchesContext = activity.category === 'restaurante' || activity.category === 'experiencia' || activity.category === 'bodega';

    // 3. Pace Filter (Ritmo) mapping to Activity Categories/Tags
    let matchesPace = true;
    if (pace === 'zen') matchesPace = ['spa', 'yoga', 'playa', 'parque', 'paseo'].some(tag => activity.category.includes(tag) || (typeof activity.name === 'object' ? activity.name.es : activity.name).toLowerCase().includes(tag));
    if (pace === 'adventure') matchesPace = ['bodega', 'experiencia', 'evento'].includes(activity.category);
    if (pace === 'dynamic') matchesPace = !['piscina', 'spa'].includes(activity.category); // Exclude very static things

    return matchesSearch && matchesContext && matchesPace;
  });

  // Agrupar por categoría
  const groupedActivities = groupActivitiesByCategory(filtered);
  const totalActivities = filtered.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        Error cargando actividades: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0c4a6e] to-[#075985] text-white pt-8 pb-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Flex */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="font-playfair text-4xl font-bold mb-2 tracking-tight">
                Explorando Colonia
              </h1>
              <p className="text-[#e0f2fe] max-w-lg text-lg hidden sm:block">
                Descubre actividades curadas para tu estilo de viaje.
                La inteligencia artificial adapta las opciones al clima y a tu perfil.
              </p>
            </div>

            {/* Weather Widget */}
            <div className="glass-panel bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl max-w-xs">
              <WeatherWidget showDetails />
              {showRainWarning && (
                <div className="mt-3 text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded border border-amber-500/30 flex items-center gap-1">
                  <Umbrella className="w-3 h-3" />
                  <span>Plan B activado por lluvia</span>
                </div>
              )}
            </div>
          </div>

          {/* Search & Main Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar bodegas, paseos, experiencias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-[#7dd3fc] border-none outline-none text-lg"
              />
            </div>

            {/* Turista Extranjero Toggle */}
            <button
              onClick={toggleNonResident}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 border shadow-lg group",
                isNonResident
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-white/10 border-white/20 text-ocean-100 hover:bg-white/20"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isNonResident ? "border-white bg-white" : "border-ocean-200"
              )}>
                {isNonResident && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-medium opacity-80">{t('explore.foreign_tourist', 'Soy Turista Extranjero')}</span>
                <span className="block text-sm font-bold">{t('explore.min_iva', 'Ver Precios sin IVA')}</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Filters Section (Sticky) */}
      <section className="sticky top-16 md:top-0 z-30 bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Psychometric Filters */}
            <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">

              {/* Context Selector (Viaje) */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-medium text-gray-500 mr-1">{t('explore.travel_style', 'Estilo:')}</span>
                <div className="flex gap-2">
                  {['all', 'couple', 'family', 'friends'].map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => setTripContext(ctx as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                        tripContext === ctx
                          ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-500 hover:border-rose-100 hover:text-rose-600"
                      )}
                    >
                      {t(`explore.context.${ctx}`, ctx === 'all' ? 'Todos' : ctx === 'couple' ? 'Pareja' : ctx === 'family' ? 'Familia' : 'Amigos')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

              {/* Pace Selector (Ritmo) */}
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-500 mr-1">{t('explore.pace', 'Ritmo:')}</span>
                <div className="flex gap-2">
                  {['all', 'zen', 'dynamic', 'adventure'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPace(p as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                        pace === p
                          ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-500 hover:border-amber-100 hover:text-amber-600"
                      )}
                    >
                      {t(`explore.pace_label.${p}`, p === 'all' ? 'Cualquiera' : p)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 whitespace-nowrap hidden sm:block">
              Mostrando <strong>{totalActivities}</strong> experiencias
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[50vh]">
        {totalActivities > 0 ? (
          <div className="space-y-16">
            {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-playfair text-3xl font-bold text-gray-900 capitalize">
                    {t(`explore.categories.${category}`)}
                  </h2>
                  <div className="h-px bg-gray-200 flex-grow"></div>
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{categoryActivities.length} opciones</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryActivities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <ActivityCard
                        activity={activity}
                      // isForeignTourist prop removed; handled internally by card
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No encontramos experiencias exactas
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Intenta ajustar los filtros de ritmo o contexto para ver más opciones en Colonia.
            </p>
            <button
              onClick={() => { setTripContext('all'); setPace('all'); setSearchQuery(''); }}
              className="mt-6 text-ocean-600 font-medium hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </section>

      {/* Floating Action Button (Itinerary) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/itinerary-builder')}
        className="fixed bottom-8 right-8 bg-ocean-600 text-white rounded-full px-6 py-4 shadow-2xl hover:bg-ocean-700 transition-colors flex items-center gap-3 z-50 border-2 border-white/20"
      >
        <span className="bg-white text-ocean-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {totalActivities > 0 ? '+' : '0'}
        </span>
        <span className="font-bold tracking-wide">Mi Maleta</span>
      </motion.button>
    </div>
  );
}
