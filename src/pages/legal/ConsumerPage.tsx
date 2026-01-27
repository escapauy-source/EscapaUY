import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, ExternalLink, Phone, Mail, MapPin, Scale } from 'lucide-react';

export function ConsumerPage() {
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
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              Defensa del Consumidor
            </h1>
            <p className="text-gray-500">Ley 17.250 - Relaciones de Consumo</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* Intro */}
          <section>
            <p className="text-gray-600 leading-relaxed">
              En ESCAPAUY estamos comprometidos con el respeto a los derechos de los consumidores 
              establecidos en la Ley 17.250 de Relaciones de Consumo de Uruguay. A continuación, 
              le informamos sobre sus derechos y los canales disponibles para realizar consultas o reclamos.
            </p>
          </section>

          {/* Derechos */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-nature-600" />
              Sus Derechos como Consumidor
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-nature-50 border border-nature-100 rounded-xl">
                <h4 className="font-medium text-nature-800 mb-2">Información</h4>
                <p className="text-sm text-nature-700">
                  Derecho a recibir información clara, veraz y suficiente sobre los servicios ofrecidos
                </p>
              </div>
              <div className="p-4 bg-nature-50 border border-nature-100 rounded-xl">
                <h4 className="font-medium text-nature-800 mb-2">Seguridad</h4>
                <p className="text-sm text-nature-700">
                  Derecho a la protección de su salud, seguridad e intereses económicos
                </p>
              </div>
              <div className="p-4 bg-nature-50 border border-nature-100 rounded-xl">
                <h4 className="font-medium text-nature-800 mb-2">Reparación</h4>
                <p className="text-sm text-nature-700">
                  Derecho a la reparación integral de daños y perjuicios
                </p>
              </div>
              <div className="p-4 bg-nature-50 border border-nature-100 rounded-xl">
                <h4 className="font-medium text-nature-800 mb-2">Acceso a la Justicia</h4>
                <p className="text-sm text-nature-700">
                  Derecho a acceder a organismos judiciales y administrativos para resolver conflictos
                </p>
              </div>
            </div>
          </section>

          {/* Contact ESCAPAUY */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              Atención al Cliente ESCAPAUY
            </h2>
            <div className="bg-ocean-50 border border-ocean-100 rounded-xl p-6">
              <p className="text-ocean-800 mb-4">
                Antes de acudir a organismos externos, le invitamos a contactarnos directamente. 
                Nos comprometemos a responder su consulta o reclamo en un plazo máximo de 10 días hábiles.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-ocean-700">
                  <Mail className="w-5 h-5" />
                  <span>consumidor@escapauy.com</span>
                </div>
                <div className="flex items-center gap-3 text-ocean-700">
                  <Phone className="w-5 h-5" />
                  <span>+598 4522 1234</span>
                </div>
                <div className="flex items-start gap-3 text-ocean-700">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Calle de los Suspiros 100, Colonia del Sacramento, Uruguay</span>
                </div>
              </div>
            </div>
          </section>

          {/* External Resources */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              Organismos de Defensa del Consumidor
            </h2>
            <div className="space-y-4">
              <a
                href="https://www.gub.uy/ministerio-economia-finanzas/defensa-consumidor"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Área de Defensa del Consumidor (MEF)
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Ministerio de Economía y Finanzas - Organismo competente para recibir 
                      denuncias y mediar en conflictos de consumo.
                    </p>
                    <p className="text-sm text-ocean-600">
                      www.gub.uy/ministerio-economia-finanzas/defensa-consumidor
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
              </a>

              <a
                href="https://www.gub.uy/ministerio-turismo"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Ministerio de Turismo (MINTUR)
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Organismo regulador de los prestadores de servicios turísticos.
                    </p>
                    <p className="text-sm text-ocean-600">
                      www.gub.uy/ministerio-turismo
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
              </a>

              <a
                href="https://www.bcu.gub.uy"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Banco Central del Uruguay (BCU)
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Regulador de los Proveedores de Servicios de Pago y Cobranza (PSPC).
                    </p>
                    <p className="text-sm text-ocean-600">
                      www.bcu.gub.uy
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
              </a>
            </div>
          </section>

          {/* Libro de Quejas */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              Libro de Quejas Digital
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-800 mb-4">
                Conforme a la normativa vigente, ponemos a su disposición un Libro de Quejas 
                digital para registrar sus reclamos de forma fehaciente.
              </p>
              <button className="px-6 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors">
                Acceder al Libro de Quejas
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
