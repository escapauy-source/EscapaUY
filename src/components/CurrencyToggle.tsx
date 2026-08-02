import { useCurrency } from '@/hooks/useCurrency';

export function CurrencyToggle() {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border border-gray-200">
            <button
                onClick={() => setCurrency('UYU')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currency === 'UYU'
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                $U
            </button>
            <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currency === 'USD'
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                USD
            </button>
        </div>
    );
}
