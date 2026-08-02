import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { WeatherWidget } from './WeatherWidget';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencyToggle } from './CurrencyToggle';
import { cn } from '@/utils/cn';

export function Header() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, setShowAuthModal, setAuthModalRole } = useApp();
  const location = useLocation();

  const navLinks = [
    { href: '/explore', label: t('header.explore') },
    { href: '/adn-viajero', label: t('header.my_adn') },
    { href: '/blog', label: t('header.blog') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="EscapaUY"
              className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "font-inter text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-ocean-600"
                    : "text-gray-600 hover:text-ocean-600"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin Link */}
            {isAuthenticated && user?.email === 'escapauy@gmail.com' && (
              <Link
                to="/admin/control-tower"
                className={cn(
                  "font-inter text-sm font-bold transition-all px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100",
                  isActive('/admin/control-tower') && "ring-1 ring-amber-400 bg-amber-100"
                )}
              >
                {t('header.control_tower')}
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <CurrencyToggle />
            <LanguageSwitcher />
            <WeatherWidget compact />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-ocean-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.user_metadata?.full_name?.split(' ')[0] || t('header.profile')}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title={t('header.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalRole('tourist');
                  setShowAuthModal(true);
                }}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-ocean-600 text-white text-sm font-medium rounded-full hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-200"
              >
                <User className="w-4 h-4" />
                {t('header.login')}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block py-2 text-base font-medium",
                isActive(link.href) ? "text-ocean-600" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-gray-600"
              >
                {t('header.profile')}
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="block py-2 text-base font-medium text-red-500"
              >
                {t('header.logout')}
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
              className="w-full py-3 bg-ocean-600 text-white font-medium rounded-lg"
            >
              {t('header.login_register')}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
