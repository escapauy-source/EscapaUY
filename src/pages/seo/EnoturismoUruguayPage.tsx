import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wine, Globe, Leaf, TrendingUp } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEOLayout } from '@/components/seo/SEOLayout';

const schema = {
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": "Enoturismo Uruguay",
  "description": "Uruguay, el país del Tannat. Recorrido por las principales regiones vitivinícolas: Carmelo, Canelones, Atlántica. Experiencias de enoturismo únicas.",
  "url": "https://www.escapauy.com/experiencias/enoturismo-uruguay",
  "touristType": ["Wine Tourism", "Gastronomy", "Luxury"],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -32.5228,
    "longitude": -55.7658
  }
};

const regiones = [
  {
    nombre: 'Carmelo, Colonia',
    uva: 'Tannat · Albariño · Merlot',
    descripcion: 'La región más turística. Bodegas boutique con alojamiento y gastronomía integrada. A 2 horas de Buenos Aires.',
    ideal: 'Fin de semana completo',
    acceso: '⭐ Más fácil desde BA',
  },
  {
    nombre: 'Canelones',
    uva: 'Tannat · Cabernet · Viognier',
    descripcion: 'La región vitivinícola más grande de Uruguay. Bodegas de todas las escalas, desde pequeñas familiares hasta grandes exportadoras.',
    ideal: 'Día o fin de semana',
    acceso: 'Cerca de Montevideo',
  },
  {
    nombre: 'Costa de Oro / Atlántica',
    uva: 'Albariño · Chardonnay',
    descripcion: 'Vinos de influencia oceánica. El Albariño uruguayo tiene características únicas por la brisa marítima. Bodegas pequeñas y exclusivas.',
    ideal: 'Combinable con Punta del Este',
    acceso: 'Ruta 9 desde Montevideo',
  },
];

const razones = [
  { icon: Wine, title: 'El país del Tannat', desc: 'Uruguay es el principal productor mundial de Tannat. Una uva que en otros países es de mezcla, aquí es la estrella.' },
  { icon: Globe, title: 'Reconocimiento mundial', desc: 'Los vinos uruguayos tienen presencia en los mejores restaurantes de Europa y Norteamérica. Descubrís algo genuino.' },
  { icon: Leaf, title: 'Producción sustentable', desc: 'La mayoría de las bodegas boutique trabajan con prácticas orgánicas o biodinámicas. El vino que tomás respeta la tierra.' },
  { icon: TrendingUp, title: 'Precio-calidad imbatible', desc: 'Vinos de alta calidad a un precio muy accesible comparado con Mendoza, Napa o Bordeaux. El secreto mejor guardado.' },
];

export function EnoturismoUruguayPage() {
  return (
    <>
      <SEOHead
        title="Enoturismo en Uruguay 2026: Regiones, Bodegas y Experiencias | EscapaUY"
        description="Uruguay, el país del Tannat. Guía completa de enoturismo: regiones de Carmelo, Canelones y Costa de Oro. Bodegas boutique, degustaciones y maridajes. Reservá tu experiencia con EscapaUY."
        canonical="/experiencias/enoturismo-uruguay"
        schema={schema}
      />
      <SEOLayout>
          {/* Hero */}
          <section className="relative bg-[#1A0E00] text-white py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-[#1A0E00]" />
            <div className="relative max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-[#C5A059]">
                <Wine className="w-5 h-5" />
                <span className="text-sm font-medium tracking-widest uppercase">El secreto del vino sudamericano</span>
              </div>
              <motion.h1
                className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Enoturismo en<br />
                <span className="text-[#C5A059]">Uruguay</span>
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Uruguay es el único país del mundo donde el Tannat es la uva estrella. Sus bodegas boutique ofrecen experiencias íntimas que no encontrás en Argentina ni Chile.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all shadow-lg"
              >
                Planificá tu ruta del vino
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Por qué Uruguay */}
          <section className="py-16 px-4 bg-[#F8F7F4]">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-12">
                Por qué el enoturismo en Uruguay es diferente
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {razones.map(({ icon: Icon, title, desc }) => (
                  <motion.div
                    key={title}
                    className="bg-white rounded-2xl p-6 shadow-sm flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 bg-[#1A0E00] rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#C5A059]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Regiones */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-4">
                Las tres regiones vitivinícolas de Uruguay
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Cada región tiene su carácter. EscapaUY te ayuda a elegir la que mejor se adapta a tu viaje.
              </p>
              <div className="space-y-6">
                {regiones.map((region) => (
                  <motion.div
                    key={region.nombre}
                    className="bg-[#F8F7F4] rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-xl">{region.nombre}</h3>
                          <span className="px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold rounded-full">{region.acceso}</span>
                        </div>
                        <div className="text-xs text-purple-700 font-medium mb-3 flex items-center gap-1">
                          <Wine className="w-3 h-3" />
                          {region.uva}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{region.descripcion}</p>
                      </div>
                      <div className="shrink-0 text-sm">
                        <div className="text-xs text-gray-500 mb-1">Duración ideal</div>
                        <div className="font-medium text-gray-800">{region.ideal}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* El Tannat */}
          <section className="py-16 px-4 bg-[#F8F7F4]">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
                Todo lo que necesitás saber sobre el Tannat uruguayo
              </h2>
              <div className="prose prose-sm text-gray-600 space-y-3">
                <p>El <strong>Tannat</strong> es originario de la región de Madiran en Francia, pero fue en Uruguay donde encontró su tierra prometida. El clima atlántico uruguayo (más húmedo y fresco que Mendoza) le da características únicas: taninos más suaves, mayor frescura y una complejidad aromática que los franceses envidian.</p>
                <p>Las bodegas uruguayas producen Tannat en tres estilos: <strong>joven y frutal</strong> (para beber en los primeros 2-3 años), <strong>roble corto</strong> (6-12 meses en barrica, más estructura) y <strong>gran reserva</strong> (18+ meses, los más complejos y costosos).</p>
                <p>El maridaje perfecto del Tannat uruguayo: <strong>asado de tira, cordero patagónico, quesos curados</strong>. En Carmelo, muchas bodegas lo sirven con charcutería local de productores vecinos.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-[#1A0E00] text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold mb-4">
                Tu ruta del vino personalizada
              </h2>
              <p className="text-gray-300 mb-8">
                EscapaUY crea tu itinerario enoturístico según tu perfil: qué bodegas visitar, en qué orden, con qué hotel y qué maridajes. Solo tenés que disfrutar.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all"
              >
                Crear mi ruta del vino
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
      </SEOLayout>
    </>
  );
}
