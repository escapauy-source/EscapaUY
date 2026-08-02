import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Umbrella, Brain, ArrowRight, CheckCircle2,
  Building2, Target, AlertTriangle, Route, TrendingUp, MapPin, Zap, Presentation,
  ShieldAlert, Focus, LineChart, XCircle, Clock
} from 'lucide-react';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useTranslation } from 'react-i18next';

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Hero para inversores */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Investor Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full shadow-lg mb-6 border border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-ocean-400 animate-pulse" />
                  <span className="text-sm text-white font-medium">{t('landing.badge_demo')}</span>
                </div>

                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  {t('landing.hero.title')}
                  <span className="relative block mt-2">
                    <span className="relative z-10 text-ocean-600"> {t('landing.hero.title_accent')}</span>
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                  {t('landing.hero.description')}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/adn-viajero"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ocean-600 text-white font-semibold rounded-full hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-200"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t('landing.hero.cta_demo')}
                  </Link>
                  <button
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                  >
                    <Presentation className="w-5 h-5" />
                    {t('landing.hero.cta_deck')}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Visual Demo / Context */}
            <div className="hidden lg:flex justify-end relative">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-md relative z-10"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-ocean-100 to-amber-100 blur-2xl opacity-50 rounded-[3rem]" />
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('landing.hero.weather_label')}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <WeatherWidget showDetails />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. El Problema */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-ocean-600 uppercase mb-3">
              {t('landing.problem.title')}
            </h2>
            <h3 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900">
              {t('landing.problem.subtitle')}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-3">{t('landing.problem.point1_title')}</h4>
              <p className="text-gray-600">{t('landing.problem.point1_desc')}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Umbrella className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-3">{t('landing.problem.point2_title')}</h4>
              <p className="text-gray-600">{t('landing.problem.point2_desc')}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-ocean-100 text-ocean-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-3">{t('landing.problem.point3_title')}</h4>
              <p className="text-gray-600">{t('landing.problem.point3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. La Oportunidad & 4. La Solución */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-ocean-500/20 text-ocean-400 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold tracking-widest text-ocean-400 uppercase mb-3">
                {t('landing.opportunity.title')}
              </h2>
              <h3 className="font-playfair text-3xl font-bold mb-4">
                {t('landing.opportunity.subtitle')}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 flex-grow">
                {t('landing.opportunity.description')}
              </p>
              <div className="bg-ocean-900/30 rounded-xl p-5 border border-ocean-500/20">
                <h4 className="font-bold text-ocean-300 text-sm mb-2 uppercase tracking-wide">
                  {t('landing.opportunity.tax_free_title')}
                </h4>
                <p className="text-sm text-gray-400">
                  {t('landing.opportunity.tax_free_desc')}
                </p>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-nature-500/20 text-nature-400 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold tracking-widest text-nature-400 uppercase mb-3">
                {t('landing.solution.title')}
              </h2>
              <h3 className="font-playfair text-3xl font-bold mb-4">
                {t('landing.solution.subtitle')}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 flex-grow">
                {t('landing.solution.description')}
              </p>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Input del usuario</span>
                </div>
                <p className="font-mono text-white text-lg bg-gray-900 p-4 rounded-lg border border-gray-700">
                  "Voy en pareja 2 noches y llueve"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué ahora */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-ocean-600 uppercase mb-3">
              {t('landing.why_now.title')}
            </h2>
            <h3 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900">
              {t('landing.why_now.subtitle')}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl mb-3">{t('landing.why_now.point1_title')}</h4>
              <p className="text-gray-600">{t('landing.why_now.point1_desc')}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-nature-100 text-nature-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl mb-3">{t('landing.why_now.point2_title')}</h4>
              <p className="text-gray-600">{t('landing.why_now.point2_desc')}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl mb-3">{t('landing.why_now.point3_title')}</h4>
              <p className="text-gray-600">{t('landing.why_now.point3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. El Wedge Inicial (Colonia sin Riesgos) */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mock Dashboard Preview */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm order-2 lg:order-1">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-semibold text-gray-900">{t('landing.partner_preview.title')}</h4>
                <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 bg-ocean-50 px-3 py-1 rounded-full">{t('landing.partner_preview.demo')}</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 text-amber-700 mb-3">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-bold">{t('landing.partner_preview.alert_active')}</span>
                </div>
                <p className="text-sm text-amber-900 font-medium">
                  {t('landing.partner_preview.alert_desc')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">{t('landing.partner_preview.weather')}</div>
                  <div className="text-3xl font-bold text-amber-500 mb-1">75%</div>
                  <div className="text-xs text-gray-400">{t('landing.partner_preview.rain_prob')}</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">{t('landing.partner_preview.current_occupancy')}</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">40%</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[40%] bg-ocean-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-3">
                {t('landing.wedge.title')}
              </h2>
              <h3 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t('landing.wedge.subtitle')}
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('landing.wedge.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Diferencial, 7. Qué NO estamos haciendo & 8. Modelo de Negocio */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Diferencial */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-8 h-8 text-ocean-600" />
                <h2 className="font-playfair text-2xl font-bold text-gray-900">
                  {t('landing.differential.title')}
                </h2>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-bold mb-1">{t('landing.differential.point1_title')}</h4>
                  <p className="text-sm text-gray-600">{t('landing.differential.point1_desc')}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-bold mb-1">{t('landing.differential.point2_title')}</h4>
                  <p className="text-sm text-gray-600">{t('landing.differential.point2_desc')}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 border-l-4 border-l-ocean-500">
                  <h4 className="font-bold mb-1">{t('landing.differential.point3_title')}</h4>
                  <p className="text-sm text-gray-600">{t('landing.differential.point3_desc')}</p>
                </div>
              </div>
            </div>

            {/* Qué NO hacemos */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
                <h2 className="font-playfair text-2xl font-bold text-gray-900">
                  {t('landing.not_doing.title')}
                </h2>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 h-full">
                <h4 className="font-bold text-red-900 mb-6">{t('landing.not_doing.subtitle')}</h4>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-red-800 text-sm">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 font-bold text-xs">x</span>
                      </div>
                      <span>{t(`landing.not_doing.point${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modelo de Negocio */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <LineChart className="w-8 h-8 text-nature-600" />
                <h2 className="font-playfair text-2xl font-bold text-gray-900">
                  {t('landing.business_model.title')}
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-nature-100 text-nature-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold">{t('landing.business_model.point1_title')}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t('landing.business_model.point1_desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start opacity-70">
                  <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold">{t('landing.business_model.point2_title')}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t('landing.business_model.point2_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Validación & 10. Riesgos */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Qué validamos */}
            <div>
              <h2 className="text-sm font-bold tracking-widest text-ocean-600 uppercase mb-3">Hitos Críticos</h2>
              <h3 className="font-playfair text-3xl font-bold text-gray-900 mb-8">
                {t('landing.validation.title')}
              </h3>
              <ul className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ocean-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{t(`landing.validation.item${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Riesgos */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-sm font-bold tracking-widest text-red-600 uppercase mb-3">{t('landing.risks.subtitle')}</h2>
              <h3 className="font-playfair text-3xl font-bold text-gray-900 mb-8">
                {t('landing.risks.title')}
              </h3>
              <ul className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Focus className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800">{t(`landing.risks.item${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Roadmap */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-16">
            {t('landing.roadmap.title')}
          </h2>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gray-100 -z-10" />
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
              <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mb-4">
                M1-2
              </div>
              <p className="text-sm font-medium text-gray-700">{t('landing.roadmap.month1')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
              <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mb-4">
                M2-3
              </div>
              <p className="text-sm font-medium text-gray-700">{t('landing.roadmap.month2')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
              <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mb-4">
                M3-4
              </div>
              <p className="text-sm font-medium text-gray-700">{t('landing.roadmap.month3')}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
              <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mb-4">
                M4-6
              </div>
              <p className="text-sm font-medium text-gray-700">{t('landing.roadmap.month4')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11.5 Estado Actual (Qué existe y qué falta) */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-ocean-600 uppercase mb-3">
              {t('landing.current_status.subtitle')}
            </h2>
            <h3 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900">
              {t('landing.current_status.title')}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
              <h4 className="font-bold text-xl text-green-800 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t('landing.current_status.exists_title')}
              </h4>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>{t(`landing.current_status.exists_${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-ocean-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-ocean-500" />
              <h4 className="font-bold text-xl text-ocean-800 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t('landing.current_status.missing_title')}
              </h4>
              <ul className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-ocean-500 mt-2 flex-shrink-0" />
                    <span>{t(`landing.current_status.missing_${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 12. CTA Final */}
      <section className="py-24 bg-gray-900 text-white border-t-4 border-t-ocean-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold tracking-widest text-ocean-400 uppercase mb-4">
              {t('landing.cta_final.pre_title')}
            </h2>
            <h3 className="font-playfair text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              {t('landing.cta_final.description')}
            </h3>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.cta_final.call_to_action')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-colors shadow-xl text-lg"
              >
                <Presentation className="w-5 h-5" />
                {t('landing.cta_final.primary_btn')}
              </button>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-gray-700 text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-xl text-lg"
              >
                <Sparkles className="w-5 h-5" />
                {t('landing.cta_final.secondary_btn')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
