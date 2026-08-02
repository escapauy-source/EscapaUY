import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, MapPin, Sun, Umbrella,
  AlertCircle, Calendar, CreditCard, Shield, ArrowRight
} from 'lucide-react';
import { getActivityById, getPartnerById, activities } from '@/data/mockData';
import { ActivityCard } from '@/components/ActivityCard';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { getTranslatedContent } from '@/utils/i18nHelpers';
import { useTranslation } from 'react-i18next';

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { weather, isAuthenticated, setShowAuthModal } = useApp();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const activity = getActivityById(id || '');
  const partner = activity ? getPartnerById(activity.partnerId) : null;
  const planBActivity = activity?.planBAlternativeId ? getActivityById(activity.planBAlternativeId) : null;

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('notFound', 'Actividad no encontrada')}</h1>
          <Link to="/explore" className="text-ocean-600 hover:underline">
            {t('backToCatalog', 'Volver al catálogo')}
          </Link>
        </div>
      </div>
    );
  }

  // Bilingual Content Logic (Object-Based)
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

  const translatedTitle = getLocalized(activity.name);
  const translatedDescription = getLocalized(activity.description);

  const planBTitle = planBActivity
    ? getLocalized(planBActivity.name)
    : '';

  const occupancyPercent = (activity.currentOccupancy / activity.capacity) * 100;
  const showWeatherAlert = !activity.weatherResilient && weather.rainProbability >= 70;

  const handleReserve = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigate(`/checkout?activity=${activity.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('back', 'Volver')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden mb-6"
            >
              <img
                src={activity.images[0]}
                alt={translatedTitle}
                className="w-full h-[400px] object-cover"
              />
            </motion.div>

            {/* Weather Alert */}
            {showWeatherAlert && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Umbrella className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      ⚠️ {t('weatherAlert', 'Alerta Climática')}: {t('outdoorActivity', 'Esta es una actividad outdoor')}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {t('rainProbabilityMessage', `Con ${weather.rainProbability}% de probabilidad de lluvia, tu reserva incluye automáticamente el Plan B.`)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                  activity.weatherResilient
                    ? "bg-ocean-100 text-ocean-700"
                    : "bg-amber-100 text-amber-700"
                )}>
                  {activity.weatherResilient ? (
                    <><Umbrella className="w-3.5 h-3.5" /> Indoor</>
                  ) : (
                    <><Sun className="w-3.5 h-3.5" /> Outdoor</>
                  )}
                </span>
                <span className="text-sm text-gray-500 capitalize">{activity.category}</span>
              </div>

              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {translatedTitle}
              </h1>

              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {activity.partnerName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {activity.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {t('upTo', 'Hasta')} {activity.capacity} {t('people', 'personas')}
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {translatedDescription}
              </p>

              {/* Partner Legal Info */}
              {partner && (
                <div className="p-4 bg-gray-100 rounded-xl mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{t('providerInfo', 'Información del Prestador')}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>{t('businessName', 'Razón Social')}:</strong> {partner.razonSocial}</p>
                    <p><strong>RUT:</strong> {partner.rut}</p>
                    <p><strong>{t('address', 'Dirección')}:</strong> {partner.legalAddress}</p>
                  </div>
                </div>
              )}

              {/* Image Disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  {t('imageDisclaimer', 'Las imágenes son de carácter ilustrativo. Los servicios, instalaciones y disponibilidad pueden variar. Consulte condiciones en el establecimiento.')}
                </p>
              </div>
            </motion.div>

            {/* Plan B Section */}
            {planBActivity && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Umbrella className="w-5 h-5 text-ocean-600" />
                  <h2 className="font-playfair text-xl font-bold text-gray-900">
                    {t('planBIncluded', 'Tu Plan B incluido')}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  {t('planBDescription', 'Si el clima no acompaña, automáticamente se activará esta alternativa bajo techo:')}
                </p>
                <ActivityCard activity={planBActivity} isAlternative showPlanB={false} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${activity.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500">UYU / {t('person', 'persona')}</span>
                </div>
                <p className="text-sm text-nature-600 mt-1 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {t('foreignCardsBenefit', 'Tarjetas extranjeras: IVA incluido con beneficio')}
                </p>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">{t('availability', 'Disponibilidad')}</span>
                  <span className="font-medium">
                    {activity.capacity - activity.currentOccupancy} {t('spots', 'lugares')}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      occupancyPercent > 80 ? "bg-red-500" :
                        occupancyPercent > 50 ? "bg-amber-500" : "bg-nature-500"
                    )}
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              {/* Date Picker Placeholder */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('date', 'Fecha')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Reserve Button */}
              <button
                onClick={handleReserve}
                className="w-full py-4 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-200 flex items-center justify-center gap-2"
              >
                {t('reserveNow', 'Reservar ahora')}
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-nature-500" />
                  <span>{t('weatherGuarantee', 'Garantía de reembolso por clima')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Umbrella className="w-4 h-4 text-ocean-500" />
                  <span>{t('autoPlanB', 'Plan B automático incluido')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span>{t('securePayments', 'Pagos seguros (BCU regulado)')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Activities */}
        <section className="mt-16">
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
            {t('youMayAlsoLike', 'También te puede interesar')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities
              .filter(a => a.id !== activity.id && a.category === activity.category)
              .slice(0, 3)
              .map(a => (
                <ActivityCard key={a.id} activity={a} />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
