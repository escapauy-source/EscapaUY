import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
        i18n.changeLanguage(newLang).then(() => {
            window.location.reload();
        });
    };

    const isEnglish = i18n.language.startsWith('en');

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-gray-100 p-1.5 px-3 rounded-full border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors group"
            title={isEnglish ? "Cambiar a Español" : "Switch to English"}
        >
            <Globe className="w-4 h-4 text-ocean-600 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-700 tracking-wider">
                {isEnglish ? "ENG" : "ESP"}
            </span>
        </button>
    );
}
