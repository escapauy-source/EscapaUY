import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Calendar, CreditCard, Globe, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useItineraryStore } from '@/store/itineraryStore';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

type AuthMode = 'login' | 'register';
type UserRole = 'tourist' | 'partner';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, syncUserSession } = useApp();
  const setStoreResidency = useItineraryStore((state) => state.setResidencyCountry);
  const [mode, setMode] = useState<AuthMode>('login');
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

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...');

    // SIMULACIÓN MODO DEMO
    setTimeout(() => {
      const demoUser = {
        id: 'user-' + Date.now(),
        email: formData.email || 'demo@escapauy.com',
        user_metadata: { 
          full_name: formData.fullName || 'Usuario Demo' 
        }
      };
      
      syncUserSession(demoUser);
      
      if (role === 'tourist') {
        setStoreResidency(formData.country);
      }

      toast.success(mode === 'login' ? '¡Bienvenido de nuevo!' : 'Cuenta creada con éxito', { id: loadingToast });
      setShowAuthModal(false);
      setIsLoading(false);
    }, 1500);
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">MODO DEMO ACTIVO</p>
          </div>
          <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Ingresar' : 'Continuar'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="w-full text-sm text-blue-600 hover:underline"
          >
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
          </button>
        </form>
      </div>
    </div>
  );
}

