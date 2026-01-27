import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, BigFiveScores, WeatherData, Hotel, FullItinerary } from '@/types';
import type { KYCData } from '@/components/KYCForm';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hardReset: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  updateIAInsights: (insights: { scores?: BigFiveScores; duration?: number; companion?: string; analysis?: any }) => Promise<void>;

  // Big Five Personality
  bigFiveScores: BigFiveScores | null;
  setBigFiveScores: (scores: BigFiveScores) => void;

  // Weather
  weather: WeatherData;
  setWeather: (weather: WeatherData) => void;

  // Travel Group
  travelGroup: string | null;
  setTravelGroup: (group: string | null) => void;

  // Hotel Selection
  selectedHotel: Hotel | null;
  setSelectedHotel: (hotel: Hotel | null) => void;

  // Arrival Time
  arrivalTime: 'morning' | 'afternoon' | 'evening' | null;
  setArrivalTime: (time: 'morning' | 'afternoon' | 'evening' | null) => void;

  // Trip Details
  numberOfNights: number;
  setNumberOfNights: (nights: number) => void;
  numberOfAdults: number;
  setNumberOfAdults: (adults: number) => void;
  numberOfChildren: number;
  setNumberOfChildren: (children: number) => void;
  childrenAges: number[];
  setChildrenAges: (ages: number[]) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;

  // Itinerary
  itinerary: FullItinerary | null;
  setItinerary: (itinerary: FullItinerary | null) => void;
  currentItineraryDay: number;
  setCurrentItineraryDay: (day: number) => void;

  // KYC
  kycData: KYCData | null;
  setKycData: (data: KYCData | null) => void;
  kycCompleted: boolean;
  setKycCompleted: (completed: boolean) => void;

  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Hydration State
  isContextHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default weather data
const defaultWeather: WeatherData = {
  temp: 22,
  condition: 'sunny',
  rainProbability: 20,
  humidity: 65,
  wind: 12,
  forecast: [
    { time: 'Ahora', temp: 22, condition: 'sunny', rainProbability: 20 },
    { time: '13:00', temp: 24, condition: 'sunny', rainProbability: 15 },
    { time: '15:00', temp: 23, condition: 'cloudy', rainProbability: 30 },
    { time: '17:00', temp: 20, condition: 'cloudy', rainProbability: 40 },
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Helper to load from localStorage with debugging
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        return parsed;
      }
    } catch (e) {
      console.error(`[ADN_DEBUG] Error loading ${key}:`, e);
    }
    return defaultValue;
  };

  // Helper to save to localStorage with debugging
  const saveToStorage = <T,>(key: string, value: T) => {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`[ADN_DEBUG] Error saving ${key}:`, e);
    }
  };

  // HYDRATION FIX: Inicializar estados con valores por defecto, NO leer localStorage directamente
  // Esto evita el conflicto entre SSR y hydration
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bigFiveScores, setBigFiveScoresState] = useState<BigFiveScores | null>(null);
  const [weather, setWeather] = useState<WeatherData>(defaultWeather);
  const [travelGroup, setTravelGroupState] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotelState] = useState<Hotel | null>(null);
  const [arrivalTime, setArrivalTimeState] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [numberOfNights, setNumberOfNightsState] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [numberOfAdults, setNumberOfAdultsState] = useState(1);
  const [numberOfChildren, setNumberOfChildrenState] = useState(0);
  const [childrenAges, setChildrenAgesState] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<FullItinerary | null>(null);
  const [currentItineraryDay, setCurrentItineraryDay] = useState(1);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [kycCompleted, setKycCompleted] = useState(false);
  
  // HYDRATION FIX: Estado de hydration - comienza en false
  const [isContextHydrated, setIsContextHydrated] = useState(false);

  // HYDRATION FIX: Cargar datos de localStorage despues del mount
  useEffect(() => {
    console.log('[ADN_DEBUG] AppContext: Starting hydration...');
    
    try {
      // Cargar todos los estados desde localStorage
      const storedIsAuthenticated = loadFromStorage<boolean>('escapauy_isAuthenticated', false);
      const storedUser = loadFromStorage<User | null>('escapauy_user', null);
      const storedBigFiveScores = loadFromStorage<BigFiveScores | null>('escapauy_bigFiveScores', null);
      const storedTravelGroup = loadFromStorage<string | null>('escapauy_travelGroup', null);
      const storedSelectedHotel = loadFromStorage<Hotel | null>('escapauy_selectedHotel', null);
      const storedArrivalTime = loadFromStorage<'morning' | 'afternoon' | 'evening' | null>('escapauy_arrivalTime', null);
      const storedNumberOfNights = loadFromStorage<number>('escapauy_numberOfNights', 1);
      const storedNumberOfAdults = loadFromStorage<number>('escapauy_numberOfAdults', 1);
      const storedNumberOfChildren = loadFromStorage<number>('escapauy_numberOfChildren', 0);
      const storedChildrenAges = loadFromStorage<number[]>('escapauy_childrenAges', []);

      // Aplicar todos los estados cargados
      if (storedIsAuthenticated) setIsAuthenticated(storedIsAuthenticated);
      if (storedUser) setUser(storedUser);
      if (storedBigFiveScores) setBigFiveScoresState(storedBigFiveScores);
      if (storedTravelGroup) setTravelGroupState(storedTravelGroup);
      if (storedSelectedHotel) setSelectedHotelState(storedSelectedHotel);
      if (storedArrivalTime) setArrivalTimeState(storedArrivalTime);
      if (storedNumberOfNights !== 1) setNumberOfNightsState(storedNumberOfNights);
      if (storedNumberOfAdults !== 1) setNumberOfAdultsState(storedNumberOfAdults);
      if (storedNumberOfChildren !== 0) setNumberOfChildrenState(storedNumberOfChildren);
      if (storedChildrenAges.length > 0) setChildrenAgesState(storedChildrenAges);

      console.log('[ADN_DEBUG] AppContext: Hydration complete');
      setIsContextHydrated(true);
    } catch (error) {
      console.error('[ADN_DEBUG] AppContext: Hydration error:', error);
      // En caso de error, marcar como hidrato para evitar bucle infinito
      setIsContextHydrated(true);
    }
  }, []);

  // Sync with Supabase Auth State
  useEffect(() => {
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        syncUserSession(session.user);
      }
    };

    checkInitialSession();

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
  }, []);

  const syncUserSession = (supabaseUser: any) => {
    const email = supabaseUser.email || '';

    const finalUser: User = {
      id: supabaseUser.id,
      email: email,
      fullName: supabaseUser.user_metadata?.full_name || 'Usuario',
      role: email === 'escapauy@gmail.com' ? 'admin' : (supabaseUser.user_metadata?.role || 'tourist'),
      originCountry: supabaseUser.user_metadata?.country || 'Uruguay',
      kycData: supabaseUser.user_metadata?.kycData || null,
      bigFiveScores: supabaseUser.user_metadata?.bigFiveScores || null,
      ia_insight: supabaseUser.user_metadata?.ia_insight || null,
      trip_duration: supabaseUser.user_metadata?.trip_duration || null,
      companion_type: supabaseUser.user_metadata?.companion_type || null,
    };

    setUser(finalUser);
    setIsAuthenticated(true);
    saveToStorage('escapauy_isAuthenticated', true);
    saveToStorage('escapauy_user', finalUser);
  };

  const clearLocalState = () => {
    setUser(null);
    setIsAuthenticated(false);
    setBigFiveScoresState(null);
    setTravelGroupState(null);
    setSelectedHotelState(null);
    setArrivalTimeState(null);
    setNumberOfNightsState(1);
    setNumberOfAdultsState(1);
    setNumberOfChildrenState(0);
    setChildrenAgesState([]);
    setItinerary(null);
    setCurrentItineraryDay(1);
    setKycData(null);
    setKycCompleted(false);

    // Clear main keys
    const keys = [
      'escapauy_isAuthenticated', 'escapauy_user', 'escapauy_bigFiveScores',
      'escapauy_travelGroup', 'escapauy_selectedHotel', 'escapauy_arrivalTime',
      'escapauy_numberOfNights', 'escapauy_numberOfAdults', 'escapauy_numberOfChildren',
      'escapauy_childrenAges'
    ];
    keys.forEach(k => localStorage.removeItem(k));
  };

  const login = (newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    saveToStorage('escapauy_isAuthenticated', true);
    saveToStorage('escapauy_user', newUser);

    if (newUser.role === 'admin') {
      window.location.href = '/admin/control-tower';
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    clearLocalState();
  };

  const hardReset = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) { }

    // Clear all storage
    Object.keys(localStorage)
      .filter(key => key.startsWith('escapauy_'))
      .forEach(key => localStorage.removeItem(key));

    // Legacy keys cleanup
    localStorage.removeItem('escapauy_debug_partner');

    clearLocalState();
    window.location.reload();
  };

  const setBigFiveScores = (scores: BigFiveScores) => {
    setBigFiveScoresState(scores);
    saveToStorage('escapauy_bigFiveScores', scores);
  };

  const updateIAInsights = async (insights: { scores?: BigFiveScores; duration?: number; companion?: string; analysis?: any }) => {
    if (!user) return;

    try {
      console.log('[IA_DEBUG] Updating insights in Supabase:', insights);

      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          bigFiveScores: insights.scores || user.bigFiveScores,
          trip_duration: insights.duration || user.trip_duration,
          companion_type: insights.companion || user.companion_type,
          ia_insight: insights.analysis || user.ia_insight
        }
      });

      if (authError) throw authError;

      // 2. Update Profiles Table (Optional but recommended for scale)
      await supabase
        .from('profiles')
        .update({
          bigFiveScores: insights.scores || user.bigFiveScores,
          trip_duration: insights.duration || user.trip_duration,
          companion_type: insights.companion || user.companion_type,
          ia_insight: insights.analysis || user.ia_insight,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // 3. Update Local State
      const updatedUser: User = {
        ...user,
        bigFiveScores: insights.scores || user.bigFiveScores,
        trip_duration: insights.duration || user.trip_duration,
        companion_type: insights.companion || user.companion_type,
        ia_insight: insights.analysis || user.ia_insight
      };

      setUser(updatedUser);
      saveToStorage('escapauy_user', updatedUser);

      console.log('[IA_DEBUG] Insights updated successfully');
    } catch (error) {
      console.error('[IA_DEBUG] Error updating insights:', error);
    }
  };

  const value: AppContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    hardReset,
    showAuthModal,
    setShowAuthModal,
    updateIAInsights,
    bigFiveScores,
    setBigFiveScores,
    weather,
    setWeather,
    travelGroup,
    setTravelGroup: (g) => { setTravelGroupState(g); saveToStorage('escapauy_travelGroup', g); },
    selectedHotel,
    setSelectedHotel: (h) => { setSelectedHotelState(h); saveToStorage('escapauy_selectedHotel', h); },
    arrivalTime,
    setArrivalTime: (t) => { setArrivalTimeState(t); saveToStorage('escapauy_arrivalTime', t); },
    numberOfNights,
    setNumberOfNights: (n) => { setNumberOfNightsState(n); saveToStorage('escapauy_numberOfNights', n); },
    numberOfAdults,
    setNumberOfAdults: (a) => { setNumberOfAdultsState(a); saveToStorage('escapauy_numberOfAdults', a); },
    numberOfChildren,
    setNumberOfChildren: (c) => { setNumberOfChildrenState(c); saveToStorage('escapauy_numberOfChildren', c); },
    childrenAges,
    setChildrenAges: (ag) => { setChildrenAgesState(ag); saveToStorage('escapauy_childrenAges', ag); },
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    itinerary,
    setItinerary,
    currentItineraryDay,
    setCurrentItineraryDay,
    kycData,
    setKycData,
    kycCompleted,
    setKycCompleted,
    isLoading,
    setIsLoading,
    isContextHydrated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
