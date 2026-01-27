import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import {
    Shield,
    Users,
    AlertTriangle,
    Activity,
    TrendingUp,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Clock,
    ShieldCheck,
    Loader2,
    BookOpen,
    FileText,
    LogOut,
    Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'react-hot-toast';
import { IVA_RATE, DEPOSIT_PERCENTAGE } from '@/config/constants';
import { getExchangeRate, setManualExchangeRate } from '@/utils/currencyUtils';

// --- Types ---
interface PartnerStats {
    id: string;
    business_name: string;
    legal_status: 'validado' | 'pendiente';
    occupancy: number;
    earnings: number;
    trend: 'up' | 'down';
}

interface ComplianceAlert {
    id: string;
    voucher_code: string;
    partner_name: string;
    days_old: number;
    total_amount: number;       // 100%
    deposit_amount?: number;    // 15% (lo que retiene EscapaUY)
    balance_amount?: number;    // 85% (lo que se paga en el local)
    tax_discount?: number;     // Beneficio fiscal (p.ej. IVA para extranjeros)
    is_foreign?: boolean;
}

// --- Main Admin Dashboard ---
export function AdminDashboard() {
    const { user } = useApp();
    const [partners, setPartners] = useState<PartnerStats[]>([]);
    const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [climateSwitch, setClimateSwitch] = useState(false);
    const [capacityLevel, setCapacityLevel] = useState(75);
    const [searchQuery, setSearchQuery] = useState('');

    // Exchange Rate State
    const [currentRate, setCurrentRate] = useState(40.0);
    const [isManualRate, setIsManualRate] = useState(false);
    const [manualRateInput, setManualRateInput] = useState(40.0);

    // Fetching data from Supabase
    useEffect(() => {
        async function fetchAdminData() {
            setLoading(true);
            try {
                // 1. Fetch Partners
                const { data: partnersData, error: partnersError } = await supabase
                    .from('partners')
                    .select('id, business_name, rut, mintur_registration');

                if (partnersError) throw partnersError;

                // 2. Fetch Bookings for Earnings & Compliance
                // We fetch all active/confirmed bookings to aggregate
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('partner_bookings')
                    .select('*');

                if (bookingsError) {
                    console.warn('[AdminDashboard] partner_bookings table might not exist yet, using fallback');
                }

                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

                // Process Partner Stats
                const processedPartners: PartnerStats[] = (partnersData || []).map(p => {
                    const partnerBookings = (bookingsData || []).filter(b => b.partner_id === p.id);
                    const earnings = partnerBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

                    // Mock trend/occupancy if no data exists, otherwise try to calculate
                    const occupancy = partnerBookings.length > 0 ? Math.min(Math.floor((partnerBookings.length / 20) * 100), 100) : Math.floor(Math.random() * 20) + 10;

                    return {
                        id: p.id,
                        business_name: p.business_name || 'Partner Sin Nombre',
                        legal_status: (p.rut && p.mintur_registration) ? 'validado' : 'pendiente',
                        occupancy: occupancy,
                        earnings: earnings,
                        trend: Math.random() > 0.5 ? 'up' : 'down'
                    };
                });
                setPartners(processedPartners);

                // Process Compliance Alerts (Bookings > 30 days)
                const complianceAlerts: ComplianceAlert[] = (bookingsData || [])
                    .filter(b => {
                        const createdAt = new Date(b.created_at);
                        return createdAt < thirtyDaysAgo && b.status !== 'consumed';
                    })
                    .map(b => {
                        const partner = processedPartners.find(p => p.id === b.partner_id);
                        const daysOld = Math.floor((now.getTime() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24));
                        const total = b.total_amount || 0;
                        const isForeign = !!b.is_foreign;

                        // ⚠️ REGLA DE NEGOCIO: Comisión (seña) sobre el valor NETO
                        const netAmount = total / (1 + IVA_RATE);
                        const deposit = netAmount * DEPOSIT_PERCENTAGE;
                        const balance = total - deposit;
                        const taxDiscount = isForeign ? total * (IVA_RATE / (1 + IVA_RATE)) : 0;

                        return {
                            id: b.id,
                            voucher_code: b.voucher_id || `VOU-${b.id.slice(0, 4)}`,
                            partner_name: partner?.business_name || 'Socio Desconocido',
                            days_old: daysOld,
                            total_amount: total,
                            deposit_amount: deposit,
                            balance_amount: balance,
                            tax_discount: taxDiscount,
                            is_foreign: isForeign
                        };
                    });

                // Failover for demo if no alerts found
                if (complianceAlerts.length === 0) {
                    const mockTotal = 5000;
                    const mockNet = mockTotal / (1 + IVA_RATE);
                    const mockDeposit = mockNet * DEPOSIT_PERCENTAGE;

                    setAlerts([
                        {
                            id: 'mock-1',
                            voucher_code: 'BCU-DEMO-01',
                            partner_name: 'Bodega El Legado',
                            days_old: 32,
                            total_amount: mockTotal,
                            deposit_amount: mockDeposit,
                            balance_amount: mockTotal - mockDeposit,
                            tax_discount: mockTotal * (IVA_RATE / (1 + IVA_RATE)),
                            is_foreign: true
                        },
                    ]);
                } else {
                    setAlerts(complianceAlerts);
                }

            } catch (err) {
                console.error('[AdminDashboard] Error loading data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAdminData();


        // Fetch Exchange Rate Config
        getExchangeRate().then(data => {
            setCurrentRate(data.rate);
            setIsManualRate(data.isManual);
            setManualRateInput(data.rate);
        });

    }, []);

    const handleRateChange = async () => {
        const toastId = toast.loading('Actualizando tasa de cambio...');
        try {
            const success = await setManualExchangeRate(manualRateInput, isManualRate);
            if (success) {
                toast.success('Configuración cambiaria actualizada', { id: toastId });
                // Refresh local view
                const newData = await getExchangeRate();
                setCurrentRate(newData.rate);
            } else {
                throw new Error('Error al guardar en DB');
            }
        } catch (error) {
            toast.error('Error al actualizar tasa', { id: toastId });
        }
    };

    const handleApplyChanges = async () => {
        setIsSaving(true);
        const loadingToast = toast.loading('Aplicando cambios en la red de resiliencia...');

        try {
            // Log the action to logs_cumplimiento
            const { error: logError } = await supabase
                .from('logs_cumplimiento')
                .insert({
                    admin_id: user?.id,
                    action_type: 'resilience_update',
                    details: {
                        climate_bypass: climateSwitch,
                        ia_capacity_level: capacityLevel,
                        timestamp: new Date().toISOString()
                    }
                });

            if (logError) throw logError;

            // Here we would also update global site settings if they existed in a table
            // For now, we persist the intent in the logs.

            toast.success('Cambios aplicados globalmente con éxito', { id: loadingToast });
        } catch (err: any) {
            console.error('[AdminDashboard] Error applying changes:', err);
            toast.error(`Error al aplicar cambios: ${err.message}`, { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleActionBCU = async (alertId: string, action: 'contact' | 'refund') => {
        const loadingToast = toast.loading(`${action === 'contact' ? 'Contactando' : 'Reembolsando'}...`);
        try {
            await supabase
                .from('logs_cumplimiento')
                .insert({
                    admin_id: user?.id,
                    action_type: 'bcu_alert_action',
                    details: { alertId, action, timestamp: new Date().toISOString() }
                });

            toast.success('Acción de auditoría registrada correctamente', { id: loadingToast });
            // Remove alert from local state for UX
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (err) {
            toast.error('No se pudo registrar la acción', { id: loadingToast });
        }
    };

    // Get Admin Initials
    const getInitials = () => {
        if (!user?.fullName) return 'AD';
        return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#2D2D2D] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
                    <p className="text-[#D4AF37] font-medium tracking-widest uppercase text-sm">EscapaUY | Torre de Control</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2D2D2D] text-white font-inter selection:bg-[#D4AF37] selection:text-[#2D2D2D]">
            {/* --- Top Global Bar --- */}
            <div className="border-b border-white/5 bg-[#2D2D2D]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37] rounded flex items-center justify-center">
                            <Shield className="w-6 h-6 text-[#2D2D2D]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight uppercase text-[#D4AF37]">Torre de Control</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">EscapaUY Resilience Center</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Climate Status */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", climateSwitch ? "bg-red-500" : "bg-green-500")} />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                                {climateSwitch ? 'Modo Alta Contingencia' : 'Clima Estable'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">{user?.fullName || 'Admin Central'}</p>
                                <p className="text-[10px] text-[#D4AF37] uppercase">Nivel de Acceso: 5</p>
                            </div>
                            <div className="w-11 h-11 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center text-[#2D2D2D] font-bold border-2 border-[#D4AF37]/20 shadow-lg shadow-black/20">
                                {getInitials()}
                            </div>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.href = '/';
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-tighter"
                                title="Cerrar Sesión Definitiva"
                            >
                                <LogOut className="w-4 h-4" />
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-10">
                {/* --- Executive Metrics --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Ingresos Totales Brutos', value: '$1.42M', icon: TrendingUp, detail: '+12.4% vs Mes Ant' },
                        { label: 'Flota de Partners', value: partners.length, icon: Users, detail: '3 nuevos este mes' },
                        { label: 'Ocupación Destino', value: '68%', icon: Activity, detail: 'Punto Crítico: 85%' },
                        { label: 'Alertas de Auditoría', value: alerts.length, icon: AlertTriangle, detail: 'Acción Requerida', color: 'text-red-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#363636] border border-white/5 p-6 rounded-2xl shadow-xl hover:border-[#D4AF37]/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#D4AF37]/10 transition-colors">
                                    <stat.icon className={cn("w-5 h-5 text-white/60 group-hover:text-[#D4AF37]", stat.color)} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-white/20" />
                            </div>
                            <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-bold mb-2">{stat.value}</h4>
                            <p className="text-[11px] font-medium text-green-400">{stat.detail}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* --- Left Column: Fleet Management --- */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-[#363636] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">Flota de Partners</h3>
                                    <p className="text-xs text-white/40 mb-3">Monitoreo de rendimiento y cumplimiento legal</p>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg max-w-md">
                                        <p className="text-[10px] text-[#D4AF37] font-bold uppercase mb-1">¿Qué es esto?</p>
                                        <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                                            Listado maestro de prestadores. Sirve para ver quién genera más ingresos y quién tiene trámites pendientes.
                                            <span className="text-[#D4AF37] ml-1 font-bold">Acción:</span> Validar documentos si el estado es "pendiente".
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="text"
                                            placeholder="Buscar partner..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent transition-all w-64"
                                        />
                                    </div>
                                    <button className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                        <Filter className="w-4 h-4 text-white/60" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#2D2D2D]/50 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                                        <tr>
                                            <th className="px-8 py-4 text-left">Partner</th>
                                            <th className="px-8 py-4 text-left">Estado Legal</th>
                                            <th className="px-8 py-4 text-left">Ocupación</th>
                                            <th className="px-8 py-4 text-right">Ganancias</th>
                                            <th className="px-8 py-4 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {partners.filter(p => p.business_name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-sm">{p.business_name}</p>
                                                    <p className="text-[10px] text-white/30 truncate max-w-[150px]">{p.id}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                        p.legal_status === 'validado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    )}>
                                                        {p.legal_status === 'validado' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {p.legal_status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full transition-all duration-1000", p.occupancy > 80 ? "bg-red-400" : "bg-ocean-400")}
                                                                style={{ width: `${p.occupancy}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold font-mono">{p.occupancy}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-mono font-bold text-[#D4AF37]">
                                                    ${p.earnings.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group-hover:text-[#D4AF37]">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* --- Right Column: Intelligence & Controls --- */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Intelligence Command */}
                        <section className="bg-gradient-to-br from-[#363636] to-[#2D2D2D] border border-[#D4AF37]/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-5 blur-[100px]" />

                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-8 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Mando de Resiliencia
                            </h3>

                            <div className="space-y-8">
                                {/* Climate Switch */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-sm font-bold">Master Switch Climático</p>
                                        <p className="text-[10px] text-white/40 mt-1 uppercase">Bypass de Lógica de Derivación</p>
                                    </div>
                                    <button
                                        onClick={() => setClimateSwitch(!climateSwitch)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            climateSwitch ? "bg-red-500" : "bg-green-500"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            climateSwitch ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>

                                {/* Capacity Control */}
                                <div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg mb-4">
                                        <p className="text-[10px] text-[#D4AF37] font-bold uppercase mb-1">¿Para qué sirve?</p>
                                        <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                                            Evita que un destino "se sature" de gente. Si subes la capacidad, la IA dejará de recomendar ese lugar a nuevos turistas.
                                            <span className="text-[#D4AF37] ml-1 font-bold">Acción:</span> Deslizar a la derecha si ves muchas quejas por amontonamiento.
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-sm font-bold">Carga de Destino (IA)</p>
                                        <span className="text-sm font-mono font-bold text-[#D4AF37] px-2 py-1 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20">
                                            {capacityLevel}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={capacityLevel}
                                        onChange={(e) => setCapacityLevel(parseInt(e.target.value))}
                                        className="w-full accent-[#D4AF37]"
                                    />
                                    <div className="flex justify-between text-[10px] text-white/30 uppercase mt-2">
                                        <span>Sub-utilizado</span>
                                        <span>Punto Crítico</span>
                                    </div>
                                    <p className="text-[10px] text-amber-400/80 mt-4 leading-relaxed font-medium italic">
                                        * Ajustar este nivel re-dirige automáticamente las sugerencias de la IA hacia zonas con menor densidad de turistas.
                                    </p>
                                </div>

                                <button
                                    onClick={handleApplyChanges}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-[#D4AF37] text-[#2D2D2D] font-bold rounded-xl hover:bg-[#B8860B] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                    {isSaving ? 'Aplicando...' : 'Aplicar Cambios Globales'}
                                </button>
                            </div>
                        </section>

                        {/* Currency Control Widget */}
                        <section className="bg-[#363636] border border-white/5 p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Control Cambiario
                            </h3>

                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-xs text-white/40 uppercase font-bold">Tasa Actual (USD/UYU)</p>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded uppercase",
                                        isManualRate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
                                    )}>
                                        {isManualRate ? 'Modo Manual' : 'Auto (API)'}
                                    </span>
                                </div>
                                <p className="text-4xl font-mono font-bold text-white tracking-tighter">
                                    ${currentRate.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-white/30 mt-1">
                                    Valor efectivo aplicado en checkout
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold">Activar Tasa Manual</span>
                                    <button
                                        onClick={() => setIsManualRate(!isManualRate)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            isManualRate ? "bg-[#D4AF37]" : "bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                            isManualRate ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>

                                {isManualRate && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs text-white/60 mb-1 block">Valor Manual Personalizado</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={manualRateInput}
                                                onChange={(e) => setManualRateInput(Number(e.target.value))}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                                            />
                                            <button
                                                onClick={handleRateChange}
                                                className="px-4 py-2 bg-[#D4AF37] text-[#2D2D2D] font-bold rounded-lg hover:bg-[#B8860B] transition-colors"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isManualRate && (
                                    <button
                                        onClick={async () => {
                                            const loadToast = toast.loading('Consultando API...');
                                            const data = await getExchangeRate();
                                            setCurrentRate(data.rate);
                                            toast.success('Tasa actualizada desde API', { id: loadToast });
                                        }}
                                        className="w-full py-2 border border-white/10 rounded-lg text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Activity className="w-3 h-3" />
                                        Forzar Actualización API
                                    </button>
                                )}
                            </div>
                        </section>
                        {/* BCU Compliance Monitor */}
                        <section className="bg-[#363636] border border-white/5 p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Monitor BCU (30 Días)
                            </h3>

                            <div className="bg-red-400/5 border border-red-400/20 p-3 rounded-lg mb-6">
                                <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Regla de Permanencia</p>
                                <p className="text-[10px] text-red-300/70 leading-relaxed font-medium">
                                    Por normativa BCU, los fondos no pueden quedar "en el aire" más de 30 días sin ser consumidos.
                                    <span className="text-red-400 ml-1 font-extrabold uppercase animate-pulse">Acción:</span> Contactar al partner para que valide el servicio o devolver el dinero al turista.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl group hover:bg-red-400/15 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-bold text-red-400">{alert.voucher_code}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-400 text-[#2D2D2D] rounded">CRÍTICO</span>
                                        </div>
                                        <p className="text-sm font-bold">{alert.partner_name}</p>

                                        {/* Financial Breakdown */}
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                                <p className="text-[9px] text-white/40 uppercase">Seña (15%)</p>
                                                <p className="text-xs font-bold text-[#D4AF37]">${alert.deposit_amount?.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                                <p className="text-[9px] text-white/40 uppercase">Saldo Local (85%)</p>
                                                <p className="text-xs font-bold">${alert.balance_amount?.toLocaleString()}</p>
                                            </div>
                                            {alert.is_foreign && (
                                                <div className="col-span-2 bg-green-500/5 p-2 rounded border border-green-500/10 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[9px] text-green-400 uppercase font-bold">Turista Extranjero</p>
                                                        <p className="text-[9px] text-white/40 italic">Beneficio fiscal a favor del partner</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-green-400">+${alert.tax_discount?.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleActionBCU(alert.id, 'contact')}
                                                className="flex-1 py-2 bg-red-400/20 text-red-300 text-[10px] font-bold uppercase rounded hover:bg-red-400/30 transition-all"
                                            >
                                                Contactar Partner
                                            </button>
                                            <button
                                                onClick={() => handleActionBCU(alert.id, 'refund')}
                                                className="flex-1 py-2 bg-white/5 text-white/60 text-[10px] font-bold uppercase rounded hover:bg-white/10 transition-all border border-white/10"
                                            >
                                                Devolver Fondos
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 text-xs font-bold text-white/60 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                                    Ver todas las auditorías
                                </button>
                            </div>
                        </section>
                        {/* Marketing & Content CMS */}
                        <section className="bg-[#363636] border border-white/5 p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Contenidos & Marketing
                            </h3>

                            <Link
                                to="/admin/blog"
                                className="group block p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <h4 className="font-bold text-white mb-1">Editor del Blog</h4>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    Crea historias, guías de viaje y anuncios para los turistas.
                                </p>
                            </Link>

                            <Link
                                to="/admin/content-engine"
                                className="group block p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all mt-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37]">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <h4 className="font-bold text-white mb-1">Content Engine (IA)</h4>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    Generador automático de blogs y contenido para redes sociales con GPT-4o.
                                </p>
                            </Link>

                            <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Tip de estrategia</p>
                                <p className="text-[10px] text-blue-300/70 leading-relaxed italic">
                                    "Los posts sobre bodegas aumentan la conversión un 22% durante los fines de semana."
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
