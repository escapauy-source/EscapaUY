/**
 * SEOLayout — Layout ligero para páginas de aterrizaje SEO.
 * No depende de AppContext, Supabase ni i18n para poder ser
 * pre-renderizado server-side sin conflictos.
 */
import { Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

function SEOHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="EscapaUY"
              className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-playfair font-bold text-xl text-gray-900 group-hover:text-[#C5A059] transition-colors">
              EscapaUY
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Explorar
            </Link>
            <Link to="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <Link
              to="/adn-viajero"
              className="px-5 py-2.5 bg-[#C5A059] text-white text-sm font-bold rounded-full hover:bg-[#b08e48] transition-colors"
            >
              Planificá tu escapada
            </Link>
          </nav>
          {/* Mobile CTA */}
          <Link
            to="/adn-viajero"
            className="md:hidden px-4 py-2 bg-[#C5A059] text-white text-sm font-bold rounded-full hover:bg-[#b08e48] transition-colors"
          >
            Empezar
          </Link>
        </div>
      </div>
    </header>
  );
}

function SEOFooter() {
  return (
    <footer className="bg-[#1A1F2C] text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="font-playfair font-bold text-xl mb-3 text-[#C5A059]">EscapaUY</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plataforma de experiencias turísticas personalizadas en el Departamento de Colonia, Uruguay.
            </p>
          </div>
          <div>
            <div className="font-bold text-sm mb-3 text-gray-300 tracking-widest uppercase">Destinos</div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/colonia/que-hacer" className="hover:text-[#C5A059] transition-colors">Qué hacer en Colonia</Link></li>
              <li><Link to="/carmelo/bodegas" className="hover:text-[#C5A059] transition-colors">Bodegas en Carmelo</Link></li>
              <li><Link to="/experiencias/enoturismo-uruguay" className="hover:text-[#C5A059] transition-colors">Enoturismo Uruguay</Link></li>
              <li><Link to="/escapada-desde-buenos-aires" className="hover:text-[#C5A059] transition-colors">Escapada desde Buenos Aires</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm mb-3 text-gray-300 tracking-widest uppercase">Legal</div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/legal/terminos" className="hover:text-[#C5A059] transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/legal/privacidad" className="hover:text-[#C5A059] transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/legal/consumidor" className="hover:text-[#C5A059] transition-colors">Defensa del Consumidor</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} EscapaUY · Colonia, Uruguay · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}

interface SEOLayoutProps {
  children: React.ReactNode;
}

export function SEOLayout({ children }: SEOLayoutProps) {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col font-inter">
        <SEOHeader />
        <main className="flex-1">{children}</main>
        <SEOFooter />
      </div>
    </HelmetProvider>
  );
}
