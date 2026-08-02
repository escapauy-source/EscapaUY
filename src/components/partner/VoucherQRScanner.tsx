import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, XCircle, Scan, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface VoucherQRScannerProps {
    partnerId: string;
}

type ScanResult = {
    success: boolean;
    message: string;
    booking?: any;
} | null;

/**
 * Escáner de Vouchers QR - Conexión Supabase Real
 * Valida voucher_code + partner_id y marca como 'completed'
 */
export function VoucherQRScanner({ partnerId }: VoucherQRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult>(null);
    const [scanHistory, setScanHistory] = useState<any[]>([]);

    const handleScan = async (qrDataString: string) => {
        let voucherCode = qrDataString.trim();

        // 🟢 SMART PARSING: Check if QR is a JSON payload (Enriched QR)
        try {
            if (voucherCode.startsWith('{') && voucherCode.endsWith('}')) {
                const parsed = JSON.parse(voucherCode);
                // Extract the actual ID from common fields used in our Vouchers
                if (parsed.ref) voucherCode = parsed.ref;
                else if (parsed.voucherId) voucherCode = parsed.voucherId;
                else if (parsed.bookingId) voucherCode = parsed.bookingId;

                console.log('[Scanner] Parsed JSON payload. Code extracted:', voucherCode);
            }
        } catch (e) {
            // Not JSON, continue with raw string
            console.log('[Scanner] QR is raw string:', voucherCode);
        }

        try {
            console.log('[Scanner] Validating voucher:', voucherCode);

            const { data: booking, error: fetchError } = await supabase
                .from('partner_bookings')
                .select('*, partner_services(name)')
                .eq('voucher_code', voucherCode)
                .single();

            if (fetchError || !booking) {
                setScanResult({
                    success: false,
                    message: 'Voucher no encontrado o código inválido',
                });
                return;
            }

            // Validar que el booking pertenezca al partner actual
            if (booking.partner_id !== partnerId) {
                setScanResult({
                    success: false,
                    message: 'Este voucher no pertenece a este establecimiento',
                    booking,
                });
                return;
            }

            if (booking.status === 'completed') {
                setScanResult({
                    success: false,
                    message: `Voucher ya consumido anteriormente`,
                    booking,
                });
                return;
            }

            if (booking.status === 'cancelled') {
                setScanResult({
                    success: false,
                    message: 'Voucher cancelado',
                    booking,
                });
                return;
            }

            // Redimir voucher (actualizar a 'completed')
            const { error: updateError } = await supabase
                .from('partner_bookings')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', booking.id);

            if (updateError) throw updateError;

            const scanRecord = {
                ...booking,
                scannedAt: new Date().toISOString(),
            };
            setScanHistory([scanRecord, ...scanHistory]);

            setScanResult({
                success: true,
                message: '¡Voucher validado y consumido correctamente!',
                booking: scanRecord,
            });
            toast.success('Check-in exitoso');

        } catch (err) {
            console.error('[Scanner] Error:', err);
            setScanResult({
                success: false,
                message: 'Error técnico al validar el voucher',
            });
        } finally {
            setIsScanning(false);
        }
    };

    // Simulación de escaneo para testing (Auto-Healing)
    const simulateScan = async () => {
        setIsScanning(true);
        setScanResult(null);

        try {
            // 1. Intentar buscar un booking existente
            const { data } = await supabase
                .from('partner_bookings')
                .select('voucher_code')
                .eq('partner_id', partnerId)
                .eq('status', 'confirmed')
                .limit(1);

            let codeToUse = data?.[0]?.voucher_code;

            // 2. Si no hay bookings, mostrar mensaje claro en lugar de error o auto-creación
            if (!codeToUse) {
                toast.error('No hay reservas pendientes para escanear');
                setIsScanning(false);
                return;
            }

            // 3. Proceder al escaneo
            setTimeout(() => {
                handleScan(codeToUse);
            }, 1500);

        } catch (err) {
            console.error('[Scanner] Setup failed:', err);
            toast.error('Error preparando la simulación');
            setIsScanning(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Validación de Vouchers</h2>
                    <p className="text-sm text-gray-500 mt-1">Escanea el código QR del voucher del cliente</p>
                </div>

                <div className="p-8">
                    <div className={cn(
                        "relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border-4 transition-all",
                        isScanning ? "border-ocean-500 animate-pulse" : "border-gray-200"
                    )}>
                        {isScanning ? (
                            <div className="absolute inset-0 bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center">
                                <div className="text-center">
                                    <Scan className="w-16 h-16 text-white animate-pulse mx-auto mb-4" />
                                    <p className="text-white font-medium">Escaneando...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Presiona el botón para escanear</p>
                                </div>
                            </div>
                        )}

                        {isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-4 border-white/50 rounded-xl"></div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={simulateScan}
                            disabled={isScanning}
                            className={cn(
                                "px-8 py-4 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto",
                                isScanning
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-ocean-600 text-white hover:bg-ocean-700 shadow-lg hover:shadow-xl"
                            )}
                        >
                            {isScanning && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isScanning ? 'Procesando...' : 'Iniciar Escaneo de Seguridad'}
                        </button>
                    </div>
                </div>

                {scanResult && (
                    <div className={cn(
                        "p-6 border-t",
                        scanResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}>
                        <div className="flex items-start gap-3">
                            {scanResult.success ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={cn(
                                    "font-semibold",
                                    scanResult.success ? "text-green-900" : "text-red-900"
                                )}>
                                    {scanResult.message}
                                </p>
                                {scanResult.booking && (
                                    <div className="mt-3 space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Turista:</span>
                                                <span className="ml-2 font-medium text-gray-900">
                                                    {scanResult.booking.tourist_name}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Saldo a Cobrar:</span>
                                                <span className="ml-2 font-bold text-gray-900">
                                                    {formatCurrency(scanResult.booking.balance_amount || 0)}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Actividad:</span>
                                                <span className="ml-2 text-gray-900">
                                                    {scanResult.booking.partner_services?.name || 'Servicio General'}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Voucher:</span>
                                                <span className="ml-2 font-mono text-gray-900">
                                                    {scanResult.booking.voucher_code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Helper for Demo/Debug: Show Real Pending Bookings */}
            <LiveVoucherHints partnerId={partnerId} onSelectCode={(code) => handleScan(code)} />

            {scanHistory?.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 font-sans">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-gray-900">Historial de Validaciones</h3>
                            <p className="text-sm text-gray-500 mt-1">Check-ins realizados en esta sesión</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            Total: {scanHistory?.length}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {scanHistory?.map((scan, idx) => (
                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-mono text-sm font-medium text-gray-900">
                                            {scan?.voucher_code}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {scan?.tourist_name} • {scan?.partner_services?.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-700">
                                            {formatCurrency(scan?.balance_amount || 0)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                            Validado {new Date(scan?.scannedAt).toLocaleTimeString('es-UY', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 italic">No hay validaciones registradas en esta sesión.</p>
                </div>
            )}
        </div>
    );
}

/**
 * Helper Component to show "Real" bookings waiting to be scanned
 * Makes user testing much easier by linking Tourist -> Partner
 */
function LiveVoucherHints({ partnerId, onSelectCode }: { partnerId: string, onSelectCode: (code: string) => void }) {
    const [pendingVouchers, setPendingVouchers] = useState<any[]>([]);

    useEffect(() => {
        const fetchPending = async () => {
            const { data } = await supabase
                .from('partner_bookings')
                .select('voucher_code, tourist_name, total_amount')
                .eq('partner_id', partnerId)
                .eq('status', 'confirmed') // Only confirmed, not yet completed
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) setPendingVouchers(data);
        };
        fetchPending();

        // Refresh every 10s to catch new "Tourist" purchases
        const interval = setInterval(fetchPending, 10000);
        return () => clearInterval(interval);
    }, [partnerId]);

    if (pendingVouchers.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-600">🔔</span>
                <p className="text-sm font-semibold text-amber-900">
                    Solicitudes Reales Pendientes ({pendingVouchers.length})
                </p>
            </div>
            <p className="text-xs text-amber-700 mb-3">
                Estos son turistas reales que han comprado y están esperando validación. Click para "escanear" (demo).
            </p>
            <div className="flex flex-wrap gap-2">
                {pendingVouchers.map((v) => (
                    <button
                        key={v.voucher_code}
                        onClick={() => onSelectCode(v.voucher_code)}
                        className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm"
                        title={`Turista: ${v.tourist_name}`}
                    >
                        {v.voucher_code}
                        <span className="opacity-50 ml-1">(${v.total_amount})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
