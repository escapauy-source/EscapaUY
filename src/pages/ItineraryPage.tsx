import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, MapPin, Sun, Umbrella, CloudRain,
  Check, ChevronRight, Share2, Download
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { activities } from '@/data/mockData';
import { cn } from '@/utils/cn';

export function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const { weather, bigFiveScores, travelGroup } = useApp();

  // Generate a mock itinerary based on profile
  const generateItinerary = () => {
    const blocks = [
      {
        id: 'b1',
        time: '10:00',
        planA: activities.find(a => a.id === 'a3')!, // Tour Histórico
        planB: activities.find(a => a.id === 'a4'), // Taller Azulejos
        isActive: true,
        weatherTriggered: weather.rainProbability >= 70,
      },
      {
        id: 'b2',
        time: '13:00',
        planA: activities.find(a => a.id === 'a6')!, // Almuerzo Gourmet
        planB: undefined,
        isActive: false,
        weatherTriggered: false,
      },
      {
        id: 'b3',
        time: '16:00',
        planA: activities.find(a => a.id === 'a2')!, // Paseo Viñedos
        planB: activities.find(a => a.id === 'a1'), // Cata Premium
        isActive: false,
        weatherTriggered: weather.forecast.find(f => f.time === '16:00')?.rainProbability! >= 70,
      },
    ];
    return blocks;
  };

  const itineraryBlocks = generateItinerary();
  const itineraryDate = new Date().toLocaleDateString('es-UY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hasWeatherAlert = itineraryBlocks.some(b => b.weatherTriggered);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-ocean-100 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-3xl font-bold mb-2">
                Tu Itinerario Personalizado
              </h1>
              <p className="text-ocean-100 capitalize">{itineraryDate}</p>
              {travelGroup && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-ocean-500/30 rounded-full text-sm">
                  {travelGroup === 'solo' ? '👤 Viaje Solo' : 
                   travelGroup === 'couple' ? '💑 En Pareja' : '👨‍👩‍👧 Familia'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alert Banner */}
      {hasWeatherAlert && (
        <div className="bg-amber-500 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <CloudRain className="w-6 h-6" />
              <div>
                <p className="font-semibold">
                  ⚠️ Alerta Clima: Activando Plan B para algunas actividades
                </p>
                <p className="text-sm text-amber-100">
                  Detectamos alta probabilidad de lluvia. Tu itinerario se ha adaptado automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Timeline */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {itineraryBlocks.map((block, index) => {
              const activity = block.weatherTriggered && block.planB ? block.planB : block.planA;
              const isWeatherSwitch = block.weatherTriggered && block.planB;

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Time marker */}
                  <div className={cn(
                    "absolute left-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center",
                    block.isActive 
                      ? "bg-ocean-600 text-white" 
                      : "bg-white border-2 border-gray-200 text-gray-600"
                  )}>
                    <Clock className="w-4 h-4 mb-1" />
                    <span className="text-sm font-bold">{block.time}</span>
                  </div>

                  {/* Activity Card */}
                  <Link
                    to={`/actividad/${activity.id}`}
                    className={cn(
                      "block bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow",
                      isWeatherSwitch ? "border-amber-300" : "border-gray-100"
                    )}
                  >
                    {/* Weather Switch Banner */}
                    {isWeatherSwitch && (
                      <div className="bg-amber-50 px-4 py-2 flex items-center gap-2 text-amber-800 text-sm">
                        <Umbrella className="w-4 h-4" />
                        <span className="font-medium">Plan B Activado</span>
                        <span className="text-amber-600">
                          (Era: {block.planA.name})
                        </span>
                      </div>
                    )}

                    <div className="p-4 flex gap-4">
                      <img
                        src={activity.images[0]}
                        alt={activity.name}
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {activity.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {activity.partnerName}
                            </p>
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                            activity.weatherResilient 
                              ? "bg-ocean-100 text-ocean-700" 
                              : "bg-amber-100 text-amber-700"
                          )}>
                            {activity.weatherResilient ? (
                              <><Umbrella className="w-3 h-3" /> Indoor</>
                            ) : (
                              <><Sun className="w-3 h-3" /> Outdoor</>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {activity.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              ${activity.price.toLocaleString()}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status indicator */}
                    {block.isActive && (
                      <div className="bg-ocean-50 px-4 py-2 flex items-center gap-2 text-ocean-700 text-sm">
                        <div className="w-2 h-2 bg-ocean-500 rounded-full animate-pulse" />
                        <span className="font-medium">Actividad actual</span>
                      </div>
                    )}
                  </Link>

                  {/* Check mark for completed */}
                  {index === 0 && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-nature-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-br from-ocean-50 to-nature-50 rounded-2xl p-6 border border-ocean-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Resumen del Itinerario</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {itineraryBlocks.length}
              </p>
              <p className="text-sm text-gray-500">Actividades</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {itineraryBlocks.reduce((acc, b) => {
                  const activity = b.weatherTriggered && b.planB ? b.planB : b.planA;
                  return acc + activity.price;
                }, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">UYU Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-nature-600">
                {itineraryBlocks.filter(b => b.weatherTriggered).length}
              </p>
              <p className="text-sm text-gray-500">Planes B activos</p>
            </div>
          </div>

          <Link
            to={`/checkout?itinerary=${id}`}
            className="mt-6 w-full py-4 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 transition-colors flex items-center justify-center gap-2"
          >
            Reservar Todo el Itinerario
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* ADN Profile Match */}
        {bigFiveScores && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🧬</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Basado en tu ADN Viajero</h3>
                <p className="text-sm text-gray-500">
                  Este itinerario fue personalizado según tus preferencias
                </p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(bigFiveScores).map(([trait, score]) => (
                <div key={trait} className="text-center">
                  <div className="h-12 bg-gray-100 rounded-lg relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-purple-400"
                      style={{ height: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 capitalize truncate">{trait.slice(0, 3)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
