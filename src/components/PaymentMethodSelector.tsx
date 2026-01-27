import { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type PaymentMethod = 'card' | 'mercadopago';

interface PaymentMethodSelectorProps {
    selected: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-4">Método de Pago</h3>

            {/* Credit Card Option */}
            <button
                onClick={() => onChange('card')}
                className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                    selected === 'card'
                        ? "border-ocean-500 bg-ocean-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                )}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            selected === 'card' ? "bg-ocean-100" : "bg-gray-100"
                        )}>
                            <CreditCard className={cn(
                                "w-6 h-6",
                                selected === 'card' ? "text-ocean-600" : "text-gray-500"
                            )} />
                        </div>
                        <div>
                            <p className={cn(
                                "font-semibold",
                                selected === 'card' ? "text-ocean-900" : "text-gray-900"
                            )}>
                                Tarjeta de Crédito/Débito
                            </p>
                            <p className="text-sm text-gray-600">
                                💳 Visa, Mastercard, Amex
                            </p>
                        </div>
                    </div>
                    {selected === 'card' && (
                        <CheckCircle2 className="w-6 h-6 text-ocean-600" />
                    )}
                </div>
            </button>

            {/* Mercado Pago Option */}
            <button
                onClick={() => onChange('mercadopago')}
                className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                    selected === 'mercadopago'
                        ? "bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                )}
                style={selected === 'mercadopago' ? { borderColor: '#009EE3' } : {}}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            selected === 'mercadopago' ? "bg-blue-100" : "bg-gray-100"
                        )}>
                            <Smartphone className={cn(
                                "w-6 h-6",
                                selected === 'mercadopago' ? "text-blue-600" : "text-gray-500"
                            )} />
                        </div>
                        <div>
                            <p className={cn(
                                "font-semibold",
                                selected === 'mercadopago' ? "text-blue-900" : "text-gray-900"
                            )}>
                                Mercado Pago
                            </p>
                            <p className="text-sm text-gray-600">
                                🔵 Pago seguro en Uruguay
                            </p>
                        </div>
                    </div>
                    {selected === 'mercadopago' && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    )}
                </div>
            </button>

            {/* Security Note */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                    🔒 Todos los pagos son procesados de forma segura con encriptación SSL 256-bit
                </p>
            </div>
        </div>
    );
}
