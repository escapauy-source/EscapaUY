import { useState } from 'react';
import { Camera, AlertCircle, XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';

interface QRScannerProps {
    onScan: (qrData: string) => void;
    onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanner, setScanner] = useState<Html5Qrcode | null>(null);

    const startScanning = async () => {
        setError(null);

        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            setScanner(html5QrCode);

            await html5QrCode.start(
                { facingMode: "environment" }, // Usar cámara trasera en móviles
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    console.log('[QR_SCANNER] QR detectado:', decodedText);
                    stopScanning();
                    onScan(decodedText);
                },
                (errorMessage) => {
                    // Ignorar errores de escaneo continuos (no hay QR en frame)
                }
            );

            setIsScanning(true);
        } catch (err) {
            const errorMsg = 'No se pudo acceder a la cámara. Verifica los permisos.';
            setError(errorMsg);
            onError?.(errorMsg);
            console.error('[QR_SCANNER] Error:', err);
        }
    };

    const stopScanning = async () => {
        if (scanner && isScanning) {
            try {
                await scanner.stop();
                scanner.clear();
                setScanner(null);
                setIsScanning(false);
            } catch (err) {
                console.error('[QR_SCANNER] Error al detener:', err);
            }
        }
    };

    return (
        <div className="space-y-4">
            {!isScanning ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300"
                >
                    <Camera className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-6 text-center">
                        Presiona el botón para activar la cámara<br />
                        y escanear el código QR del voucher
                    </p>
                    <button
                        onClick={startScanning}
                        className="px-8 py-4 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Camera className="w-5 h-5" />
                        Activar Cámara
                    </button>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}
                </motion.div>
            ) : (
                <div className="relative">
                    {/* QR Reader Container */}
                    <div id="qr-reader" className="rounded-2xl overflow-hidden shadow-2xl"></div>

                    {/* Scanning Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            Escaneando...
                        </div>
                        <button
                            onClick={stopScanning}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-center">
                            📱 Coloca el código QR del voucher dentro del recuadro
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
