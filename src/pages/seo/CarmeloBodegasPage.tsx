import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Wine, Clock, Star, Leaf } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEOLayout } from '@/components/seo/SEOLayout';

const schema = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "Carmelo - Enoturismo Uruguay",
  "description": "Bodegas boutique y enoturismo en Carmelo, Uruguay. Degustación de vinos Tannat, Albariño y experiencias únicas.",
  "url": "https://www.escapauy.com/carmelo/bodegas",
  "touristType": ["Gastronomy", "Wine Tourism", "Luxury"],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -33.9968,
    "longitude": -58.2873
  },
  "containsPlace": [
    { "@type": "Winery", "name": "Bodega Narbona", "description": "Bodega boutique con lodge de lujo y restaurante gourmet" },
    { "@type": "Winery", "name": "Bodegas Irurtia", "description": "La bodega más antigua de Uruguay con tradición familiar" },
    { "@type": "Winery", "name": "Finca Nómade", "description": "Vinos naturales y experiencia inmersiva en Carmelo" }
  ]
};

const bodegas = [
  {
    nombre: 'Bodega Narbona',
    descripcion: 'Experiencia premium con lodge boutique, restaurante gourmet y degustación de sus vinos Tannat y Albariño premiados internacionalmente.',
    destaca: 'Gastronomía de autor',
    precio: 'Desde $2.500 UYU/persona',
  },
  {
    nombre: 'Bodegas Irurtia',
    descripcion: 'La bodega familiar más importante del departamento. Tour por las cavas históricas, degustación de 5 vinos y maridaje de quesos artesanales locales.',
    destaca: 'Historia y tradición',
    precio: 'Desde $1.200 UYU/persona',
  },
  {
    nombre: 'Finca Nómade',
    descripcion: 'Vinos naturales elaborados con mínima intervención. Ambiente íntimo y atípico. Ideal para viajeros que buscan lo auténtico fuera del circuito tradicional.',
    destaca: 'Vinos naturales',
    precio: 'Desde $900 UYU/persona',
  },
];

export function CarmeloBodegasPage() {
  return (
    <>
      <SEOHead
        title="Bodegas en Carmelo Uruguay 2026: Guía de Enoturismo | EscapaUY"
        description="Descubrí las mejores bodegas de Carmelo, Uruguay: Narbona, Irurtia, Finca Nómade y más. Tours con degustación de Tannat, Albariño y gastronomía local. Reservá tu experiencia enoturística hoy."
        canonical="/carmelo/bodegas"
        schema={schema}
      />
      <SEOLayout>
          {/* Hero */}
          <section className="relative bg-[#2C1A0E] text-white py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[#2C1A0E]" />
            <div className="relative max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-[#C5A059]">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium tracking-widest uppercase">Carmelo, Colonia — Uruguay</span>
              </div>
              <motion.h1
                className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Bodegas y Enoturismo<br />
                <span className="text-[#C5A059]">en Carmelo, Uruguay</span>
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                El secreto mejor guardado del vino sudamericano. Carmelo produce algunos de los mejores Tannat del mundo en bodegas boutique que reciben visitas íntimas todo el año.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all shadow-lg"
              >
                Reservar experiencia enoturística
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Por qué Carmelo */}
          <section className="py-16 px-4 bg-[#F8F7F4]">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 mb-12">
                Por qué el enoturismo en Carmelo es especial
              </h2>
              <div className="grid sm:grid-cols-3 gap-8 mb-12">
                {[
                  { icon: Wine, title: 'Tannat premium', desc: 'Uruguay es el país del Tannat. Carmelo lo lleva a su máxima expresión con microterroirs únicos.' },
                  { icon: Clock, title: 'A 2 horas de BA', desc: 'Cruzás en barco a Colonia y llegás en auto a Carmelo. Una tarde o un fin de semana completo.' },
                  { icon: Leaf, title: 'Producción artesanal', desc: 'Bodegas pequeñas, visitas íntimas y productores que te reciben en persona. Sin grupos de 50 personas.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="w-14 h-14 bg-[#2C1A0E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-[#C5A059]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bodegas */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4 text-center">
                Principales bodegas de Carmelo
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Seleccionadas y verificadas por el equipo de EscapaUY.
              </p>
              <div className="space-y-6">
                {bodegas.map((bodega) => (
                  <motion.div
                    key={bodega.nombre}
                    className="bg-[#F8F7F4] rounded-2xl p-6 border border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 text-xl">{bodega.nombre}</h3>
                          <span className="px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold rounded-full">{bodega.destaca}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{bodega.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm text-gray-500">Precio estimado</div>
                        <div className="font-bold text-gray-900">{bodega.precio}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Consejo */}
          <section className="py-12 px-4 bg-[#F8F7F4]">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 border border-[#C5A059]/20">
              <div className="flex items-start gap-4">
                <Star className="w-6 h-6 text-[#C5A059] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Consejo EscapaUY: combiná bodegas + hotel en Colonia</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Lo ideal es llegar a Colonia el viernes, pasar la noche en un hotel boutique histórico y dedicar el sábado entero a recorrer las bodegas de Carmelo. EscapaUY arma este itinerario completo por vos, incluyendo traslados y reservas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-[#2C1A0E] text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-playfair text-3xl font-bold mb-4">
                Armá tu escapada enoturística con IA
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                EscapaUY selecciona las bodegas y actividades ideales según tu perfil de viajero. Reservas, vouchers y logística incluida.
              </p>
              <Link
                to="/adn-viajero"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-white rounded-full font-bold text-lg hover:bg-[#b08e48] transition-all"
              >
                Comenzar mi itinerario
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
      </SEOLayout>
    </>
  );
}
