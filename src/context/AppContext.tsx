import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Configuración de Supabase (Modo Demo si no hay llaves)
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

// Definimos qué información del clima queremos mostrar
interface Weather {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temp: number;
  rainProbability: number;
  wind: number;
  forecast: any[];
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  weather: Weather;
  setShowAuthModal: (show: boolean) => void;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  syncUserSession: (user: User) => void;
  clearLocalState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  // DATOS DE CLIMA PARA LA DEMO (Puedes cambiar 'sunny' por 'rainy' para mostrar el Plan B)
  const [weather] = useState<Weather>({
    condition: 'sunny',
    temp: 24,
    rainProbability: 10,
    wind: 15,
    forecast: [
      { time: '14:00', temp: 25, condition: 'sunny' },
      { time: '16:00', temp: 24, condition: 'cloudy' },
      { time: '18:00', temp: 22, condition: 'rainy' },
      { time: '20:00', temp: 20, condition: 'rainy' }
    ]
  });

  const syncUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('escapauy_user', JSON.stringify(userData));
  };

  const clearLocalState = () => {
    setUser(null);
    localStorage.removeItem('escapauy_user');
  };

  const login = async (email: string) => {
    console.log('[DEMO] Simulando login para:', email);
    const demoUser = {
      id: 'demo-' + Date.now(),
      email: email,
      user_metadata: { full_name: email.split('@')[0] }
    };
    syncUserSession(demoUser);
    toast.success('¡Bienvenido a la Demo!');
  };

  const logout = async () => {
    clearLocalState();
    navigate('/');
    toast.success('Sesión cerrada');
  };

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    showAuthModal,
    weather,
    setShowAuthModal,
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
