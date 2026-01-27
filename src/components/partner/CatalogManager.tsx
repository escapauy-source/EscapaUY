import { useState } from 'react';
import { Plus, Save, Eye, Trash2, Loader2, Sparkles } from 'lucide-react';
import { ImageGalleryManager } from './ImageGalleryManager';
import { ServiceCard, type PartnerService } from './ServiceCard';
import { usePartnerServices } from '@/hooks/usePartnerData';
import { toast } from 'react-hot-toast';

interface CatalogManagerProps {
    partnerId: string;
}

/**
 * Gestor Completo de Catálogo - "Mi Vidriera"
 * Permite crear y editar servicios con fotos y datos de contacto
 */
export function CatalogManager({ partnerId }: CatalogManagerProps) {
    const { services, loading, upsertService, deleteService } = usePartnerServices(partnerId);
    const [editingService, setEditingService] = useState<Partial<PartnerService> | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const handleCreateNew = () => {
        setEditingService({
            name: '',
            description: '',
            category: 'Gastronomía',
            capacity: 10,
            availableHours: ['10:00-12:00', '14:00-18:00'],
            duration: 90,
            price: 4500,
            images: [],
            contactInfo: {
                address: '',
                phone: '',
                coordinates: { lat: -34.4, lng: -57.8 },
                arrivalInstructions: '',
            },
            isActive: true,
        });
        setShowPreview(false);
    };

    const handleSave = async () => {
        if (!editingService) return;

        // Validaciones
        if (!editingService.name || !editingService.description) {
            toast.error('⚠️ Campos obligatorios: Nombre y Descripción');
            return;
        }

        if ((editingService.images?.length || 0) === 0) {
            toast.error('⚠️ Debe cargar al menos 1 foto del servicio');
            return;
        }

        try {
            setIsSaving(true);

            // Map frontend model to Supabase model
            const serviceData = {
                id: editingService.id,
                name: editingService.name,
                description: editingService.description,
                capacity: editingService.capacity,
                price: editingService.price,
                schedule: editingService.availableHours?.join(', '), // Map to schedule field
                images: editingService.images,
                contact_info: editingService.contactInfo,
                // Add any other fields from PartnerService that map to DB
            };

            const { error: saveError } = await upsertService(serviceData);

            if (saveError) throw saveError;

            toast.success('✅ Servicio guardado correctamente');
            setEditingService(null);
        } catch (err) {
            console.error('[CatalogManager] Save error:', err);
            toast.error('Error al guardar el servicio');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

        try {
            const { error } = await deleteService(id);
            if (error) throw error;
            toast.success('Servicio eliminado');
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const handleOptimizeAI = () => {
        if (!editingService?.description) {
            toast.error('Escribe algo primero para que pueda optimizarlo');
            return;
        }

        setIsOptimizing(true);
        toast.loading('Consultando a la IA de EscapaUY...', { id: 'ai-loading' });

        // Simulación de IA con los parámetros solicitados
        setTimeout(() => {
            const original = editingService.description;
            const seed = original?.toLowerCase() || '';

            let optimized = '';

            // Lógica de transformación mock basada en keywords o longitud
            if (seed.includes('vino') || seed.includes('bodega')) {
                optimized = `Descubre la esencia del Uruguay profundo en esta exclusiva experiencia boutique. Te invitamos a sumergirte en los paisajes de Carmelo, donde la elegancia y la tradición se encuentran en cada rincón. ${original}. Una vivencia acogedora y profesional diseñada para los amantes del buen vivir. No pierdas la oportunidad de vivir Colonia de una forma única: reserva ahora tu lugar y déjate seducir por el encanto de nuestra tierra.`;
            } else if (seed.includes('paseo') || seed.includes('tour')) {
                optimized = `Vive una aventura inolvidable con nuestro Turismo Boutique en Colonia. Hemos diseñado este recorrido acogedor y profesional para que descubras los secretos mejor guardados de la región. ${original}. Es el momento ideal para reconectar con lo auténtico en un entorno de elegancia incomparable. Asegura tu experiencia hoy mismo reservando a través de EscapaUY.`;
            } else {
                optimized = `Elevamos tu próxima visita a Colonia con esta propuesta de Turismo Boutique inigualable. Combinando una voz profesional y acogedora, te ofrecemos ${original} en un entorno de pura elegancia. Ya sea en Carmelo o en el corazón del departamento, esta experiencia está pensada para deleitar tus sentidos. Te invitamos cordialmente a reservar tu lugar ahora para garantizar una estadía excepcional.`;
            }

            setEditingService(prev => prev ? { ...prev, description: optimized } : null);
            setIsOptimizing(false);
            toast.dismiss('ai-loading');
            toast.success('✨ ¡Descripción optimizada con éxito!');
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-playfair text-2xl font-bold text-gray-900">Mi Vidriera</h2>
                    <p className="text-gray-600 mt-1">Gestiona tus servicios y atrae más clientes</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Servicio
                </button>
            </div>

            {/* Formulario de Edición */}
            {editingService && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 text-lg">
                            {!editingService.id ? 'Nuevo Servicio' : 'Editar Servicio'}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                {showPreview ? 'Ocultar' : 'Vista Previa'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1A2B48] text-white font-medium rounded-lg hover:bg-[#142034] transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Guardar
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Nombre y Categoría */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Servicio *
                                </label>
                                <input
                                    type="text"
                                    value={editingService.name}
                                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                    placeholder="Ej: Tour Premium de Viñedos"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={editingService.category}
                                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                                >
                                    <option>Gastronomía</option>
                                    <option>Enoturismo</option>
                                    <option>Outdoor</option>
                                    <option>Cultura</option>
                                    <option>Aventura</option>
                                </select>
                            </div>
                        </div>

                        {/* Descripción Seductora */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Descripción Seductora * (Marketing)
                                </label>
                                <button
                                    onClick={handleOptimizeAI}
                                    disabled={isOptimizing}
                                    type="button"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-ocean-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:from-ocean-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {isOptimizing ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                    Optimizar con IA EscapaUY
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                value={editingService.description}
                                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                placeholder="Describe la experiencia de forma atractiva para seducir al turista..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">
                                La IA ajustará la voz a una elegante y profesional, inyectando SEO de Colonia y Carmelo.
                            </p>
                        </div>

                        {/* Capacidad, Duración, Precio */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacidad Máxima *
                                </label>
                                <input
                                    type="number"
                                    value={editingService.capacity}
                                    onChange={(e) => setEditingService({ ...editingService, capacity: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duración (minutos) *
                                </label>
                                <input
                                    type="number"
                                    value={editingService.duration}
                                    onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio (UYU) *
                                </label>
                                <input
                                    type="number"
                                    value={editingService.price}
                                    onChange={(e) => setEditingService({ ...editingService, price: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                                />
                            </div>
                        </div>

                        {/* Datos de Contacto (Protegidos) */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-amber-900 mb-3">
                                🔒 Datos de Contacto (Solo visibles en voucher post-pago)
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-amber-900 mb-2">
                                        Dirección Exacta *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingService.contactInfo?.address || ''}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            contactInfo: { ...editingService.contactInfo!, address: e.target.value }
                                        })}
                                        placeholder="Ruta 30 Km 18, Carmelo, Colonia"
                                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-amber-900 mb-2">
                                        Teléfono de Contacto *
                                    </label>
                                    <input
                                        type="tel"
                                        value={editingService.contactInfo?.phone || ''}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            contactInfo: { ...editingService.contactInfo!, phone: e.target.value }
                                        })}
                                        placeholder="+598 XXXX XXXX"
                                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-amber-900 mb-2">
                                        Instrucciones de Llegada Personalizadas
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editingService.contactInfo?.arrivalInstructions || ''}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            contactInfo: { ...editingService.contactInfo!, arrivalInstructions: e.target.value }
                                        })}
                                        placeholder="Al llegar, estacionar en el área designada. Tocar el timbre en la entrada principal..."
                                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Gestor de Imágenes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Galería de Fotos * (Máximo 10)
                            </label>
                            <ImageGalleryManager
                                serviceId={editingService.id!}
                                existingImages={editingService.images}
                                onImagesChange={(imgs) => setEditingService({ ...editingService, images: imgs })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Vista Previa */}
            {showPreview && editingService && editingService.name && editingService.description && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Vista Previa - Cómo lo verá el turista</h3>
                    <ServiceCard
                        service={editingService as PartnerService}
                        mode="preview"
                        showModeToggle={true}
                    />
                </div>
            )}

            {/* Lista de Servicios Existentes */}
            {!editingService && (
                <>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 text-ocean-600 animate-spin mb-4" />
                            <p className="text-gray-500">Cargando tus servicios...</p>
                        </div>
                    ) : services?.length > 0 ? (
                        <div className="grid lg:grid-cols-2 gap-6">
                            {services?.map((service) => (
                                <div key={service?.id} className="relative group">
                                    <ServiceCard
                                        service={{
                                            ...service,
                                            availableHours: service?.schedule?.split(', ') || [],
                                            contactInfo: service?.contact_info || {
                                                address: '',
                                                phone: '',
                                                coordinates: { lat: -34.4, lng: -57.8 },
                                                arrivalInstructions: ''
                                            }
                                        } as PartnerService}
                                        mode="public"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingService({
                                                ...service,
                                                availableHours: service?.schedule?.split(', ') || [],
                                                contactInfo: service?.contact_info || {
                                                    address: '',
                                                    phone: '',
                                                    coordinates: { lat: -34.4, lng: -57.8 },
                                                    arrivalInstructions: ''
                                                }
                                            })}
                                            className="px-4 py-2 bg-white/95 hover:bg-white text-gray-900 font-medium rounded-lg shadow-lg transition-colors flex items-center gap-2"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service?.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 font-playfair text-xl">
                                Aún no has cargado servicios en tu vidriera
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Comienza agregando tu primera experiencia o servicio para que los turistas puedan reservarlo.
                            </p>
                            <button
                                onClick={handleCreateNew}
                                className="px-8 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Crear Primer Servicio
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
