import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTranslation } from 'react-i18next';

interface CurrencyState {
    currency: 'UYU' | 'USD';
    exchangeRate: number; // UYU per 1 USD
    isNonResident: boolean;
    setCurrency: (currency: 'UYU' | 'USD') => void;
    setExchangeRate: (rate: number) => void;
    toggleNonResident: () => void;
}

// Global Store for Currency Settings
export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: 'UYU',
            exchangeRate: 42, // Fallback default
            isNonResident: false,
            setCurrency: (currency) => set({ currency }),
            setExchangeRate: (rate) => set({ exchangeRate: rate }),
            toggleNonResident: () => set((state) => ({ isNonResident: !state.isNonResident })),
        }),
        {
            name: 'currency-storage',
        }
    )
);

// Hook for usage in components
export function useCurrency() {
    const { currency, exchangeRate, isNonResident, setCurrency, toggleNonResident } = useCurrencyStore();
    const { i18n } = useTranslation();

    // Automatic Non-Resident Logic based on Order v282
    // "Si idioma === 'EN' O moneda === 'USD', activar automáticamente isNonResident = true"
    const derivedIsNonResident = isNonResident || currency === 'USD' || i18n.language === 'en';

    const formatPrice = (amountUYU: number) => {
        // Basic conversion logic (assuming input is UYU for now as per legacy data)
        // If the order says "Base USD", we'd flip this. But legacy data is UYU.
        // I will treat input as UYU and convert to USD if needed.

        if (currency === 'USD') {
            const val = amountUYU / exchangeRate;
            return {
                value: val,
                formatted: `U$S ${Math.round(val).toLocaleString()}`,
                currency: 'USD'
            };
        }
        return {
            value: amountUYU,
            formatted: `$ ${Math.round(amountUYU).toLocaleString()}`,
            currency: 'UYU'
        };
    };

    // Bidirectional converter for Checkout
    const getBidirectionalPrice = (amountUYU: number) => {
        const usd = amountUYU / exchangeRate;
        return {
            uyu: amountUYU,
            usd: usd,
            formattedUYU: `$ ${Math.round(amountUYU).toLocaleString()}`,
            formattedUSD: `U$S ${Math.round(usd).toLocaleString()}`
        };
    };

    return {
        currency,
        setCurrency,
        exchangeRate,
        isNonResident: derivedIsNonResident, // Use the derived logic
        formatPrice,
        getBidirectionalPrice,
        toggleNonResident
    };
}
