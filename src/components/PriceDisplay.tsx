import { useCurrency } from '@/hooks/useCurrency';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface PriceDisplayProps {
    amount: number; // Assumed to be in UYU by default unless inputCurrency is set
    inputCurrency?: 'UYU' | 'USD';
    className?: string;
    showTaxBenefit?: boolean; // Whether to show the tax free badge
}

export function PriceDisplay({
    amount,
    className,
    showTaxBenefit = true
}: PriceDisplayProps) {
    const { formatPrice, currency, isNonResident } = useCurrency();
    // Removed unused t hooks and props

    // Let's rely on formatPrice which assumes UYU input for now.
    // TODO: Ideally refactor formatPrice to handle input Currency.

    const { formatted, currency: displayCurrency } = formatPrice(amount);

    // Calculate savings if applicable
    // If NonResident and showing USD, we compare with the original UYU value converted at standard rate?
    // Actually the logic in previous ActivityCard:
    // TaxFreePrice = UYU / 1.22
    // Savings = UYU - TaxFreePrice (in USD terms?) or just show raw savings.

    // Order v282 says: "Precios con IVA CERO aplicado (Exclusivo No Residentes)"

    return (
        <div className={cn("inline-flex flex-col items-end", className)}>
            {isNonResident && showTaxBenefit && (
                <span className="text-[10px] text-gray-400 line-through decoration-red-400 mb-0.5">
                    $ {Math.round(amount).toLocaleString()} UYU
                </span>
            )}

            <span className={cn(
                "font-bold text-gray-900",
                isNonResident ? "text-ocean-600" : "text-gray-900"
            )}>
                {formatted}
                <span className="text-[0.6em] font-normal text-gray-500 ml-1">
                    {displayCurrency}
                </span>
            </span>

            {isNonResident && showTaxBenefit && (
                <div className="mt-1 text-[9px] text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>TAX FREE (0% IVA)</span>
                </div>
            )}
            {!isNonResident && showTaxBenefit && currency === 'UYU' && (
                <div className="mt-1 text-[9px] text-ocean-600 font-medium flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>-9% IVA (Tarjetas)</span>
                </div>
            )}
        </div>
    );
}
