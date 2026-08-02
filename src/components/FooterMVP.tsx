import { Link } from 'react-router-dom';
import { Anchor, Shield } from 'lucide-react';

export function FooterMVP() {
  return (
    <footer
      className="border-t font-montserrat"
      style={{ background: '#0d1117', borderColor: 'rgba(197,160,89,0.12)' }}
    >
      {/* Bloque legal principal */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-sm flex items-center justify-center"
                style={{ background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.2)' }}
              >
                <Anchor className="w-4 h-4" style={{ color: '#C5A059' }} />
              </div>
              <div>
                <span className="font-playfair text-lg font-bold" style={{ color: '#F8F7F4' }}>ESCAPA</span>
                <span className="font-playfair text-lg font-bold" style={{ color: '#C5A059' }}>UY</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,247,244,0.45)' }}>
              Plataforma de orquestación turística inteligente para el Departamento de Colonia, Uruguay.
            </p>
          </div>

          {/* Declaración legal MINTUR */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-2 mb-3">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#C5A059' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,247,244,0.5)' }}>
                <strong style={{ color: 'rgba(248,247,244,0.75)' }}>EscapaUY</strong> actúa como una plataforma de difusión
                turística y tecnológica para el Departamento de Colonia. Los pagos se realizan de forma directa y
                transparente a los prestadores locales registrados ante el{' '}
                <strong style={{ color: 'rgba(248,247,244,0.65)' }}>MINTUR (Ministerio de Turismo)</strong>.
                EscapaUY no retiene fondos ni actúa como intermediario financiero (Resolución BCU).
              </p>
            </div>
          </div>
        </div>

        {/* Links legales */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-8 mt-8"
          style={{ borderTop: '1px solid rgba(248,247,244,0.06)' }}
        >
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="/terminos"
              className="text-xs transition-colors hover:underline"
              style={{ color: 'rgba(248,247,244,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C5A059')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,247,244,0.4)')}
            >
              Términos y Condiciones
            </Link>
            <Link
              to="/privacidad"
              className="text-xs transition-colors hover:underline"
              style={{ color: 'rgba(248,247,244,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C5A059')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,247,244,0.4)')}
            >
              Política de Privacidad (URCDP)
            </Link>
            <Link
              to="/defensa-consumidor"
              className="text-xs transition-colors hover:underline"
              style={{ color: 'rgba(248,247,244,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C5A059')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,247,244,0.4)')}
            >
              Defensa del Consumidor (MEF)
            </Link>
          </nav>
          <p className="text-xs ml-auto" style={{ color: 'rgba(248,247,244,0.25)' }}>
            © {new Date().getFullYear()} EscapaUY · Colonia del Sacramento, Uruguay
          </p>
        </div>
      </div>
    </footer>
  );
}
