import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext'; import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'register';
type UserRole = 'tourist' | 'partner';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, syncUserSession, authModalRole } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>(authModalRole);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar el estado local del rol con el rol solicitado globalmente
  useEffect(() => {
    console.log('[DEBUG] AuthModal: Sincronizando rol local con context:', authModalRole);
    setRole(authModalRole);
  }, [authModalRole]);
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

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Sync and navigate
          const activeRole = authModalRole;
          const targetRoute = activeRole === 'tourist' ? '/explore' : '/partner/dashboard';

          console.log('[DEBUG] AuthModal: Login exitoso, redirigiendo a:', targetRoute);
          navigate(targetRoute, { replace: true });

          setShowAuthModal(false);
          syncUserSession(data.user);
          toast.success('¡Bienvenido de nuevo!', { id: loadingToast });
        }
      } else {
        // Register (SignUp)
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: role, // 'tourist' or 'partner'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Si es partner, creamos el registro en la tabla partners
          if (role === 'partner') {
            const { error: partnerError } = await supabase
              .from('partners')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name: formData.fullName,
              });

            if (partnerError) console.error('Error creando perfil de partner:', partnerError);
          }

          const targetRoute = role === 'tourist' ? '/explore' : '/partner/dashboard';
          navigate(targetRoute, { replace: true });

          setShowAuthModal(false);
          syncUserSession(data.user as any);
          toast.success('Cuenta creada con éxito', { id: loadingToast });
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
            </h2>
          </div>
          <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center border-b border-gray-100">
          <button
            onClick={() => setRole('tourist')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${role === 'tourist' ? 'border-b-2 border-ocean-600 text-ocean-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Turista
          </button>
          <button
            onClick={() => setRole('partner')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${role === 'partner' ? 'border-b-2 border-ocean-600 text-ocean-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Partner
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

