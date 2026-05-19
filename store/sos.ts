import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SosState {
  isAssistModeOn: boolean;
  emergencyContact: string | null;
  persistentNotifId: string | null;
  toggleAssistMode: () => void;
  setEmergencyContact: (phone: string) => void;
  setPersistentNotifId: (id: string | null) => void;
}

export const useSosStore = create<SosState>()(
  persist(
    (set) => ({
      isAssistModeOn: false,
      emergencyContact: null,
      persistentNotifId: null,
      toggleAssistMode: () => set((s) => ({ isAssistModeOn: !s.isAssistModeOn })),
      setEmergencyContact: (phone) => set({ emergencyContact: phone }),
      setPersistentNotifId: (id) => set({ persistentNotifId: id }),
    }),
    {
      name: 'ford-sos',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the emergency contact — runtime state resets on restart
      partialize: (s) => ({ emergencyContact: s.emergencyContact }),
    },
  ),
);
