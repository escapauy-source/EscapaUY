import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Ship, MapPin, CheckCircle2, CalendarDays } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEOLayout } from '@/components/seo/SEOLayout';

const schema = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": "Escapada de fin de semana desde Buenos Aires a Colonia",
  "description": "El viaje perfecto desde Buenos Aires: 1 hora en barco hasta Colonia del Sacramento, Uruguay. Fin de semana cultural, gastronómico y de relax.",
  "url": "https://www.escapauy.com/escapada-desde-buenos-aires",
  "touristType": "FamilyTourism",
  "offers": {
    "@type": "Offer",
    "price": "2250",
    "priceCurrency": "UYU",
    "description": "Precio desde por persona incluyendo actividades"
  },
  "itinerary": {
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Salida en barco desde Puerto Madero" },
      { "@type": "ListItem", "position": 2, "name": "Llegada a Colonia del Sacramento" },
      { "@type": "ListItem", "position": 3, "name": "Exploración del Barrio Histórico UNESCO" },
      { "@type": "ListItem", "position": 4, "name": "Gastronomía local y vino uruguayo" }
    ]
  }
};

const itinerario = [
  {
    dia: 'Viernes',
    items: [
      '18:00 — Salís de Buenos Aires por Buquebus o Seacat desde Puerto Madero',
      '19:00 — Llegada a Colonia del Sacramento. Check-in en hotel boutique histórico.',
      '20:30 — Cena en restaurante del Barrio Histórico. Mariscos del Río de la Plata.',
      '22:00 — Paseo nocturno por las calles empedradas iluminadas. Atmósfera única.',
    ],
  },
  {
    dia: 'Sábado',
    items: [
      '09:00 — Desayuno en el hotel. Fruta local, dulce de leche artesanal, mate.',
      '10:00 — Tour a pie por el Barrio Histórico: faro, puerta colonial, ruinas portuguesas.',
      '13:00 — Almuerzo gourmet con vista al río. Recomendado: Pulpería de los Faroles.',
      '15:00 — Excursión a Carmelo: visita a bodega con degustación de Tannat y Albariño.',
      '18:30 — Regreso a Colonia. Atardecer sobre el río. Foto obligatoria.',
      '20:00 — Cena libre. Colonia tiene más de 30 restaurantes en pocas cuadras.',
    ],
  },
  {
    dia: 'Domingo',
    items: [
      '09:00 — Desayuno tranquilo. Colonia en domingo es mágica, sin turistas masivos.',
      '10:30 — Mercadito artesanal local. Souvenirs auténticos, no industriales.',
      '12:00 — Almuerzo liviano antes de embarcar.',
      '14:00 — Barco de regreso a Buenos Aires. Llegás relajado y recargado.',
    ],
  },
];

export function EscapadaBuenosAiresPage() {
  return (
    <>
      <SEOHead
        title="Escapada desde Buenos Aires a Colonia Uruguay 2026 | EscapaUY"
        description="El viaje perfecto desde Buenos Aires: 1 hora en barco a Colonia del Sacramento, Uruguay. Fin de semana con historia UNESCO, enoturismo en Carmelo y gastronomía local. Reservá con EscapaUY."
        canonical="/escapada-desde-buenos-aires"
        schema={schema}
      />
      <SEOLayout>
          {/* Hero */}
          <section className="relative bg-[#1A1F2C] text-white py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-[#1A1F2C]" />
            <div className="relative max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-[#C5A059]">
                <Ship className="w-5 h-5" />
                <span className="text-sm font-medium tracking-widest uppercase">Buenos Aires → Colonia · 1 hora</span>
              </div>
              <motion.h1
                className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Escapada desde<br />
                <span className="text-[#C5A059]">Buenos Aires a Uruguay</span>
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                A solo 1 hora en barco, Colonia del Sacramento te espera con calles empedradas, bodegas boutique y una gastronomía que no encontrás en ningún otro lado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/adn-viajero"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all shadow-lg"
                >
                  Armá tu escapada
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Datos rápidos */}
          <section className="py-12 px-4 bg-white">
            <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { icon: Clock, label: 'Tiempo de viaje', value: '1 hora' },
                { icon: Ship, label: 'Transporte', value: 'Barco directo' },
                { icon: MapPin, label: 'Destino', value: 'Colonia, UY' },
                { icon: CalendarDays, label: 'Duración ideal', value: 'Fin de semana' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[#F8F7F4] rounded-2xl p-5">
                  <Icon className="w-6 h-6 text-[#C5A059] mx-auto mb-2" />
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className="font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Itinerario */}
          <section className="py-16 px-4 bg-[#F8F7F4]">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-4">
                Itinerario sugerido: viernes a domingo
              </h2>
              <p className="text-center text-gray-600 mb-12">
                La escapada perfecta desde Buenos Aires. Personalizable con EscapaUY según tus preferencias.
              </p>
              <div className="space-y-8">
                {itinerario.map(({ dia, items }) => (
                  <motion.div
                    key={dia}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="font-bold text-[#C5A059] text-sm tracking-widest uppercase mb-4">{dia}</h3>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Barcos */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-8 text-center">
                Cómo llegar: barcos Buenos Aires → Colonia
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-[#F8F7F4] rounded-2xl p-6">
                  <div className="font-bold text-gray-900 mb-1">🚢 Buquebus</div>
                  <div className="text-sm text-gray-500 mb-3">Puerto Madero → Colonia</div>
                  <p className="text-gray-600 text-sm">El más conocido. Salidas varias veces al día. Podés llevar el auto. Restaurante a bordo.</p>
                  <div className="mt-3 text-sm font-medium text-[#C5A059]">Desde ~$30 USD/persona</div>
                </div>
                <div className="bg-[#F8F7F4] rounded-2xl p-6">
                  <div className="font-bold text-gray-900 mb-1">🚢 Seacat Colonia</div>
                  <div className="text-sm text-gray-500 mb-3">Puerto Madero → Colonia</div>
                  <p className="text-gray-600 text-sm">Alternativa económica. Sin autos. Buena frecuencia especialmente en temporada alta.</p>
                  <div className="mt-3 text-sm font-medium text-[#C5A059]">Desde ~$20 USD/persona</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-[#1A1F2C] text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold mb-4">
                Tu escapada perfecta, armada con IA
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                EscapaUY personaliza cada detalle: hotel, actividades, restaurantes y vouchers. Solo tenés que ir.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all"
              >
                Crear mi escapada ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
      </SEOLayout>
    </>
  );
}
