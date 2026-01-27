import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Calendar, CreditCard, Globe, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useItineraryStore } from '@/store/itineraryStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

type AuthMode = 'login' | 'register';
type UserRole = 'tourist' | 'partner';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, hardReset } = useApp();
  const setStoreResidency = useItineraryStore((state) => state.setResidencyCountry);
  const [mode, setMode] = useState<AuthMode>('login');
  const [hasError, setHasError] = useState(false);
  const [role, setRole] = useState<UserRole>('tourist');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    dob: '',
    docNumber: '',
    country: 'Uruguay',
    acceptTerms: false,
    acceptNoRetract: false,
  });
  const [otherCountry, setOtherCountry] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    const loadingToast = toast.loading(mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...');

    try {
      if (mode === 'login') {
        // Limpieza agresiva de datos de debug antes de intentar login real
        ['escapauy_debug_partner', 'escapauy_isAuthenticated', 'escapauy_user'].forEach(k => localStorage.removeItem(k));

        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        toast.success('¡Bienvenido de nuevo!', { id: loadingToast });
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: role,
              country: formData.country === 'Otro' ? otherCountry : formData.country,
              kycData: {
                docNumber: formData.docNumber,
                dob: formData.dob,
                phone: formData.phone,
              }
            }
          }
        });

        if (error) throw error;

        // Sync residency country to itinerary store for immediate tax benefits
        if (role === 'tourist') {
          const finalCountry = formData.country === 'Otro' ? otherCountry : formData.country;
          if (finalCountry) setStoreResidency(finalCountry);
        }

        toast.success('Cuenta creada con éxito. Revisa tu email.', { id: loadingToast });
      }

      setShowAuthModal(false);
    } catch (err: any) {
      console.error('[AUTH_ERROR]', err);
      setHasError(true);
      toast.error(err.message || 'Error en la autenticación', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login'
                ? 'Ingresa a tu cuenta ESCAPAUY'
                : step === 1 ? 'Información básica' : 'Datos de verificación (KYC)'}
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && step === 1 && (
            <>
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('tourist')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    role === 'tourist'
                      ? "border-ocean-500 bg-ocean-50 text-ocean-700"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Soy Turista</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    role === 'partner'
                      ? "border-ocean-500 bg-ocean-50 text-ocean-700"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Soy Partner</span>
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          {(mode === 'login' || step === 1) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          )}

          {/* Password */}
          {(mode === 'login' || step === 1) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* KYC Step */}
          {mode === 'register' && step === 2 && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Requisito Legal (BCU/PLAFT):</strong> Para operar con pagos, necesitamos verificar tu identidad.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    placeholder="+598 99 123 456"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => updateField('dob', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento (Cédula/Pasaporte) *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.docNumber}
                    onChange={(e) => updateField('docNumber', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    placeholder="1.234.567-8"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País de Residencia *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white"
                  >
                    <option value="Uruguay">Uruguay</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Chile">Chile</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {formData.country === 'Otro' && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Especifica tu país de residencia *
                    </label>
                    <input
                      type="text"
                      required
                      value={otherCountry}
                      onChange={(e) => setOtherCountry(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                      placeholder="Ej: Reino Unido"
                    />
                  </div>
                )}
              </div>

              {/* Legal Checkboxes */}
              <div className="space-y-3 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={(e) => updateField('acceptTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los <a href="/legal/terminos" className="text-ocean-600 underline">Términos de Servicio</a> y la <a href="/legal/privacidad" className="text-ocean-600 underline">Política de Privacidad</a> *
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Ingresar'
            ) : step === 1 ? (
              'Continuar'
            ) : (
              'Crear Cuenta'
            )}
          </button>

          {/* Back button for step 2 */}
          {mode === 'register' && step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
          )}

          {/* Toggle Mode */}
          <p className="text-center text-sm text-gray-500 pt-4">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setStep(1); }}
                  className="text-ocean-600 font-medium hover:underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setStep(1); }}
                  className="text-ocean-600 font-medium hover:underline"
                >
                  Ingresar
                </button>
              </>
            )}
          </p>

          {hasError && (
            <div className="mt-6 pt-6 border-t border-red-100 animate-in fade-in slide-in-from-top-4">
              <p className="text-xs text-red-600 mb-3 text-center font-medium leading-relaxed">
                ¿Problemas persistentes con el acceso? <br />
                Intenta una limpieza profunda de sesión.
              </p>
              <button
                type="button"
                onClick={() => hardReset()}
                className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-200 flex items-center justify-center gap-2"
              >
                <X className="w-3 h-3" /> Reiniciar Sesión Forzosamente
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
