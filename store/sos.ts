import { create } from 'zustand';

interface SosState {
  isAssistModeOn: boolean;
  emergencyContact: string | null;
  persistentNotifId: string | null;
  toggleAssistMode: () => void;
  setEmergencyContact: (phone: string) => void;
  setPersistentNotifId: (id: string | null) => void;
}

export const useSosStore = create<SosState>((set) => ({
  isAssistModeOn: false,
  emergencyContact: null,
  persistentNotifId: null,
  toggleAssistMode: () => set((s) => ({ isAssistModeOn: !s.isAssistModeOn })),
  setEmergencyContact: (phone) => set({ emergencyContact: phone }),
  setPersistentNotifId: (id) => set({ persistentNotifId: id }),
}));
