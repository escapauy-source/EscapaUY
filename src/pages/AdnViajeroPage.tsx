import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, CheckCircle, Loader2, Sparkles,
  Building2, Camera, CreditCard, Clock, Sun, Sunset,
  Utensils, Moon, Bed
} from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import { useAuthStore, User as AuthUser } from '@/stores/authStore';
import { hotels, activities, getActivitiesByCity } from '@/data/mockData';
import { calculateTaxBenefits } from '@/utils/taxUtils';
import { PaymentSummary, ItineraryDay } from '@/types';
import { BigFiveCardSelector } from '@/components/BigFiveCardSelector';
import { AuthCheckout } from '@/components/checkout/AuthCheckout';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { Voucher } from '@/components/voucher/Voucher';

// ============ TIPOS ============
interface ActivitySelection {
  activityId: string | null;
  resting: boolean;
}

interface DaySchedule {
  morning: ActivitySelection;
  midday: ActivitySelection;
  afternoon: ActivitySelection;
  evening: ActivitySelection;
}

// ============ TARJETAS ============
const OptionCard = ({ icon, title, description, selected, onClick, price, color = 'blue' }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  };
  
  const c = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 ${
        selected
          ? `${c.bg} text-white shadow-lg`
          : `bg-white ${c.border} hover:shadow-lg`
      }`}
    >
      <div className={`text-3xl mb-2 ${selected ? '' : c.text}`}>{icon}</div>
      <h3 className={`font-semibold text-base ${selected ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className={`text-sm mt-1 ${selected ? 'text-white/80' : 'text-gray-500'}`}>
        {description}
      </p>
      {price && (
        <div className={`mt-2 text-sm ${selected ? 'text-white/80' : c.text}`}>
          {price}
        </div>
      )}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.button>
  );
};

// ============ PASO 1: TIPO DE VIAJE ============
const TravelTypeStep = ({ onSelect, selectedType }) => {
  const types = [
    { id: 'solo', icon: '🧳', title: 'Solo', description: 'Aventura personal', price: '1 persona' },
    { id: 'pareja', icon: '💑', title: 'Pareja', description: 'Escapada romántica', price: '2 personas' },
    { id: 'amigos', icon: '👯', title: 'Amigos', description: 'Diversión grupal', price: '4 personas' },
    { id: 'familia', icon: '👨‍👩‍👧', title: 'Familia', description: 'Para toda la familia', price: '3 personas' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">¿Quién viaja?</h2>
        <p className="text-gray-500">Selecciona tu grupo de viaje</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {types.map((t) => (
          <OptionCard key={t.id} {...t} selected={selectedType === t.id} onClick={() => onSelect(t.id)} />
        ))}
      </div>
    </div>
  );
};

// ============ PASO 2: BIG FIVE ============
const BigFiveStep = ({ onSelect, scores }) => {
  const traits = [
    { id: 'openness', name: 'Apertura', left: 'Tradicional', right: 'Explorador' },
    { id: 'conscientiousness', name: 'Ritmo', left: 'Relajado', right: 'Planificado' },
    { id: 'extraversion', name: 'Social', left: 'Introvertido', right: 'Extrovertido' },
    { id: 'agreeableness', name: 'Gastronomía', left: 'Clásico', right: 'Foodie' },
    { id: 'neuroticism', name: 'Flexibilidad', left: 'Flexible', right: 'Organizado' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Tu Estilo de Viajero</h2>
        <p className="text-gray-500">5 preguntas para personalizar tu experiencia</p>
      </div>
      <div className="space-y-8">
        {traits.map((trait) => (
          <BigFiveCardSelector
            key={trait.id}
            trait={trait.id}
            traitName={trait.name}
            leftOption={{ label: trait.left, description: '' }}
            rightOption={{ label: trait.right, description: '' }}
            selectedValue={scores[trait.id] ?? 50}
            onSelect={(val) => onSelect({ ...scores, [trait.id]: val })}
          />
        ))}
      </div>
    </div>
  );
};

// ============ PASO 3: FECHAS ============
const DateStep = ({ onSelect, selectedDates }) => {
  const [startDate, setStartDate] = useState(selectedDates?.start || '');
  const [endDate, setEndDate] = useState(selectedDates?.end || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      onSelect({ start: startDate, end: endDate });
    }
  };

  const getNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = getNights();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">¿Cuándo viajas?</h2>
        <p className="text-gray-500">Elige las fechas de tu escapada</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 ml-1">Llegada</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 ml-1">Salida</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {nights > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white text-center"
          >
            <span className="text-lg font-medium">✨ {nights} {nights === 1 ? 'noche' : 'noches'} en Colonia</span>
          </motion.div>
        )}
        <button
          type="submit"
          disabled={!startDate || !endDate}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
        >
          Continuar
        </button>
      </form>
    </div>
  );
};

// ============ PASO 4: HOTEL ============
const HotelStep = ({ onSelect, selectedHotel, onArrivalTimeSelect, arrivalTime, config }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const arrivalOptions = [
    { id: 'morning', icon: Sun, label: 'Mañana', time: '06:00 - 12:00', color: 'amber' },
    { id: 'afternoon', icon: Clock, label: 'Tarde', time: '12:00 - 18:00', color: 'orange' },
    { id: 'evening', icon: Sunset, label: 'Noche', time: '18:00 - 00:00', color: 'purple' }
  ];

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: '5', label: '⭐⭐⭐⭐⭐' },
    { id: '4', label: '⭐⭐⭐⭐' },
    { id: '3', label: '⭐⭐⭐' }
  ];

  const filteredHotels = selectedCategory === 'all' 
    ? hotels 
    : hotels.filter(h => h.stars === parseInt(selectedCategory));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">¿Dónde te alojas?</h2>
        <p className="text-gray-500">Elige tu hotel (define las actividades disponibles)</p>
      </div>

      {!selectedHotel && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 ml-1">¿A qué hora llegas?</p>
          <div className="grid grid-cols-3 gap-3">
            {arrivalOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = arrivalTime === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onArrivalTimeSelect(opt.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    isSelected ? `border-${opt.color}-500 bg-${opt.color}-50` : 'border-gray-200 bg-white'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? `text-${opt.color}-500` : 'text-gray-400'}`} />
                  <p className="font-medium text-gray-700 text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.time}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredHotels.map((hotel) => (
          <motion.button
            key={hotel.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(hotel)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedHotel?.id === hotel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{hotel.name}</h3>
                <p className="text-sm text-gray-500">📍 {hotel.city}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">${hotel.pricePerNight.toLocaleString()}</p>
                <p className="text-xs text-gray-400">por noche</p>
              </div>
            </div>
            <div className="mt-2 text-yellow-500">{'⭐'.repeat(hotel.stars)}</div>
          </motion.button>
        ))}
      </div>

      {selectedHotel && (
        <button
          onClick={() => { onSelect(null); onArrivalTimeSelect(null); }}
          className="w-full py-2 text-blue-600 text-sm hover:underline"
        >
          ← Cambiar hotel
        </button>
      )}
    </div>
  );
};

// ============ PASO 5: ACTIVIDADES (NUEVO DISEÑO) ============
const ActivitiesStep = ({ onSelect, selectedActivities, config, onBack, onContinue }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentDay, setCurrentDay] = useState(0);
  const [currentTime, setCurrentTime] = useState('morning');

  const nights = config.dates.start && config.dates.end 
    ? Math.ceil((new Date(config.dates.end) - new Date(config.dates.start)) / (1000 * 60 * 60 * 24))
    : 0;
  
  const days = Array.from({ length: Math.max(nights, 1) }, (_, i) => i + 1);

  // Filtrar actividades por ciudad del hotel
  const cityActivities = useMemo(() => {
    if (!config.hotel) return activities;
    return getActivitiesByCity(config.hotel.city);
  }, [config.hotel]);

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'gastronomy', label: '🍽️' },
    { id: 'bodega', label: '🍷' },
    { id: 'cultura', label: '🏛️' },
    { id: 'naturaleza', label: '🌿' },
    { id: 'playa', label: '🏖️' }
  ];

  const timeSlots = [
    { id: 'morning', label: 'Mañana', icon: Sun, color: 'amber', description: 'Actividades matutinas' },
    { id: 'midday', label: 'Almuerzo', icon: Utensils, color: 'orange', description: 'Restaurantes y experiencias' },
    { id: 'afternoon', label: 'Tarde', icon: Clock, color: 'blue', description: 'Actividades de la tarde' },
    { id: 'evening', label: 'Noche', icon: Moon, color: 'purple', description: 'Cenas y vida nocturna' }
  ];

  const filteredActivities = useMemo(() => {
    return cityActivities.filter(a => {
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      // Para mediodía, solo mostrar restaurantes y bodegas
      if (currentTime === 'midday') {
        return matchesCategory && (a.category === 'gastronomy' || a.category === 'bodega');
      }
      return matchesCategory;
    });
  }, [cityActivities, selectedCategory, currentTime]);

  // Obtener selección actual
  const getSelection = (day: number, time: string): ActivitySelection => {
    const key = `${day}-${time}`;
    return selectedActivities[key] || { activityId: null, resting: false };
  };

  // Toggle actividad o descansar
  const toggleSelection = (day: number, time: string, activityId: string | null, resting: boolean) => {
    const key = `${day}-${time}`;
    const newActivities = { ...selectedActivities };
    
    if (resting) {
      newActivities[key] = { activityId: null, resting: true };
    } else {
      // Si ya está seleccionada, deseleccionar
      if (getSelection(day, time).activityId === activityId) {
        delete newActivities[key];
      } else {
        newActivities[key] = { activityId, resting: false };
      }
    }
    
    onSelect(newActivities);
  };

  // Contar progreso
  const getProgress = () => {
    let total = 0;
    let completed = 0;
    days.forEach(day => {
      timeSlots.forEach(slot => {
        total++;
        const sel = getSelection(day, slot.id);
        if (sel.activityId || sel.resting) completed++;
      });
    });
    return { completed, total };
  };

  const progress = getProgress();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
        <p className="text-gray-500">
          {config.hotel ? `Según tu hotel en ${config.hotel.city}` : 'Elige actividades para cada momento'}
        </p>
      </div>

      {/* Selector de Día */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day, idx) => (
          <button
            key={day}
            onClick={() => {
              setCurrentDay(idx);
              // Auto-seleccionar el primer time slot
              setCurrentTime('morning');
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentDay === idx
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Día {day}
          </button>
        ))}
      </div>

      {/* Selector de Momento del Día */}
      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((slot) => {
          const Icon = slot.icon;
          const isSelected = currentTime === slot.id;
          const sel = getSelection(currentDay, slot.id);
          const hasSelection = sel.activityId || sel.resting;
          
          return (
            <button
              key={slot.id}
              onClick={() => setCurrentTime(slot.id)}
              className={`p-3 rounded-xl text-center transition-all ${
                isSelected
                  ? `bg-${slot.color}-500 text-white shadow-lg`
                  : hasSelection
                  ? `bg-${slot.color}-50 border-2 border-${slot.color}-200`
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? '' : `text-${slot.color}-500`}`} />
              <p className="text-xs font-medium">{slot.label}</p>
              {hasSelection && (
                <CheckCircle className={`w-3 h-3 mx-auto mt-1 ${isSelected ? 'text-white' : `text-${slot.color}-500`}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Opciones: Descansar o Elegir Actividad */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">
          Para {timeSlots.find(t => t.id === currentTime)?.label.toLowerCase()} del Día {currentDay + 1}:
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSelection(currentDay, currentTime, null, true)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              getSelection(currentDay, currentTime).resting
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-200 hover:border-green-300'
            }`}
          >
            <Bed className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium text-sm">Descansar</p>
            <p className="text-xs opacity-70">Tiempo libre</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Desactivar descansar si se selecciona actividad
              const current = getSelection(currentDay, currentTime);
              if (current.resting) {
                toggleSelection(currentDay, currentTime, null, false);
              }
            }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              getSelection(currentDay, currentTime).activityId && !getSelection(currentDay, currentTime).resting
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <Camera className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium text-sm">Elegir Actividad</p>
            <p className="text-xs opacity-70">
              {filteredActivities.length} opciones
            </p>
          </motion.button>
        </div>

        {/* Lista de actividades (solo si no está descansando) */}
        <AnimatePresence>
          {!getSelection(currentDay, currentTime).resting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {/* Categorías */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-gray-800 text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Lista */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredActivities.map((activity) => {
                  const isSelected = getSelection(currentDay, currentTime).activityId === activity.id;
                  return (
                    <motion.button
                      key={activity.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSelection(currentDay, currentTime, activity.id, false)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="text-xl">{isSelected && <CheckCircle className="w-5 h-5 text-blue-500" />}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{activity.name}</p>
                        <p className="text-xs text-gray-400">{activity.city} • {activity.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600 text-sm">
                          {activity.price === 0 ? 'Gratis' : `$${activity.price.toLocaleString()}`}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progreso */}
      <div className="bg-gray-100 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
          style={{ width: `${(progress.completed / progress.total) * 100}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-500">
        {progress.completed} de {progress.total} momentos completados
      </p>

      {/* Botones de navegación */}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
          Atrás
        </button>
        <button 
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

// ============ PASO 6: RESUMEN ============
interface SummaryStepProps {
  config: any;
  onCheckout: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const SummaryStep = ({ config, onCheckout, onBack, isLoading }: SummaryStepProps) => {
  const [isForeigner, setIsForeigner] = useState(false);

  const startDate = config.dates.start ? new Date(config.dates.start) : null;
  const endDate = config.dates.end ? new Date(config.dates.end) : null;
  const isValidDates = startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
  const nights = isValidDates ? Math.ceil((endDate! - startDate!) / (1000 * 60 * 60 * 24)) : 0;

  const adults = config.travelType === 'pareja' ? 2 : config.travelType === 'familia' ? 2 : config.travelType === 'amigos' ? 4 : 1;
  const children = config.travelType === 'familia' ? 1 : 0;
  const totalPeople = adults + children;

  const hotelPerPerson = config.hotel ? config.hotel.pricePerNight : 0;
  const hotelTotal = isValidDates ? hotelPerPerson * nights * totalPeople : 0;
  
  // Calcular actividades (solo las que NO son descanso)
  let activitiesTotal = 0;
  Object.values(config.activities).forEach((sel: any) => {
    if (sel.activityId && !sel.resting) {
      const activity = activities.find(a => a.id === sel.activityId);
      if (activity) {
        activitiesTotal += activity.price * totalPeople;
      }
    }
  });

  const items = [
    ...(config.hotel && isValidDates ? [{ category: 'hotel' as const, grossAmount: hotelTotal }] : []),
    ...Object.values(config.activities).filter((sel: any) => sel.activityId && !sel.resting).map((sel: any) => {
      const activity = activities.find(a => a.id === sel.activityId);
      return { category: 'restaurante' as const, grossAmount: (activity?.price || 0) * totalPeople };
    })
  ];

  const taxBreakdown = calculateTaxBenefits({
    items,
    isNonUruguayanResident: isForeigner,
    paidElectronically: true
  });

  const total = taxBreakdown.finalTotal;

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return '---';
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  // Contar actividades y descansos
  let activityCount = 0;
  let restCount = 0;
  Object.values(config.activities).forEach((sel: any) => {
    if (sel.resting) restCount++;
    else if (sel.activityId) activityCount++;
  });

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Resumen</h2>
        <p className="text-gray-500">Revisa los detalles de tu viaje</p>
      </div>

      <div className="space-y-3">
        {/* Grupo */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                {config.travelType === 'solo' ? '🧳' : config.travelType === 'pareja' ? '💑' : config.travelType === 'amigos' ? '👯' : '👨‍👩‍👧'}
              </div>
              <div>
                <p className="font-medium text-gray-800 capitalize">{config.travelType || '---'}</p>
                <p className="text-sm text-gray-500">{totalPeople} persona{totalPeople > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{formatDate(startDate)} - {formatDate(endDate)}</p>
                <p className="text-sm text-gray-500">{nights} noche{nights !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{config.hotel?.name || 'Sin hotel'}</p>
                <p className="text-sm text-gray-500">{config.hotel?.city}</p>
              </div>
            </div>
            {config.hotel && <p className="font-semibold text-gray-800">${hotelTotal.toLocaleString()}</p>}
          </div>
        </div>

        {/* Actividades */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{activityCount} actividades</p>
                <p className="text-sm text-gray-500">{restCount} descansos</p>
              </div>
            </div>
            <p className="font-semibold text-gray-800">${activitiesTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Toggle extranjero */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">🌍 Turista extranjero</p>
            <p className="text-sm text-gray-500">IVA 0% + devolución 9pts</p>
          </div>
          <button
            onClick={() => setIsForeigner(!isForeigner)}
            className={`relative w-14 h-7 rounded-full transition-colors ${isForeigner ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isForeigner ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
        {isForeigner && (
          <div className="mt-2 pt-2 border-t border-indigo-200 flex justify-between">
            <span className="text-green-600">Ahorro IVA</span>
            <span className="font-semibold text-green-600">-${taxBreakdown.totalDiscount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-center">
          <span className="text-lg">Total</span>
          <span className="text-3xl font-bold">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
          Atrás
        </button>
        <button
          onClick={onCheckout}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700"
        >
          {isLoading ? 'Procesando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

// ============ PROGRESS INDICATOR ============
const ProgressIndicator = ({ currentStep }) => {
  const steps = ['Tipo', 'Perfil', 'Fechas', 'Hotel', 'Actividades', 'Resumen'];
  
  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div key={label} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              isActive || isCompleted
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-1 mx-1 rounded ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============ COMPONENTE PRINCIPAL ============
export function AdnViajeroPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [checkoutData, setCheckoutData] = useState({ user: null as AuthUser | null, transactionId: null });

  const [config, setConfig] = useState({
    travelType: null as string | null,
    dates: { start: '', end: '' },
    bigFive: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
    hotel: null as typeof hotels[0] | null,
    activities: {} as Record<string, ActivitySelection>
  });

  const generateItineraryDays = (): ItineraryDay[] => {
    const days: ItineraryDay[] = [];
    const startDateStr = config.dates.start;
    if (!startDateStr) return [];
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) return [];
    
    const nights = config.dates.end 
      ? Math.ceil((new Date(config.dates.end) - startDate) / (1000 * 60 * 60 * 24))
      : 1;

    for (let d = 0; d < nights; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      
      const dayActivities: any[] = [];
      ['morning', 'midday', 'afternoon', 'evening'].forEach((time) => {
        const key = `${d}-${time}`;
        const sel = config.activities[key];
        if (sel?.activityId && !sel.resting) {
          const activity = activities.find(a => a.id === sel.activityId);
          if (activity) {
            dayActivities.push({
              id: activity.id,
              name: activity.name,
              description: activity.description,
              category: activity.category,
              location: activity.city,
              price: activity.price,
              time,
              duration: activity.duration || '2h',
              indoor: activity.type === 'indoor'
            });
          }
        }
      });

      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: d + 1,
        activities: dayActivities,
        freeTime: dayActivities.length === 0,
        recommendations: []
      });
    }
    return days;
  };

  const calculatePaymentSummary = (): PaymentSummary => {
    const startStr = config.dates.start;
    const endStr = config.dates.end;
    if (!startStr || !endStr) {
      return { subtotal: 0, ivaSavings: 0, total: 0, depositAmount: 0, remainingAmount: 0, hotelTaxSavings: 0, restaurantSavings: 0, nights: 0, adults: 1, children: 0, checkInDate: '', checkOutDate: '' };
    }
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { subtotal: 0, ivaSavings: 0, total: 0, depositAmount: 0, remainingAmount: 0, hotelTaxSavings: 0, restaurantSavings: 0, nights: 0, adults: 1, children: 0, checkInDate: startStr, checkOutDate: endStr };
    }
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const adults = config.travelType === 'pareja' ? 2 : config.travelType === 'familia' ? 2 : config.travelType === 'amigos' ? 4 : 1;
    const children = config.travelType === 'familia' ? 1 : 0;
    const totalPeople = adults + children;
    
    const hotelPerPerson = config.hotel ? config.hotel.pricePerNight : 0;
    const hotelTotal = hotelPerPerson * nights * totalPeople;
    
    let activitiesTotal = 0;
    Object.values(config.activities).forEach((sel: any) => {
      if (sel.activityId && !sel.resting) {
        const activity = activities.find(a => a.id === sel.activityId);
        if (activity) activitiesTotal += activity.price * totalPeople;
      }
    });

    const items = [
      ...(config.hotel ? [{ category: 'hotel' as const, grossAmount: hotelTotal }] : []),
      ...Object.values(config.activities).filter((sel: any) => sel.activityId && !sel.resting).map((sel: any) => {
        const activity = activities.find(a => a.id === sel.activityId);
        return { category: 'restaurante' as const, grossAmount: (activity?.price || 0) * totalPeople };
      })
    ];

    const taxBreakdown = calculateTaxBenefits({ items, isNonUruguayanResident: true, paidElectronically: true });
    const total = taxBreakdown.finalTotal;
    
    return { subtotal: hotelTotal + activitiesTotal, ivaSavings: taxBreakdown.totalDiscount, total, depositAmount: total * 0.15, remainingAmount: total * 0.85, hotelTaxSavings: config.hotel ? hotelTotal * 0.22 : 0, restaurantSavings: activitiesTotal * 0.09, nights, adults, children, checkInDate: startStr, checkOutDate: endStr };
  };

  const steps = [
    { key: 'type', component: TravelTypeStep },
    { key: 'bigFive', component: BigFiveStep },
    { key: 'dates', component: DateStep },
    { key: 'hotel', component: HotelStep },
    { key: 'activities', component: ActivitiesStep },
    { key: 'summary', component: SummaryStep }
  ];

  const handleCheckoutStart = () => setCurrentStep(6);
  const handleAuthComplete = (userData) => { setCheckoutData(prev => ({ ...prev, user: userData })); setCurrentStep(7); };
  const handlePaymentSuccess = (transactionId) => { setCheckoutData(prev => ({ ...prev, transactionId })); setCurrentStep(8); };
  const handleVoucherDownload = () => {
    const { setStartDate, setEndDate, setSelectedHotel, setSelectedActivities, setTravelGroup, setNumberOfAdults, setNumberOfChildren, setBigFiveScores } = useItineraryStore();
    setStartDate(config.dates.start);
    setEndDate(config.dates.end);
    if (config.hotel) setSelectedHotel(config.hotel);
    
    const flatActivities = Object.entries(config.activities).map(([key, sel]: [string, any]) => {
      if (sel.activityId && !sel.resting) {
        const [day, time] = key.split('-');
        const activity = activities.find(a => a.id === sel.activityId);
        return { ...activity, time, _day: parseInt(day) };
      }
      return null;
    }).filter(Boolean);
    
    setSelectedActivities(flatActivities);
    const group = config.travelType || 'solo';
    setTravelGroup(group);
    if (group === 'pareja') { setNumberOfAdults(2); setNumberOfChildren(0); }
    else if (group === 'solo') { setNumberOfAdults(1); setNumberOfChildren(0); }
    else { setNumberOfAdults(2); setNumberOfChildren(1); }
    setBigFiveScores(config.bigFive);
    navigate('/itinerary/new');
  };

  const CurrentStepComponent = steps[currentStep]?.component;
  const paymentSummary = calculatePaymentSummary();
  const itineraryDays = generateItineraryDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🧳 Tu Escapada</h1>
          <p className="text-gray-500 text-sm">Colonia del Sacramento</p>
        </div>

        {currentStep < 6 && <ProgressIndicator currentStep={currentStep} />}

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {currentStep < 6 && CurrentStepComponent && (
              <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <CurrentStepComponent
                  onSelect={(data) => { setConfig({ ...config, [steps[currentStep].key]: data }); setCurrentStep(currentStep < 5 ? currentStep + 1 : 6); }}
                  selectedType={config.travelType}
                  selectedDates={config.dates}
                  scores={config.bigFive}
                  selectedHotel={config.hotel}
                  selectedActivities={config.activities}
                  config={config}
                  isLoading={isLoading}
                  onCheckout={handleCheckoutStart}
                  onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  onContinue={() => setCurrentStep(5)}
                  arrivalTime={arrivalTime}
                  onArrivalTimeSelect={setArrivalTime}
                />
              </motion.div>
            )}
            {currentStep === 6 && checkoutData.user === null && (
              <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <AuthCheckout paymentSummary={paymentSummary} onComplete={handleAuthComplete} onBack={() => setCurrentStep(5)} />
              </motion.div>
            )}
            {currentStep === 7 && checkoutData.user && (
              <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <PaymentForm paymentSummary={paymentSummary} user={checkoutData.user} onSuccess={handlePaymentSuccess} onBack={() => setCurrentStep(6)} />
              </motion.div>
            )}
            {currentStep === 8 && checkoutData.user && (
              <motion.div key="voucher" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Voucher user={checkoutData.user} paymentSummary={paymentSummary} itineraryDays={itineraryDays} hotel={{ name: config.hotel?.name || 'Hotel', address: config.hotel?.location || 'Colonia', phone: '+598 4522 2222', email: 'info@hotel.com' }} onDownload={handleVoucherDownload} onShare={() => alert('Email enviado')} onAddToCalendar={handleVoucherDownload} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AdnViajeroPage;
