import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle, AlertCircle, ArrowLeft, List } from 'lucide-react';
import { QRScanner } from '@/components/QRScanner';
import { VoucherDetailModal } from '@/components/VoucherDetailModal';
import { validateVoucherQR, type ScannedVoucher } from '@/utils/voucherValidation';
import { useItineraryStore } from '@/store/itineraryStore';
import { Link } from 'react-router-dom';

export function QRScannerPage() {
    const [showScanner, setShowScanner] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        error?: string;
        voucher?: any;
    } | null>(null);
    const [scannedVouchers, setScannedVouchers] = useState<ScannedVoucher[]>([]);

    // Get all vouchers from store (en producción vendría del partner específico)
    const allVouchers = useItineraryStore((state) => state.vouchers);

    // Mock partner ID (en producción vendría de auth)
    const partnerId = 'partner-bodega-narbona';

    const handleQRScan = (qrData: string) => {
        console.log('[QR_SCANNER_PAGE] QR escaneado:', qrData);

        const result = validateVoucherQR(qrData, allVouchers);
        setValidationResult(result);
        setShowScanner(false);
    };

    const handleConfirmScanned = (voucherId: string) => {
        console.log('[QR_SCANNER_PAGE] Voucher confirmado:', voucherId);

        if (validationResult?.voucher) {
            const scannedVoucher: ScannedVoucher = {
                voucherId: validationResult.voucher.voucherId,
                bookingId: validationResult.voucher.bookingId,
                activityName: validationResult.voucher.services[0].activityName,
                scannedAt: new Date().toISOString(),
                scannedBy: partnerId,
                pax: {
                    adults: validationResult.voucher.services[0].pax.adults,
                    children: validationResult.voucher.services[0].pax.children,
                },
                amount: validationResult.voucher.balanceDue,
            };

            setScannedVouchers([scannedVoucher, ...scannedVouchers]);
        }

        setValidationResult(null);
    };

    const totalScannedToday = scannedVouchers.reduce((sum, v) => sum + v.amount, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/partner/dashboard"
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="font-playfair text-2xl font-bold">Escanear Vouchers</h1>
                            <p className="text-gray-400 text-sm">Validar servicios de clientes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-500">Escaneados Hoy</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{scannedVouchers.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                                <span className="text-xl">💰</span>
                            </div>
                            <span className="text-sm text-gray-500">Ingresos Pendientes</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#C5A059' }}>
                            ${totalScannedToday.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">UYU - Saldo a liquidar</p>
                    </div>
                </div>

                {/* Scanner Section */}
                {!showScanner ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
                    >
                        <QrCode className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                            Listo para Escanear
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Activa la cámara para validar el código QR del voucher del cliente
                        </p>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="px-8 py-4 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                        >
                            <QrCode className="w-5 h-5" />
                            Escanear Voucher
                        </button>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <QRScanner
                            onScan={handleQRScan}
                            onError={(error) => {
                                console.error('[QR_SCANNER_PAGE] Error:', error);
                                setShowScanner(false);
                            }}
                        />
                    </div>
                )}

                {/* Scanned Vouchers List */}
                {scannedVouchers.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            <List className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Vouchers Escaneados Hoy</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {scannedVouchers.map((voucher, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{voucher.activityName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {voucher.pax.adults} adultos
                                                    {voucher.pax.children > 0 && ` + ${voucher.pax.children} niños`}
                                                </p>
                                                <p className="text-xs text-gray-400 font-mono mt-1">
                                                    {new Date(voucher.scannedAt).toLocaleTimeString('es-UY', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg" style={{ color: '#C5A059' }}>
                                                ${voucher.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">UYU</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Validation Result Modal */}
            <AnimatePresence>
                {validationResult?.isValid && validationResult.voucher && (
                    <VoucherDetailModal
                        voucher={validationResult.voucher}
                        partnerId={partnerId}
                        onClose={() => setValidationResult(null)}
                        onConfirm={handleConfirmScanned}
                    />
                )}
            </AnimatePresence>

            {/* Error Modal */}
            <AnimatePresence>
                {validationResult && !validationResult.isValid && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="font-playfair text-xl font-bold text-gray-900 mb-2">
                                    Voucher No Válido
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {validationResult.error || 'El código QR no corresponde a un voucher válido.'}
                                </p>
                                <button
                                    onClick={() => setValidationResult(null)}
                                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Intentar de Nuevo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
