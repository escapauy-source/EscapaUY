import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, CloudRain, MapPin, Wine, UtensilsCrossed, Sparkles,
  ArrowRight, Shield, Star, TrendingDown, Clock, ChevronDown
} from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type WeatherState = 'sunny' | 'rainy';

// ── Datos del widget climático (simulados) ────────────────────────────────────
const WEATHER_DATA = {
  sunny: {
    temp: '23°C',
    desc: 'Parcialmente nublado',
    planB: 28,
    icon: Sun,
    color: 'text-gold',
    bg: 'from-amber-900/20 to-night-800',
  },
  rainy: {
    temp: '14°C',
    desc: 'Lluvias intermitentes',
    planB: 82,
    icon: CloudRain,
    color: 'text-blue-300',
    bg: 'from-blue-900/20 to-night-800',
  },
};

// ── Destinos ocultos ──────────────────────────────────────────────────────────
const DESTINATIONS = [
  {
    name: 'Carmelo',
    label: 'Ruta del Vino',
    icon: Wine,
    desc: 'Bodegas boutique a 45 min de Colonia capital. Catas privadas, paisajes de ribera.',
    highlight: '6 bodegas boutique',
    distance: '45 min',
  },
  {
    name: 'Nueva Helvecia',
    label: 'Ruta del Queso',
    icon: UtensilsCrossed,
    desc: 'Colonia suiza con queseros artesanales y cervecerías de autor. Sin multitudes.',
    highlight: '4 productores artesanales',
    distance: '30 min',
  },
  {
    name: 'Conchillas',
    label: 'Pueblo Histórico',
    icon: MapPin,
    desc: 'Arquitectura victoriana intacta. El secreto mejor guardado del Departamento.',
    highlight: 'Patrimonio UNESCO',
    distance: '55 min',
  },
];

// ── Prueba social (datos falsos para demo) ────────────────────────────────────
const STATS = [
  { value: '3 destinos', label: 'alternativos activados' },
  { value: '100%', label: 'techado si llueve' },
  { value: '0 filas', label: 'sin cola de ferry' },
];

// ══════════════════════════════════════════════════════════════════════════════
export function LandingMVP() {
  const [weather, setWeather] = useState<WeatherState>('sunny');
  const [tick, setTick] = useState(0);

  // Simula variación climática automática cada 8 s para demo
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(id);
  }, []);

  const wData = WEATHER_DATA[weather];
  const WeatherIcon = wData.icon;

  const scrollToWizard = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#1A1F2C' }}>

      {/* ══ HERO — Pantalla dividida Sol / Lluvia ════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Fondo dinámico */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="wait">
            {weather === 'sunny' ? (
              <motion.div
                key="sunny-bg"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                style={{
                  background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(197,160,89,0.18) 0%, transparent 70%), #1A1F2C',
                }}
              />
            ) : (
              <motion.div
                key="rainy-bg"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                style={{
                  background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%), #1A1F2C',
                }}
              />
            )}
          </AnimatePresence>
          {/* Grid decorativo */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(197,160,89,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Contenido hero */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border mb-8"
            style={{ borderColor: 'rgba(197,160,89,0.4)', background: 'rgba(197,160,89,0.08)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#C5A059' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#C5A059' }}>
              Departamento de Colonia · Uruguay
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-playfair text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ color: '#F8F7F4' }}
          >
            Colonia sin Riesgos:
            <br />
            <span style={{ color: '#C5A059' }}>Descubrí la Ruta</span>
            <br />
            del Vino y del Queso
            <br />
            <span className="italic font-normal text-4xl md:text-5xl opacity-80">con Garantía Climática</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'rgba(248,247,244,0.7)' }}
          >
            Si llueve en la capital, tu plan B ya está listo. Te llevamos a las bodegas boutique
            y rutas gastronómicas del interior: <strong style={{ color: '#C5A059' }}>Carmelo, Nueva Helvecia y Conchillas</strong>,
            donde no hay colas ni multitudes.
          </motion.p>

          {/* Toggle clima interactivo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-1 p-1 rounded-sm mb-10"
            style={{ background: 'rgba(248,247,244,0.06)', border: '1px solid rgba(197,160,89,0.2)' }}
          >
            <button
              onClick={() => setWeather('sunny')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-semibold transition-all duration-300 ${weather === 'sunny' ? 'text-night' : 'text-cream/60 hover:text-cream/90'}`}
              style={weather === 'sunny' ? { background: '#C5A059', color: '#1A1F2C' } : {}}
            >
              <Sun className="w-4 h-4" />
              Día de Sol
            </button>
            <button
              onClick={() => setWeather('rainy')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-semibold transition-all duration-300 ${weather === 'rainy' ? '' : 'text-cream/60 hover:text-cream/90'}`}
              style={weather === 'rainy' ? { background: '#3b82f6', color: '#fff' } : {}}
            >
              <CloudRain className="w-4 h-4" />
              Día de Lluvia
            </button>
          </motion.div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/wizard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-sm font-bold text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: '#C5A059', color: '#1A1F2C', boxShadow: '0 8px 32px rgba(197,160,89,0.3)' }}
            >
              <Sparkles className="w-5 h-5" />
              Diseñar mi Escapada Inteligente
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={scrollToWizard}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-sm font-medium text-sm transition-all duration-300 hover:opacity-90"
              style={{ color: 'rgba(248,247,244,0.7)', border: '1px solid rgba(248,247,244,0.15)' }}
            >
              ¿Cómo funciona?
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ color: 'rgba(197,160,89,0.5)' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ══ WIDGET CLIMÁTICO ════════════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={weather}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="rounded-sm p-8 glass-dark"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Temperatura */}
                <div className="flex items-center gap-4 shrink-0">
                  <div
                    className="w-16 h-16 rounded-sm flex items-center justify-center"
                    style={{ background: weather === 'sunny' ? 'rgba(197,160,89,0.15)' : 'rgba(59,130,246,0.15)' }}
                  >
                    <WeatherIcon
                      className="w-8 h-8"
                      style={{ color: weather === 'sunny' ? '#C5A059' : '#60a5fa' }}
                    />
                  </div>
                  <div>
                    <div className="font-playfair text-4xl font-bold" style={{ color: '#F8F7F4' }}>
                      {wData.temp}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(248,247,244,0.55)' }}>
                      Colonia del Sacramento
                    </div>
                    <div className="text-sm font-medium mt-0.5" style={{ color: 'rgba(248,247,244,0.7)' }}>
                      {wData.desc}
                    </div>
                  </div>
                </div>

                {/* Barra Plan B */}
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(248,247,244,0.5)' }}>
                      Probabilidad de activar Plan B (Techado)
                    </span>
                    <span
                      className="text-xl font-bold font-playfair"
                      style={{ color: wData.planB > 50 ? '#60a5fa' : '#C5A059' }}
                    >
                      {wData.planB}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full w-full overflow-hidden" style={{ background: 'rgba(248,247,244,0.1)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${wData.planB}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: wData.planB > 50 ? '#3b82f6' : '#C5A059' }}
                    />
                  </div>
                  <p className="text-sm mt-4 leading-relaxed" style={{ color: 'rgba(248,247,244,0.6)' }}>
                    {wData.planB > 50
                      ? '⚡ Plan B activado automáticamente: tu itinerario ya incluye actividades 100% techadas en Carmelo y Nueva Helvecia.'
                      : '☀️ Condiciones ideales para actividades al aire libre. Tu ruta por viñedos y rutas del queso están confirmadas.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══ PITCH TERRITORIAL ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(197,160,89,0.1)', color: '#C5A059', border: '1px solid rgba(197,160,89,0.2)' }}
            >
              <TrendingDown className="w-3 h-3" />
              Escapá de la Aglomeración
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F8F7F4' }}>
              Rincones que la mayoría
              <br />
              <span style={{ color: '#C5A059' }}>nunca descubren</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(248,247,244,0.6)' }}>
              Mientras todos hacen fila para el ferry, vos ya estás en una cata privada entre viñedos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest, i) => {
              const Icon = dest.icon;
              return (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="rounded-sm p-7 group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(248,247,244,0.04)',
                    border: '1px solid rgba(197,160,89,0.12)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(197,160,89,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(197,160,89,0.12)')}
                >
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
                    style={{ background: 'rgba(197,160,89,0.1)' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#C5A059' }} />
                  </div>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#C5A059' }}
                  >
                    {dest.label}
                  </div>
                  <h3 className="font-playfair text-2xl font-bold mb-3" style={{ color: '#F8F7F4' }}>
                    {dest.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(248,247,244,0.6)' }}>
                    {dest.desc}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="px-3 py-1 rounded-sm font-medium"
                      style={{ background: 'rgba(197,160,89,0.1)', color: '#C5A059' }}
                    >
                      {dest.highlight}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'rgba(248,247,244,0.4)' }}>
                      <Clock className="w-3 h-3" />
                      {dest.distance}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ ESTADÍSTICAS ════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 border-y" style={{ borderColor: 'rgba(197,160,89,0.12)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-playfair text-3xl md:text-4xl font-bold mb-1" style={{ color: '#C5A059' }}>
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(248,247,244,0.5)' }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════════════════ */}
      <section id="cta-section" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5" style={{ color: '#C5A059' }} />
              <Star className="w-5 h-5" style={{ color: '#C5A059' }} />
              <Star className="w-5 h-5" style={{ color: '#C5A059' }} />
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F8F7F4' }}>
              Tu escapada perfecta
              <br />
              <span className="italic font-normal" style={{ color: '#C5A059' }}>empieza en 3 minutos</span>
            </h2>
            <p className="text-base mb-10" style={{ color: 'rgba(248,247,244,0.6)' }}>
              Sin registro. Sin cuenta. Contanos quién sos como viajero y la plataforma diseña
              tu itinerario con resiliencia climática incluida.
            </p>

            <Link
              to="/wizard"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-sm font-bold text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: '#C5A059', color: '#1A1F2C', boxShadow: '0 12px 40px rgba(197,160,89,0.35)' }}
            >
              <Sparkles className="w-6 h-6" />
              Diseñar mi Escapada Inteligente
              <ArrowRight className="w-6 h-6" />
            </Link>

            {/* Micro-garantías */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              {[
                { icon: Shield, text: 'Sin registro requerido' },
                { icon: Clock, text: '3 minutos para tu perfil' },
                { icon: MapPin, text: 'Itinerario personalizado' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(248,247,244,0.5)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#C5A059' }} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
