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
                EscapaUY, como intermediario profesional, asume responsabilidad solidaria ante el turista por el cumplimiento del servicio. Si el local está cerrado o el servicio falla sustancialmente, el turista puede reclamar tanto al Partner como a la plataforma, conforme a la normativa vigente de Defensa del Consumidor.
              </p>
            </div>
          </section>

          {/* Retract Exception */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              4. Política de Cancelación y Retracto
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-900 leading-relaxed mb-4">
                <strong>CLÁUSULA Y: POLÍTICA DE CANCELACIÓN Y RETRACTO</strong>
              </p>
              <ul className="list-decimal list-inside text-amber-800 text-sm mt-2 space-y-3">
                <li>
                  <strong>Derecho de Arrepentimiento:</strong> De acuerdo con la excepción establecida en el Art. 16 de la Ley N° 17.250, por tratarse de servicios de esparcimiento y alojamiento con fecha de ejecución determinada, <strong>no aplica el derecho de retracto de 5 días</strong> una vez formalizada la reserva.
                </li>
                <li>
                  <strong>Reembolsos:</strong> Los reembolsos solo procederán en casos de incumplimiento sustancial por parte del Partner o ante la imposibilidad técnica de activar un Plan B viable. En cumplimiento con la normativa del BCU, cualquier fondo en custodia que no sea dispersado al Partner o consumido en un plazo de 30 días será reintegrado automáticamente al medio de pago original del Usuario.
                </li>
                <li>
                  <strong>Responsabilidad:</strong> EscapaUY actúa como intermediario profesional y asume responsabilidad solidaria por la devolución de importes pagados en concepto de seña web en caso de fallas comprobables en la prestación del servicio final.
                </li>
              </ul>
            </div>
          </section>

          {/* Weather Guarantee */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              5. Garantía de Resiliencia Climática (Plan B)
            </h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <p className="text-blue-900 leading-relaxed mb-4">
                <strong>CLÁUSULA X: GARANTÍA DE RESILIENCIA CLIMÁTICA</strong>
              </p>
              <p className="text-blue-800 text-sm leading-relaxed">
                La Plataforma cuenta con un sistema de monitoreo meteorológico basado en radares Doppler. En caso de detectarse una <strong>probabilidad de precipitación superior al 70%</strong> en el destino en una ventana de 3 horas, el sistema activará automáticamente una propuesta de "Plan B". Esta funcionalidad busca mitigar el riesgo de cancelación por mal tiempo, ofreciendo alternativas de interior de similar categoría. El Usuario podrá validar o modificar estas alternativas desde su itinerario dinámico, manteniendo el control final sobre su agenda.
              </p>
            </div>
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
