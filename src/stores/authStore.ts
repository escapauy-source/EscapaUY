import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  nationality?: string;
  country?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setGuestData: (data: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call - replace with actual Supabase auth
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          const mockUser: User = {
            id: 'user_' + Date.now(),
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          };
          
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: 'Error al iniciar sesión', isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call - replace with actual Supabase auth
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: 'user_' + Date.now(),
            email,
            name,
            createdAt: new Date().toISOString()
          };
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: 'Error al registrarse', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...data };
            set({ user: updatedUser, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Error al actualizar perfil', isLoading: false });
          throw error;
        }
      },

      setGuestData: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        } else {
          set({ 
            user: { 
              id: 'guest_' + Date.now(),
              email: data.email || '',
              name: data.name || 'Invitado',
              createdAt: new Date().toISOString(),
              ...data 
            } 
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
