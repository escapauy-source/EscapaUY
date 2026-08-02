import { supabase } from '@/lib/supabase';

// URL for Open Exchange Rates API (Free Tier or similar open API)
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRateData {
    rate: number;
    isManual: boolean;
    lastUpdated: string;
}

/**
 * Fetches the current exchange rate (USD -> UYU).
 * Logic:
 * 1. Get from DB.
 * 2. If Manual Mode is ON, return DB manual_rate.
 * 3. If Auto Mode is ON and cache is expired (>24h), fetch API and update DB.
 * 4. Return effective rate.
 */
export async function getExchangeRate(): Promise<ExchangeRateData> {
    try {
        // 1. Get from DB
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('*')
            .eq('currency_pair', 'USD_UYU')
            .single();

        if (error) {
            console.warn('[CurrencyUtils] DB fetch failed, using fallback:', error);
            // Fallback safety
            return { rate: 40.0, isManual: false, lastUpdated: new Date().toISOString() };
        }

        const dbRecord = data;

        // 2. Check Manual Mode
        if (dbRecord.is_manual && dbRecord.manual_rate) {
            console.log('[CurrencyUtils] Using MANUAL Local Rate:', dbRecord.manual_rate);
            return {
                rate: dbRecord.manual_rate,
                isManual: true,
                lastUpdated: dbRecord.last_updated
            };
        }

        // 3. Check Cache Expiry (24 hours)
        const lastUpdated = new Date(dbRecord.last_updated);
        const now = new Date();
        const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) {
            console.log('[CurrencyUtils] Using CACHED API Rate:', dbRecord.api_rate);
            return {
                rate: dbRecord.api_rate,
                isManual: false,
                lastUpdated: dbRecord.last_updated
            };
        }

        // 4. Fetch Fresh API Rate (Cache Expired)
        console.log('[CurrencyUtils] Cache expired, fetching fresh rate from API...');
        const response = await fetch(API_URL);
        const apiData = await response.json();

        if (apiData && apiData.rates && apiData.rates.UYU) {
            const newRate = apiData.rates.UYU;

            // Update DB
            const { error: updateError } = await supabase
                .from('exchange_rates')
                .update({
                    api_rate: newRate,
                    last_updated: now.toISOString()
                })
                .eq('currency_pair', 'USD_UYU');

            if (updateError) console.error('[CurrencyUtils] Failed to update cache:', updateError);

            return {
                rate: newRate,
                isManual: false,
                lastUpdated: now.toISOString()
            };
        }

        // API Failed fallback
        return {
            rate: dbRecord.api_rate || 40.0,
            isManual: false,
            lastUpdated: dbRecord.last_updated
        };

    } catch (err) {
        console.error('[CurrencyUtils] Critical error:', err);
        return { rate: 40.0, isManual: false, lastUpdated: new Date().toISOString() };
    }
}

/**
 * Updates the Manual Override settings.
 */
export async function setManualExchangeRate(rate: number, enabled: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('exchange_rates')
        .update({
            manual_rate: rate,
            is_manual: enabled,
            last_updated: new Date().toISOString()
        })
        .eq('currency_pair', 'USD_UYU');

    return !error;
}
