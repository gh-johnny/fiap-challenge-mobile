import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/storage/secureStorage';

export interface User {
  name: string;
  email: string;
}

export interface Vehicle {
  model: string;
  year: string;
  plate: string;
}

interface AuthState {
  user: User | null;
  vehicle: Vehicle | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;

  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
  setVehicle: (vehicle: Vehicle) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      vehicle: null,
      isAuthenticated: false,
      hasOnboarded: false,

      login: (user) => set({ user, isAuthenticated: true }),
      signup: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, vehicle: null, isAuthenticated: false, hasOnboarded: false }),
      setVehicle: (vehicle) => set({ vehicle }),
      completeOnboarding: () => set({ hasOnboarded: true }),
    }),
    {
      name: 'ford-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (s) => ({
        user: s.user,
        vehicle: s.vehicle,
      }),
    },
  ),
);
