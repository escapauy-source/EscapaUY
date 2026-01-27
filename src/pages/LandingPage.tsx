import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Shield, Sun, Umbrella, Brain, CreditCard,
  BarChart3, Calendar, Users, ArrowRight, CheckCircle2,
  Building2, Percent, Clock
} from 'lucide-react';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { ReviewCard } from '@/components/ReviewCard';
import { reviews } from '@/data/mockData';

export function LandingPage() {
  const { setShowAuthModal } = useApp();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Split Background */}
        <div className="absolute inset-0 grid grid-cols-2">
          <div
            className="bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />
          </div>
          <div
            className="bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-ocean-500/30 to-transparent" />
          </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Weather badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-sm text-gray-600">{t('landing.hero.weather_label')}</span>
                <WeatherWidget compact />
              </div>

              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {t('landing.hero.title')}
                <span className="relative">
                  <span className="relative z-10"> {t('landing.hero.title_accent')}</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-300" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                {t('landing.hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/adn-viajero"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ocean-600 text-white font-semibold rounded-full hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-200"
                >
                  <Sparkles className="w-5 h-5" />
                  {t('landing.hero.cta_design')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors border border-gray-200 shadow-lg"
                >
                  <Building2 className="w-5 h-5" />
                  {t('landing.hero.cta_partner')}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-gray-200/50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-nature-500" />
                  {t('landing.hero.badge_bcu')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-nature-500" />
                  {t('landing.hero.badge_mintur')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-5 h-5 text-nature-500" />
                  {t('landing.hero.badge_iva')}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Weather Widget Large - Más pequeño y mejor posicionado */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block absolute right-8 top-24 w-72"
          >
            <div className="scale-90 origin-top-right">
              <WeatherWidget showDetails />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works - Tourist */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.tourist.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.tourist.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-medium text-purple-600 mb-2">{t('landing.step_label', { index: 1 })}</div>
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-3">
                {t('landing.tourist.step1_title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.tourist.step1_desc')}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-ocean-200">
                <Umbrella className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-medium text-ocean-600 mb-2">{t('landing.step_label', { index: 2 })}</div>
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-3">
                {t('landing.tourist.step2_title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.tourist.step2_desc')}
              </p>
              <div className="mt-4 p-3 bg-ocean-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Umbrella className="w-5 h-5 text-ocean-500" />
                </div>
                <p className="text-xs text-ocean-700 mt-2">Plan A → Plan B</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-nature-500 to-nature-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-nature-200">
                <Percent className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-medium text-nature-600 mb-2">{t('adn.step_of', { current: 3, total: 3 })}</div>
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-3">
                {t('landing.tourist.step3_title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.tourist.step3_desc')}
              </p>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/adn-viajero"
              className="inline-flex items-center gap-2 px-8 py-4 bg-ocean-600 text-white font-semibold rounded-full hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-200"
            >
              {t('landing.tourist.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isTestimonial
              />
            ))}
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-500/20 rounded-full mb-6">
                <Building2 className="w-4 h-4 text-ocean-400" />
                <span className="text-sm text-ocean-300">{t('landing.partner.label')}</span>
              </div>

              <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-6">
                {t('landing.partner.title')}
              </h2>

              <p className="text-lg text-gray-300 mb-8">
                {t('landing.partner.description')}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-nature-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-nature-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t('landing.partner.feature1_title')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('landing.partner.feature1_desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t('landing.partner.feature2_title')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('landing.partner.feature2_desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ocean-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-ocean-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t('landing.partner.feature3_title')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('landing.partner.feature3_desc')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-ocean-500 text-white font-semibold rounded-full hover:bg-ocean-600 transition-colors"
              >
                {t('landing.partner.cta')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold">{t('landing.partner_preview.title')}</h4>
                <span className="text-xs text-gray-400">{t('landing.partner_preview.demo')}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-ocean-400" />
                    <span className="text-sm text-gray-400">{t('landing.partner_preview.today')}</span>
                  </div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-gray-400">{t('landing.partner_preview.visitors')}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Umbrella className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-gray-400">{t('landing.partner_preview.weather')}</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-400">75%</p>
                  <p className="text-xs text-gray-400">{t('landing.partner_preview.rain_prob')} 16h</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Umbrella className="w-5 h-5" />
                  <span className="font-medium">{t('landing.partner_preview.alert_active')}</span>
                </div>
                <p className="text-sm text-gray-300">
                  {t('landing.partner_preview.alert_desc', { count: 12 })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{t('landing.partner_preview.current_occupancy')}</span>
                  <span className="font-medium">8 / 20</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-gradient-to-r from-nature-500 to-nature-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-ocean-600 to-ocean-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-6">
              {t('landing.cta_final.title')}
            </h2>
            <p className="text-lg text-ocean-100 mb-8 max-w-2xl mx-auto">
              {t('landing.cta_final.description')}
            </p>
            <Link
              to="/adn-viajero"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-ocean-700 font-bold rounded-full hover:bg-ocean-50 transition-colors shadow-xl text-lg"
            >
              <Sparkles className="w-6 h-6" />
              {t('landing.cta_final.button')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
