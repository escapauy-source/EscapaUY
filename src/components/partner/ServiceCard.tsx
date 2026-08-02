import { MapPin, Phone, Navigation, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState } from 'react';

export interface PartnerService {
    id: string;
    partnerId: string;
    name: string;
    name_en?: string;
    description: string;
    description_en?: string;
    category: string;
    capacity: number;
    availableHours: string[];
    duration: number;
    price: number;
    images: string[];
    contactInfo: {
        address: string;
        phone: string;
        coordinates: { lat: number; lng: number };
        arrivalInstructions: string;
    };
    isActive: boolean;
}

interface ServiceCardProps {
    service: PartnerService;
    mode: 'public' | 'voucher' | 'preview';
    showModeToggle?: boolean;
}

/**
 * Tarjeta de Servicio con Lógica de Protección de Comisión
 * - modo 'public': Sin datos de contacto (web pública)
 * - modo 'voucher': Con datos de contacto (post-pago)
 * - modo 'preview': Toggle entre público/voucher
 */
export function ServiceCard({ service, mode: initialMode, showModeToggle = false }: ServiceCardProps) {
    const [currentMode, setCurrentMode] = useState<'public' | 'voucher'>(
        initialMode === 'preview' ? 'public' : initialMode
    );
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const showContact = currentMode === 'voucher';
    const displayImages = service.images.slice(0, 10);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const generateGoogleMapsLink = () => {
        const { lat, lng } = service.contactInfo.coordinates;
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Preview Mode Toggle */}
            {showModeToggle && (
                <div className="bg-[#F8F7F4] border-b border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Vista Previa:</p>
                        <button
                            onClick={() => setCurrentMode(m => m === 'public' ? 'voucher' : 'public')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                currentMode === 'public'
                                    ? "bg-ocean-100 text-ocean-700"
                                    : "bg-green-100 text-green-700"
                            )}
                        >
                            {currentMode === 'public' ? (
                                <>
                                    <Eye className="w-4 h-4" />
                                    Vista Pública
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-4 h-4" />
                                    Vista Voucher
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Image Carousel */}
            <div className="relative aspect-video bg-gray-900">
                <img
                    src={displayImages[currentImageIndex]}
                    alt={`${service.name} - Foto ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                />

                {/* Carousel Navigation */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentImageIndex(i => (i - 1 + displayImages.length) % displayImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setCurrentImageIndex(i => (i + 1) % displayImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            ›
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {displayImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-playfair text-2xl font-bold text-gray-900">
                            {service.name}
                        </h3>
                        <span className="px-3 py-1 bg-nature-100 text-nature-700 text-sm font-medium rounded-full whitespace-nowrap">
                            {service.category}
                        </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        {service.description}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Capacidad</p>
                        <p className="font-semibold text-gray-900">Hasta {service?.capacity || 0} personas</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Duración</p>
                        <p className="font-semibold text-gray-900">{service?.duration || 0} minutos</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Horarios Disponibles</p>
                        <p className="font-semibold text-gray-900">
                            {service?.availableHours?.length ? service.availableHours.join(', ') : 'No definidos'}
                        </p>
                    </div>
                </div>

                {/* Contact Info - Conditional */}
                <div className="space-y-3 mb-6">
                    <div className={cn(
                        "flex items-start gap-3 p-4 rounded-xl transition-all",
                        showContact ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
                    )}>
                        <MapPin className={cn(
                            "w-5 h-5 mt-0.5 flex-shrink-0",
                            showContact ? "text-green-600" : "text-amber-600"
                        )} />
                        <div className="flex-1">
                            {showContact ? (
                                <>
                                    <p className="font-semibold text-green-900 mb-1">{service?.contactInfo?.address || 'Dirección no disponible'}</p>
                                    {service?.contactInfo?.coordinates && (
                                        <a
                                            href={generateGoogleMapsLink()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Cómo llegar (Google Maps)
                                        </a>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-amber-700 font-medium italic">
                                    📍 [Dirección disponible tras confirmar la reserva]
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-start gap-3 p-4 rounded-xl transition-all",
                        showContact ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
                    )}>
                        <Phone className={cn(
                            "w-5 h-5 mt-0.5 flex-shrink-0",
                            showContact ? "text-green-600" : "text-amber-600"
                        )} />
                        <div className="flex-1">
                            {showContact ? (
                                <>
                                    <p className="font-semibold text-green-900 mb-1">{service?.contactInfo?.phone || 'Sin teléfono'}</p>
                                    {service?.contactInfo?.phone && (
                                        <a
                                            href={`tel:${service.contactInfo.phone}`}
                                            className="text-sm text-green-700 hover:text-green-800 font-medium"
                                        >
                                            Llamar ahora
                                        </a>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-amber-700 font-medium italic">
                                    📞 [Teléfono disponible tras confirmar la reserva]
                                </p>
                            )}
                        </div>
                    </div>

                    {showContact && service?.contactInfo?.arrivalInstructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-blue-900 mb-2">🚗 Instrucciones de Llegada</p>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                {service.contactInfo.arrivalInstructions}
                            </p>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div>
                        <p className="text-sm text-gray-500">Precio por persona</p>
                        <p className="font-playfair text-3xl font-bold text-gray-900">
                            {formatCurrency(service.price)}
                        </p>
                    </div>

                    {initialMode === 'preview' ? (
                        <div className="flex flex-col items-end">
                            <button disabled className="px-6 py-3 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed">
                                Reservar Ahora
                            </button>
                            <span className="text-[10px] text-gray-400 mt-1 italic">
                                (Botón visible para el turista)
                            </span>
                        </div>
                    ) : (
                        <button className="px-6 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-colors">
                            Reservar Ahora
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
