import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, FileText, AlertCircle, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePartnerData, type Partner } from '@/hooks/usePartnerData';
import { toast } from 'react-hot-toast';
import { useApp } from '@/context/AppContext';

interface PartnerLegalConfigProps {
    partnerId: string;
    initialData?: Partial<Partner> | null;
}

/**
 * Formulario de Configuración Legal del Establecimiento
 * Cumplimiento Ley 17.250 (Defensa del Consumidor)
 */
export function PartnerLegalConfig({ partnerId, initialData }: PartnerLegalConfigProps) {
    const { upsertPartner, loading: hookLoading } = usePartnerData(partnerId);
    const { user } = useApp();
    const [config, setConfig] = useState<Partial<Partner>>(initialData || {});
    const [errors, setErrors] = useState<Partial<Record<keyof Partner, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData && typeof initialData === 'object') {
            setConfig(initialData);
        }
    }, [initialData]);

    const validateRUT = (rut: string): boolean => {
        // Formato válido: 12-345678-001-2 o similar
        const rutRegex = /^\d{2}-\d{6}-\d{3}-\d$/;
        return rutRegex.test(rut);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^\+598\s?\d{4}\s?\d{4}$/;
        return phoneRegex.test(phone);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (field: keyof Partner, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Partner, string>> = {};

        if (!config.business_name) newErrors.business_name = 'Razón social es obligatoria';

        if (!config.rut) {
            newErrors.rut = 'RUT es obligatorio';
        } else if (!validateRUT(config.rut)) {
            newErrors.rut = 'Formato inválido (ej: 12-345678-001-2)';
        }

        if (!config.mintur_registration) newErrors.mintur_registration = 'Registro MINTUR es obligatorio';
        if (!config.legal_address) newErrors.legal_address = 'Domicilio real es obligatorio';

        if (!config.contact_phone) {
            newErrors.contact_phone = 'Teléfono es obligatorio';
        } else if (!validatePhone(config.contact_phone)) {
            newErrors.contact_phone = 'Formato inválido (ej: +598 XXXX XXXX)';
        }

        if (!config.contact_email) {
            newErrors.contact_email = 'Email es obligatorio';
        } else if (!validateEmail(config.contact_email)) {
            newErrors.contact_email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                setIsSaving(true);
                // Inject required fields for new partners
                const finalConfig = {
                    ...config,
                    email: config.email || user?.email || `partner-${partnerId}@escapauy.com`,
                    name: config.name || user?.user_metadata?.full_name || 'Nuevo Partner'
                };
                const { error } = await upsertPartner(finalConfig);
                if (error) throw error;
                toast.success('Configuración guardada correctamente');
            } catch (err) {
                toast.error('Error al guardar la configuración');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const isComplete = config.business_name && config.rut && config.mintur_registration &&
        config.legal_address && config.contact_phone && config.contact_email;

    if (hookLoading && !config.id) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-ocean-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">Configuración Legal del Establecimiento</h2>
                        <p className="text-sm text-gray-500 mt-1">Ley 17.250 - Defensa del Consumidor</p>
                    </div>
                    {isComplete && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Completado</span>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Razón Social */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="w-4 h-4" />
                        Razón Social *
                    </label>
                    <input
                        type="text"
                        value={config?.business_name || ''}
                        onChange={(e) => handleChange('business_name', e.target.value)}
                        placeholder="Ej: Bodega Demo S.A."
                        className={cn(
                            "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors",
                            errors.business_name ? "border-red-300" : "border-gray-300"
                        )}
                    />
                    {errors.business_name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.business_name}
                        </p>
                    )}
                </div>

                {/* RUT */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        RUT *
                    </label>
                    <input
                        type="text"
                        value={config?.rut || ''}
                        onChange={(e) => handleChange('rut', e.target.value)}
                        placeholder="12-345678-001-2"
                        className={cn(
                            "w-full px-4 py-3 border rounded-xl font-mono focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors",
                            errors.rut ? "border-red-300" : "border-gray-300"
                        )}
                    />
                    {errors.rut && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.rut}
                        </p>
                    )}
                </div>

                {/* Registro MINTUR */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        N° Registro MINTUR *
                    </label>
                    <input
                        type="text"
                        value={config?.mintur_registration || ''}
                        onChange={(e) => handleChange('mintur_registration', e.target.value)}
                        placeholder="MINTUR-2024-XXXX"
                        className={cn(
                            "w-full px-4 py-3 border rounded-xl font-mono focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors",
                            errors.mintur_registration ? "border-red-300" : "border-gray-300"
                        )}
                    />
                    {errors.mintur_registration && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.mintur_registration}
                        </p>
                    )}
                </div>

                {/* Domicilio Real Split: Address, City, Department */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            Dirección (Calle y Número) *
                        </label>
                        <input
                            type="text"
                            value={config?.legal_address || ''}
                            onChange={(e) => handleChange('legal_address', e.target.value)}
                            placeholder="Calle Principal 1234"
                            className={cn(
                                "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors",
                                errors.legal_address ? "border-red-300" : "border-gray-300"
                            )}
                        />
                        {errors.legal_address && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.legal_address}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Localidad / Ciudad *
                        </label>
                        <input
                            type="text"
                            value={config?.location?.split(',')[0] || ''}
                            onChange={(e) => {
                                const dept = config?.location?.split(',')[1]?.trim() || '';
                                handleChange('location', `${e.target.value}, ${dept}`);
                            }}
                            placeholder="Ej: Carmelo"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Fundamental para la IA de sugerencias</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departamento *
                        </label>
                        <select
                            value={config?.location?.split(',')[1]?.trim() || ''}
                            onChange={(e) => {
                                const city = config?.location?.split(',')[0]?.trim() || '';
                                handleChange('location', `${city}, ${e.target.value}`);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Colonia">Colonia</option>
                            <option value="Montevideo">Montevideo</option>
                            <option value="Maldonado">Maldonado</option>
                            <option value="Rocha">Rocha</option>
                            <option value="Canelones">Canelones</option>
                            <option value="San José">San José</option>
                            <option value="Soriano">Soriano</option>
                        </select>
                    </div>
                </div>

                {/* Teléfono */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        Teléfono de Contacto *
                    </label>
                    <input
                        type="tel"
                        value={config?.contact_phone || ''}
                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                        placeholder="+598 XXXX XXXX"
                        className={cn(
                            "w-full px-4 py-3 border rounded-xl font-mono focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors",
                            errors.contact_phone ? "border-red-300" : "border-gray-300"
                        )}
                    />
                    {errors.contact_phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.contact_phone}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        Email de Contacto *
                    </label>
                    <input
                        type="email"
                        value={config?.contact_email || ''}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                        placeholder="contacto@tuestablecimiento.com.uy"
                        className={cn(
                            "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors",
                            errors.contact_email ? "border-red-300" : "border-gray-300"
                        )}
                    />
                    {errors.contact_email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.contact_email}
                        </p>
                    )}
                </div>

                {/* Legal Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-blue-900">Cumplimiento Normativo</p>
                            <p className="text-xs text-blue-700 mt-1">
                                Estos datos son requeridos por la Ley 17.250 de Defensa del Consumidor y deben estar visibles en tu establecimiento y documentación comercial.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setConfig(initialData || {})}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1A2B48] text-white font-medium rounded-xl hover:bg-[#142034] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
}
