import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Download, Mail, Printer, AlertTriangle } from 'lucide-react';
import { useItineraryStore, useIsForeigner } from '@/store/itineraryStore';
import { QRCodeCanvas } from 'qrcode.react';
import { cn } from '@/utils/cn';

interface VoucherQRData {
  bookingId: string;
  voucherId: string;
  partnerName: string;
  serviceType: string;
  checkInDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  currency: string;
}

export function CheckoutSuccessPage() {
  const navigate = useNavigate();

  // ==================== ZUSTAND PROPS ====================
  const bookingId = useItineraryStore((state) => state.bookingId);
  const vouchers = useItineraryStore((state) => state.vouchers);
  const selectedHotel = useItineraryStore((state) => state.selectedHotel);
  const numberOfNights = useItineraryStore((state) => state.numberOfNights);
  const numberOfAdults = useItineraryStore((state) => state.numberOfAdults);
  const numberOfChildren = useItineraryStore((state) => state.numberOfChildren);
  const residencyCountry = useItineraryStore((state) => state.residencyCountry);
  const currency = useItineraryStore((state) => state.currency);
  const exchangeRate = useItineraryStore((state) => state.exchangeRate);

  const isForeigner = useIsForeigner();

  // ==================== LOCAL STATE ====================
  const [emailSent, setEmailSent] = useState(false);
  const [timestamp] = useState(new Date());

  // ==================== DEBUG & VALIDATION ====================
  useEffect(() => {
    console.log('[CHECKOUT_SUCCESS] Estado recibido:', {
      bookingId,
      vouchersCount: vouchers.length,
      hotel: selectedHotel?.name,
      nights: numberOfNights,
      residency: residencyCountry
    });

    if (!bookingId || vouchers.length === 0 || !selectedHotel) {
      console.error('[CHECKOUT_SUCCESS_ERROR] Datos insuficientes. Redirigiendo...');
    }
  }, [bookingId, vouchers, selectedHotel, numberOfNights, residencyCountry]);

  // Si no hay datos críticos, mostrar error y botón de retorno
  if (!bookingId || vouchers.length === 0 || !selectedHotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos no encontrados</h2>
          <p className="text-gray-600 mb-6">
            No pudimos recuperar la información de tu reserva. Si acabas de pagar, revisa tu correo electrónico.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ==================== ACTIONS ====================

  // 📥 Descargar QR individual
  const downloadQR = (voucherId: string, partnerName: string) => {
    const canvas = document.getElementById(`qr-${voucherId}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `voucher-${partnerName.replace(/\s+/g, '-').toLowerCase()}-${voucherId}.png`;
      link.href = url;
      link.click();
    }
  };

  // 📄 Descargar PDF (Mock)
  const handleDownloadPDF = () => {
    // Aquí iría la lógica real de generación de PDF (ej: jspdf)
    // Por ahora, usamos print del navegador que es muy efectivo
    window.print();
  };

  // 📧 Enviar Email (Mock)
  const handleEmailVouchers = () => {
    setEmailSent(true);
    // Simular delay de API
    setTimeout(() => setEmailSent(false), 3000);
  };

  // Calcular totales financieros para el resumen
  // Nota: Esto es visual, los cálculos reales ocurrieron en el paso anterior
  // Asumimos que el backend/store tiene los valores finales, aquí solo sumamos para mostrar

  // Total bruto antes de descuentos
  const totalGross = vouchers.reduce((acc, v) => acc + (v.totalAmount || 0), 0);

  // Si es extranjero, estimamos el descuento que se aplicó (esto debería venir del store idealmente)
  // Pero para efectos visuales recalculamos o usamos los valores ya netos si el store los guardó así.
  // En este contexto, asumimos que voucher.totalAmount es el precio FINAL.

  return (
    <div className="min-h-screen bg-gray-50 font-inter print:bg-white">
      {/* Background Pattern (Solo visible en pantalla) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none print:hidden flex items-center justify-center overflow-hidden">
        <svg width="100%" height="100%">
          <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="text-gray-900" fill="currentColor" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 print:p-0 print:max-w-none">

        {/* ✅ HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 print:mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 print:hidden">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h1>
          <p className="text-lg text-gray-600 mb-4">Tu viaje está listo y asegurado 🇺🇾✈️</p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-none print:shadow-none">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Booking ID</span>
              <span className="font-mono text-xl font-bold text-ocean-600">{bookingId}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Fecha Confirmación</span>
              <span className="text-gray-900 font-medium">
                {timestamp.toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })} • {timestamp.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 🎫 VOUCHERS GRID */}
        <div className="grid gap-8 lg:grid-cols-1 mb-12 print:block print:gap-0">
          {vouchers.map((voucher, index) => {
            // Datos para el QR
            const qrData: VoucherQRData = {
              bookingId,
              voucherId: voucher.voucherId,
              partnerName: voucher.partnerName,
              serviceType: voucher.services[0]?.category || 'Servicio',
              checkInDate: voucher.startDate,
              adults: numberOfAdults,
              children: numberOfChildren,
              totalAmount: voucher.totalAmount,
              currency: currency
            };

            const isAccommodation = voucher.services.some(s => s.category === 'accommodation' || s.category === 'hotel');

            return (
              <motion.div
                key={voucher.voucherId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border print:mb-8 break-inside-avoid"
              >
                {/* Voucher Header */}
                <div className={cn(
                  "p-6 border-b flex justify-between items-start",
                  isAccommodation ? "bg-ocean-50/50 border-ocean-100" : "bg-gray-50/50 border-gray-100"
                )}>
                  <div>
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2",
                      isAccommodation ? "bg-ocean-100 text-ocean-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {isAccommodation ? 'Alojamiento' : 'Experiencia / Gastronomía'}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">{voucher.partnerName}</h3>
                    <p className="text-gray-500 text-sm mt-1">Voucher ID: <span className="font-mono">{voucher.voucherId}</span></p>
                  </div>
                  {/* Logo Placeholder */}
                  <div className="w-12 h-12 rounded-lg bg-gray-200 opacity-20 hidden sm:block"></div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Info Column */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Check-in</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {new Date(voucher.startDate).toLocaleDateString('es-UY')}
                        </p>
                        <p className="text-xs text-gray-400">Desde las 14:00</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Check-out / Fin</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {new Date(voucher.endDate).toLocaleDateString('es-UY')}
                        </p>
                        <p className="text-xs text-gray-400">Hasta las 11:00</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Huéspedes</p>
                        <p className="font-medium text-gray-900">
                          {numberOfAdults} Adultos, {numberOfChildren} Niños
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Incluido</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {voucher.services.map((s, i) => (
                            <li key={i}>{s.description || s.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {isForeigner && isAccommodation && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-4 inline-block">
                        <p className="text-xs text-green-800 font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Beneficio IVA Cero aplicado (Ley 19.253) - Pasaporte Extranjero
                        </p>
                      </div>
                    )}
                  </div>

                  {/* QR Column */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 print:bg-white print:border-gray-900">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-4 print:border-none print:shadow-none">
                      <QRCodeCanvas
                        id={`qr-${voucher.voucherId}`}
                        value={JSON.stringify(qrData)}
                        size={160}
                        level={"H"}
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 max-w-[200px] mb-4 print:hidden">
                      Muestra este QR al llegar al establecimiento para validar tu reserva.
                    </p>
                    <button
                      onClick={() => downloadQR(voucher.voucherId, voucher.partnerName)}
                      className="text-xs font-semibold text-ocean-600 hover:text-ocean-700 flex items-center gap-1 print:hidden"
                    >
                      <Download className="w-3 h-3" />
                      Descargar QR
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 💰 FINANCIAL SUMMARY */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen Financiero</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total del Itinerario</span>
                <span className="font-medium">{totalGross.toLocaleString('es-UY', { style: 'currency', currency: currency })} {currency}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-ocean-700 font-medium">Pagado Online (15%)</span>
                <span className="font-bold text-ocean-700">
                  {(totalGross * 0.15).toLocaleString('es-UY', { style: 'currency', currency: currency })} {currency}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 uppercase font-bold mb-1">Saldo a Pagar en Destino</p>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-amber-900">
                  {(totalGross * 0.85).toLocaleString('es-UY', { style: 'currency', currency: currency })}
                </span>
                <span className="text-sm font-medium text-amber-800">{currency}</span>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                * Pagar directamente en cada establecimiento al realizar el check-in.
              </p>
            </div>
          </div>
        </div>

        {/* 🔘 ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex flex-col items-center justify-center p-4 bg-ocean-600 text-white rounded-xl shadow-lg hover:bg-ocean-700 transition-all hover:-translate-y-1"
          >
            <Download className="w-6 h-6 mb-2" />
            <span className="font-bold">Descargar Todo (PDF)</span>
            <span className="text-xs opacity-80 mt-1">Recomendado</span>
          </button>

          <button
            onClick={handleEmailVouchers}
            disabled={emailSent}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl shadow-sm border-2 transition-all hover:-translate-y-1",
              emailSent
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:border-ocean-300 hover:bg-ocean-50"
            )}
          >
            {emailSent ? <CheckCircle2 className="w-6 h-6 mb-2" /> : <Mail className="w-6 h-6 mb-2" />}
            <span className="font-bold">{emailSent ? 'Enviado' : 'Enviar por Email'}</span>
            <span className="text-xs opacity-80 mt-1">{emailSent ? 'Revisa tu bandeja' : 'Al correo registrado'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center p-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
          >
            <Home className="w-6 h-6 mb-2" />
            <span className="font-bold">Volver al Inicio</span>
            <span className="text-xs opacity-80 mt-1">Explorar más</span>
          </button>
        </div>

      </div>
    </div>
  );
}
