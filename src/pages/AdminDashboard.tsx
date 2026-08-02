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
    service_name?: string;
    booking_date?: string;
    status?: string;           // 'pending', 'confirmed', 'completed', 'no_show'
}

interface PartnerStats {
    id: string;
    business_name: string;
    legal_status: 'validado' | 'pendiente';
    occupancy: number;
    earnings: number;
    trend: 'up' | 'down';
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
    const [bcuTab, setBcuTab] = useState<'pending' | 'validated'>('pending');

    // Exchange Rate State
    const [currentRate, setCurrentRate] = useState(40.0);
    const [isManualRate, setIsManualRate] = useState(false);
    const [manualRateInput, setManualRateInput] = useState(40.0);

    // Fetching data from Supabase
    useEffect(() => {
        async function fetchAdminData() {
            setLoading(true);
            try {
                const { data: partnersData, error: partnersError } = await supabase
                    .from('partners')
                    .select('id, business_name, rut, mintur_registration');

                if (partnersError) throw partnersError;

                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('partner_bookings')
                    .select('*, partner_services(name)');

                if (bookingsError) {
                    console.warn('[AdminDashboard] partner_bookings table might not exist yet');
                }

                const now = new Date();
                const processedPartners: PartnerStats[] = (partnersData || []).map((p: any) => {
                    const partnerBookings = (bookingsData || []).filter((b: any) => b.partner_id === p.id);
                    const earnings = partnerBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
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

                const complianceAlerts: ComplianceAlert[] = (bookingsData || []).map((b: any) => {
                    const partner = processedPartners.find(p => p.id === b.partner_id);
                    const daysOld = Math.floor((now.getTime() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24));

                    const total = b.amount || 0;
                    const balance = b.balance_amount || 0;
                    const deposit = b.deposit_amount || 0;

                    const netTotal = balance / 0.85;
                    const taxSavings = total - netTotal;
                    const isForeign = taxSavings > 10;

                    return {
                        id: b.id,
                        voucher_code: b.voucher_code || `VOU-${b.id?.slice(0, 4)}`,
                        partner_name: partner?.business_name || 'Socio Desconocido',
                        days_old: daysOld,
                        total_amount: total,
                        deposit_amount: deposit,
                        balance_amount: balance,
                        tax_discount: isForeign ? taxSavings : 0,
                        is_foreign: isForeign,
                        service_name: (Array.isArray(b.partner_services) ? b.partner_services[0]?.name : (b.partner_services as any)?.name) || 'Servicio General',
                        booking_date: b.booking_date || b.created_at,
                        status: b.status || 'confirmed'
                    };
                });

                if (complianceAlerts.length === 0) {
                    setAlerts([
                        {
                            id: 'mock-1',
                            voucher_code: 'BCU-DEMO-01',
                            partner_name: 'Parador Mar Dulce',
                            days_old: 32,
                            total_amount: 5000,
                            deposit_amount: 750,
                            balance_amount: 4250,
                            tax_discount: 900,
                            is_foreign: true,
                            service_name: 'Servicio Demo',
                            booking_date: new Date().toISOString(),
                            status: 'confirmed'
                        },
                        {
                            id: 'mock-2',
                            voucher_code: 'BCU-DEMO-02',
                            partner_name: 'Vinos del Este',
                            days_old: 5,
                            total_amount: 3000,
                            deposit_amount: 450,
                            balance_amount: 2550,
                            tax_discount: 0,
                            is_foreign: false,
                            service_name: 'Degustación Premium',
                            booking_date: new Date().toISOString(),
                            status: 'completed'
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
                const newData = await getExchangeRate();
                setCurrentRate(newData.rate);
            }
        } catch (error) {
            toast.error('Error al actualizar tasa', { id: toastId });
        }
    };

    const handleApplyChanges = async () => {
        setIsSaving(true);
        const loadingToast = toast.loading('Aplicando cambios...');
        try {
            await supabase.from('logs_cumplimiento').insert({
                admin_id: user?.id,
                action_type: 'resilience_update',
                details: { climate_bypass: climateSwitch, ia_capacity_level: capacityLevel, timestamp: new Date().toISOString() }
            });
            toast.success('Cambios aplicados globalmente', { id: loadingToast });
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleActionBCU = async (alertId: string, action: 'contact' | 'refund') => {
        const loadingToast = toast.loading(`${action === 'contact' ? 'Contactando' : 'Reembolsando'}...`);
        try {
            await supabase.from('logs_cumplimiento').insert({
                admin_id: user?.id,
                action_type: 'bcu_alert_action',
                details: { alertId, action, timestamp: new Date().toISOString() }
            });
            toast.success('Acción registrada', { id: loadingToast });
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (err) {
            toast.error('Error al registrar acción', { id: loadingToast });
        }
    };

    const getInitials = () => {
        const name = user?.user_metadata?.full_name;
        if (!name) return 'AD';
        return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#2D2D2D] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2D2D2D] text-white font-inter">
            <div className="border-b border-white/5 bg-[#2D2D2D]/80 backdrop-blur-xl sticky top-0 z-50 h-20 flex items-center justify-between px-6">
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
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", climateSwitch ? "bg-red-500" : "bg-green-500")} />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                            {climateSwitch ? 'Modo Alta Contingencia' : 'Clima Estable'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className="text-sm font-bold">{user?.user_metadata?.full_name || 'Admin Central'}</p>
                            <p className="text-[10px] text-[#D4AF37] uppercase">Acceso Nivel 5</p>
                        </div>
                        <div className="w-11 h-11 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#2D2D2D] font-bold">
                            {getInitials()}
                        </div>
                        <button onClick={() => supabase.auth.signOut()} className="text-red-500 hover:text-red-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Ingresos Totales Brutos', value: '$1.42M', icon: TrendingUp, detail: '+12.4%' },
                        { label: 'Flota de Partners', value: partners.length, icon: Users, detail: '3 nuevos' },
                        { label: 'Ocupación Destino', value: '68%', icon: Activity, detail: '85% Crítico' },
                        { label: 'Alertas de Auditoría', value: alerts.filter(a => a.status === 'no_show' || (a.status === 'confirmed' && a.days_old > 30)).length, icon: AlertTriangle, detail: 'Acción Requerida', color: 'text-red-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#363636] border border-white/5 p-6 rounded-2xl shadow-xl">
                            <stat.icon className={cn("w-5 h-5 mb-4", stat.color || "text-[#D4AF37]")} />
                            <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-bold mb-2">{stat.value}</h4>
                            <p className="text-[11px] font-medium text-green-400">{stat.detail}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Partners Table */}
                        <section className="bg-[#363636] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Flota de Partners</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Buscar partner..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs w-64 focus:ring-1 focus:ring-[#D4AF37]"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#2D2D2D]/50 text-[10px] uppercase text-white/40 font-bold">
                                        <tr>
                                            <th className="px-8 py-4 text-left">Partner</th>
                                            <th className="px-8 py-4 text-left">Estado</th>
                                            <th className="px-8 py-4 text-left">Ocupación</th>
                                            <th className="px-8 py-4 text-right">Ganancias</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {partners.filter(p => p.business_name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-sm">{p.business_name}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                                        p.legal_status === 'validado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    )}>
                                                        {p.legal_status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#D4AF37]" style={{ width: `${p.occupancy}%` }} />
                                                        </div>
                                                        <span className="font-bold text-xs">{p.occupancy}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-mono font-bold text-[#D4AF37]">
                                                    ${p.earnings.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* BCU Compliance Monitor */}
                        <section className="bg-[#363636] border border-white/5 p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-red-400 mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Monitor BCU (30 Días)
                            </h3>

                            <div className="bg-red-400/5 border border-red-400/20 p-4 rounded-xl mb-6">
                                <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Regla de Permanencia</p>
                                <p className="text-[10px] text-red-300/70 leading-relaxed">
                                    Por normativa BCU, los fondos no pueden quedar "en el aire" más de 30 días. La devolución aplica <span className="underline">ÚNICAMENTE</span> a la seña del 15% cobrada por la plataforma.
                                </p>
                            </div>

                            <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setBcuTab('pending')}
                                    className={cn(
                                        "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                                        bcuTab === 'pending' ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/40 hover:text-white/60"
                                    )}
                                >
                                    Pendientes ({alerts.filter(a => a.status === 'no_show' || (a.status === 'confirmed' && a.days_old > 30)).length})
                                </button>
                                <button
                                    onClick={() => setBcuTab('validated')}
                                    className={cn(
                                        "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                                        bcuTab === 'validated' ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-white/40 hover:text-white/60"
                                    )}
                                >
                                    Validados ({alerts.filter(a => a.status === 'completed').length})
                                </button>
                            </div>

                            <div className="space-y-4">
                                {alerts
                                    .filter(alert => {
                                        if (bcuTab === 'validated') return alert.status === 'completed';
                                        return alert.status === 'no_show' || (alert.status === 'confirmed' && alert.days_old > 30);
                                    })
                                    .map((alert) => {
                                        const isValidated = alert.status === 'completed';
                                        const isNoShow = alert.status === 'no_show';
                                        return (
                                            <div key={alert.id} className={cn(
                                                "p-4 border rounded-xl transition-all",
                                                isValidated ? "bg-green-500/5 border-green-500/10" : "bg-red-400/10 border-red-400/20"
                                            )}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-white/50">{alert.voucher_code}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded",
                                                        isValidated ? "bg-green-500/20 text-green-400" : isNoShow ? "bg-red-600 text-white" : "bg-red-400 text-[#2D2D2D]"
                                                    )}>
                                                        {isValidated ? 'VALIDADO' : isNoShow ? 'NO-SHOW' : 'EXPIRADO'}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold">{alert.partner_name}</p>
                                                <p className="text-xs text-white/60 mb-3">{alert.service_name}</p>

                                                <div className="grid grid-cols-2 gap-2 text-center mt-4 border-t border-white/5 pt-4">
                                                    <div>
                                                        <p className="text-[9px] text-white/40 uppercase">Seña (15%)</p>
                                                        <p className="text-xs font-bold text-[#D4AF37]">${alert.deposit_amount?.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-white/40 uppercase">Saldo (85%)</p>
                                                        <p className="text-xs font-bold">${alert.balance_amount?.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                {!isValidated && (
                                                    <div className="flex gap-2 mt-4">
                                                        <button
                                                            onClick={() => handleActionBCU(alert.id, 'contact')}
                                                            className="flex-1 py-2 bg-white/5 text-white/70 text-[10px] font-bold uppercase rounded border border-white/10 hover:bg-white/10 transition-all"
                                                        >
                                                            Contactar
                                                        </button>
                                                        <button
                                                            onClick={() => handleActionBCU(alert.id, 'refund')}
                                                            className="flex-1 py-2 bg-[#D4AF37] text-[#2D2D2D] text-[10px] font-bold uppercase rounded hover:bg-[#B8860B] transition-all"
                                                        >
                                                            Devolver Seña
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Mando de Resiliencia Card */}
                        <section className="bg-[#363636] border border-[#D4AF37]/20 p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-8 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Mando de Resiliencia
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <span className="text-sm font-bold">Climate Bypass</span>
                                    <button
                                        onClick={() => setClimateSwitch(!climateSwitch)}
                                        className={cn("w-10 h-5 rounded-full relative transition-all", climateSwitch ? "bg-red-500" : "bg-white/10")}
                                    >
                                        <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", climateSwitch ? "right-1" : "left-1")} />
                                    </button>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-bold">Carga de Destino</span>
                                        <span className="text-[#D4AF37] font-bold">{capacityLevel}%</span>
                                    </div>
                                    <input type="range" value={capacityLevel} onChange={(e) => setCapacityLevel(parseInt(e.target.value))} className="w-full accent-[#D4AF37]" />
                                </div>
                                <button onClick={handleApplyChanges} className="w-full py-4 bg-[#D4AF37] text-[#2D2D2D] font-bold rounded-xl hover:bg-[#B8860B] transition-all">
                                    Aplicar Globalmente
                                </button>
                            </div>
                        </section>

                        {/* Currency Card */}
                        <section className="bg-[#363636] border border-white/5 p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Tipo de Cambio</h3>
                            <div className="text-center mb-6">
                                <p className="text-4xl font-bold font-mono text-white tracking-tighter">${currentRate.toFixed(2)}</p>
                                <p className="text-[10px] text-white/30 uppercase mt-1">USD/UYU</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span>Tasa Manual</span>
                                    <button onClick={() => setIsManualRate(!isManualRate)} className={cn("w-8 h-4 rounded-full relative transition-all", isManualRate ? "bg-[#D4AF37]" : "bg-white/10")}>
                                        <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", isManualRate ? "right-0.5" : "left-0.5")} />
                                    </button>
                                </div>
                                {isManualRate && (
                                    <input type="number" value={manualRateInput} onChange={(e) => setManualRateInput(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center font-mono text-sm" />
                                )}
                                <button onClick={handleRateChange} className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase hover:bg-white/10 transition-all">
                                    Actualizar Tasa
                                </button>
                            </div>
                        </section>

                        {/* Content CMS */}
                        <section className="bg-[#363636] border border-white/5 p-8 rounded-2xl shadow-2xl space-y-4">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">CMS & Marketing</h3>
                            <Link to="/admin/blog" className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#D4AF37]/50 transition-all">
                                <p className="font-bold text-sm">Editor del Blog</p>
                                <p className="text-[10px] text-white/40">Gestionar historias y guías</p>
                            </Link>
                            <Link to="/admin/content-engine" className="block p-4 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                                <p className="font-bold text-sm text-[#D4AF37]">Content Engine (IA)</p>
                                <p className="text-[10px] text-white/40">Generación automática GPT-4</p>
                            </Link>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
