import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Scale, FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-ocean-600" />
          </div>
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              Términos de Servicio
            </h1>
            <p className="text-gray-500">Última actualización: Enero 2025</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* Identity Section */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-ocean-600" />
              1. Identificación del Prestador
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm">
              <p><strong>Razón Social:</strong> ESCAPAUY S.A.</p>
              <p><strong>RUT:</strong> 21-123456-0001</p>
              <p><strong>Domicilio:</strong> Calle de los Suspiros 100, Colonia del Sacramento, Uruguay</p>
              <p><strong>Registro MINTUR:</strong> Prestador de Servicios Turísticos N° 12345</p>
              <p><strong>Registro BCU:</strong> Proveedor de Servicios de Pago y Cobranza (PSPC)</p>
            </div>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-600 leading-relaxed">
              ESCAPAUY opera como una plataforma de intermediación turística que conecta 
              viajeros con prestadores de servicios turísticos en la región de Colonia, Uruguay. 
              La plataforma utiliza inteligencia artificial para generar itinerarios personalizados 
              que se adaptan a las condiciones climáticas en tiempo real.
            </p>
          </section>

          {/* Responsabilidad Solidaria */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-ocean-600" />
              3. Responsabilidad Solidaria
            </h2>
            <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-6">
              <p className="text-ocean-800 leading-relaxed">
                Conforme al artículo 34 de la Ley 17.250 de Defensa del Consumidor, 
                <strong> ESCAPAUY asume responsabilidad solidaria</strong> junto con los prestadores 
                de servicios turísticos por el cumplimiento de las obligaciones derivadas de las 
                reservas realizadas a través de esta plataforma.
              </p>
            </div>
          </section>

          {/* Retract Exception */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              4. Excepción al Derecho de Retracto
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-900 leading-relaxed mb-4">
                <strong>AVISO IMPORTANTE:</strong> De conformidad con el Artículo 16 de la Ley 17.250 
                de Defensa del Consumidor de Uruguay, los servicios turísticos con fecha determinada 
                constituyen una excepción al derecho de arrepentimiento de 5 días hábiles.
              </p>
              <p className="text-amber-800 text-sm">
                Al confirmar una reserva en esta plataforma, el usuario acepta expresamente que:
              </p>
              <ul className="list-disc list-inside text-amber-800 text-sm mt-2 space-y-1">
                <li>El servicio contratado tiene una fecha específica de prestación</li>
                <li>No podrá ejercer el derecho de retracto una vez confirmada la reserva</li>
                <li>Solo procederán reembolsos en casos de fuerza mayor debidamente documentados</li>
              </ul>
            </div>
          </section>

          {/* Weather Guarantee */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              5. Garantía Climática
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              ESCAPAUY ofrece una garantía única de adaptación climática:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Cada actividad outdoor tiene vinculada una alternativa indoor (Plan B) 
                que se activa automáticamente si la probabilidad de lluvia supera el 70%
              </li>
              <li>
                En caso de cancelación total por condiciones climáticas extremas verificadas 
                por la autoridad competente, se procederá al reembolso íntegro del depósito
              </li>
              <li>
                El cambio de Plan A a Plan B no genera derecho a reembolso ni reclamo alguno
              </li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              6. Condiciones de Pago
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Seña:</strong> El 30% del valor total se cobra al momento de la reserva 
                como garantía de la misma.
              </p>
              <p>
                <strong>Saldo:</strong> El 70% restante se abona directamente en el establecimiento 
                del prestador el día de la experiencia.
              </p>
              <p>
                <strong>Segregación de Fondos:</strong> Conforme a la normativa del BCU para PSPC, 
                los fondos cobrados se mantienen en cuentas segregadas y se dispersan al prestador 
                dentro de los 30 días siguientes a la prestación del servicio.
              </p>
            </div>
          </section>

          {/* Beneficios Fiscales */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              7. Beneficios Fiscales para Turistas Extranjeros
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Los turistas extranjeros que abonen con tarjetas de débito o crédito emitidas 
              en el exterior tienen derecho a la devolución de 9 puntos de IVA en servicios 
              gastronómicos y al IVA Cero en servicios de alojamiento, conforme a la normativa 
              tributaria uruguaya vigente. La plataforma aplica estos beneficios automáticamente.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              8. Atención al Consumidor
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm">
              <p><strong>Email:</strong> consumidor@escapauy.com</p>
              <p><strong>Teléfono:</strong> +598 4522 1234</p>
              <p><strong>Horario:</strong> Lunes a Viernes de 9:00 a 18:00</p>
              <p className="pt-4 border-t border-gray-200 mt-4">
                <strong>Área de Defensa del Consumidor:</strong>{' '}
                <a 
                  href="https://www.gub.uy/ministerio-economia-finanzas/defensa-consumidor" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ocean-600 underline"
                >
                  www.gub.uy/defensa-consumidor
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
