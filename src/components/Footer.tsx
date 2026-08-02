import { useTranslation } from 'react-i18next';
import { Anchor, ArrowRight, Presentation, Mail } from 'lucide-react';
import { COMPANY_NAME, SUPPORT_EMAIL } from '@/config/constants';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Brand & Tagline */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-xl flex items-center justify-center shadow-lg shadow-ocean-900/20">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-playfair text-xl font-bold text-white tracking-tight">ESCAPA</span>
                <span className="font-playfair text-xl font-bold text-ocean-400">UY</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Status */}
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">
              {t('footer.status_title')}
            </h4>
            <div className="p-5 bg-gray-900/50 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-amber-500 uppercase tracking-wider">Pre-Seed</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t('footer.status_desc')}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">
              {t('footer.contact_title')}
            </h4>
            <ul className="space-y-4">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="group flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-ocean-500/50 hover:bg-gray-800/50 transition-all">
                  <div className="flex items-center gap-3 text-white font-medium">
                    <Mail className="w-4 h-4 text-gray-500 group-hover:text-ocean-400 transition-colors" />
                    {t('footer.contact_founder')}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-ocean-400 group-hover:translate-x-1 transition-all" />
                </a>
              </li>
              <li>
                <button className="w-full group flex items-center justify-between p-4 bg-transparent rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-left">
                  <div className="flex items-center gap-3 text-gray-400 group-hover:text-white font-medium transition-colors">
                    <Presentation className="w-4 h-4" />
                    {t('footer.contact_demo')}
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-900 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} {COMPANY_NAME}. {t('footer.rights_reserved')}</p>
            <p>Montevideo / Colonia del Sacramento</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
