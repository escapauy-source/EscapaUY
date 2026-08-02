/**
 * Translation Service for EscapaUY
 * Handles dynamic content translation with caching strategy.
 */

const CACHE_KEY = 'escapauy_translation_cache';

interface TranslationCache {
    [key: string]: string;
}

// Load cache from localStorage
const getCache = (): TranslationCache => {
    try {
        const item = localStorage.getItem(CACHE_KEY);
        return item ? JSON.parse(item) : {};
    } catch (e) {
        console.error('Error reading translation cache', e);
        return {};
    }
};

// Save cache to localStorage
const saveCache = (cache: TranslationCache) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Error saving translation cache (quota exceeded?)', e);
    }
};

/**
 * Translates text to the target language.
 * Uses a simulated API for now to avoid costs/keys, but validates the architectural flow.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return '';
    if (targetLang === 'es') return text; // Assume source is ES

    const cache = getCache();
    const cacheId = `${targetLang}|${text.substring(0, 50)}_${text.length}`; // Simple hash-like key

    if (cache[cacheId]) {
        // console.log(`[Translation] Cache hit for: "${text.substring(0, 20)}..."`);
        return cache[cacheId];
    }

    // console.log(`[Translation] API Call (Simulated) for: "${text.substring(0, 20)}..."`);

    // SIMULATED API CALL (Replace with real Google Translate API / OpenAI call)
    // Logic: Just append [Auto-EN] to demonstrate the flow without mangling text.
    // In a real scenario: const res = await fetch('https://translation.googleapis.com/...');

    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency

    // Rudimentary Mock Translation for Demo Purposes
    // (In production this would be the actual API response)
    const simulatedTranslation = `[Translated to ${targetLang}] ${text}`;

    // Update Cache
    const newCache = { ...cache, [cacheId]: simulatedTranslation };
    saveCache(newCache);

    return simulatedTranslation;
}

/**
 * Hook helper to generate a unique key for SWR or React Query if we were using them.
 */
export function getTranslationKey(text: string, lang: string) {
    return `trans_${lang}_${text?.substring(0, 10)}`;
}
