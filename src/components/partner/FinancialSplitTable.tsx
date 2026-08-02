import { Download, MapPin, BadgeCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MockBooking } from '@/utils/mockPartnerData';

interface FinancialSplitTableProps {
    bookings: MockBooking[];
    onExportCSV?: () => void;
}

/**
 * Tabla de Transparencia Financiera (BCU)
 * Muestra split 15/85 y aplica IVA CERO para extranjeros (Ley 19.253)
 */
export function FinancialSplitTable({ bookings, onExportCSV }: FinancialSplitTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-gray-900">Reservas y Split Financiero</h2>
                    <p className="text-sm text-gray-500 mt-1">Transparencia BCU - Split 15% Seña / 85% Saldo</p>
                </div>
                <button
                    onClick={onExportCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#F8F7F4] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Residencia
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Seña 15%
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Saldo 85%
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr
                                key={booking.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm font-medium text-gray-900">
                                        {booking.bookingCode}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {booking.guestName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.activity}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {booking.touristResidence}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="font-mono text-sm font-bold text-gray-900">
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="font-mono text-sm text-green-600">
                                        +{formatCurrency(booking.paidAmount)}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-mono text-sm text-amber-600">
                                            {formatCurrency(booking.remainingAmount)}
                                        </span>
                                        {booking.ivaExempt && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-full">
                                                <BadgeCheck className="w-3 h-3 text-[#C5A059]" />
                                                <span className="text-xs font-medium text-[#C5A059]">
                                                    IVA CERO
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        booking.status === 'confirmed' && "bg-green-100 text-green-800",
                                        booking.status === 'pending' && "bg-yellow-100 text-yellow-800",
                                        booking.status === 'checked-in' && "bg-blue-100 text-blue-800",
                                        booking.status === 'completed' && "bg-gray-100 text-gray-800",
                                        booking.status === 'cancelled' && "bg-red-100 text-red-800"
                                    )}>
                                        {booking.status === 'confirmed' && 'Confirmado'}
                                        {booking.status === 'pending' && 'Pendiente'}
                                        {booking.status === 'checked-in' && 'Check-in'}
                                        {booking.status === 'completed' && 'Completado'}
                                        {booking.status === 'cancelled' && 'Cancelado'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#F8F7F4] border-t-2 border-gray-200">
                        <tr>
                            <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-900">
                                TOTAL
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="font-mono text-sm font-bold text-gray-900">
                                    {formatCurrency(bookings.reduce((sum, b) => sum + b.totalAmount, 0))}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="font-mono text-sm font-bold text-green-600">
                                    +{formatCurrency(bookings.reduce((sum, b) => sum + b.paidAmount, 0))}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="font-mono text-sm font-bold text-amber-600">
                                    {formatCurrency(bookings.reduce((sum, b) => sum + b.remainingAmount, 0))}
                                </span>
                            </td>
                            <td className="px-6 py-4"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Leyenda Legal + Descarga */}
            <div className="p-4 bg-[#C5A059]/5 border-t border-[#C5A059]/20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-2 flex-1">
                        <BadgeCheck className="w-4 h-4 text-[#C5A059] mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-[#C5A059]">Ley 19.253 - IVA CERO Turismo</p>
                            <p className="text-xs text-gray-700 mt-1">
                                Turistas extranjeros están exentos del IVA. Aplicar precio sin IVA al cobrar el saldo en mostrador.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            // En producción: jsPDF + QRCode para generar PDF con vouchers
                            alert('📥 Generando PDF con vouchers del día...\n\n(Función pendiente: integrará jsPDF + html2canvas para generar documento con QR codes)');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1A2B48] text-white text-sm font-medium rounded-lg hover:bg-[#142034] transition-colors whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        Descargar Vouchers PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
