import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const setLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner group">
            <button
                onClick={() => setLanguage('es')}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    i18n.language.startsWith('es')
                        ? "bg-white text-ocean-600 shadow-sm ring-1 ring-gray-100"
                        : "text-gray-400 hover:text-gray-600"
                )}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    i18n.language.startsWith('en')
                        ? "bg-white text-ocean-600 shadow-sm ring-1 ring-gray-100"
                        : "text-gray-400 hover:text-gray-600"
                )}
            >
                EN
            </button>
            <Globe className="w-3.5 h-3.5 text-gray-400 ml-1 mr-2 group-hover:text-ocean-500 transition-colors" />
        </div>
    );
}
