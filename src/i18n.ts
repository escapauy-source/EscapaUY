import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: {
                translation: esTranslations,
            },
            en: {
                translation: enTranslations,
            },
        },
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    }, (_err, _t) => {
        // Callback cuando i18n está listo
        console.log('[I18N] Internacionalización lista');
        // Marcar como inicializado
        if (typeof window !== 'undefined') {
            (window as any).i18n = {
                i18n: i18n,
                isInitialized: true
            };
        }
    });

export default i18n;
