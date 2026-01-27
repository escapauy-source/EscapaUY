import { useItineraryStore } from '@/store/itineraryStore';

export function CurrencyToggle() {
    const currency = useItineraryStore((state) => state.currency);
    const setCurrency = useItineraryStore((state) => state.setCurrency);

    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border border-gray-200">
            <button
                onClick={() => setCurrency('UYU')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currency === 'UYU'
                        ? 'bg-ocean-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                UYU
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
