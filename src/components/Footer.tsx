import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Anchor, Shield, FileText, Mail, MapPin,
  Instagram, Facebook, MessageCircle, Percent
} from 'lucide-react';
import { SOCIAL_LINKS, SUPPORT_EMAIL, COMPANY_NAME } from '@/config/constants';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Social */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-xl flex items-center justify-center shadow-lg shadow-ocean-900/20">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-playfair text-xl font-bold text-white tracking-tight">ESCAPA</span>
                <span className="font-playfair text-xl font-bold text-ocean-400">UY</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-md mb-8">
              <div className="flex items-center gap-2 mb-2 text-ocean-400">
                <Percent className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">{t('footer.tax_free_title')}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                {t('footer.tax_free_description')}
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ocean-600 hover:text-white transition-all transform hover:-translate-y-1"
                title="Siguenos en Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-ocean-600 hover:text-white transition-all transform hover:-translate-y-1"
                title="Siguenos en Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="md:ml-auto">
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">{t('footer.legal_title')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/legal/terminos" className="hover:text-ocean-400 transition-colors flex items-center gap-3 decoration-ocean-400/30 underline-offset-4 hover:underline">
                  <FileText className="w-4 h-4 text-ocean-400" />
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/legal/privacidad" className="hover:text-ocean-400 transition-colors flex items-center gap-3 decoration-ocean-400/30 underline-offset-4 hover:underline">
                  <Shield className="w-4 h-4 text-ocean-400" />
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal/consumidor" className="hover:text-ocean-400 transition-colors decoration-ocean-400/30 underline-offset-4 hover:underline">
                  {t('footer.consumer')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:ml-auto">
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">{t('footer.contact_title')}</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href={SOCIAL_LINKS.WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500 hover:text-white transition-all group"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-bold">{t('footer.whatsapp')}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-ocean-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{SUPPORT_EMAIL}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-gray-400 leading-snug">Calle de los Suspiros 100,<br />Colonia, Uruguay</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Bottom Bar */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-500 tracking-wide">
            <div className="space-y-2">
              <p className="font-bold text-gray-400 uppercase text-[10px]">{t('footer.fiscal_data')}</p>
              <p>ESCAPAUY S.A. | RUT: 21-123456-0001</p>
              <p>{t('footer.regulated')}</p>
            </div>
            <div className="space-y-3 md:text-right">
              <div className="flex items-center gap-2 md:justify-end">
                <Shield className="w-3 h-3 text-nature-500" />
                <span className="text-gray-400">Plataforma PSPC Registrada No. 123456</span>
              </div>
              <p>© {new Date().getFullYear()} {COMPANY_NAME.toUpperCase()}. {t('footer.rights_reserved')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
}
