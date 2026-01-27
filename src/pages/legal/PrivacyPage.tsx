import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Share2 } from 'lucide-react';

export function PrivacyPage() {
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
          <div className="w-12 h-12 bg-nature-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-nature-600" />
          </div>
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              Política de Privacidad
            </h1>
            <p className="text-gray-500">Conforme a la Ley 18.331 de Protección de Datos Personales</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* Responsable */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-ocean-600" />
              1. Responsable del Tratamiento
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm">
              <p><strong>Razón Social:</strong> ESCAPAUY S.A.</p>
              <p><strong>RUT:</strong> 21-123456-0001</p>
              <p><strong>Domicilio:</strong> Calle de los Suspiros 100, Colonia del Sacramento, Uruguay</p>
              <p><strong>Email DPO:</strong> privacidad@escapauy.com</p>
              <p><strong>Registro URCDP:</strong> Base de datos registrada ante la Unidad Reguladora</p>
            </div>
          </section>

          {/* Datos Recopilados */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-ocean-600" />
              2. Datos Personales Recopilados
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Datos de Identificación (KYC - BCU/PLAFT)</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Requeridos por normativa de prevención de lavado de activos:
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Nombre completo</li>
                  <li>Fecha de nacimiento</li>
                  <li>Número de documento de identidad (Cédula/Pasaporte)</li>
                  <li>Número de teléfono celular</li>
                  <li>País de residencia</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Datos de Perfil (ADN Viajero)</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Preferencias de viaje (grupo, ritmo, estilo)</li>
                  <li>Resultados del test Big Five (puntuaciones psicométricas)</li>
                  <li>Historial de reservas y preferencias</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Datos Técnicos</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de dispositivo y navegador</li>
                  <li>Datos de geolocalización (con consentimiento)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalidad */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              3. Finalidad del Tratamiento
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Gestión de reservas y prestación de servicios turísticos</li>
              <li>Personalización de itinerarios mediante IA</li>
              <li>Cumplimiento de obligaciones legales (BCU, PLAFT, MINTUR)</li>
              <li>Aplicación de beneficios fiscales (IVA Turista)</li>
              <li>Comunicaciones comerciales (con consentimiento previo)</li>
              <li>Mejora continua del servicio mediante análisis anónimos</li>
            </ul>
          </section>

          {/* Transferencias */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-ocean-600" />
              4. Transferencia de Datos
            </h2>
            <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-6">
              <p className="text-ocean-800 mb-4">
                Sus datos personales podrán ser compartidos con:
              </p>
              <ul className="list-disc list-inside text-ocean-800 space-y-2 text-sm">
                <li>
                  <strong>Prestadores de Servicios Turísticos:</strong> Nombre, documento y datos 
                  de reserva para la prestación del servicio contratado
                </li>
                <li>
                  <strong>Procesadores de Pago:</strong> Datos necesarios para procesar 
                  transacciones (DLocal, Mercado Pago)
                </li>
                <li>
                  <strong>Autoridades:</strong> Cuando sea requerido por ley (BCU, DGI, SENACLAFT)
                </li>
              </ul>
              <p className="text-ocean-700 text-sm mt-4 pt-4 border-t border-ocean-200">
                Al utilizar nuestra plataforma, usted <strong>consiente expresamente</strong> la 
                transferencia de sus datos a los destinatarios indicados para los fines descritos.
              </p>
            </div>
          </section>

          {/* Derechos */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-ocean-600" />
              5. Derechos del Titular
            </h2>
            <p className="text-gray-600 mb-4">
              Conforme a la Ley 18.331, usted tiene derecho a:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-1">Acceso</h4>
                <p className="text-sm text-gray-600">
                  Conocer qué datos personales tenemos sobre usted
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-1">Rectificación</h4>
                <p className="text-sm text-gray-600">
                  Corregir datos inexactos o desactualizados
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-1">Supresión</h4>
                <p className="text-sm text-gray-600">
                  Solicitar la eliminación de sus datos (con excepciones legales)
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-1">Oposición</h4>
                <p className="text-sm text-gray-600">
                  Oponerse al tratamiento para fines comerciales
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Para ejercer estos derechos, contacte a: <strong>privacidad@escapauy.com</strong>
            </p>
          </section>

          {/* Beneficiario Final */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              6. Identificación del Beneficiario Final
            </h2>
            <p className="text-gray-600 leading-relaxed">
              En cumplimiento de la normativa de transparencia corporativa y prevención de 
              lavado de activos, informamos que el/los beneficiario(s) final(es) de ESCAPAUY S.A. 
              (personas físicas con participación superior al 15% del capital) se encuentran 
              debidamente registrados ante el Banco Central del Uruguay.
            </p>
          </section>

          {/* Retención */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              7. Plazo de Conservación
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Datos de transacciones: 10 años (obligación tributaria DGI)</li>
              <li>Datos KYC: 5 años desde la última transacción (normativa BCU)</li>
              <li>Datos de perfil: Mientras mantenga cuenta activa + 2 años</li>
              <li>Cookies y datos técnicos: 1 año</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-semibold text-xl text-gray-900 mb-4">
              8. Contacto y Reclamaciones
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm">
              <p><strong>DPO (Delegado de Protección de Datos):</strong> privacidad@escapauy.com</p>
              <p className="pt-4 border-t border-gray-200 mt-4">
                <strong>Unidad Reguladora y de Control de Datos Personales (URCDP):</strong>{' '}
                <a 
                  href="https://www.gub.uy/unidad-reguladora-control-datos-personales" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ocean-600 underline"
                >
                  www.gub.uy/urcdp
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
