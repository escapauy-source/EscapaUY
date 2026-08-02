import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calendar, CheckCircle, Sparkles,
  Building2, Camera, Clock, Sun, Sunset,
  Utensils, Moon, Bed
} from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import { User as AuthUser } from '@/stores/authStore';
import { hotels, activities } from '@/data/mockData';
import { calculateTaxBenefits } from '@/utils/taxUtils';
import { PaymentSummary } from '@/types';
import { BigFiveCardSelector } from '@/components/BigFiveCardSelector';
import { AuthCheckout } from '@/components/checkout/AuthCheckout';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { Voucher } from '@/components/voucher/Voucher';
import { supabase } from '@/lib/supabase';
import { generateBookingReference } from '@/utils/bookingUtils';
import { generateItineraryOptions } from '@/utils/itineraryGenerator';
import { ItinerarySelectionStep } from '@/components/wizard/ItinerarySelectionStep';




// ============ TIPOS ============
interface ActivitySelection {
  activityId: string | null;
  resting: boolean;
  planBEnabled: boolean;
  planBActivityId: string | null;
}



// ============ TARJETAS ============
const getLocalized = (content: any, lang: string = 'es'): string => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    return content[lang] || content['es'] || content['en'] || '';
  }
  return String(content);
};



// ============ PASO 1: TIPO DE VIAJE (CON DETALLES) ============
const TravelTypeStep = ({ onSelect, selectedType, isForeigner, defaultCurrency = 'UYU' }: { onSelect: (data: any) => void, selectedType: string | null, isForeigner: boolean, defaultCurrency?: 'UYU' | 'USD' }) => {
  const { t } = useTranslation();
  const [localType, setLocalType] = useState<string | null>(selectedType);
  const [localIsForeigner, setLocalIsForeigner] = useState<boolean>(isForeigner);
  const [details, setDetails] = useState({
    adults: 2,
    children: 0,
    ages: [] as number[]
  });

  const types = [
    { id: 'solo', icon: '🧳', title: t('adn.types.solo.title', 'Solo'), description: t('adn.types.solo.desc', 'Aventura personal'), defaultAdults: 1, defaultChildren: 0 },
    { id: 'pareja', icon: '💑', title: t('adn.types.couple.title', 'Pareja'), description: t('adn.types.couple.desc', 'Escapada romántica'), defaultAdults: 2, defaultChildren: 0 },
    { id: 'amigos', icon: '👯', title: t('adn.types.friends.title', 'Amigos'), description: t('adn.types.friends.desc', 'Diversión grupal'), defaultAdults: 4, defaultChildren: 0 },
    { id: 'familia', icon: '👨‍👩‍👧', title: t('adn.types.family.title', 'Familia'), description: t('adn.types.family.desc', 'Para toda la familia'), defaultAdults: 2, defaultChildren: 2 }
  ];

  const handleTypeClick = (typeId: string) => {
    setLocalType(typeId);
    const typeDef = types.find(t => t.id === typeId);
    if (typeDef) {
      setDetails({
        adults: typeDef.defaultAdults,
        children: typeDef.defaultChildren,
        ages: Array(typeDef.defaultChildren).fill(5)
      });
    }
  };

  const updateChildrenCount = (count: number) => {
    const newAges = [...details.ages];
    if (count > newAges.length) {
      // Add new children with default age 5
      for (let i = newAges.length; i < count; i++) newAges.push(5);
    } else {
      // Remove excess
      newAges.splice(count);
    }
    setDetails({ ...details, children: count, ages: newAges });
  };

  const updateChildAge = (index: number, age: number) => {
    const newAges = [...details.ages];
    newAges[index] = age;
    setDetails({ ...details, ages: newAges });
  };

  const [budget, setBudget] = useState<string>('');
  const [currency, setCurrency] = useState<'UYU' | 'USD'>(defaultCurrency);

  const handleConfirm = () => {
    if (!localType) {
      toast.error(t('adn.validation.selectType', 'Por favor selecciona un estilo de viaje'));
      return;
    }
    onSelect({
      type: localType,
      adults: details.adults,
      children: details.children,
      ages: details.ages,
      budget: budget === '' ? null : Number(budget),
      currency: currency,
      isForeigner: localIsForeigner
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-2">{t('adn.styleTitle', '¿Cuál es tu estilo de viaje?')}</h2>
        <p className="text-gray-500">{t('adn.styleSubtitle', 'Personalizamos la experiencia según tu compañía')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTypeClick(t.id)}
            className={`cursor-pointer rounded-2xl p-6 text-center border-2 transition-all ${localType === t.id
              ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
              : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
          >
            <div className="text-4xl mb-3">{t.icon}</div>
            <h3 className="font-bold mb-1">{t.title}</h3>
            <p className="text-xs text-gray-500">{t.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Inputs Section */}
      <AnimatePresence>
        {localType && (localType === 'amigos' || localType === 'familia') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mt-6"
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">👥</span> {t('adn.groupConfig', 'Configuración del Grupo')}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Adults Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adn.adults', 'Adultos')}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDetails(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{details.adults}</span>
                  <button
                    onClick={() => setDetails(prev => ({ ...prev, adults: Math.min(10, prev.adults + 1) }))}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adn.children', 'Niños (0-17 años)')}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateChildrenCount(Math.max(0, details.children - 1))}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{details.children}</span>
                  <button
                    onClick={() => updateChildrenCount(Math.min(6, details.children + 1))}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Children Ages */}
            {details.children > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('adn.childrenAges', 'Edades de los niños')}</label>
                <div className="flex flex-wrap gap-3">
                  {details.ages.map((age, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">{t('adn.child', 'Niño')} {idx + 1}</span>
                      <select
                        value={age}
                        onChange={(e) => updateChildAge(idx, parseInt(e.target.value))}
                        className="p-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 18 }, (_, i) => (
                          <option key={i} value={i}>{i} {t('adn.years', 'años')}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('adn.budgetLabel', 'Presupuesto Objetivo (Opcional)')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3 text-gray-500">{currency === 'USD' ? 'U$S' : '$'}</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={t('adn.budgetPlaceholder', 'Monto total estimado')}
                className="w-full pl-12 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCurrency('UYU')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currency === 'UYU' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                $ UYU
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currency === 'USD' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                U$S
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">* {t('adn.budgetHint', 'La IA priorizará opciones que se ajusten a este monto.')}</p>
        </div>
      </div>

      {/* Foreigner Toggle */}
      <div className="mt-6 flex justify-center">
        <motion.div
          className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-purple-100 transition-colors"
          onClick={() => setLocalIsForeigner(!localIsForeigner)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${localIsForeigner ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
            {localIsForeigner && <CheckCircle className="w-4 h-4 text-white" />}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">{t('adn.foreignerTitle', 'Soy Turista Extranjero')}</p>
            <p className="text-xs text-gray-500">{t('adn.foreignerDesc', 'Quiero activar beneficios Tax Free (Hotel y Gasto)')}</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {!localType && (
          <p className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full">
            👆 {t('adn.selectTypeHint', 'Selecciona un estilo de viaje arriba')}
          </p>
        )}
        <button
          onClick={handleConfirm}
          disabled={!localType}
          className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all ${localType
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-xl hover:-translate-y-1'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          {localType ? t('common.continue', 'Continuar') : t('adn.selectType', 'Selecciona un estilo')}
        </button>
      </div>
    </div>
  );
};

// ============ PASO 2: BIG FIVE ============
const BigFiveStep = ({ onUpdateScore, onComplete, scores, onBack }: { onUpdateScore: any, onComplete: any, scores: any, onBack: any }) => {
  const { t } = useTranslation();
  const traits = [
    {
      id: 'openness',
      name: t('adn.traits.openness.name', 'Apertura'),
      left: t('adn.traits.openness.optC', 'Tradicional'),
      leftDesc: t('adn.traits.openness.optCDesc', 'Prefiero experiencias probadas y recomendadas'),
      right: t('adn.traits.openness.optA', 'Explorador'),
      rightDesc: t('adn.traits.openness.optADesc', 'Me emociona probar cosas nuevas y salir de mi zona de confort')
    },
    {
      id: 'conscientiousness',
      name: t('adn.traits.conscientiousness.name', 'Ritmo'),
      left: t('adn.traits.conscientiousness.optC', 'Relajado'),
      leftDesc: t('adn.traits.conscientiousness.optCDesc', 'Prefiero improvisar y dejarme llevar'),
      right: t('adn.traits.conscientiousness.optA', 'Planificado'),
      rightDesc: t('adn.traits.conscientiousness.optADesc', 'Quiero aprovechar cada minuto con actividades organizadas')
    },
    {
      id: 'extraversion',
      name: t('adn.traits.extraversion.name', 'Social'),
      left: t('adn.traits.extraversion.optC', 'Introvertido'),
      leftDesc: t('adn.traits.extraversion.optCDesc', 'Prefiero experiencias privadas o en pareja/familia'),
      right: t('adn.traits.extraversion.optA', 'Extrovertido'),
      rightDesc: t('adn.traits.extraversion.optADesc', 'Me encanta conocer gente nueva y compartir experiencias')
    },
    {
      id: 'agreeableness',
      name: t('adn.traits.agreeableness.name', 'Gastronomía'),
      left: t('adn.traits.agreeableness.optC', 'Clásico'),
      leftDesc: t('adn.traits.agreeableness.optCDesc', 'Prefiero lugares conocidos y sabores familiares'),
      right: t('adn.traits.agreeableness.optA', 'Foodie'),
      rightDesc: t('adn.traits.agreeableness.optADesc', 'Busco restaurantes auténticos y platos únicos')
    },
    {
      id: 'neuroticism',
      name: t('adn.traits.neuroticism.name', 'Flexibilidad'),
      left: t('adn.traits.neuroticism.optC', 'Organizado'),
      leftDesc: t('adn.traits.neuroticism.optCDesc', 'Prefiero tener todo controlado y previsto'),
      right: t('adn.traits.neuroticism.optA', 'Flexible'),
      rightDesc: t('adn.traits.neuroticism.optADesc', 'Los cambios de planes son parte de la aventura')
    }
  ];

  const allTraitsCompleted = traits.every(trait => scores[trait.id] !== undefined && scores[trait.id] !== null);
  const completedCount = traits.filter(trait => scores[trait.id] !== undefined && scores[trait.id] !== null).length;

  const handleScoreUpdate = (traitId: string, value: number) => {
    onUpdateScore({ ...scores, [traitId]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('adn.traitsTitle', 'Tu Estilo de Viajero')}</h2>
        <p className="text-gray-500">{t('adn.traitsSubtitle', '5 preguntas para personalizar tu experiencia')}</p>
      </div>

      <div className="bg-gray-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / traits.length) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 text-center">{completedCount} {t('common.of', 'de')} {traits.length} {t('common.completed', 'completado')}</p>

      <div className="space-y-8">
        {traits.map((trait) => (
          <BigFiveCardSelector
            key={trait.id}
            trait={trait.id}
            traitName={trait.name}
            leftOption={{ label: trait.left, description: trait.leftDesc }}
            rightOption={{ label: trait.right, description: trait.rightDesc }}
            selectedValue={scores[trait.id] ?? 50}
            onSelect={(val) => handleScoreUpdate(trait.id, val)}
          />
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {t('common.back', 'Atrás')}
        </button>
        <button
          onClick={() => {
            if (allTraitsCompleted) {
              onComplete(scores);
            }
          }}
          disabled={!allTraitsCompleted}
          className={`flex-1 py-3 rounded-xl font-semibold shadow-lg transition-all ${allTraitsCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {allTraitsCompleted ? t('common.continue', 'Continuar →') : t('adn.completeAllQuestions', 'Completa todas las preguntas')}
        </button>
      </div>
    </div>
  );
};

// ============ PASO 3: FECHAS ============
interface DateStepProps {
  onSelect: (dates: { start: string; end: string }) => void;
  selectedDates: { start: string; end: string } | null;
}

const DateStep = ({ onSelect, selectedDates }: DateStepProps) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(selectedDates?.start || '');
  const [endDate, setEndDate] = useState(selectedDates?.end || '');

  // Force update if props change (fix "stuck" date)
  useEffect(() => {
    if (selectedDates?.start) setStartDate(selectedDates.start);
    if (selectedDates?.end) setEndDate(selectedDates.end);
  }, [selectedDates]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (startDate && endDate) {
      onSelect({ start: startDate, end: endDate });
    }
  };

  const getNights = () => {
    if (!startDate || !endDate) return 0;

    const getLocalMidday = (dStr: string) => {
      if (dStr.includes('T')) return new Date(dStr);
      const [year, month, day] = dStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    };

    const start = getLocalMidday(startDate);
    const end = getLocalMidday(endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = getNights();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('adn.whenTravel', '¿Cuándo viajas?')}</h2>
        <p className="text-gray-500">{t('adn.chooseDates', 'Elige las fechas de tu escapada')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 ml-1">{t('adn.arrival.label', 'Llegada')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 ml-1">{t('adn.departure_label', 'Salida')}</label>
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
            <span className="text-lg font-medium">✨ {nights} {nights === 1 ? t('checkout.night_singular', 'noche') : t('checkout.nights_plural', 'noches')} {t('common.inColonia', 'en Colonia')}</span>
          </motion.div>
        )}
        <button
          type="submit"
          disabled={!startDate || !endDate}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
        >
          {t('common.continue', 'Continuar')}
        </button>
      </form>
    </div>
  );
};

// ============ PASO 4: HOTEL ============
interface HotelStepProps {
  onSelect: (hotel: any) => void;
  selectedHotel: any;
  onArrivalTimeSelect: (time: string | null) => void;
  arrivalTime: string | null;
  config: any;
}

const HotelStep = ({ onSelect, selectedHotel, onArrivalTimeSelect, arrivalTime, config }: HotelStepProps) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const arrivalOptions = [
    { id: 'morning', icon: Sun, label: t('adn.morning', 'Mañana'), time: '06:00 - 12:00', color: 'amber' },
    { id: 'afternoon', icon: Clock, label: t('adn.afternoon', 'Tarde'), time: '12:00 - 18:00', color: 'orange' },
    { id: 'evening', icon: Sunset, label: t('adn.evening', 'Noche'), time: '18:00 - 00:00', color: 'purple' }
  ];

  const categories = [
    { id: 'all', label: t('adn.all', 'Todos') },
    { id: '5', label: '⭐⭐⭐⭐⭐' },
    { id: '4', label: '⭐⭐⭐⭐' },
    { id: '3', label: '⭐⭐⭐' }
  ];

  // Calculate Budget Info (Moved Up)
  const totalBudget = config.budget || 100000;

  // Simplest Date Parsing (Matches useEffect logic)
  // config.dates.start is expected to be "YYYY-MM-DD"
  const start = config.dates?.start ? new Date(config.dates.start) : null;
  const end = config.dates?.end ? new Date(config.dates.end) : null;

  // Safe Calculation of Nights (Handle NaN)
  const calculateNights = () => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

    // Calculate difference in milliseconds
    const diffMs = end.getTime() - start.getTime();

    // Convert to days (rounding to handle potential DST/timezone offsets)
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
  };
  const nights = calculateNights();

  // Currency Utils (Moved Up)
  const exchangeRate = 42;
  const isUSD = config.currency === 'USD';
  const displayCurrency = isUSD ? 'U$S' : '$';

  // Debug removed

  const filteredHotels = hotels.filter(h => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && h.stars !== parseInt(selectedCategory)) return false;

    // 2. Budget Filter (Smart)
    if (config.budget) {
      const hotelPricePerNight = isUSD ? (h.pricePerNight / exchangeRate) : h.pricePerNight;
      // Strict: If cannot afford even 1 night, hide.
      if (hotelPricePerNight > config.budget) return false;
    }

    return true;
  });





  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('adn.hotelTitle', '¿Dónde te alojas?')}</h2>
        <p className="text-gray-500">{t('adn.hotelSubtitle', 'Elige tu hotel (define las actividades disponibles)')}</p>
      </div>

      {/* Budget Indicator */}
      {config.budget && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-emerald-800 font-bold uppercase">{t('adn.totalBudget', 'Presupuesto Total')}</p>
              <p className="text-xl font-bold text-emerald-700">{displayCurrency} {totalBudget.toLocaleString()}</p>
            </div>
          </div>
          {selectedHotel && (
            <div className="text-right">
              <p className="text-xs text-gray-500">{t('adn.hotelCost', 'Costo Hotel')} ({nights} {t('checkout.nights_plural', 'noches')})</p>
              {(() => {
                const originalCost = (selectedHotel.pricePerNight * nights);
                const convertedCost = isUSD ? (originalCost / exchangeRate) : originalCost;
                const remaining = totalBudget - convertedCost;
                const isDeficit = remaining < 0;
                return (
                  <>
                    <p className="font-bold text-gray-800">-{displayCurrency} {Math.round(convertedCost).toLocaleString()}</p>
                    <div className={`text-xs font-bold mt-1 ${isDeficit ? 'text-red-600' : 'text-blue-600'}`}>
                      {isDeficit ? t('adn.missingBudget', 'Faltan: ') : t('adn.remainingBudget', 'Restante: ')} {displayCurrency} {Math.round(Math.abs(remaining)).toLocaleString()}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {!selectedHotel && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 ml-1">{t('adn.arrivalTime', '¿A qué hora llegas?')}</p>
          <div className="grid grid-cols-3 gap-3">
            {arrivalOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = arrivalTime === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onArrivalTimeSelect(opt.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected ? `border-${opt.color}-500 bg-${opt.color}-50` : 'border-gray-200 bg-white'
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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredHotels.map((hotel) => {
          // Currency Conversion Logic
          // Hotel prices are in UYU (base)
          const hotelPricePerNightUserCurrency = isUSD ? (hotel.pricePerNight / exchangeRate) : hotel.pricePerNight;
          const totalCostUserCurrency = hotelPricePerNightUserCurrency * nights;
          const isOverBudget = config.budget && (totalCostUserCurrency > totalBudget);

          if (hotel.id === 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a112') { // Artilleros Cabañas ID check
            console.log('DEBUG CHECK HOTEL:', {
              name: hotel.name,
              priceUserCurrency: hotelPricePerNightUserCurrency,
              nights,
              totalCost: totalCostUserCurrency,
              budget: config.budget,
              totalBudgetVar: totalBudget,
              isOverBudget,
              rawDates: config.dates, // CHECK THIS
              startDateObj: start,
              endDateObj: end
            });
          }

          let budgetMessage = null;
          if (isOverBudget && config.budget) {
            // Calculate how many nights they CAN afford
            const maxAffordableNights = Math.floor(config.budget / hotelPricePerNightUserCurrency);

            if (maxAffordableNights < 1) {
              budgetMessage = t('adn.outOfBudget', 'Fuera de presupuesto');
            } else {
              budgetMessage = `${t('adn.onlyEnoughFor', 'Solo alcanza para')} ${maxAffordableNights} ${maxAffordableNights === 1 ? t('checkout.night_singular', 'noche') : t('checkout.nights_plural', 'noches')}`;
            }
          }

          return (
            <motion.button
              key={hotel.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isOverBudget) {
                  toast(t('adn.budgetWarning', `Atención: Presupuesto insuficiente para ${nights} noches.`), { icon: '⚠️' });
                }
                onSelect(hotel);
              }}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedHotel?.id === hotel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'
                } ${isOverBudget ? 'opacity-90 border-orange-200 bg-orange-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{getLocalized(hotel.name, 'es')}</h3>
                  <p className="text-sm text-gray-500">📍 {hotel.city}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isOverBudget ? 'text-orange-600' : 'text-blue-600'}`}>
                    {displayCurrency} {Math.round(hotelPricePerNightUserCurrency).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{t('adn.perNight', 'por noche')}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-yellow-500">{'⭐'.repeat(hotel.stars)}</div>
                {isOverBudget && (
                  <span className="text-xs text-orange-700 font-bold bg-orange-100 px-2 py-1 rounded-full flex items-center gap-1">
                    ⚠️ {budgetMessage}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {selectedHotel && (
        <button
          onClick={() => { onSelect(null); onArrivalTimeSelect(null); }}
          className="w-full py-2 text-blue-600 text-sm hover:underline"
        >
          ← {t('adn.changeHotel', 'Cambiar hotel')}
        </button>
      )}
    </div>
  );
};


// ============ PASO 5: ACTIVIDADES ============
const ActivitiesStep = ({ onSelect, selectedActivities, config, onBack, onContinue, arrivalTime, onAutoFill }: { onSelect: any, selectedActivities: any, config: any, onBack: any, onContinue: any, arrivalTime: string | null, onAutoFill: () => void }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentDay, setCurrentDay] = useState(0);
  const [currentTime, setCurrentTime] = useState('morning');
  const [showValidationError, setShowValidationError] = useState(false);

  const nights = config.dates.start && config.dates.end
    ? Math.ceil((new Date(config.dates.end).getTime() - new Date(config.dates.start).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const days = Array.from({ length: Math.max(nights, 1) }, (_, i) => i + 1);

  const cityActivities = useMemo(() => {
    if (!config.hotel) return activities;
    // Sort: Hotel's city first, then others
    return [...activities].sort((a, b) => {
      const aIsLocal = a.city === config.hotel.city;
      const bIsLocal = b.city === config.hotel.city;
      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;
      return 0;
    });
  }, [config.hotel]);


  // ================= AVAILABILITY STATE & LOGIC =================
  const [availabilityCounts, setAvailabilityCounts] = useState<Record<string, number>>({});
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      // 1. Calculate Real Date
      // 1. Calculate Real Date
      // let realDate = new Date().toISOString().split('T')[0];
      if (config.dates?.start) {
        // const d = new Date(config.dates.start);
        // d.setDate(d.getDate() + currentDay);
        // realDate = d.toISOString().split('T')[0];
      }

      setIsAvailabilityLoading(true);
      const newCounts: Record<string, number> = {};

      try {
        // Query confirmed bookings for displayed activities
        // Note: In a real scenario, we MUST filter by 'booking_date' and 'time_slot'.
        // Since we are uncertain about schema, we fetch confirmed bookings and count them.

        const serviceIds = cityActivities.map(a => a.id);
        if (serviceIds.length > 0) {
          const { data } = await supabase
            .from('partner_bookings')
            .select('service_id')
            .in('service_id', serviceIds)
            .eq('status', 'confirmed');

          if (data) {
            data.forEach((booking: any) => {
              const sId = booking.service_id;
              newCounts[sId] = (newCounts[sId] || 0) + 1;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching availability', err);
      } finally {
        setAvailabilityCounts(newCounts);
        setIsAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [currentDay, currentTime, config.dates, cityActivities]);

  const categories = [
    { id: 'all', label: t('adn.all', 'Todas') },
    { id: 'gastronomy', label: '🍽️' },
    { id: 'bodega', label: '🍷' },
    { id: 'cultura', label: '🏛️' },
    { id: 'naturaleza', label: '🌿' },
    { id: 'playa', label: '🏖️' }
  ];

  const timeSlots = [
    { id: 'morning', label: t('adn.morning', 'Mañana'), icon: Sun, color: 'amber', description: t('adn.morningDesc', 'Actividades matutinas') },
    { id: 'midday', label: t('adn.midday', 'Almuerzo'), icon: Utensils, color: 'orange', description: t('adn.middayDesc', 'Restaurantes y experiencias') },
    { id: 'afternoon', label: t('adn.afternoon', 'Tarde'), icon: Clock, color: 'blue', description: t('adn.afternoonDesc', 'Actividades de la tarde') },
    { id: 'evening', label: t('adn.evening', 'Noche'), icon: Moon, color: 'purple', description: t('adn.eveningDesc', 'Cenas y vida nocturna') }
  ];

  const filteredActivities = useMemo(() => {
    return cityActivities.filter(a => {
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;

      if (currentTime === 'midday') {
        return matchesCategory && (a.category === 'restaurante' || a.category === 'bodega' || (a.bestTime as string) === 'midday');
      }

      // Hide strict Midday/Evening activities from Morning/Afternoon slots
      if (currentTime === 'morning' && ((a.bestTime as string) === 'midday' || a.bestTime === 'evening')) return false;
      if (currentTime === 'afternoon' && ((a.bestTime as string) === 'midday' || a.bestTime === 'evening')) return false;

      // DUPLICATE PREVENTION LOGIC:
      if (a.category === 'playa') return matchesCategory;

      if (a.category === 'restaurante') {
        const restaurantCount = cityActivities.filter(act => act.category === 'restaurante').length;
        if (restaurantCount === 1) return matchesCategory;
      }

      const isSelectedAnywhere = Object.entries(selectedActivities).some(([key, val]: [string, any]) => {
        const [d, t] = key.split('-');
        const isCurrentSlot = parseInt(d) === (currentDay + 1) && t === currentTime;
        if (isCurrentSlot) return false;
        return val.activityId === a.id;
      });

      if (isSelectedAnywhere) return false;

      return matchesCategory;
    });
  }, [cityActivities, selectedCategory, currentTime, selectedActivities, currentDay]);

  const getSelection = (day: number, time: string): ActivitySelection => {
    const key = `${day}-${time}`;
    return selectedActivities[key] || { activityId: null, resting: false };
  };

  const toggleSelection = (day: number, time: string, activityId: string | null, resting: boolean) => {
    const key = `${day}-${time}`;
    const currentSelection = getSelection(day, time);
    const newActivities = { ...selectedActivities };

    if (resting) {
      newActivities[key] = {
        activityId: null,
        resting: true,
        planBEnabled: false,
        planBActivityId: null
      };
    } else {
      if (currentSelection.activityId === activityId) {
        delete newActivities[key];
      } else {
        const activity = activities.find(a => a.id === activityId);
        const planBId = activity?.planBAlternativeId || null;

        newActivities[key] = {
          activityId,
          resting: false,
          planBEnabled: currentSelection.planBEnabled || false,
          planBActivityId: currentSelection.planBActivityId || planBId
        };
      }
    }

    onSelect(newActivities);
  };

  // State for Plan B Confirmation
  const [planBModal, setPlanBModal] = useState<{ isOpen: boolean; day: number; time: string; activityId: string; planBId: string; priceDiff: number; currencySymbol: string } | null>(null);

  const togglePlanB = (day: number, time: string) => {
    const key = `${day}-${time}`;
    const currentSelection = getSelection(day, time);

    if (!currentSelection.activityId) return;

    // If disabling (already enabled), just do it
    if (currentSelection.planBEnabled) {
      const newActivities = { ...selectedActivities };
      newActivities[key] = {
        ...currentSelection,
        planBEnabled: false,
        planBActivityId: null // Reset
      };
      onSelect(newActivities);
      return;
    }

    // IF ENABLING: Show Confirmation Modal
    const originalActivity = activities.find(a => a.id === currentSelection.activityId);
    const planBId = originalActivity?.planBAlternativeId;

    if (planBId) {
      const planBActivity = activities.find(a => a.id === planBId);
      if (planBActivity) {
        // Price diff calculation
        const isUSD = config.currency === 'USD';
        const rate = 42;

        const originalPrice = isUSD ? (originalActivity.price || 0) / rate : (originalActivity.price || 0);
        const planBPrice = isUSD ? (planBActivity.price || 0) / rate : (planBActivity.price || 0);

        const priceDiff = planBPrice - originalPrice;
        setPlanBModal({
          isOpen: true,
          day,
          time,
          activityId: currentSelection.activityId,
          planBId: planBId,
          priceDiff,
          currencySymbol: isUSD ? 'U$S' : '$' // Pass symbol to modal
        });
        return;
      }
    }

    // Fallback if no Plan B defined (shouldn't happen if UI shows switch)
    const newActivities = { ...selectedActivities };
    newActivities[key] = {
      ...currentSelection,
      planBEnabled: true
    };
    onSelect(newActivities);
  };

  const confirmPlanB = () => {
    if (!planBModal) return;
    const { day, time, planBId } = planBModal;
    const key = `${day}-${time}`;
    const currentSelection = getSelection(day, time);

    const newActivities = { ...selectedActivities };
    newActivities[key] = {
      ...currentSelection,
      planBEnabled: true,
      planBActivityId: planBId
    };
    onSelect(newActivities);
    setPlanBModal(null);
  };

  // Helper to check if a slot is blocked relative to arrival time
  const isSlotBlocked = (dayIndex: number, timeId: string) => {
    if (dayIndex === 0) {
      const arrival = arrivalTime || 'morning';
      const order = ['morning', 'midday', 'afternoon', 'evening'];
      const arrivalIdx = order.indexOf(arrival);
      const slotIdx = order.indexOf(timeId);
      // Valid if slot is same or later than arrival
      return slotIdx < arrivalIdx;
    }
    // Only block Day 1 slots. Subsequent days are full.
    return false;
  };

  const getDayProgress = (dayIndex: number) => {
    const slots = timeSlots.filter(t => !isSlotBlocked(dayIndex, t.id));
    const totalSlots = slots.length;
    const completedSlots = slots.filter(slot => {
      const sel = getSelection(dayIndex, slot.id);
      return sel.activityId || sel.resting;
    }).length;
    return { completed: completedSlots, total: totalSlots };
  };

  const isItineraryComplete = useMemo(() => {
    return days.every((_, dayIndex) => {
      const { completed, total } = getDayProgress(dayIndex);
      return completed === total;
    });
  }, [days, selectedActivities, arrivalTime]);

  const incompleteDays = days.filter((_, idx) => {
    const { completed, total } = getDayProgress(idx);
    return completed < total;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-gray-800">{t('adn.activitiesTitle', 'Actividades')}</h2>
          <p className="text-gray-500">
            {config.hotel ? t('adn.activitiesSubtitleHotel', `Según tu hotel en ${config.hotel.city}`) : t('adn.activitiesSubtitle', 'Elige actividades para cada momento')}
          </p>
        </div>

        {onAutoFill && (
          <button
            onClick={onAutoFill}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            {t('adn.autoFillAi', 'Autocompletar itinerario con IA')}
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day, idx) => (
          <button
            key={day}
            onClick={() => {
              setCurrentDay(idx);
              setCurrentTime('morning');
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentDay === idx
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {t('adn.day', 'Día')} {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((slot) => {
          const Icon = slot.icon;
          const isSelected = currentTime === slot.id;
          const sel = getSelection(currentDay, slot.id);
          const hasSelection = sel.activityId || sel.resting;

          // Logic to block slots before arrival time on Day 1
          const isBlocked = isSlotBlocked(currentDay, slot.id);

          return (
            <button
              key={slot.id}
              onClick={() => !isBlocked && setCurrentTime(slot.id)}
              disabled={isBlocked}
              className={`p-3 rounded-xl text-center transition-all ${isBlocked
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                : isSelected
                  ? `bg-${slot.color}-500 text-white shadow-lg`
                  : hasSelection
                    ? `bg-${slot.color}-50 border-2 border-${slot.color}-200`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${isBlocked ? 'text-gray-300' : isSelected ? '' : `text-${slot.color}-500`}`} />
              <p className="text-xs font-medium">{slot.label}</p>
              {hasSelection && !isBlocked && (
                <CheckCircle className={`w-3 h-3 mx-auto mt-1 ${isSelected ? 'text-white' : `text-${slot.color}-500`}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">
          {t('adn.forTimeSlot', 'Para')} {timeSlots.find(t => t.id === currentTime)?.label.toLowerCase()} {t('adn.ofDay', 'del Día')} {currentDay + 1}:
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSelection(currentDay, currentTime, null, true)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${getSelection(currentDay, currentTime).resting
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-200 hover:border-green-300'
              }`}
          >
            <Bed className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium text-sm">{t('adn.rest', 'Descansar')}</p>
            <p className="text-xs opacity-70">{t('adn.freeTime', 'Tiempo libre')}</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const current = getSelection(currentDay, currentTime);
              if (current.resting) {
                toggleSelection(currentDay, currentTime, null, false);
              }
            }}
            className={`p-4 rounded-xl border-2 text-center transition-all ${getSelection(currentDay, currentTime).activityId && !getSelection(currentDay, currentTime).resting
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
          >
            <Camera className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium text-sm">{t('adn.chooseActivity', 'Elegir Actividad')}</p>
            <p className="text-xs opacity-70">
              {filteredActivities.length} {t('adn.options', 'opciones')}
            </p>
          </motion.button>
        </div>

        <AnimatePresence>
          {!getSelection(currentDay, currentTime).resting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${selectedCategory === cat.id
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {isAvailabilityLoading && (
                  <div className="p-4 text-center text-gray-500">{t('adn.loadingAvailability', 'Cargando disponibilidad...')}</div>
                )}
                {!isAvailabilityLoading && filteredActivities.length === 0 && (
                  <div className="p-4 text-center text-gray-500">{t('adn.noActivities', 'No hay actividades disponibles para esta categoría.')}</div>
                )}
                {!isAvailabilityLoading && filteredActivities.map((activity) => {
                  const isSelected = getSelection(currentDay, currentTime).activityId === activity.id;

                  // 5. Calculate remainingPlaces
                  const bookedQuantity = availabilityCounts[activity.id] || 0;
                  const activityCapacity = activity.capacity || 20; // Default capacity if not specified
                  const remainingPlaces = activityCapacity - bookedQuantity;
                  const isFull = remainingPlaces <= 0;

                  // Localized strings resolved using top-level currentLang or default 'es'
                  const displayName = getLocalized(activity.name, 'es');
                  const displayDesc = getLocalized(activity.description, 'es');

                  const finalIsFull = isFull;
                  const finalRemainingPlaces = remainingPlaces;

                  // Currency Conversion for Activity Card
                  const isUSD = config.currency === 'USD';
                  const rate = 42;
                  const displayPrice = isUSD ? (activity.price / rate) : activity.price;
                  const currencySymbol = isUSD ? 'U$S' : '$';

                  return (
                    <motion.button
                      key={activity.id}
                      disabled={finalIsFull} // 7. Disable the button if full
                      whileTap={finalIsFull ? {} : { scale: 0.98 }}
                      onClick={() => !finalIsFull && toggleSelection(currentDay, currentTime, activity.id, false)}
                      className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden ${isSelected
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : finalIsFull
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                    >
                      {/* Full Quota Overlay */}
                      {finalIsFull && (
                        <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200 shadow-sm transform -rotate-2">
                            🚫 {t('adn.fullCapacity', 'Cupo Completo')}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                          <img
                            src={activity.images[0]}
                            alt={displayName}
                            className={`w-full h-full object-cover ${finalIsFull ? 'grayscale' : ''}`}
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium text-sm truncate pr-2 ${finalIsFull ? 'text-gray-500' : 'text-gray-900'}`}>{displayName}</h4>
                            {activity.price > 0 && (
                              <span className="text-xs font-semibold text-blue-600">{currencySymbol} {Math.round(displayPrice).toLocaleString()}</span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="mb-1">
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">
                                ✨ {t('adn.suggestedAi', 'Sugerido por IA')}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 truncate mt-0.5">{displayDesc}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {activity.duration}
                            </span>
                            {activity.vat_benefit && activity.vat_benefit > 0 && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-2 h-2" />
                                -{activity.vat_benefit}% IVA
                              </span>
                            )}

                            {/* 6. Use remainingPlaces to show "Cupo Lleno" or "X lugares disponibles" */}
                            {!finalIsFull && finalRemainingPlaces > 0 && finalRemainingPlaces < 10 && (
                              <span className="text-[10px] text-orange-600 font-medium flex items-center gap-0.5">
                                ⚠️ {t('adn.spotsLeft', 'Quedan')} {finalRemainingPlaces} {t('adn.spots', 'lugares')}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(() => {
        const selection = getSelection(currentDay, currentTime);
        if (!selection.activityId || selection.resting) return null;

        const activity = activities.find(a => a.id === selection.activityId);
        const planBActivity = selection.planBActivityId ? activities.find(a => a.id === selection.planBActivityId) : null;

        if (!activity || activity.type !== 'outdoor' || !planBActivity) return null;

        // Plan B Currency Logic
        const isUSD = config.currency === 'USD';
        const rate = 42;
        const planBPrice = isUSD ? (planBActivity.price / rate) : planBActivity.price;
        const currencySymbol = isUSD ? 'U$S' : '$';

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🌧️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">☔ Plan B</p>
                  <p className="text-xs text-gray-500">
                    {selection.planBEnabled
                      ? `Si llueve: ${getLocalized(planBActivity.name, 'es')}`
                      : 'Actividad al aire libre - sin alternativa'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => togglePlanB(currentDay, currentTime)}
                className={`relative w-14 h-7 rounded-full transition-colors ${selection.planBEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${selection.planBEnabled ? 'left-8' : 'left-1'
                  }`} />
              </button>
            </div>
            {selection.planBEnabled && (
              <div className="mt-2 pt-2 border-t border-amber-200 flex justify-between text-sm">
                <span className="text-green-600">✓ {t('adn.alternativeActivated', 'Alternativa activada')}</span>
                <span className="text-green-600 font-medium">
                  {planBActivity.price === 0 ? t('common.free', 'GRATIS') : `${currencySymbol} ${Math.round(planBPrice).toLocaleString()}`}
                </span>
              </div>
            )}
          </motion.div>
        );
      })()}

      <div className="space-y-2">
        {days.map((day, idx) => {
          const { completed, total } = getDayProgress(idx);
          const dayCompleted = completed === total;
          const progressPercent = total === 0 ? 100 : (completed / total) * 100;

          return (
            <div
              key={day}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${currentDay === idx
                ? 'border-blue-500 bg-blue-50'
                : dayCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                }`}
              onClick={() => {
                setCurrentDay(idx);
                setCurrentTime('morning');
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${currentDay === idx ? 'text-blue-700' : dayCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                  Día {day} {dayCompleted && '✓'}
                </span>
                <span className="text-xs text-gray-400">
                  {completed}/{total} momentos
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${dayCompleted ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showValidationError && incompleteDays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <div>
              <p className="font-medium text-red-800">{t('adn.completeItineraryTitle', 'Completa tu itinerario')}</p>
              <p className="text-sm text-red-600">
                {t('adn.missingDays', 'Te faltan')} {incompleteDays.length} {t('adn.day', 'día')}{incompleteDays.length > 1 ? 's' : ''} {t('adn.toPlan', 'por planificar')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentDay(incompleteDays[0] - 1);
              setCurrentTime('morning');
              setShowValidationError(false);
            }}
            className="w-full py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            {t('adn.goToDay', 'Ir a Día')} {incompleteDays[0]}
          </button>
        </motion.div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
          {t('common.back', 'Atrás')}
        </button>
        <button
          onClick={() => {
            if (isItineraryComplete) {
              onContinue();
            } else {
              setShowValidationError(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`flex-1 py-3 rounded-xl font-semibold shadow-lg transition-all ${isItineraryComplete
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isItineraryComplete ? t('common.continue', 'Continuar →') : `${t('adn.completeItinerary', 'Completa tu viaje')} (${incompleteDays.length} ${t('adn.day', 'día')}${incompleteDays.length !== 1 ? 's' : ''} ${t('adn.unassigned', 'sin asignar')})`}
        </button>
      </div>

      {/* Plan B Modal */}
      <AnimatePresence>
        {planBModal && planBModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-full">☔</div>
                  <h3 className="text-xl font-bold">{t('adn.rainAlert', 'Alerta de Lluvia')}</h3>
                </div>
                <p className="opacity-90 text-sm">
                  {t('adn.rainProb', 'Hay probabilidad de lluvia para este horario. Hemos seleccionado una alternativa para ti.')}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('adn.currentActivity', 'Tu actividad actual')}</p>
                    <p className="font-medium text-gray-800 line-through decoration-red-500 decoration-2">
                      {getLocalized(activities.find(a => a.id === planBModal.activityId)?.name, 'es')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('adn.indoorSuggestion', 'Sugerencia Indoor')}</p>
                    <p className="font-bold text-blue-600 text-lg">
                      {getLocalized(activities.find(a => a.id === planBModal.planBId)?.name, 'es')}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${planBModal.priceDiff > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  {planBModal.priceDiff > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="font-bold text-amber-800">{t('adn.priceDiffPaid', 'Diferencia a pagar:')} +{planBModal.currencySymbol} {Math.round(planBModal.priceDiff).toLocaleString()}</p>
                        <p className="text-xs text-amber-600">{t('adn.paidAtVenue', 'Este monto se abonará directamente en el local.')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <p className="font-bold text-green-800">{t('adn.noExtraCost', 'Sin costo adicional')}</p>
                        <p className="text-xs text-green-600">{t('adn.samePriceOrLess', 'Mismo precio o menor que tu actividad original.')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => setPlanBModal(null)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {t('adn.keepOriginal', 'Mantener Original')}
                </button>
                <button
                  onClick={confirmPlanB}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
                >
                  {t('adn.confirmChange', 'Confirmar Cambio')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ PASO 6: RESUMEN ============
interface SummaryStepProps {
  config: any;
  onCheckout: () => void;
  onBack: () => void;
  isLoading: boolean;
  isForeigner: boolean;
  setIsForeigner: (val: boolean) => void;
  foreignerDoc: any;
  setForeignerDoc: (doc: any) => void;
  foreignerVerified: boolean;
  setForeignerVerified: (val: boolean) => void;
}

const SummaryStep = ({ config, onCheckout, onBack, isLoading, isForeigner, setIsForeigner, foreignerDoc, setForeignerDoc, setForeignerVerified, foreignerVerified }: SummaryStepProps) => {
  const { t, i18n } = useTranslation();
  const [showForeignerForm, setShowForeignerForm] = useState(false);

  // Fix timezone issue by appending time part to ensure local day
  // Fix timezone issue by setting time to 12:00 PM
  // Fix timezone issue (Robust)
  const getSafeDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    // If it's already an ISO string (has 'T'), just parse it
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    }
    // If it's YYYY-MM-DD, append T12:00:00 to avoid timezone shifts
    const d = new Date(`${dateStr}T12:00:00`);
    return isNaN(d.getTime()) ? null : d;
  };

  const startDate = getSafeDate(config.dates.start);
  const endDate = getSafeDate(config.dates.end);
  const isValidDates = startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
  // Add 12 hours to safely cover day difference without DST issues
  const nights = isValidDates ? Math.ceil((endDate!.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const adults = config.travelType === 'pareja' ? 2 : config.travelType === 'familia' ? 2 : config.travelType === 'amigos' ? 4 : 1;
  const children = config.travelType === 'familia' ? 1 : 0;
  const totalPeople = adults + children;

  const hotelPerRoom = config.hotel ? config.hotel.pricePerNight : 0;
  const hotelTotal = isValidDates ? hotelPerRoom * nights : 0;

  // Arrival Time Logic for Blocked Slots


  // Valid slots order
  const timeOrder = ['morning', 'midday', 'afternoon', 'evening'];

  let activitiesTotal = 0;
  Object.entries(config.activities).forEach(([key, sel]: [string, any]) => {
    if (sel.activityId && !sel.resting) {
      // Parse key: "1-morning" (Day 1, Morning)
      const [dayStr, time] = key.split('-');
      const dayNum = parseInt(dayStr);

      // Check blocked slots (Day 1 only)
      let isBlocked = false;
      if (dayNum === 0 && config.arrivalTime) { // Fix: Day 0 is Day 1
        const arrivalIdx = timeOrder.indexOf(config.arrivalTime);
        const slotIdx = timeOrder.indexOf(time);
        // If slot is before arrival, it is blocked
        if (slotIdx < arrivalIdx) isBlocked = true;
      }

      if (!isBlocked) {
        const activity = activities.find(a => a.id === sel.activityId);
        if (activity) {
          activitiesTotal += activity.price * totalPeople;
        }
      }
    }
  });

  const items = [
    ...(config.hotel && isValidDates ? [{ category: 'hotel' as const, grossAmount: hotelTotal }] : []),
    ...Object.entries(config.activities)
      .filter(([key, sel]: [string, any]) => {
        if (!sel.activityId || sel.resting) return false;

        // Check blocked slots (Day 1 only)
        const [dayStr, time] = key.split('-');
        const dayNum = parseInt(dayStr);

        if (dayNum === 0 && config.arrivalTime) { // Fix: Day 0 is first day
          const arrivalIdx = timeOrder.indexOf(config.arrivalTime);
          const slotIdx = timeOrder.indexOf(time);
          if (slotIdx < arrivalIdx) return false;
        }
        return true;
      })
      .map(([_, sel]: [string, any]) => {
        const activity = activities.find(a => a.id === sel.activityId);
        return { category: activity?.category || 'actividad', grossAmount: (activity?.price || 0) * totalPeople };
      })
  ];

  const taxBreakdown = calculateTaxBenefits({
    items,
    isNonUruguayanResident: isForeigner,
    paidElectronically: isForeigner
  });

  const rawTotal = taxBreakdown.finalTotal;

  // Currency Utils
  const isUSD = config.currency === 'USD';
  const rate = 42;
  const currencySymbol = isUSD ? 'U$S' : '$';

  const convert = (amount: number) => isUSD ? (amount / rate) : amount;

  const displayHotelTotal = convert(hotelTotal);
  const displayActivitiesTotal = convert(activitiesTotal);
  const displayTotal = convert(rawTotal);
  const displayDiscount = convert(taxBreakdown.totalDiscount);
  const subtotalDisplay = convert(hotelTotal + activitiesTotal); // Correct Subtotal

  const depositAmountDisplay = convert(rawTotal * 0.15);
  const remainingAmountDisplay = convert(rawTotal * 0.85);

  const formatDate = (date: any) => {
    if (!date || isNaN(date.getTime())) return '---';
    return date.toLocaleDateString(i18n.language || 'es', { day: 'numeric', month: 'short' });
  };

  let activityCount = 0;
  let restCount = 0;
  Object.values(config.activities).forEach((sel: any) => {
    if (sel.resting) restCount++;
    else if (sel.activityId) activityCount++;
  });

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('adn.summaryTitle', 'Resumen')}</h2>
        <p className="text-gray-500">{t('adn.summarySubtitle', 'Revisa los detalles de tu viaje')}</p>
      </div>

      <div className="space-y-3">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                {config.travelType === 'solo' ? '🧳' : config.travelType === 'pareja' ? '💑' : config.travelType === 'amigos' ? '👯' : '👨‍👩‍👧'}
              </div>
              <div>
                <p className="font-medium text-gray-800 capitalize">{config.travelType ? t(`adn.group.${config.travelType}`, { defaultValue: config.travelType }) as string : '---'}</p>
                <p className="text-sm text-gray-500">{totalPeople} {totalPeople > 1 ? t('adn.people', 'personas') : t('adn.person', 'persona')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{formatDate(startDate)} - {formatDate(endDate)}</p>
                <p className="text-sm text-gray-500">{nights} {nights !== 1 ? t('checkout.nights_plural', 'noches') : t('checkout.night_singular', 'noche')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{getLocalized(config.hotel?.name, 'es') || t('adn.noHotel', 'Sin hotel')}</p>
                <p className="text-sm text-gray-500">{config.hotel?.city}</p>
              </div>
            </div>
            {config.hotel && <p className="font-semibold text-gray-800">{currencySymbol} {Math.round(displayHotelTotal).toLocaleString()}</p>}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{activityCount} {t('voucher.activities', 'actividades')}</p>
                <p className="text-sm text-gray-500">{restCount} {t('adn.rests', 'descansos')}</p>
              </div>
            </div>
            <p className="font-semibold text-gray-800">{currencySymbol} {Math.round(displayActivitiesTotal).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">🌍 {t('adn.foreignTourist', 'Turista extranjero')}</p>
            <p className="text-sm text-gray-500">{t('adn.taxBenefitDesc', 'IVA 0% + devolución 9pts')}</p>
          </div>
          <button
            onClick={() => {
              if (!foreignerVerified) {
                setShowForeignerForm(true);
              } else {
                setIsForeigner(!isForeigner);
              }
            }}
            className={`relative w-14 h-7 rounded-full transition-colors ${isForeigner ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isForeigner ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
        {isForeigner && foreignerVerified && (
          <div className="mt-2 pt-2 border-t border-indigo-200 flex justify-between">
            <span className="text-green-600">✓ {t('adn.verifiedTourist', 'Verificado: Turista Extranjero')}</span>
            <span className="font-semibold text-green-600">{t('adn.savings', 'Ahorro:')} -{currencySymbol} {Math.round(displayDiscount).toLocaleString()}</span>
          </div>
        )}
      </div>

      {showForeignerForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForeignerForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('adn.foreignerVerificationTitle', 'Verificación de Turista Extranjero')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('adn.foreignerVerificationDesc', 'Para aplicar los beneficios fiscales, necesitamos verificar tu status de turista extranjero.')}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adn.docType', 'Tipo de documento')}</label>
                <select
                  value={foreignerDoc.type}
                  onChange={(e) => setForeignerDoc({ ...foreignerDoc, type: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                >
                  <option value="passport">{t('adn.passport', 'Pasaporte')}</option>
                  <option value="id">{t('adn.foreignId', 'Cédula de Identidad Extranjera')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adn.docNumber', 'Número de documento')}</label>
                <input
                  type="text"
                  value={foreignerDoc.number}
                  onChange={(e) => setForeignerDoc({ ...foreignerDoc, number: e.target.value })}
                  placeholder={foreignerDoc.type === 'passport' ? 'AB1234567' : '12345678'}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adn.fullName', 'Nombre completo')}</label>
                <input
                  type="text"
                  value={foreignerDoc.name}
                  onChange={(e) => setForeignerDoc({ ...foreignerDoc, name: e.target.value })}
                  placeholder={t('adn.asInDoc', 'Como aparece en tu documento')}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForeignerForm(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                onClick={() => {
                  if (foreignerDoc.number && foreignerDoc.name) {
                    setForeignerVerified(true);
                    setIsForeigner(true);
                    setShowForeignerForm(false);
                  }
                }}
                disabled={!foreignerDoc.number || !foreignerDoc.name}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {t('common.verify', 'Verificar')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-bold text-gray-800 border-b pb-2">{t('adn.yourItinerary', 'Tu Itinerario')}</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {config.hotel && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="bg-blue-100 text-blue-700 p-1 rounded">🏨</span>
              <span className="flex-1 truncate">{getLocalized(config.hotel.name, 'es')}</span>
            </div>
          )}
          {Object.entries(config.activities)
            .filter(([_, sel]: [string, any]) => sel.activityId && !sel.resting)
            .map(([key, sel]: [string, any]) => {
              const act = activities.find(a => a.id === sel.activityId);
              const [dayStr, time] = key.split('-');
              // Format: "Día 1 - Mañana: Actividad Name"
              const timeLabels: Record<string, string> = { morning: t('adn.morning', 'Mañana'), midday: t('adn.lunch', 'Almuerzo'), afternoon: t('adn.afternoon', 'Tarde'), evening: t('adn.nightTime', 'Noche') };
              return (
                <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="bg-green-100 text-green-700 p-1 rounded text-xs font-bold w-12 text-center">
                    Día {parseInt(dayStr) + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{getLocalized(act?.name, 'es')}</p>
                    <p className="text-xs text-gray-500">{timeLabels[time] || time}</p>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-gray-600">
          <span>{t('adn.subtotal', 'Subtotal')}</span>
          <span>{currencySymbol} {subtotalDisplay.toFixed(0)}</span>
        </div>
        {taxBreakdown.totalDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600 text-sm">
            <span>{t('adn.taxBenefits', 'Beneficios Fiscales')}</span>
            <span>-{currencySymbol} {Math.round(displayDiscount).toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-gray-100 my-2"></div>

        <div className="flex justify-between items-center text-xl font-bold text-gray-800">
          <span>{t('adn.finalTotal', 'Total Final (IVA Inc.)')}</span>
          <span>{currencySymbol} {Math.round(displayTotal).toLocaleString()}</span>
        </div>

        {/* 15/85 Breakdown */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800 font-bold uppercase mb-1">{t('adn.webDeposit', 'Seña Web (15%)')}</p>
            <p className="text-lg font-bold text-blue-700">{currencySymbol} {Math.round(depositAmountDisplay).toLocaleString()}</p>
            <p className="text-[10px] text-blue-600">{t('adn.payNow', 'A pagar ahora')}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs text-red-800 font-bold uppercase mb-1">{t('adn.balanceDest', 'Saldo en Destino (85%)')}</p>
            <p className="text-lg font-bold text-red-700">{currencySymbol} {Math.round(remainingAmountDisplay).toLocaleString()}</p>
            <p className="text-[10px] text-red-600">{t('adn.payArrival', 'A pagar al llegar')}</p>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-700">
          <span className="mt-0.5">⚠️</span>
          <p><strong>{t('common.attention', 'Atención')}:</strong> {t('adn.priceWarning', 'El presupuesto final depende de los lugares seleccionados. No incluye traslados entre puntos.')}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
          {t('common.back', 'Atrás')}
        </button>
        <button
          onClick={onCheckout}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700"
        >
          {isLoading ? t('common.processing', 'Procesando...') : t('common.continue', 'Continuar')}
        </button>
      </div>

    </div>
  );
};

// ============ PROGRESS INDICATOR ============
const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Tipo', 'Perfil', 'Fechas', 'Hotel', 'Selección', 'Actividades', 'Resumen'];

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isActive || isCompleted
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
// ============ STEPS DEFINITION ============
const steps = [
  { key: 'travelType', component: TravelTypeStep },
  { key: 'bigFive', component: BigFiveStep },
  { key: 'dates', component: DateStep },
  { key: 'hotel', component: HotelStep },
  { key: 'selection', component: ItinerarySelectionStep }, // v282: New Step
  { key: 'activities', component: ActivitiesStep },
  { key: 'summary', component: SummaryStep }
];

import { useCurrencyStore } from '@/hooks/useCurrency';

// ... other imports

// ============ ZUSTAND ADAPTER HOOK ============
const useConfigAdapter = () => {
  const store = useItineraryStore();
  const globalCurrencyStore = useCurrencyStore();

  // Map Store State to Config Object
  const config = {
    travelType: store.travelGroup,
    groupDetails: {
      adults: store.numberOfAdults,
      children: store.numberOfChildren,
      ages: store.childrenAges
    },
    dates: { start: store.startDate || '', end: store.endDate || '' },
    hotel: store.selectedHotel,
    budget: store.budget,
    currency: globalCurrencyStore.currency,
    arrivalTime: store.arrivalTime, // Mapped
    bigFive: store.bigFiveScores || { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
    activities: store.draftActivities || {},
  };

  // Map Setters
  const setConfig = (newConfigOrFn: any) => {
    const current = config;
    const next = typeof newConfigOrFn === 'function' ? newConfigOrFn(current) : newConfigOrFn;

    // Batch Updates to Store
    if (next.travelType !== current.travelType) store.setTravelGroup(next.travelType);
    if (next.budget !== current.budget) store.setBudget(next.budget);
    if (next.currency !== current.currency) {
      store.setCurrency(next.currency);
      globalCurrencyStore.setCurrency(next.currency);
    }

    // Group Details
    if (JSON.stringify(next.groupDetails) !== JSON.stringify(current.groupDetails)) {
      store.setNumberOfAdults(next.groupDetails.adults);
      store.setNumberOfChildren(next.groupDetails.children);
      store.setChildrenAges(next.groupDetails.ages);
    }

    // Dates
    if (next.dates.start !== current.dates.start || next.dates.end !== current.dates.end) {
      const getLocalDate = (dStr: string) => {
        if (!dStr) return null;
        if (dStr.includes('T')) return new Date(dStr);
        const [year, month, day] = dStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      };

      const s = getLocalDate(next.dates.start);
      const e = getLocalDate(next.dates.end);
      store.setDates(s, e);
    }

    // Hotel
    if (next.hotel?.id !== current.hotel?.id) {
      store.setSelectedHotel(next.hotel);
    }

    // Big Five
    if (JSON.stringify(next.bigFive) !== JSON.stringify(current.bigFive)) {
      store.setBigFiveScores(next.bigFive);
    }

    // Activities
    if (JSON.stringify(next.activities) !== JSON.stringify(current.activities)) {
      store.setDraftActivities(next.activities);
    }
  };

  return { config, setConfig };
};

export function AdnViajeroPage() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] || 'es') as 'es' | 'en';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determinar step inicial: si viene ?step=hotel, ir directo al paso hotel (índice 3)
  const getInitialStep = () => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'hotel') return 3;
    return 0;
  };
  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [isLoading] = useState(false);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ user: AuthUser | null; transactionId: string | null; voucherCodes?: Record<string, string> }>({ user: null, transactionId: null, voucherCodes: {} });

  // Tax & Foreigner State
  const [isForeigner, setIsForeigner] = useState(false);
  const [foreignerDoc, setForeignerDoc] = useState({ type: 'passport', number: '', name: '' });
  const [foreignerVerified, setForeignerVerified] = useState(false);

  // v282: Persistence & Clusters
  const { config, setConfig } = useConfigAdapter();
  const [itineraryOptions, setItineraryOptions] = useState<any[]>([]);


  // v282: Removed Internal ItinerarySelectionStep component
  // v282: Removed local config state (replaced by useConfigAdapter)


  // Fix timezone issue by appending time part to ensure local day
  // Fix timezone issue by setting time to 12:00 PM
  // Fix timezone issue by setting time to 12:00 PM (Robust)
  // Fix timezone issue by setting time to 12:00 PM (Robust)
  const getSafeDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    // If it's already an ISO string (has 'T'), just parse it
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    }
    // Append time to force local parsing around noon (safest for dates)
    const date = new Date(`${dateStr}T12:00:00`);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const calculatePaymentSummary = (): PaymentSummary => {
    const startStr = config.dates.start;
    const endStr = config.dates.end;
    if (!startStr || !endStr) {
      return { subtotal: 0, ivaSavings: 0, total: 0, depositAmount: 0, remainingAmount: 0, hotelTaxSavings: 0, restaurantSavings: 0, nights: 0, adults: 1, children: 0, checkInDate: '', checkOutDate: '' };
    }
    const start = getSafeDate(startStr);
    const end = getSafeDate(endStr);
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { subtotal: 0, ivaSavings: 0, total: 0, depositAmount: 0, remainingAmount: 0, hotelTaxSavings: 0, restaurantSavings: 0, nights: 0, adults: 1, children: 0, checkInDate: startStr, checkOutDate: endStr };
    }
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // ✅ Modified: Use Dynamic Group Details
    const adults = config.groupDetails?.adults || (config.travelType === 'pareja' ? 2 : config.travelType === 'amigos' ? 4 : 1);
    const children = config.groupDetails?.children || (config.travelType === 'familia' ? 1 : 0);
    const totalPeople = adults + children;

    const hotelPerRoom = config.hotel ? config.hotel.pricePerNight : 0;
    const hotelTotal = hotelPerRoom * nights;

    // Filter logic must match SummaryStep (Blocked Day 1 slots)
    const timeOrder = ['morning', 'midday', 'afternoon', 'evening'];
    let activitiesTotal = 0;
    Object.entries(config.activities).forEach(([key, sel]: [string, any]) => {
      if (sel.activityId && !sel.resting) {
        const [dayStr, time] = key.split('-');
        const dayNum = parseInt(dayStr);
        let isBlocked = false;
        if (dayNum === 0 && config.arrivalTime) { // Day 0 is first day
          const arrivalIdx = timeOrder.indexOf(config.arrivalTime);
          const slotIdx = timeOrder.indexOf(time);
          if (slotIdx < arrivalIdx) isBlocked = true;
        }

        if (!isBlocked) {
          const activity = activities.find(a => a.id === sel.activityId);
          if (activity) activitiesTotal += activity.price * totalPeople;
        }
      }
    });

    const items = [
      ...(config.hotel ? [{ category: 'hotel' as const, grossAmount: hotelTotal }] : []),
      ...Object.entries(config.activities)
        .filter(([key, sel]: [string, any]) => {
          if (!sel.activityId || sel.resting) return false;
          const [dayStr, time] = key.split('-');
          const dayNum = parseInt(dayStr);
          if (dayNum === 0 && config.arrivalTime) {
            const arrivalIdx = timeOrder.indexOf(config.arrivalTime);
            const slotIdx = timeOrder.indexOf(time);
            if (slotIdx < arrivalIdx) return false;
          }
          return true;
        })
        .map(([_, sel]: [string, any]) => {
          const activity = activities.find(a => a.id === sel.activityId);
          // Pass actual category so taxUtils can distinguish Gastronomy (7.38%) from Others (9%)
          return { category: activity?.category || 'actividad', grossAmount: (activity?.price || 0) * totalPeople };
        })
    ];

    // Only apply electronic payment benefits if IS FOREIGNER (to force max potential discount)
    // or if user explicitly selects it (future feature). For now, use isForeigner as proxy to show "Foreigner Price" vs "Standard Price"
    const taxBreakdown = calculateTaxBenefits({ items, isNonUruguayanResident: isForeigner, paidElectronically: isForeigner });
    const total = taxBreakdown.finalTotal;

    // Correct Tax Splits:
    // hotelTaxSavings = The Accommodation Discount from taxUtils
    const hotelSavings = taxBreakdown.accommodationIVADiscount;
    // ivaSavings = Total Discount - Hotel Discount (covers Gastronomy + Others)
    const otherSavings = taxBreakdown.totalDiscount - hotelSavings;

    return {
      subtotal: hotelTotal + activitiesTotal,
      ivaSavings: otherSavings,
      total,
      depositAmount: total * 0.15,
      remainingAmount: total * 0.85,
      hotelTaxSavings: hotelSavings,
      restaurantSavings: taxBreakdown.gastronomyIVADiscount,
      nights,
      adults,
      children,
      checkInDate: startStr,
      checkOutDate: endStr
    };
  };

  // v282: Steps handled dynamically above


  const handleCheckoutStart = () => {
    if (checkoutData.user) {
      setCurrentStep(8);
    } else {
      setCurrentStep(7);
    }
  };

  const handleAuthComplete = (userData: any) => {
    console.log('[AdnViajero] Auth Complete. User Data:', userData);
    setCheckoutData(prev => ({
      ...prev,
      user: { ...userData } // Ensure we create a new object ref
    }));
    setCurrentStep(8);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    // Save to Supabase for Admin/Partner Dashboards
    const newVoucherCodes: Record<string, string> = {};

    try {
      const bookingsToInsert: any[] = [];
      const user = checkoutData.user;
      const totalPax = calculatePaymentSummary().adults + calculatePaymentSummary().children;

      if (config.hotel && config.dates.start && config.dates.end) {
        const start = getSafeDate(config.dates.start);
        const end = getSafeDate(config.dates.end);
        const nights = (start && end) ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 1;

        const masterCode = generateBookingReference();
        newVoucherCodes['hotel'] = masterCode;

        const grossTotal = config.hotel.pricePerNight * nights;
        const taxSavings = isForeigner ? (grossTotal - (grossTotal / 1.22)) : 0;
        const netTotal = grossTotal - taxSavings;

        // 1. Hotel Booking - Refactored to match CheckoutPage schema
        bookingsToInsert.push({
          partner_id: config.hotel.partnerId || 'd290f1ee-6c54-4b01-90e6-d701748f0856', // ✅ Fallback: Mar Dulce
          service_id: config.hotel.id || crypto.randomUUID(), // Must be UUID
          booking_date: config.dates.start || new Date().toISOString().split('T')[0],
          time_slot: 'check-in',
          tourist_name: user?.name || user?.email || 'Guest',
          tourist_email: user?.email || 'guest@escapauy.com',
          voucher_code: masterCode,
          status: 'confirmed',
          amount: grossTotal,
          deposit_amount: netTotal * 0.15,
          balance_amount: netTotal * 0.85
        });

        // 2. Paid Activities
        Object.entries(config.activities).forEach(([key, sel]: [string, any]) => {
          if (sel.activityId && !sel.resting) {
            const activity = activities.find(a => a.id === sel.activityId);
            if (activity) {
              const grossTotal = activity.price * totalPax;
              const taxSavings = (isForeigner && activity.price > 0) ? (grossTotal - (grossTotal / 1.22)) : 0;
              const netTotal = grossTotal - taxSavings;

              newVoucherCodes[key] = masterCode;

              const [dayIdx, time] = key.split('-');
              const activityDate = new Date(config.dates.start);
              activityDate.setDate(activityDate.getDate() + parseInt(dayIdx));

              bookingsToInsert.push({
                partner_id: activity.partnerId || 'd290f1ee-6c54-4b01-90e6-d701748f0856', // ✅ Fallback: Mar Dulce
                service_id: activity.id || crypto.randomUUID(),
                booking_date: activityDate.toISOString().split('T')[0],
                time_slot: time,
                tourist_name: user?.name || user?.email || 'Guest',
                tourist_email: user?.email || 'guest@escapauy.com',
                voucher_code: masterCode,
                status: 'confirmed',
                amount: grossTotal,
                deposit_amount: netTotal * 0.15,
                balance_amount: netTotal * 0.85
              });
            }
          }
        });

        console.log('[AdnViajero] Config for DB save:', { hotel: config.hotel, activities: config.activities });
        console.log('[AdnViajero] Bookings prepared for insert:', bookingsToInsert);

        if (bookingsToInsert.length > 0) {
          const toastId = toast.loading('Guardando reserva...');
          const { error } = await supabase.from('partner_bookings').insert(bookingsToInsert);

          if (error) {
            console.error('[AdnViajero] DB Save Error:', error);
            if (error.message.includes('Failed to fetch') || !import.meta.env.VITE_SUPABASE_URL) {
              console.warn('⚠️ Falló conexión a Supabase. Guardado simulado con éxito (Mock).');
              toast.success('¡Reserva guardada con éxito! (Modo Demo)', { id: toastId });
            } else {
              toast.error(`Error al guardar: ${error.message}`, { id: toastId });
            }
          } else {
            console.log('[AdnViajero] Persistence Successful');
            toast.success('¡Reserva guardada con éxito!', { id: toastId });
          }
        } else {
          console.warn('[AdnViajero] No bookings to insert! Arrays are empty.');
          toast.error('Error: No hay datos para guardar', { duration: 4000 });
        }

      }
    } catch (err: any) {
      console.error('[AdnViajero] Critical DB Error:', err);
      if (err.message?.includes('Failed to fetch') || !import.meta.env.VITE_SUPABASE_URL) {
        console.warn('⚠️ Falló conexión a Supabase. Guardado simulado con éxito (Mock).');
        toast.success('¡Reserva guardada con éxito! (Modo Demo)');
      } else {
        toast.error('Error crítico al procesar la reserva');
      }
    }

    setCheckoutData(prev => ({ ...prev, transactionId, voucherCodes: newVoucherCodes }));
    setCurrentStep(9);
  };

  const handleVoucherDownload = () => {
    const { setDates, setSelectedHotel, addActivity, setTravelGroup, setNumberOfAdults, setNumberOfChildren, setBigFiveScores, clearItinerary } = useItineraryStore.getState();

    // 1. Reset and Set Basic Info
    clearItinerary();

    // 2. Set Dates
    if (config.dates.start && config.dates.end) {
      setDates(new Date(config.dates.start), new Date(config.dates.end));
    }

    // 3. Set Hotel
    if (config.hotel) setSelectedHotel(config.hotel);

    // 4. Set Group
    const group = config.travelType || 'solo';
    setTravelGroup(group);

    // Use configured group details or defaults based on type
    if (config.groupDetails) {
      setNumberOfAdults(config.groupDetails.adults);
      setNumberOfChildren(config.groupDetails.children);
    } else {
      if (group === 'pareja') { setNumberOfAdults(2); setNumberOfChildren(0); }
      else if (group === 'solo') { setNumberOfAdults(1); setNumberOfChildren(0); }
      else { setNumberOfAdults(2); setNumberOfChildren(1); }
    }

    setBigFiveScores(config.bigFive);

    // 5. Add Activities
    Object.entries(config.activities).forEach(([key, sel]: [string, any]) => {
      if (sel.activityId && !sel.resting) {
        const [dayIdxStr, time] = key.split('-');
        const activity = activities.find(a => a.id === sel.activityId);
        if (activity) {
          const dayIdx = parseInt(dayIdxStr);
          // time is 'morning' | 'midday' | 'afternoon' | 'evening'. 
          // We need to map it to valid TimeSlot if needed, or if addActivity accepts string.
          // Store definition: addActivity: (dayIndex: number, activity: Activity, timeSlot: TimeSlot) => boolean;

          const currentLang = (i18n.language?.split('-')[0] || 'es') as 'es' | 'en';
          const storeActivity = {
            ...activity,
            name: getLocalized(activity.name, currentLang),
            description: getLocalized(activity.description, currentLang) // Even if store ignores it, it's safe providing string
          };
          addActivity(dayIdx, storeActivity as any, time as any);
        }
      }
    });

    navigate('/itinerary/new');
  };

  const CurrentStepComponent = steps[currentStep]?.component as any;
  const paymentSummary = calculatePaymentSummary();

  // Currency Conversion for Payment/Vouchers
  const exchangeRate = 42;
  const isUSD = config.currency === 'USD';

  const finalPaymentSummary = isUSD ? {
    ...paymentSummary,
    subtotal: paymentSummary.subtotal / exchangeRate,
    ivaSavings: paymentSummary.ivaSavings / exchangeRate,
    total: paymentSummary.total / exchangeRate,
    depositAmount: paymentSummary.depositAmount / exchangeRate,
    remainingAmount: paymentSummary.remainingAmount / exchangeRate,
    hotelTaxSavings: (paymentSummary.hotelTaxSavings || 0) / exchangeRate,
    restaurantSavings: (paymentSummary.restaurantSavings || 0) / exchangeRate
  } : paymentSummary;

  // unused var removed


  // v282: Clear stale data on mount to ensure fresh start
  const { clearItinerary } = useItineraryStore();

  useEffect(() => {
    // Only clear if we are starting from the beginning (which is default on mount)
    // This solves "Cosas pegadas en memoria"
    if (currentStep === 0) {
      console.log('[AdnViajero] Clearing stale persistence on mount');
      clearItinerary();
    }
  }, []); // Run once on mount

  // v282: Robust Auto-Generation Trigger (AI INTEGRATION)
  useEffect(() => {
    if (currentStep === 4 && itineraryOptions.length === 0) {
      console.log('[DEBUG] Auto-generating options for Step 4 (AI POWERED)...');
      const toastId = toast.loading('La IA está diseñando tu viaje...'); // Keep loading

      const runAi = async () => {
        try {
          // Import dynamically to avoid top-level issues if file not ready, generally safe though
          const { fetchAiItinerary } = await import('@/utils/aiService');

          // 1. Call Agent
          const start = config.dates.start ? new Date(config.dates.start) : new Date();
          const end = config.dates.end ? new Date(config.dates.end) : new Date();
          const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

          const aiData = await fetchAiItinerary(checkoutData.user?.id || 'anon-user', {
            days: nights + 1, // Itinerary usually covers days, so nights + 1 roughly or just nights? Let's say days = nights + 1 covering checkout day
            // Actually standard is Days = Nights + 1 usually. 
            // But let's stick to days = nights for simplified logic if preferred, OR pass both dates.
            // Let's pass date range for better context.
            dates: config.dates,
            cityName: config.hotel?.city || 'Colonia del Sacramento',
            arrivalTime: config.arrivalTime,
            groupType: config.travelType,
            isForeigner: isForeigner
          });

          if (aiData && aiData.itinerary) {
            console.log('[AdnViajero] AI Itinerary Received:', aiData);

            // 2. Map AI Response to Frontend Structure
            // 2. Map AI Response to Frontend Structure
            // Structure: Array of Day Objects [ { morning: {...}, afternoon: {...} }, ... ]
            const aiActivities: any[] = [];

            aiData.itinerary.forEach((dayPlan: any) => {
              const daySchedule: any = {};
              ['morning', 'midday', 'afternoon', 'evening'].forEach(time => {
                const item = dayPlan[time];
                if (item && item.activity_id) {
                  // Verify ID exists in our local database
                  const foundActivity = activities.find(a => a.id === item.activity_id);
                  if (foundActivity) {
                    daySchedule[time] = {
                      activityId: item.activity_id,
                      activity: foundActivity, // Vital for ItinerarySelectionStep to render images/title
                      resting: false,
                      planBEnabled: foundActivity.type === 'outdoor', // Auto-enable for outdoor?
                      planBActivityId: null
                    };
                  } else {
                    console.warn(`[AdnViajero] AI returned unknown ID: ${item.activity_id}`);
                    daySchedule[time] = { resting: true };
                  }
                } else {
                  // Default to resting if AI didn't schedule anything for this slot
                  daySchedule[time] = { resting: true };
                }
              });
              aiActivities.push(daySchedule);
            });

            // 3. Create Option
            // We'll reuse the hotel from config or pick one if AI suggested (AI currently doesn't suggest hotel in this mock, assuming Config hotel)
            const aiOption = {
              id: 'discovery', // Reusing ID type
              title: 'Recomendado por IA',
              description: aiData.reasoning || 'Personalizado para ti',
              totalPrice: 0, // Recalculated below
              originalPrice: 0,
              savings: 0,
              hotel: config.hotel || hotels[0], // Fallback
              activities: aiActivities, // Correct Array Structure 
              // Wait, `activities` in ItineraryOption is usually an ARRAY of Activity objects or the Map?
              // Let's check `itineraryGenerator.ts` again.
              // It returns `activities: any[]` which are the *Selected Activities Lists*?
              // actually `generateItineraryOptions` returns `activities` as the Map?
              // Looking at `ItinerarySelectionStep`, it expects `options` to have `activities` which is the map/object?
              // Line 2168: `data.activities.forEach...` suggest `data` is the option. 
              // `selection` in config is the *chosen option*. 

              // Actually, looking at `ItinerarySelectionStep` usage in `AdnViajeroPage`:
              // When option selected: `options` passed to it.
              // Let's assume `activities` in Option is the pre-calculated selection map/array.
              // In `itineraryGenerator.ts`, `selectActivities` returns a Map-like object or Array?
              // `balancedActivities` calls `selectActivities`. I didn't see `selectActivities` body but likely returns the map.

              badge: '✨ IA Generativa'
            };

            // We need to calculate price for the option to be valid
            // Reuse `calculateTotal` if possible, but it implies importing.
            // For now, let's trust the components calculate display price or we approximate.
            // Actually `generateItineraryOptions` does `calculateTotal`.

            // Let's MIX: Get standard options AND replace one or add one.
            const standardOptions = generateItineraryOptions(config, isForeigner);

            // Overwrite the first option or add as special
            // Overwrite the first option or add as special
            const finalOptions = [
              { ...aiOption, id: 'classic', activities: aiActivities, totalPrice: 9999, originalPrice: 10000 },
              ...standardOptions.slice(1) // Keep others as alternatives
            ];

            setItineraryOptions(finalOptions);
          } else {
            console.warn('[AdnViajero] AI returned no itinerary, falling back to algorithmic.');
            const options = generateItineraryOptions(config, isForeigner);
            setItineraryOptions(options);
          }

          toast.dismiss(toastId);
          toast.success('¡Itinerario generado con IA!');

        } catch (e) {
          console.error('[AdnViajero] AI Generation Failed, falling back.', e);
          const options = generateItineraryOptions(config, isForeigner);
          setItineraryOptions(options);
          toast.dismiss(toastId);
        }
      };

      runAi();
    }
  }, [currentStep, itineraryOptions.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🧳 {t('adn.yourGetaway', 'Tu Escapada')}</h1>
          <p className="text-gray-500 text-sm">{config.hotel?.city ? `${config.hotel.city}, ${t('adn.departmentOf', 'Departamento de')} Colonia` : `${t('adn.departmentOf', 'Departamento de')} Colonia`}</p>
        </div>

        {currentStep < 7 && <ProgressIndicator currentStep={currentStep} />}

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {currentStep < 7 && CurrentStepComponent && (
              <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {currentStep === 1 ? (
                  <BigFiveStep
                    onUpdateScore={(data: any) => setConfig({ ...config, [steps[currentStep].key]: data })} // Explicit type
                    onComplete={(data: any) => { setConfig({ ...config, [steps[currentStep].key]: data }); setCurrentStep(currentStep + 1); }}
                    scores={config.bigFive}
                    onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  />
                ) : currentStep === 0 ? (
                  <TravelTypeStep
                    onSelect={(data) => {
                      setConfig({
                        ...config,
                        travelType: data.type,
                        groupDetails: { adults: data.adults, children: data.children, ages: data.ages },
                        budget: data.budget,
                        currency: data.currency
                      });
                      setIsForeigner(data.isForeigner);
                      setCurrentStep(currentStep + 1);
                    }}
                    selectedType={config.travelType}
                    isForeigner={isForeigner}
                    defaultCurrency={config.currency}
                  />
                ) : currentStep < steps.length ? (
                  <CurrentStepComponent

                    onSelect={
                      (data: any) => {
                        // Special handling for Itinerary Selection
                        if (steps[currentStep].key === 'selection') {
                          // 1. Save selection
                          setConfig((prev: any) => {
                            // Flatten activities from option to store format
                            const newActivities: any = {};
                            data.activities.forEach((daySchedule: any, dayIdx: number) => {
                              Object.entries(daySchedule).forEach(([time, selection]: [string, any]) => {
                                const key = `${dayIdx}-${time}`; // Fix: 0-based index to match ActivitiesStep & PaymentSummary
                                newActivities[key] = {
                                  activityId: selection.activityId,
                                  activity: selection.activity, // Persist full object for SummaryStep
                                  resting: selection.resting,
                                  planBEnabled: selection.planBEnabled,
                                  planBActivityId: selection.planBActivityId
                                };
                              });
                            });

                            // Also update Hotel!
                            return {
                              ...prev,
                              selection: data,
                              hotel: data.hotel,
                              activities: newActivities
                            };
                          });
                          setCurrentStep(currentStep + 1);
                        } else {
                          // Generic Handler
                          setConfig((prev: any) => ({ ...prev, [steps[currentStep].key]: data }));
                          if (steps[currentStep].key !== 'activities') {
                            setCurrentStep(currentStep + 1);
                          }
                        }
                      }}
                    selectedType={config.travelType}
                    selectedDates={config.dates}
                    selectedHotel={config.hotel}
                    selectedActivities={config.activities}
                    config={config}
                    options={itineraryOptions}
                    currency={config.currency}
                    isLoading={isLoading}
                    onCheckout={handleCheckoutStart}
                    onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    onContinue={() => setCurrentStep(6)}
                    arrivalTime={arrivalTime}
                    onArrivalTimeSelect={setArrivalTime}
                    scores={config.bigFive}
                    onUpdateScore={(data: any) => setConfig({ ...config, bigFive: data })}
                    onComplete={() => { }}
                    isForeigner={isForeigner}
                    setIsForeigner={setIsForeigner}
                    foreignerDoc={foreignerDoc}
                    setForeignerDoc={setForeignerDoc}
                    foreignerVerified={foreignerVerified}
                    setForeignerVerified={setForeignerVerified}
                    // v282: AUTO FILL LOGIC FIXED
                    onAutoFill={() => {
                      const toastId = toast.loading('La IA está diseñando tu viaje...');
                      setTimeout(() => {
                        const options = generateItineraryOptions(config, isForeigner);
                        setItineraryOptions(options);
                        toast.dismiss(toastId);
                        setCurrentStep(4); // Go to Clustered Selection
                      }, 1500);
                    }}

                  />
                ) : null}
              </motion.div>
            )}
            {currentStep === 7 && checkoutData.user === null && (
              <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <AuthCheckout paymentSummary={finalPaymentSummary} onComplete={handleAuthComplete} onBack={() => setCurrentStep(6)} />
              </motion.div>
            )}
            {currentStep === 8 && checkoutData.user && (
              <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <PaymentForm paymentSummary={finalPaymentSummary} user={checkoutData.user} onSuccess={handlePaymentSuccess} onBack={() => setCurrentStep(6)} currency={config.currency || 'UYU'} />
              </motion.div>
            )}
            {currentStep === 9 && checkoutData.user && (
              <motion.div key="voucher" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{t('adn.yourVouchers', 'Tus Vouchers de Reserva')}</h2>
                  <p className="text-gray-500">{t('adn.generatedVouchers1', 'Hemos generado')} {
                    (config.hotel ? 1 : 0) + Object.values(config.activities).filter((s: any) => s.activityId && !s.resting && (activities.find(a => a.id === s.activityId)?.price || 0) > 0).length
                  } {t('adn.generatedVouchers2', 'vouchers individuales para tu viaje.')}</p>
                </div>

                {/* 1. Hotel Voucher */}
                {config.hotel && (() => {
                  const start = getSafeDate(config.dates.start);
                  const end = getSafeDate(config.dates.end);
                  const nights = (start && end)
                    ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  const grossTotal = config.hotel.pricePerNight * nights;
                  const taxSavings = isForeigner ? (grossTotal - (grossTotal / 1.22)) : 0;
                  const netTotal = grossTotal - taxSavings;

                  const convert = (val: number) => isUSD ? (val / exchangeRate) : val;

                  return (
                    <Voucher
                      user={checkoutData.user!}
                      onDownload={handleVoucherDownload}
                      onShare={() => alert('Voucher enviado')}
                      onAddToCalendar={handleVoucherDownload}
                      currency={config.currency || 'UYU'}
                      item={{
                        id: 'hotel-voucher',
                        type: 'hotel',
                        reference: checkoutData.voucherCodes?.['hotel'], // Use persisted ref
                        providerName: (config.hotel.name[currentLang] || config.hotel.name['es']),
                        itemName: `${t('adn.stay', 'Estadía')} ${nights} ${t('checkout.nights_plural', 'Noches')}`,
                        address: config.hotel.address,
                        phone: '+598 4522 9999',
                        email: 'reservas@hotel.com',
                        date: start ? start.toISOString() : config.dates.start,
                        endDate: end ? end.toISOString() : config.dates.end,
                        priceAdult: convert(config.hotel.pricePerNight),
                        priceChild: 0,
                        totalPrice: convert(grossTotal),
                        isForeigner: isForeigner,
                        taxSavings: convert(taxSavings),
                        depositAmount: convert(netTotal * 0.15),
                        remainingAmount: convert(netTotal * 0.85),
                        pax: { adults: calculatePaymentSummary().adults, children: calculatePaymentSummary().children }
                      }}
                    />
                  );
                })()}

                {/* 2. Paid Activities Vouchers */}
                {Object.entries(config.activities)
                  .filter(([_, sel]: [string, any]) => {
                    if (!sel.activityId || sel.resting) return false;
                    const act = activities.find(a => a.id === sel.activityId);
                    if (!act) return false;

                    // EXCLUDE FREE BEACHES from Vouchers (User request: "I don't need voucher for beach")
                    // But keep Free Parks/Reserves (like Kerayvoty)
                    if (act.category === 'playa' && act.price === 0) return false;

                    return true;
                  })
                  .map(([key, sel]: [string, any]) => {
                    const [dayIdx, time] = key.split('-');
                    const activity = activities.find(a => a.id === sel.activityId)!;
                    const date = getSafeDate(config.dates.start);
                    if (!date) return null;
                    date.setDate(date.getDate() + parseInt(dayIdx));

                    // Set specific time based on slot for correct ISO string
                    if (time === 'morning') date.setHours(9, 0, 0);
                    else if (time === 'midday') date.setHours(13, 0, 0);
                    else if (time === 'afternoon') date.setHours(16, 0, 0);
                    else if (time === 'evening') date.setHours(20, 0, 0);

                    const totalPeople = calculatePaymentSummary().adults + calculatePaymentSummary().children;
                    const grossTotal = activity.price * totalPeople;

                    // Logic from taxUtils (Unified 18.03% Zero VAT for all services for foreigners)
                    // Formula: Gross - (Gross / 1.22)
                    const taxSavings = isForeigner ? (grossTotal - (grossTotal / 1.22)) : 0;
                    const netTotal = grossTotal - taxSavings;

                    const convert = (val: number) => isUSD ? (val / exchangeRate) : val;

                    return (
                      <Voucher
                        key={key}
                        user={checkoutData.user!}
                        onDownload={handleVoucherDownload}
                        onShare={() => alert('Voucher enviado')}
                        onAddToCalendar={handleVoucherDownload}
                        currency={config.currency || 'UYU'}
                        item={{
                          id: `activity-${sel.activityId}`,
                          type: 'activity',
                          reference: checkoutData.voucherCodes?.[key], // Use persisted ref
                          providerName: activity?.category === 'restaurante' ? (activity?.partnerName || 'Restaurante Local') : (activity?.partnerName || 'Operador Turístico'),
                          itemName: getLocalized(activity?.name, currentLang),
                          address: activity?.city || 'Uruguay',
                          phone: '+598 99 123 456',
                          email: 'info@actividad.com',
                          date: date.toISOString(),
                          time: time,
                          endDate: '',
                          priceAdult: convert(activity?.price || 0),
                          priceChild: 0,
                          totalPrice: convert(grossTotal),
                          isForeigner: isForeigner,
                          taxSavings: convert(taxSavings),
                          depositAmount: convert(netTotal * 0.15),
                          remainingAmount: convert(netTotal * 0.85),
                          pax: { adults: calculatePaymentSummary().adults, children: calculatePaymentSummary().children }
                        }}
                      />
                    );

                  })}

                <div className="flex justify-center pt-8">
                  <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-900 transition-all flex items-center gap-2">
                    🖨️ Imprimir Todos los Vouchers
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AdnViajeroPage;