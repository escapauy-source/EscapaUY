import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Calendar, User, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface Booking {
    id: string;
    created_at: string;
    booking_date: string; // Added field for service date
    voucher_code: string;
    tourist_name: string;
    partner_services?: { name: string } | { name: string }[]; // Joined (can be object or array)
    status: string;
    amount: number;    // Gross
    deposit_amount: number;
    balance_amount: number;
}

interface BookingListProps {
    partnerId: string;
}

export function BookingList({ partnerId }: BookingListProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            let query = supabase
                .from('partner_bookings')
                .select('*, partner_services(name)')
                .order('created_at', { ascending: false });

            if (partnerId) {
                query = query.eq('partner_id', partnerId);
            }

            const { data, error } = await query;

            if (error) throw error;
            console.log('[BookingList] Fetched bookings:', data);
            setBookings(data || []);
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError('No se pudieron cargar las reservas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [partnerId]);

    const handleNoShow = async (bookingId: string) => {
        const loadingToast = toast.loading('Reportando No-Show...');
        try {
            const { error } = await supabase
                .from('partner_bookings')
                .update({
                    status: 'no_show',
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success('No-Show reportado correctamente', { id: loadingToast });
            fetchBookings(); // Refresh list
        } catch (err: any) {
            console.error('[BookingList] Error reporting no-show:', err);
            toast.error('Error al reportar no-show', { id: loadingToast });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Sin reservas aún</h3>
                <p className="text-sm text-gray-500 mt-2">ID Partner: {partnerId}</p>
                <p className="text-gray-500 mt-4">Tus reservas confirmadas aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referencia</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente / Servicio</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Beneficio Fiscal</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Reserva</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Comisión (15%)</th>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-600 uppercase tracking-wider text-right">A Cobrar (85%)</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking: Booking) => {
                            // Calculate derived values
                            // Net Total = Balance / 0.85 (Since balance is 85% of Net)
                            const netTotal = booking.balance_amount / 0.85;
                            const taxSavings = booking.amount - netTotal;
                            const isExempt = taxSavings > 10; // Tolerance for floating point

                            // Robust service name extraction
                            let serviceName = 'Servicio Desconocido';
                            if (booking.partner_services) {
                                if (Array.isArray(booking.partner_services)) {
                                    serviceName = booking.partner_services[0]?.name || serviceName;
                                } else {
                                    serviceName = (booking.partner_services as any).name || serviceName;
                                }
                            } else if ((booking as any).service_name) {
                                serviceName = (booking as any).service_name;
                            } else if (booking.amount === 0) {
                                serviceName = 'Actividad Gratuita / Paseo';
                            } else {
                                serviceName = 'Estadía Hotel';
                            }

                            return (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                                            {booking.voucher_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 flex items-center gap-1">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {booking.tourist_name}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5">{serviceName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {(() => {
                                            const dateStr = booking.booking_date || booking.created_at;
                                            // Handle YYYY-MM-DD manually to avoid timezone shifts
                                            if (dateStr.includes('-') && dateStr.length === 10) {
                                                const [year, month, day] = dateStr.split('-');
                                                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                return dateObj.toLocaleDateString('es-UY', { day: '2-digit', month: 'short' });
                                            }
                                            return new Date(dateStr).toLocaleDateString('es-UY', { day: '2-digit', month: 'short' });
                                        })()}
                                    </td>

                                    {/* Financial Columns */}
                                    <td className="px-6 py-4 text-right">
                                        {isExempt ? (
                                            <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                                                -${Math.round(taxSavings).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                        ${Math.round(netTotal).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-500 text-sm">
                                        -${Math.round(booking.deposit_amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-blue-600 text-lg">
                                            ${Math.round(booking.balance_amount).toLocaleString()}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    booking.status === 'no_show' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                        )}>
                                            {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> :
                                                booking.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                                                    booking.status === 'no_show' ? <XCircle className="w-3 h-3" /> :
                                                        <Clock className="w-3 h-3" />}
                                            {booking.status === 'confirmed' ? 'Confirmada' :
                                                booking.status === 'completed' ? 'Consumido' :
                                                    booking.status === 'no_show' ? 'No-Show' :
                                                        booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleNoShow(booking.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                                title="Marcar como No-Show"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                Reportar No-Show
                                            </button>
                                        )}
                                        {booking.status === 'no_show' && (
                                            <span className="text-[10px] text-red-400 font-bold uppercase italic opacity-50">
                                                Enviado a Torre
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
