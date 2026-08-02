import { useState, useCallback } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon, Move } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageSpec {
    minWidth: number;
    minHeight: number;
    maxSize: number; // bytes
    formats: string[];
    aspectRatio: string;
}

interface ImageGalleryManagerProps {
    serviceId: string;
    existingImages?: string[];
    onImagesChange?: (images: string[]) => void;
    maxImages?: number;
}

/**
 * ESPECIFICACIONES TÉCNICAS OFICIALES ESCAPAUY
 * Calidad Editorial para Fotos de Servicios
 */
const IMAGE_SPECS: ImageSpec = {
    minWidth: 1920,        // Ancho mínimo
    minHeight: 1080,       // Alto mínimo
    maxSize: 5 * 1024 * 1024, // 5MB máximo
    formats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: '16:9',   // Relación de aspecto recomendada
};

/**
 * Gestor de Galería de Imágenes con Validaciones de Calidad Editorial
 * Garantiza que todos los partners suban fotos con los mismos estándares
 */
export function ImageGalleryManager({
    serviceId,
    existingImages = [],
    onImagesChange,
    maxImages = 10
}: ImageGalleryManagerProps) {
    const [images, setImages] = useState<string[]>(existingImages);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

    const validateImage = useCallback(async (file: File): Promise<{ valid: boolean; error?: string }> => {
        // Validar formato
        if (!IMAGE_SPECS.formats.includes(file.type)) {
            return {
                valid: false,
                error: `Formato no permitido. Use: ${IMAGE_SPECS.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
            };
        }

        // Validar tamaño de archivo
        if (file.size > IMAGE_SPECS.maxSize) {
            return {
                valid: false,
                error: `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: ${IMAGE_SPECS.maxSize / 1024 / 1024}MB`
            };
        }

        // Validar resolución
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                if (img.width < IMAGE_SPECS.minWidth || img.height < IMAGE_SPECS.minHeight) {
                    resolve({
                        valid: false,
                        error: `Resolución muy baja (${img.width}x${img.height}px). Mínimo: ${IMAGE_SPECS.minWidth}x${IMAGE_SPECS.minHeight}px`
                    });
                } else {
                    resolve({ valid: true });
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ valid: false, error: 'Error al cargar la imagen' });
            };

            img.src = url;
        });
    }, []);

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setValidationStatus('validating');
        setUploadErrors([]);

        const newErrors: string[] = [];
        const validFiles: File[] = [];

        // Verificar límite de imágenes
        if (images.length + files.length > maxImages) {
            newErrors.push(`Máximo ${maxImages} fotos por servicio. Actualmente: ${images.length}`);
            setUploadErrors(newErrors);
            setValidationStatus('error');
            return;
        }

        // Validar cada archivo
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = await validateImage(file);

            if (validation.valid) {
                validFiles.push(file);
            } else {
                newErrors.push(`${file.name}: ${validation.error}`);
            }
        }

        // Si hay errores, mostrarlos
        if (newErrors.length > 0) {
            setUploadErrors(newErrors);
            setValidationStatus('error');

            // Si hay archivos válidos también, procesarlos
            if (validFiles.length > 0) {
                processValidFiles(validFiles);
            }
        } else {
            setValidationStatus('success');
            processValidFiles(validFiles);
        }
    }, [images, maxImages, validateImage]);

    const processValidFiles = useCallback((files: File[]) => {
        // En producción, aquí se subirían a Supabase Storage
        // Por ahora, crear URLs temporales
        const newImageUrls = files.map(file => URL.createObjectURL(file));
        const updated = [...images, ...newImageUrls];

        setImages(updated);
        onImagesChange?.(updated);

        // Auto-limpiar status después de 3 segundos
        setTimeout(() => {
            setValidationStatus('idle');
            setUploadErrors([]);
        }, 3000);
    }, [images, onImagesChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const removeImage = useCallback((index: number) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
        onImagesChange?.(updated);
    }, [images, onImagesChange]);

    return (
        <div className="space-y-4">
            {/* Especificaciones Técnicas */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 text-sm mb-2">
                            📸 Especificaciones Técnicas - Calidad Editorial
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3 text-xs text-blue-800">
                            <div>
                                <p className="font-medium mb-1">✅ Formato</p>
                                <p className="text-blue-700">JPG, PNG o WEBP</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">✅ Tamaño de Archivo</p>
                                <p className="text-blue-700">Máximo 5MB por foto</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">✅ Resolución Mínima</p>
                                <p className="text-blue-700">1920 x 1080 píxeles (Full HD)</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">✅ Relación de Aspecto</p>
                                <p className="text-blue-700">16:9 (recomendado)</p>
                            </div>
                        </div>
                        <p className="text-xs text-blue-700 mt-3 italic">
                            💡 Consejo: Use fotos profesionales con buena iluminación natural. Evite selfies o fotos con marcas de agua.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                    isDragging ? "border-ocean-500 bg-ocean-50" : "border-gray-300 hover:border-ocean-400",
                    images.length >= maxImages && "opacity-50 pointer-events-none"
                )}
            >
                <input
                    type="file"
                    id={`image-upload-${serviceId}`}
                    multiple
                    accept={IMAGE_SPECS.formats.join(',')}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={images.length >= maxImages}
                />

                <Upload className={cn(
                    "w-12 h-12 mx-auto mb-4",
                    isDragging ? "text-ocean-600" : "text-gray-400"
                )} />

                <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragging ? 'Suelte las imágenes aquí' : 'Arrastre fotos o haga click para seleccionar'}
                </p>

                <p className="text-sm text-gray-500 mb-4">
                    {images.length} / {maxImages} fotos cargadas
                </p>

                <label
                    htmlFor={`image-upload-${serviceId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-colors cursor-pointer"
                >
                    <Upload className="w-4 h-4" />
                    Seleccionar Fotos
                </label>
            </div>

            {/* Validation Status */}
            {validationStatus !== 'idle' && (
                <div className={cn(
                    "rounded-xl p-4 border",
                    validationStatus === 'validating' && "bg-blue-50 border-blue-200",
                    validationStatus === 'success' && "bg-green-50 border-green-200",
                    validationStatus === 'error' && "bg-red-50 border-red-200"
                )}>
                    <div className="flex items-start gap-2">
                        {validationStatus === 'validating' && (
                            <>
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-0.5" />
                                <p className="text-sm text-blue-900 font-medium">Validando imágenes...</p>
                            </>
                        )}
                        {validationStatus === 'success' && (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                <p className="text-sm text-green-900 font-medium">✅ Fotos válidas y cargadas correctamente</p>
                            </>
                        )}
                        {validationStatus === 'error' && uploadErrors.length > 0 && (
                            <>
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm text-red-900 font-medium mb-2">Errores de validación:</p>
                                    <ul className="text-xs text-red-800 space-y-1">
                                        {uploadErrors.map((error, i) => (
                                            <li key={i}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                        >
                            <img
                                src={image}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay con acciones */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => removeImage(index)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors cursor-move">
                                    <Move className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Indicador de posición */}
                            <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
