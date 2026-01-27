import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  syncUserSession: (user: User) => void;
  clearLocalState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const syncUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('escapauy_user', JSON.stringify(userData));
  };

  const clearLocalState = () => {
    setUser(null);
    localStorage.removeItem('escapauy_user');
  };

  const login = async (email: string) => {
    if (!supabase) {
      console.log('[ADN_DEBUG] Supabase not configured, simulating login');
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        user_metadata: { full_name: email.split('@')[0] }
      };
      syncUserSession(demoUser);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast.error('Error al enviar el código: ' + error.message);
        return;
      }

      toast.success('Código enviado a tu email');
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearLocalState();
    navigate('/');
    toast.success('Sesión cerrada');
  };

  // Sync with Supabase Auth State
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        // Verificar si supabase está disponible (no en modo demo roto)
        if (!supabase?.auth?.getSession) {
          console.log('[ADN_DEBUG] Supabase not available, skipping session check');
          setIsLoading(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          syncUserSession(session.user);
        }
        setIsLoading(false);
      } catch (error) {
        console.log('[ADN_DEBUG] Session check failed:', error);
        setIsLoading(false);
      }
    };

    checkInitialSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          syncUserSession(session.user);
        } else if (event === 'SIGNED_OUT') {
          clearLocalState();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    syncUserSession,
    clearLocalState
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};

export default AppContext;