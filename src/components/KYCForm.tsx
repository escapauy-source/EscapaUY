import React, { useState } from 'react';
import { Upload, Shield, AlertCircle } from 'lucide-react';

interface KYCFormProps {
    onSubmit: (data: KYCData) => void;
    onCancel: () => void;
}

export interface KYCData {
    fullName: string;
    countryOfResidence: string;
    documentType: 'passport' | 'dni' | 'other';
    documentNumber: string;
    documentImage: File | null;
}

const COUNTRIES = [
    'Argentina',
    'Brasil',
    'Chile',
    'Paraguay',
    'Uruguay',
    'Estados Unidos',
    'España',
    'Francia',
    'Alemania',
    'Italia',
    'Reino Unido',
    'Otro',
];

export const KYCForm = ({ onSubmit, onCancel }: KYCFormProps) => {
    const [formData, setFormData] = useState<KYCData>({
        fullName: '',
        countryOfResidence: '',
        documentType: 'passport',
        documentNumber: '',
        documentImage: null,
    });
    const [otherCountry, setOtherCountry] = useState('');

    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof KYCData, string>>>({});

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setFormData({ ...formData, documentImage: file });
                setErrors({ ...errors, documentImage: undefined });
            } else {
                setErrors({ ...errors, documentImage: 'Por favor sube una imagen válida' });
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                setFormData({ ...formData, documentImage: file });
                setErrors({ ...errors, documentImage: undefined });
            } else {
                setErrors({ ...errors, documentImage: 'Por favor sube una imagen válida' });
            }
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof KYCData, string>> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nombre completo es requerido';
        }

        if (!formData.countryOfResidence) {
            newErrors.countryOfResidence = 'País de residencia es requerido';
        }

        if (!formData.documentNumber.trim()) {
            newErrors.documentNumber = 'Número de documento es requerido';
        }

        if (!formData.documentImage) {
            newErrors.documentImage = 'La imagen del documento es requerida (Ley 20.352)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const finalData = {
                ...formData,
                countryOfResidence: formData.countryOfResidence === 'Otro' ? otherCountry : formData.countryOfResidence
            };
            onSubmit(finalData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Legal Notice */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 text-sm">
                            Debida Diligencia Simplificada
                        </h4>
                        <p className="text-xs text-blue-700 mt-1">
                            Según Ley 20.352 (Prevención de Lavado de Activos), debemos verificar tu identidad.
                            Tu información será almacenada de forma segura por 5 años.
                        </p>
                    </div>
                </div>
            </div>

            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                </label>
                <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all`}
                    placeholder="Ej: María García López"
                />
                {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullName}
                    </p>
                )}
            </div>

            {/* Country of Residence */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    País de Residencia * <span className="text-xs text-gray-500">(para beneficios fiscales)</span>
                </label>
                <select
                    value={formData.countryOfResidence}
                    onChange={(e) =>
                        setFormData({ ...formData, countryOfResidence: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${errors.countryOfResidence ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all`}
                >
                    <option value="">Selecciona tu país</option>
                    {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>

                {formData.countryOfResidence === 'Otro' && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Especifica tu país *
                        </label>
                        <input
                            type="text"
                            required
                            value={otherCountry}
                            onChange={(e) => setOtherCountry(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all"
                            placeholder="Ej: Reino Unido"
                        />
                    </div>
                )}
            </div>

            {/* Document Type */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento *
                    </label>
                    <select
                        value={formData.documentType}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                documentType: e.target.value as 'passport' | 'dni' | 'other',
                            })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all"
                    >
                        <option value="passport">Pasaporte</option>
                        <option value="dni">DNI / Cédula</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento *
                    </label>
                    <input
                        type="text"
                        value={formData.documentNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, documentNumber: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-lg border ${errors.documentNumber ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all`}
                        placeholder="Ej: AB123456"
                    />
                    {errors.documentNumber && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.documentNumber}
                        </p>
                    )}
                </div>
            </div>

            {/* Document Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del Documento * <span className="text-xs text-gray-500">(retención 5 años)</span>
                </label>
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                        ? 'border-[#C5A059] bg-[#C5A059]/5'
                        : errors.documentImage
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-[#C5A059]'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {formData.documentImage ? (
                        <div>
                            <p className="text-sm font-medium text-green-600">
                                ✓ {formData.documentImage.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Clic para cambiar imagen
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600">
                                Arrastra tu documento aquí o haz clic para seleccionar
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG o PDF • Máximo 10MB
                            </p>
                        </div>
                    )}
                </div>
                {errors.documentImage && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.documentImage}
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#D4AF6A] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                    Confirmar Identidad
                </button>
            </div>
        </form>
    );
};
