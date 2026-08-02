import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, DollarSign, MapPin } from 'lucide-react';
import type { PartnerVoucher } from '@/types';
import { markVoucherAsScanned } from '@/utils/voucherValidation';
import { useCurrency } from '@/hooks/useCurrency';

interface VoucherDetailModalProps {
    voucher: PartnerVoucher;
    onClose: () => void;
    onConfirm: (voucherId: string) => void;
    partnerId: string;
}

export function VoucherDetailModal({ voucher, onClose, onConfirm, partnerId }: VoucherDetailModalProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    const service = voucher.services[0]; // Vouchers individuales solo tienen 1 servicio

    const handleConfirm = () => {
        setIsConfirming(true);

        // Mark as scanned
        markVoucherAsScanned(voucher, partnerId);

        // Simulate API call
        setTimeout(() => {
            onConfirm(voucher.voucherId);
        }, 1000);
    };

    const getPeriodLabel = (timeSlot: string) => {
        switch (timeSlot) {
            case 'morning': return '🌅 Mañana';
            case 'midday': return '☀️ Mediodía';
            case 'afternoon': return '🌤️ Tarde';
            case 'evening': return '🌙 Noche';
            default: return '🕒 Horario a coordinar';
        }
    };

    const { getBidirectionalPrice } = useCurrency();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b" style={{ backgroundColor: '#F8F7F4' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-1">
                                    ✅ Voucher Detectado
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Reserva: <span className="font-mono font-semibold">{voucher.bookingId}</span>
                                </p>
                                <p className="text-sm font-bold text-ocean-700 mt-1">
                                    Titular: {voucher.touristName} ({voucher.touristNationality})
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                disabled={isConfirming}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="p-6 space-y-4">
                        {/* Activity Name */}
                        <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200">
                            <p className="text-sm text-ocean-700 mb-1">Servicio</p>
                            <p className="font-bold text-xl text-ocean-900">{service.activityName}</p>
                            <p className="text-sm text-ocean-600 mt-1">
                                Día {service.dayNumber} • {getPeriodLabel(service.timeSlot)}
                                {voucher.stayDuration && (
                                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
                                        {voucher.stayDuration} Noches
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* PAX Info */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm text-gray-600">Adulto(s)</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{service.pax.adults}</p>
                            </div>
                            {service.pax.children > 0 && (
                                <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm text-gray-600">Niño(s)</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{service.pax.children}</p>
                                    <p className="text-xs text-gray-500">
                                        Edades: {service.pax.childrenAges.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Financial Info */}
                        <div className="p-4 rounded-xl border-2" style={{ borderColor: '#C5A059', backgroundColor: '#FFF9E6' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-5 h-5" style={{ color: '#C5A059' }} />
                                <p className="font-semibold text-gray-900">Detalle Financiero</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Servicio</span>
                                    <div className="text-right">
                                        <span className="font-semibold block">{getBidirectionalPrice(voucher.totalPartnerAmount).formattedUSD}</span>
                                        <span className="text-xs text-gray-500">{getBidirectionalPrice(voucher.totalPartnerAmount).formattedUYU}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Seña Pagada (15%)</span>
                                    <div className="text-right">
                                        <span className="text-green-600 font-semibold block">-{getBidirectionalPrice(voucher.depositPaid).formattedUSD}</span>
                                        <span className="text-xs text-green-500">-{getBidirectionalPrice(voucher.depositPaid).formattedUYU}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-amber-300">
                                    <span className="font-bold text-gray-900 uppercase text-xs tracking-wider">Saldo a Cobrar</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black block" style={{ color: '#800020' }}>
                                            {getBidirectionalPrice(voucher.balanceDue).formattedUSD}
                                        </span>
                                        <span className="text-sm font-bold text-gray-700">
                                            {getBidirectionalPrice(voucher.balanceDue).formattedUYU}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Partner Info */}
                        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                            <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {voucher.partnerName}
                            </p>
                            <p className="mt-1">RUT: {voucher.partnerRUT}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-gray-50 border-t flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isConfirming}
                            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isConfirming}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isConfirming ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Confirmando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Confirmar Entregado
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
