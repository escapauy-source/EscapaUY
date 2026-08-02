import { useState } from 'react';
import { Plus, Save, Eye, Trash2, Loader2, Sparkles } from 'lucide-react';
import { ImageGalleryManager } from './ImageGalleryManager';
import { ServiceCard, type PartnerService } from './ServiceCard';
import { AvailabilityScheduler } from './AvailabilityScheduler'; // New import
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
            name_en: '',
            description: '',
            description_en: '',
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
                name_en: editingService.name_en, // New Field
                description: editingService.description,
                description_en: editingService.description_en, // New Field
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

        const original = editingService.description;

        setIsOptimizing(true);
        toast.loading('Consultando a la IA de EscapaUY...', { id: 'ai-loading' });

        // Simulación de IA Avanzada (Context Aware Generation)
        setTimeout(() => {
            const lowerDesc = original.toLowerCase();

            // 1. Detect Intent and Tone
            const isWine = lowerDesc.includes('vino') || lowerDesc.includes('bodega') || lowerDesc.includes('cata');
            const isFamily = lowerDesc.includes('familia') || lowerDesc.includes('niños') || lowerDesc.includes('juegos');
            const isRomantic = lowerDesc.includes('pareja') || lowerDesc.includes('cena') || lowerDesc.includes('noche');
            const isOutdoor = lowerDesc.includes('aire libre') || lowerDesc.includes('naturaleza') || lowerDesc.includes('paseo');

            // 2. Select Template based on context
            let templates = [];

            if (isWine) {
                templates = [
                    `Sumérgete en la tradición vitivinícola con esta experiencia exclusiva. ${original}. Un recorrido sensorial diseñado para los amantes del buen vivir, donde cada copa cuenta una historia de nuestra tierra.`,
                    `Descubre el alma de nuestros viñedos en un entorno de elegancia rústica. Te invitamos a vivir ${original}, maridado con la excelencia de nuestra producción local. Una cita ineludible para el paladar exigente.`,
                    `Déjate seducir por los aromas y sabores de nuestra bodega boutique. ${original}. Una propuesta enoturística que combina pasión, historia y la mejor compañía en el corazón de la región.`
                ];
            } else if (isFamily) {
                templates = [
                    `Crea recuerdos imborrables junto a tus seres queridos. ${original}. Un espacio pensado para la diversión y la desconexión, donde grandes y chicos encuentran su momento de felicidad.`,
                    `La escapada perfecta para disfrutar en familia. ${original}. Conecta con la naturaleza y disfruta de actividades diseñadas para fortalecer vínculos en un entorno seguro y acogedor.`,
                    `Diversión y tranquilidad en un solo lugar. Te proponemos ${original}, una experiencia donde la risa y el disfrute están garantizados para toda la familia.`
                ];
            } else if (isRomantic) {
                templates = [
                    `Enciende la magia con una velada inolvidable. ${original}. El escenario perfecto para celebrar el amor, rodeados de una atmósfera íntima y detalles que enamoran.`,
                    `Escápate de la rutina y reconecta con tu pareja en un entorno soñado. ${original}. Elegancia, privacidad y un servicio que cuida cada detalle para hacer de su visita un momento eterno.`,
                    `Una experiencia sensorial diseñada para dos. ${original}. Permítanse disfrutar del placer de la buena compañía en un ambiente exclusivo y sofisticado.`
                ];
            } else if (isOutdoor) {
                templates = [
                    `Respira aire puro y renueva tu energía. ${original}. Una invitación a explorar la belleza natural de nuestro entorno, combinando aventura y relax en perfecta armonía.`,
                    `Siente la libertad de la naturaleza en su máxima expresión. ${original}. Descubre paisajes únicos y vive una aventura auténtica, ideal para desconectar del ritmo urbano.`,
                    `Conecta con lo esencial a través de esta experiencia al aire libre. ${original}. Un recorrido que despierta los sentidos y te invita a descubrir los secretos mejor guardados de nuestra región.`
                ];
            } else {
                // Generic Premium Templates
                templates = [
                    `Elevamos tu experiencia con una propuesta de Turismo Boutique inigualable. ${original}. Diseñado para quienes buscan calidad, calidez y un servicio excepcional en cada detalle.`,
                    `Descubre un refugio de exclusividad y encanto. ${original}. Te invitamos a ser parte de una vivencia auténtica, donde la tradición y la modernidad se encuentran para deleitarte.`,
                    `Una invitación a disfrutar de lo mejor de nuestra hospitalidad. ${original}. Permítenos sorprenderte con una atención personalizada y un ambiente que invita al disfrute pleno.`
                ];
            }

            // 3. Randomize selection for variety
            const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

            // 4. Polish (Capitalization, formatting)
            const polished = selectedTemplate.replace(/\.\./g, '.').trim();

            setEditingService(prev => prev ? { ...prev, description: polished } : null);
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

                            {/* English Name - New Field */}
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                                    🇺🇸 Nombre en Inglés (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={editingService.name_en || ''}
                                    onChange={e => setEditingService({ ...editingService, name_en: e.target.value })}
                                    className="w-full px-4 py-3 border border-blue-200 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Premium Vineyard Tour"
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

                            {/* English Description - New Field */}
                            <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                    🇺🇸 Descripción en Inglés (Opcional)
                                </label>
                                <textarea
                                    value={editingService.description_en || ''}
                                    onChange={e => setEditingService({ ...editingService, description_en: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe the experience in English..."
                                />
                            </div>

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

                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        🗓️ Disponibilidad Específica
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Define qué días y horarios está habilitado este servicio.
                                    </p>
                                    <AvailabilityScheduler
                                        isEmbedded={true}
                                        initialSettings={(editingService.contactInfo as any)?.availability}
                                        onChange={(newSettings) => {
                                            setEditingService({
                                                ...editingService,
                                                contactInfo: {
                                                    ...editingService.contactInfo!,
                                                    availability: newSettings
                                                } as any
                                            });
                                        }}
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
