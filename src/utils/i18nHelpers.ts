/**
 * i18n Helpers for handling database content translations
 */

interface ServiceWithTranslation {
    [key: string]: any;
    name: string;
    description: string;
    category: string;
    // ... other fields
    name_en?: string;
    description_en?: string;
    category_en?: string;
    plan_a_desc_en?: string;
    plan_b_desc_en?: string;
}

/**
 * Resolves the content based on the selected language.
 * Prefer '_en' field if lang is 'en'. Fallback to original field.
 * 
 * @param service The data object
 * @param field The prefix of the field (e.g., 'name', 'description')
 * @param lang The current language code ('es', 'en')
 */
export function getTranslatedContent(service: ServiceWithTranslation, field: string, lang: string): string {
    if (!service) return '';

    if (lang === 'en') {
        const enField = `${field}_en`;
        if (service[enField] && service[enField].trim() !== '') {
            return service[enField];
        }
    }

    // Fallback to original (Spanish)
    return service[field] || '';
}
