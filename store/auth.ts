import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  vehicle: null,
  isAuthenticated: false,
  hasOnboarded: false,

  login: (user) => set({ user, isAuthenticated: true }),
  signup: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, vehicle: null, isAuthenticated: false, hasOnboarded: false }),
  setVehicle: (vehicle) => set({ vehicle }),
  completeOnboarding: () => set({ hasOnboarded: true }),
}));
