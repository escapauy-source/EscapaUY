import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight, Wine, Utensils, Landmark, Bike, Waves } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEOLayout } from '@/components/seo/SEOLayout';

const schema = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "Colonia del Sacramento",
  "description": "Destino turístico histórico en Uruguay con actividades únicas, bodegas, gastronomía y naturaleza.",
  "url": "https://www.escapauy.com/colonia/que-hacer",
  "touristType": ["Cultural", "Gastronomy", "Nature"],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -34.4626,
    "longitude": -57.8483
  },
  "containsPlace": [
    { "@type": "TouristAttraction", "name": "Barrio Histórico de Colonia", "description": "Patrimonio de la Humanidad UNESCO" },
    { "@type": "TouristAttraction", "name": "Faro de Colonia", "description": "Mirador icónico con vistas al Río de la Plata" },
    { "@type": "TouristAttraction", "name": "Bodegas de Carmelo", "description": "Enoturismo y degustación de vinos uruguayos" }
  ]
};

const activities = [
  { icon: Landmark, title: 'Barrio Histórico', desc: 'Calles empedradas y arquitectura colonial declarada Patrimonio UNESCO. La visita imprescindible.', tag: 'Cultural' },
  { icon: Wine, title: 'Enoturismo', desc: 'Bodegas boutique a 40 minutos: Carmelo y Nueva Helvecia. Tannat, Albariño y quesos artesanales.', tag: 'Gastronomía' },
  { icon: Utensils, title: 'Gastronomía local', desc: 'Restaurantes de cocina de autor con ingredientes de la región. Pescado de río, cordero y producción propia.', tag: 'Gastronomía' },
  { icon: Bike, title: 'Ciclismo y naturaleza', desc: 'Alquiler de bicicletas para recorrer el casco histórico y llegar hasta playas y miradores naturales.', tag: 'Aventura' },
  { icon: Waves, title: 'Playas y termas', desc: 'Playas del Río de la Plata con aguas tranquilas. Termas de Daymán a 4 horas.', tag: 'Naturaleza' },
  { icon: Star, title: 'Experiencias IA', desc: 'EscapaUY crea tu itinerario basado en tu personalidad (Big Five). Actividades curadas, no genéricas.', tag: 'Exclusivo' },
];

export function ColoniaQuehacerPage() {
  return (
    <>
      <SEOHead
        title="Qué hacer en Colonia del Sacramento, Uruguay 2026 | EscapaUY"
        description="Descubrí las mejores actividades en Colonia del Sacramento: Barrio Histórico UNESCO, enoturismo en Carmelo, gastronomía local y experiencias personalizadas. Armá tu escapada perfecta con EscapaUY."
        canonical="/colonia/que-hacer"
        schema={schema}
      />
      <SEOLayout>
          {/* Hero */}
          <section className="relative bg-[#1A1F2C] text-white py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#1A1F2C]" />
            <div className="relative max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-[#C5A059]">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium tracking-widest uppercase">Colonia del Sacramento, Uruguay</span>
              </div>
              <motion.h1
                className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Qué hacer en<br />
                <span className="text-[#C5A059]">Colonia del Sacramento</span>
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                La ciudad colonial más encantadora del Cono Sur. A 1 hora de Buenos Aires en barco, con actividades para todos los gustos y una gastronomía que sorprende.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all shadow-lg"
              >
                Armá tu itinerario personalizado
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Actividades */}
          <section className="py-16 px-4 bg-[#F8F7F4]">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-4">
                Las mejores actividades en Colonia
              </h2>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Desde historia Patrimonio UNESCO hasta enoturismo y aventura. Colonia tiene algo para cada tipo de viajero.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map(({ icon: Icon, title, desc, tag }) => (
                  <motion.div
                    key={title}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 bg-[#1A1F2C] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#C5A059]" />
                    </div>
                    <span className="text-xs font-bold text-[#C5A059] tracking-widest uppercase">{tag}</span>
                    <h3 className="font-bold text-gray-900 text-lg mt-1 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Cómo llegar */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-8 text-center">
                Cómo llegar a Colonia desde Buenos Aires
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-[#F8F7F4] rounded-2xl p-6">
                  <div className="font-bold text-gray-900 mb-2">🚢 En barco (recomendado)</div>
                  <p className="text-gray-600 text-sm">Buquebus y Seacat salen desde Puerto Madero. 1 hora de viaje. Salidas diarias desde $30 USD. La experiencia empieza en el barco.</p>
                </div>
                <div className="bg-[#F8F7F4] rounded-2xl p-6">
                  <div className="font-bold text-gray-900 mb-2">🚗 En auto + ferry</div>
                  <p className="text-gray-600 text-sm">Podés llevar el auto en el ferry. Ideal para explorar los alrededores: Carmelo, Nueva Helvecia, Fray Bentos.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-[#1A1F2C] text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold mb-4">
                Tu escapada a Colonia, personalizada con IA
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                EscapaUY analiza tu perfil de viajero y crea un itinerario único: hotel, actividades y gastronomía curados para vos.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all"
              >
                Descubrí tu ADN Viajero
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
      </SEOLayout>
    </>
  );
}
