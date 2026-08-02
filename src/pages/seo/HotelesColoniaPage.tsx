import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, Wifi, Coffee, ShieldCheck } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEOLayout } from '@/components/seo/SEOLayout';

const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Mejores hoteles boutique en Colonia del Sacramento",
  "url": "https://www.escapauy.com/hoteles/colonia",
  "description": "Los mejores hoteles boutique y alojamientos de diseño en Colonia del Sacramento, Uruguay.",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "LodgingBusiness",
        "name": "Hotel Charco Hotel",
        "description": "Boutique hotel en el Barrio Histórico con piscina y vista al río",
        "address": { "@type": "PostalAddress", "addressLocality": "Colonia del Sacramento", "addressCountry": "UY" }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "LodgingBusiness",
        "name": "Posada Plaza Mayor",
        "description": "Posada colonial frente a la Plaza Mayor, el corazón histórico de Colonia",
        "address": { "@type": "PostalAddress", "addressLocality": "Colonia del Sacramento", "addressCountry": "UY" }
      }
    }
  ]
};

const hoteles = [
  {
    nombre: 'Hotel Charco Hotel',
    tipo: 'Boutique de lujo',
    descripcion: 'El hotel más icónico de Colonia. Diseño contemporáneo en el Barrio Histórico, piscina con vista al Río de la Plata y restaurante de autor.',
    destacados: ['Piscina con vista al río', 'Restaurante gourmet', 'Spa', 'Barrio Histórico'],
    precio: 'Desde $8.000 UYU/noche',
    stars: 5,
  },
  {
    nombre: 'Posada Plaza Mayor',
    tipo: 'Posada colonial',
    descripcion: 'Ubicada frente a la Plaza Mayor, en el centro del Barrio Histórico UNESCO. Habitaciones con balcón, desayuno incluido y una atmósfera auténticamente colonial.',
    destacados: ['Ubicación histórica', 'Desayuno incluido', 'Balcón', 'Vista a la plaza'],
    precio: 'Desde $4.500 UYU/noche',
    stars: 4,
  },
  {
    nombre: 'El Capullo',
    tipo: 'Boutique íntimo',
    descripcion: 'Pequeño hotel con jardín secreto en el Barrio Histórico. Solo 6 habitaciones. Ideal para parejas que buscan privacidad y autenticidad.',
    destacados: ['6 habitaciones', 'Jardín secreto', 'Privacidad total', 'Para parejas'],
    precio: 'Desde $3.800 UYU/noche',
    stars: 4,
  },
  {
    nombre: 'Radisson Colonia',
    tipo: 'Hotel de cadena',
    descripcion: 'Opción más grande con piscina, gimnasio y salones. Ideal para grupos o viajes corporativos. Fuera del casco histórico pero con excelente relación calidad-precio.',
    destacados: ['Piscina', 'Gimnasio', 'Salones', 'Estacionamiento'],
    precio: 'Desde $2.500 UYU/noche',
    stars: 4,
  },
];

export function HotelesColoniaPage() {
  return (
    <>
      <SEOHead
        title="Hoteles Boutique en Colonia del Sacramento Uruguay 2026 | EscapaUY"
        description="Los mejores hoteles boutique y alojamientos en Colonia del Sacramento: Charco Hotel, Posada Plaza Mayor, El Capullo y más. Reservá con EscapaUY y recibí beneficios IVA para extranjeros."
        canonical="/hoteles/colonia"
        schema={schema}
      />
      <SEOLayout>
          {/* Hero */}
          <section className="relative bg-[#1A1F2C] text-white py-20 px-4">
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
                Hoteles boutique en<br />
                <span className="text-[#C5A059]">Colonia del Sacramento</span>
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Desde posadas coloniales frente a la Plaza Mayor hasta hoteles de diseño con vista al Río de la Plata. Los mejores alojamientos de Colonia, seleccionados por EscapaUY.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all"
              >
                Ver disponibilidad
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Beneficio IVA */}
          <section className="py-8 px-4 bg-[#C5A059]/10 border-y border-[#C5A059]/20">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-[#C5A059] shrink-0" />
              <p className="text-gray-800 text-sm">
                <strong>Beneficio exclusivo para turistas extranjeros:</strong> Al reservar con EscapaUY pagando con tarjeta del exterior, aplicás el descuento del 22% de IVA sobre el alojamiento (Ley 17.250 UY). Ahorrás sin ningún trámite adicional.
              </p>
            </div>
          </section>

          {/* Hoteles */}
          <section className="py-16 px-4 bg-[#F8F7F4]">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-4">
                Los mejores hoteles de Colonia
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Seleccionados y verificados. Todos incluidos en la plataforma EscapaUY.
              </p>
              <div className="space-y-6">
                {hoteles.map((hotel) => (
                  <motion.div
                    key={hotel.nombre}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-xl">{hotel.nombre}</h3>
                          <span className="text-xs text-[#C5A059] font-bold shrink-0">{hotel.tipo}</span>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{hotel.descripcion}</p>
                        <div className="flex flex-wrap gap-2">
                          {hotel.destacados.map((d) => (
                            <span key={d} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <div className="text-xs text-gray-500 mb-1">Precio orientativo</div>
                        <div className="font-bold text-gray-900">{hotel.precio}</div>
                        <Link
                          to="/adn-viajero"
                          className="mt-3 inline-block px-5 py-2 bg-[#1A1F2C] text-white text-sm rounded-full font-medium hover:bg-[#C5A059] transition-colors"
                        >
                          Reservar
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-10">
                Consejos para elegir tu alojamiento
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: MapPin, title: 'Barrio Histórico', tip: 'Vale la pena pagar más por estar dentro del barrio histórico. Podés ir caminando a todo y la atmósfera nocturna es incomparable.' },
                  { icon: Wifi, title: 'Temporada', tip: 'Semana Santa y enero/febrero son temporada alta. Reservá con 2-3 semanas de anticipación. El resto del año hay disponibilidad fácil.' },
                  { icon: Coffee, title: 'Fin de semana largo', tip: 'Los fines de semana largo en Argentina multiplican el turismo. Si viajás en fecha especial, reservá con más anticipación.' },
                ].map(({ icon: Icon, title, tip }) => (
                  <div key={title} className="text-center">
                    <div className="w-12 h-12 bg-[#F8F7F4] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-[#C5A059]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-[#1A1F2C] text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold mb-4">
                Hotel + actividades + vouchers. Todo en uno.
              </h2>
              <p className="text-gray-300 mb-8">
                EscapaUY elige el hotel ideal para tu perfil y lo combina con actividades curadas. Un solo checkout para toda tu escapada.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all"
              >
                Encontrar mi hotel ideal
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
      </SEOLayout>
    </>
  );
}
