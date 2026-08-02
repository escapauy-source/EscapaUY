import { motion } from 'framer-motion';
import { Download, Calendar, Users, DollarSign, Shield, MapPin, Phone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { PartnerVoucher } from '@/types';
import { cn } from '@/utils/cn';

interface PartnerVoucherCardProps {
    voucher: PartnerVoucher;
    className?: string;
}

export function PartnerVoucherCard({ voucher, className }: PartnerVoucherCardProps) {
    const currencyCode = voucher.currency || 'UYU';

    const getPeriodLabel = (timeSlot: string) => {
        switch (timeSlot) {
            case 'morning': return '🌅 Mañana';
            case 'midday': return '☀️ Mediodía';
            case 'afternoon': return '🌤️ Tarde';
            case 'evening': return '🌙 Noche';
            default: return '🕒 Horario a coordinar';
        }
    };

    // Generate unique QR data: bookingId_activityId_timestamp
    // ⚠️ CRÍTICO: Cada QR contiene SOLO el servicio de este voucher
    const generateQRData = () => {
        const timestamp = Date.now();
        const activityId = voucher.services[0].activityId; // Solo UNA actividad por voucher
        const cleanActivityId = activityId.replace(/[^a-zA-Z0-9]/g, '');

        const qrData = `${voucher.bookingId}_${cleanActivityId}_${timestamp}`;

        console.log('[QR_DEBUG] QR generado para:', voucher.services[0].activityName);
        console.log('[QR_DEBUG] QR data:', qrData);

        return qrData;
    };

    const qrData = generateQRData();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-white rounded-2xl shadow-xl border-2 overflow-hidden",
                className
            )}
            style={{ borderColor: '#C5A059' }}
        >
            {/* Header with Partner Info */}
            <div className="p-6 border-b" style={{ backgroundColor: '#F8F7F4', borderColor: '#C5A059' }}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-1">
                            {voucher.partnerName}
                        </h3>
                        <div className="space-y-0.5 text-sm text-gray-600">
                            <p><strong>Razón Social:</strong> {voucher.partnerRazonSocial}</p>
                            <p><strong>RUT:</strong> {voucher.partnerRUT}</p>
                            <p className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {voucher.partnerLegalAddress}
                            </p>
                            {voucher.partnerPhone && (
                                <p className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {voucher.partnerPhone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Voucher ID Badge */}
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Voucher ID</p>
                        <p className="font-mono text-sm font-bold text-gray-900">
                            {voucher.voucherId.split('-').slice(-1)[0]}
                        </p>
                    </div>
                </div>
            </div>

            {/* QR Code Section - REAL QR */}
            <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex items-center justify-center">
                    <div className="p-6 bg-white border-2 border-dashed rounded-2xl" style={{ borderColor: '#C5A059' }}>
                        {/* REAL QR CODE */}
                        <QRCodeSVG
                            value={qrData}
                            size={192}
                            level="H"
                            includeMargin={true}
                            fgColor="#1a1a1a"
                            bgColor="#ffffff"
                        />
                        <p className="text-xs text-gray-600 text-center mt-3">
                            Presenta este código en el establecimiento
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1 font-mono">
                            {qrData.split('_')[0]}-{qrData.split('_')[1].slice(-4)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Included */}
            <div className="p-6 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: '#C5A059' }} />
                    Servicios Incluidos
                </h4>
                <div className="space-y-3">
                    {voucher.services.map((service, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{service.activityName}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Día {service.dayNumber} • {getPeriodLabel(service.timeSlot)}
                                        {voucher.stayDuration && (
                                            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
                                                {voucher.stayDuration} Noches
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {currencyCode} {service.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pax Info */}
            <div className="p-6 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: '#C5A059' }} />
                    Información de Pasajeros
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-ocean-50 rounded-lg">
                        <p className="text-ocean-700 font-medium">Adulto(s)</p>
                        <p className="text-2xl font-bold text-ocean-900">{voucher.services[0].pax.adults}</p>
                    </div>
                    {voucher.services[0].pax.children > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-green-700 font-medium">Niño(s)</p>
                            <p className="text-2xl font-bold text-green-900">{voucher.services[0].pax.children}</p>
                            <p className="text-xs text-green-600">
                                Edades: {voucher.services[0].pax.childrenAges.join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-6 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" style={{ color: '#C5A059' }} />
                    Detalle Financiero
                </h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Bruto (Referencial)</span>
                        <span className="font-medium text-gray-500 line-through">
                            {currencyCode} {voucher.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {voucher.taxBenefitSavings > 0 && (
                        <div className="flex justify-between text-sm py-2 px-3 bg-green-50 rounded-lg border border-green-100">
                            <span className="text-green-700 font-medium">Ahorro Beneficio Fiscal</span>
                            <span className="font-bold text-green-700 uppercase text-xs">
                                -{currencyCode} {voucher.taxBenefitSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Servicio (Neto)</span>
                        <span className="font-bold text-gray-900">
                            {currencyCode} {voucher.totalPartnerAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    {voucher.currency === 'USD' && voucher.nativeTotal && (
                        <div className="text-right text-xs text-gray-500 mt-1">
                            (Ref: ${Math.round(voucher.nativeTotal).toLocaleString('es-UY')} UYU)
                        </div>
                    )}

                    <div className="flex justify-between text-sm pt-2">
                        <span className="text-gray-600">Seña Pagada Online (15% del Neto)</span>
                        <span className="font-semibold text-ocean-600">
                            {currencyCode} {voucher.depositPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm pt-3 border-t-2 border-dashed border-gray-200">
                        <span className="text-gray-900 font-bold">Saldo a Pagar en Local</span>
                        <span className="text-3xl font-black" style={{ color: '#800020' }}>
                            {currencyCode} {voucher.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {voucher.exchangeRateDisclaimer && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                            <p className="text-blue-800 font-medium">⚠️ Exchange Rate Notice:</p>
                            <p className="text-blue-600 italic">
                                "{voucher.exchangeRateDisclaimer}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="p-6 bg-gray-50">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-ocean-600" />
                    <div>
                        <p className="mb-2">
                            <strong>Validez Legal:</strong> Este voucher tiene validez conforme a la Ley 17.250 de Defensa del Consumidor de Uruguay.
                        </p>
                        <p className="mb-2">
                            <strong>No Retracto (Art. 16 y Art. 24 - Ley 17.250):</strong> Los servicios turísticos con <strong>fecha determinada</strong> están exceptuados del derecho de retracción de 5 días hábiles. Esta reserva es vinculante y no admite devolución, conforme al artículo 16 y 24 de la Ley de Defensa del Consumidor.
                        </p>
                        <p>
                            <strong>Intermediario:</strong> ESCAPAUY S.A. (PSPC registrado BCU).
                            El prestador es responsable directo de la calidad del servicio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <div className="p-6 bg-white">
                <button className="w-full py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                    <Download className="w-5 h-5" />
                    Descargar PDF
                </button>
            </div>
        </motion.div>
    );
}
