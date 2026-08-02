import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, Sparkles, Star } from 'lucide-react';
import { useItineraryStore, useDatesAsObjects, useIsForeigner } from '@/store/itineraryStore';
import { activities } from '@/data/mockData';
import { filterActivities, sortActivitiesByRelevance } from '@/utils/filterActivities';
import { getActivitiesForDay, filterActivitiesByTimeSlot } from '@/utils/proximity';
import { DualActivityCard } from '@/components/DualActivityCard';
import { DayHeader, TimelineSegment } from '@/components/Timeline';
import { ClimateStatusIndicator } from '@/components/ClimateStatusIndicator';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import type { TimeSlot, DayPeriod, ItineraryDayComplete } from '@/types';

// Day titles for luxury experience
const DAY_TITLES: Record<number, string> = {
  1: 'Inmersión en el Patrimonio',
  2: 'Sabores de la Campiña',
  3: 'Naturaleza y Relax',
  4: 'Explorando Tesoros Ocultos',
  5: 'Despedida con Estilo',
  6: 'Experiencias Extendidas',
  7: 'Último Día de Aventura',
};

// Mock weather data (in production, this would come from an API)
const mockWeather = {
  temp: 22,
  condition: 'sunny' as const,
  rainProbability: 20,
  humidity: 65,
  wind: 12,
};

export function ItineraryBuilderPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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

  // ==================== ZUSTAND STORE ====================
  const selectedHotel = useItineraryStore((state) => state.selectedHotel);
  const numberOfChildren = useItineraryStore((state) => state.numberOfChildren);
  const childrenAges = useItineraryStore((state) => state.childrenAges);
  const numberOfAdults = useItineraryStore((state) => state.numberOfAdults);
  const bigFiveScores = useItineraryStore((state) => state.bigFiveScores);
  const arrivalTime = useItineraryStore((state) => state.arrivalTime);
  const numberOfNights = useItineraryStore((state) => state.numberOfNights);
  const setItinerary = useItineraryStore((state) => state.setItinerary);
  const setDates = useItineraryStore((state) => state.setDates);
  const getTotalCost = useItineraryStore((state) => state.getTotalCost);

  // Get dates as Date objects (store persists as ISO strings)
  const { startDate, endDate } = useDatesAsObjects();

  // Check if user is foreigner (for tax display)
  const isForeigner = useIsForeigner();

  // Helper to determine if a slot is available based on arrival time
  const isSlotAvailable = (day: number, slot: TimeSlot) => {
    if (day > 1) return true;
    if (!arrivalTime) return true;

    if (arrivalTime === 'afternoon') {
      return slot !== 'morning';
    }
    if (arrivalTime === 'evening') {
      return slot === 'evening';
    }
    return true; // morning arrival can see all
  };

  const getInitialDayPeriods = (day: number): DayPeriod[] => {
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening'];
    return slots.map(slot => ({
      timeSlot: slot,
      activityId: null,
      isResting: !isSlotAvailable(day, slot), // Mark as resting if not available to not block completion
      planBActivityId: null,
      planBEnabled: false,
      weatherTriggered: false
    }));
  };

  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<ItineraryDayComplete[]>([]);
  const [currentDayPeriods, setCurrentDayPeriods] = useState<DayPeriod[]>(getInitialDayPeriods(1));

  // Set initial selected period based on arrival time if Day 1
  const getInitialSelectedPeriod = (): TimeSlot => {
    if (currentDay > 1 || !arrivalTime) return 'morning';
    if (arrivalTime === 'afternoon') return 'afternoon';
    if (arrivalTime === 'evening') return 'evening';
    return 'morning';
  };

  const [selectedPeriod, setSelectedPeriod] = useState<TimeSlot>(getInitialSelectedPeriod());
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [selectorTab, setSelectorTab] = useState<'ai' | 'all'>('ai');

  // Validation: Check if hotel is selected
  if (!selectedHotel) {
    console.error('[ZUSTAND_DEBUG] Missing selectedHotel for itinerary builder');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
            Hotel no seleccionado
          </h2>
          <p className="text-gray-600 mb-6">
            Por favor, completa tu perfil de viaje primero
          </p>
          <button
            onClick={() => navigate('/adn-viajero')}
            className="px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            Ir a ADN Viajero
          </button>
        </div>
      </div>
    );
  }

  // Get activities for current day (proximity-based)
  const availableActivities = getActivitiesForDay(activities, selectedHotel, currentDay);

  // Apply personalization filters
  const personalizedActivities = filterActivities(availableActivities, {
    hotel: selectedHotel,
    numberOfChildren,
    childrenAges,
    numberOfAdults,
    bigFiveScores,
    arrivalTime: (arrivalTime as 'morning' | 'afternoon' | 'evening') || 'afternoon',
  });

  // Sort by relevance
  const sortedActivities = sortActivitiesByRelevance(
    personalizedActivities,
    bigFiveScores,
    numberOfChildren,
    numberOfAdults
  );

  // Filter by selected time slot
  const activitiesForPeriod = filterActivitiesByTimeSlot(sortedActivities, selectedPeriod);

  // Sugerencias IA: top 3 actividades ya ordenadas por relevancia (Big Five) + sin precio excesivo
  const aiSuggestions = useMemo(() => {
    const alreadyUsedIds = new Set(
      currentDayPeriods.map(p => p.activityId).filter(Boolean)
    );
    return activitiesForPeriod
      .filter(a => !alreadyUsedIds.has(a.id))
      .slice(0, 3);
  }, [activitiesForPeriod, currentDayPeriods]);

  // Check if weather should trigger Plan B
  const shouldShowWeatherAlert = mockWeather.rainProbability >= 70;

  // Handle date range changes
  const handleDateChange = (start: Date | null, end: Date | null) => {
    console.log('[ZUSTAND_DEBUG] Date range changed:', { start, end });
    setDates(start, end);
  };

  // Validation: Check if current day is complete
  const isDayComplete = () => {
    return currentDayPeriods.every(
      (p) => p.activityId !== null || p.isResting === true
    );
  };

  // Get period data
  const getPeriodData = (timeSlot: TimeSlot) => {
    return currentDayPeriods.find((p) => p.timeSlot === timeSlot);
  };

  // Handle activity selection
  const handleSelectActivity = (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    console.log('[ZUSTAND_DEBUG] Activity selected:', getLocalized(activity.name), 'type:', activity.type);

    const updatedPeriods = currentDayPeriods.map((p) => {
      if (p.timeSlot === selectedPeriod) {
        // Check if activity is outdoor and needs Plan B
        const needsPlanB = activity.type === 'outdoor' && !activity.weatherResilient;
        const planBActivity = needsPlanB ? activities.find((a) => a.id === activity.planBAlternativeId) : undefined;

        console.log('[ZUSTAND_DEBUG] Activity details:', {
          needsPlanB,
          hasPlanB: !!planBActivity,
          planBEnabled: p.planBEnabled || false,
        });

        return {
          ...p,
          activityId,
          isResting: false,
          // Only set planBActivityId if Plan B is available
          planBActivityId: planBActivity?.id || null,
          // planBEnabled can be toggled by user later
          planBEnabled: p.planBEnabled || false,
          weatherTriggered: shouldShowWeatherAlert && needsPlanB,
        };
      }
      return p;
    });

    setCurrentDayPeriods(updatedPeriods);
    setShowActivitySelector(false);
  };

  // Handle rest selection
  const handleSelectRest = () => {
    const updatedPeriods = currentDayPeriods.map((p) => {
      if (p.timeSlot === selectedPeriod) {
        return {
          ...p,
          activityId: null,
          isResting: true,
          planBActivityId: null,
          planBEnabled: false,
          weatherTriggered: false,
        };
      }
      return p;
    });

    setCurrentDayPeriods(updatedPeriods);
    setShowActivitySelector(false);
  };

  // Handle remove selection
  const handleRemovePeriod = (timeSlot: TimeSlot) => {
    const updatedPeriods = currentDayPeriods.map((p) => {
      if (p.timeSlot === timeSlot) {
        return {
          ...p,
          activityId: null,
          isResting: false,
          planBActivityId: null,
          planBEnabled: false,
          weatherTriggered: false,
        };
      }
      return p;
    });

    setCurrentDayPeriods(updatedPeriods);
    setShowActivitySelector(false);
  };

  // Handle Plan B toggle
  const handleTogglePlanB = (timeSlot: TimeSlot, enabled: boolean) => {
    console.log('[ZUSTAND_DEBUG] Plan B toggled for', timeSlot, ':', enabled);

    const updatedPeriods = currentDayPeriods.map((p) => {
      if (p.timeSlot === timeSlot) {
        return { ...p, planBEnabled: enabled };
      }
      return p;
    });

    setCurrentDayPeriods(updatedPeriods);
  };

  // Handle next day / finish
  const handleNextDay = () => {
    if (!isDayComplete()) {
      console.warn('[ZUSTAND_DEBUG] Day not complete, cannot proceed');
      return;
    }

    console.log('[ZUSTAND_DEBUG] Day', currentDay, 'complete');

    const dayDate = startDate
      ? new Date(startDate.getTime() + (currentDay - 1) * 24 * 60 * 60 * 1000).toISOString()
      : new Date().toISOString();

    const newDay: ItineraryDayComplete = {
      dayNumber: currentDay,
      date: dayDate,
      periods: [...currentDayPeriods],
      location: selectedHotel.city,
    };

    const allDays = [...completedDays, newDay];
    setCompletedDays(allDays);

    if (currentDay < numberOfNights) {
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Move to next day
      const nextDay = currentDay + 1;
      console.log('[ZUSTAND_DEBUG] Moving to day:', nextDay);

      setCurrentDay(nextDay);
      setCurrentDayPeriods(getInitialDayPeriods(nextDay));
      setSelectedPeriod('morning');
      setShowActivitySelector(false);
    } else {
      // Finish - calculate total price using the new engine logic in store
      const totalPrice = getTotalCost();

      console.log('[ZUSTAND_DEBUG] Itinerary complete - saving to store');
      console.log('[ZUSTAND_DEBUG] Total price (PAX-based):', totalPrice);
      console.log('[ZUSTAND_DEBUG] Total days:', allDays.length);

      setItinerary({
        days: allDays,
        hotel: selectedHotel,
        totalPrice,
        createdAt: new Date().toISOString(),
      });

      navigate('/checkout');
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #f8f7f4 0%, #e8e6df 100%)',
      }}
    >
      {/* Subtle Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Date Picker */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-playfair text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                Diseña tu Experiencia
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-600">
                  Estadía en <span className="font-semibold text-gray-800">{getLocalized(selectedHotel.name)}</span>
                </p>
                <button
                  onClick={() => navigate('/adn-viajero?step=hotel')}
                  className="text-xs text-ocean-600 hover:text-ocean-800 underline underline-offset-2 transition-colors"
                >
                  Cambiar hotel
                </button>
              </div>
            </div>

            {/* Date Range Picker */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              minNights={1}
              maxNights={7}
            />
          </div>

          {/* Date Validation Message */}
          {(!startDate || !endDate) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-900">{t('itinerary.date_picker.select_title')}</h3>
                  <p className="text-sm text-amber-700">
                    {t('itinerary.date_picker.select_desc')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Climate Status Indicator */}
        <ClimateStatusIndicator
          rainProbability={mockWeather.rainProbability}
          temperature={mockWeather.temp}
          condition={mockWeather.condition}
          isPlanBActive={shouldShowWeatherAlert}
        />

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Timeline Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h2 className="font-playfair text-2xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
                Tu Itinerario
              </h2>

              {Array.from({ length: numberOfNights }).map((_, dayIndex) => {
                const dayNum = dayIndex + 1;
                return (
                  <div key={dayNum} className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Día {dayNum}
                    </p>
                    {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                      const available = isSlotAvailable(dayNum, slot);
                      if (!available) return null; // Ocultar si no está disponible

                      const isCompleted = dayNum < currentDay ||
                        (dayNum === currentDay && (getPeriodData(slot)?.activityId !== null || getPeriodData(slot)?.isResting || false));
                      const isActive = dayNum === currentDay && selectedPeriod === slot;

                      return (
                        <TimelineSegment
                          key={`${dayNum}-${slot}`}
                          dayNumber={dayNum}
                          dayTitle={DAY_TITLES[dayNum] || `Día ${dayNum}`}
                          timeSlot={slot}
                          isCompleted={isCompleted}
                          isActive={isActive}
                          onClick={() => {
                            if (dayNum === currentDay) {
                              setSelectedPeriod(slot);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {/* Next Day Button */}
              <button
                onClick={handleNextDay}
                disabled={!isDayComplete()}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-6',
                  isDayComplete()
                    ? 'bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {currentDay < numberOfNights ? (
                  <>
                    Continuar al Día {currentDay + 1}
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Finalizar y Pagar
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Content - Current Day */}
          <div className="lg:col-span-3">
            {/* Day Header */}
            <DayHeader
              dayNumber={currentDay}
              dayTitle={DAY_TITLES[currentDay] || `Día ${currentDay}`}
              location={selectedHotel.city}
              isCurrentDay={true}
            />

            {/* Period Cards */}
            <div className="space-y-8">
              {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                const available = isSlotAvailable(currentDay, slot);
                if (!available) return null; // Ocultar si no está disponible

                const periodData = getPeriodData(slot);
                const isActive = selectedPeriod === slot;

                const planA = periodData?.activityId
                  ? activities.find(a => a.id === periodData.activityId) || null
                  : null;

                const planB = periodData?.planBActivityId
                  ? activities.find(a => a.id === periodData.planBActivityId) || null
                  : null;

                return (
                  <div
                    key={slot}
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "scale-100" : "scale-95 opacity-60"
                    )}
                    onClick={() => setSelectedPeriod(slot)}
                  >
                    <DualActivityCard
                      planA={planA}
                      planB={planB}
                      timeSlot={slot}
                      isResting={periodData?.isResting || false}
                      weatherTriggered={periodData?.weatherTriggered || false}
                      isForeigner={isForeigner}
                      planBEnabled={periodData?.planBEnabled || false}
                      onSelectActivity={handleSelectActivity}
                      onSelectRest={handleSelectRest}
                      onRemove={() => handleRemovePeriod(slot)}
                      onOpenSelector={() => {
                        setSelectedPeriod(slot);
                        setShowActivitySelector(true);
                      }}
                      onTogglePlanB={(enabled) => handleTogglePlanB(slot, enabled)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Activity Selector Modal */}
            {showActivitySelector && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowActivitySelector(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-playfair font-bold">Elegí tu actividad</h3>
                    <button onClick={() => setShowActivitySelector(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-5">
                    <button
                      onClick={() => setSelectorTab('ai')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                        selectorTab === 'ai'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                      Sugerencias IA
                    </button>
                    <button
                      onClick={() => setSelectorTab('all')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                        selectorTab === 'all'
                          ? 'bg-gray-800 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      Todas las actividades
                    </button>
                  </div>

                  {/* IA Suggestions Tab */}
                  {selectorTab === 'ai' && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <p className="text-sm text-purple-700">
                          Seleccionadas por la IA según tu perfil de viaje. Elegí una para agregarla a tu itinerario y presupuesto.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiSuggestions.length === 0 ? (
                          <p className="text-gray-500 col-span-3 text-center py-8">No hay sugerencias disponibles para este período.</p>
                        ) : aiSuggestions.map((activity, idx) => (
                          <button
                            key={activity.id}
                            onClick={() => { handleSelectActivity(activity.id); setSelectorTab('ai'); }}
                            className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left relative group"
                          >
                            {idx === 0 && (
                              <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                <Star className="w-3 h-3" /> Top IA
                              </div>
                            )}
                            <img
                              src={activity.images[0]}
                              alt={getLocalized(activity.name)}
                              className="w-full h-28 object-cover rounded-lg mb-3"
                            />
                            <p className="font-semibold text-gray-900">{getLocalized(activity.name)}</p>
                            <p className="text-xs text-gray-500 mb-2">{activity.partnerName}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold" style={{ color: '#C5A059' }}>
                                {activity.price > 0 ? `$${activity.price.toLocaleString()}` : 'Gratis'}
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs",
                                activity.type === 'outdoor' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                              )}>
                                {activity.type === 'outdoor' ? 'Outdoor' : 'Indoor'}
                              </span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-purple-100 text-xs text-purple-600 font-semibold group-hover:text-purple-800">
                              ✓ Agregar al itinerario y presupuesto →
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Activities Tab */}
                  {selectorTab === 'all' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activitiesForPeriod.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => handleSelectActivity(activity.id)}
                          className="p-4 border-2 border-gray-200 rounded-xl hover:border-ocean-400 hover:bg-ocean-50/50 transition-all text-left"
                        >
                          <img
                            src={activity.images[0]}
                            alt={getLocalized(activity.name)}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <p className="font-semibold text-gray-900">{getLocalized(activity.name)}</p>
                          <p className="text-sm text-gray-600">{activity.partnerName}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-lg font-bold" style={{ color: '#C5A059' }}>
                              ${activity.price}
                            </span>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              activity.type === 'outdoor' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {activity.type === 'outdoor' ? 'Outdoor' : 'Indoor'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* DEBUG */}
      <div className="fixed bottom-4 left-4 p-3 bg-gray-900 text-white text-xs rounded-lg max-w-xs">
        <p>Day: {currentDay}/{numberOfNights}</p>
        <p>Dates: {startDate ? startDate.toLocaleDateString() : 'Not set'} - {endDate ? endDate.toLocaleDateString() : 'Not set'}</p>
        <p>Complete: {isDayComplete() ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
