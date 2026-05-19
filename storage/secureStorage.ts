import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

// SecureStore keys must be alphanumeric + hyphens, max 255 chars
function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9-_]/g, '_');
}

export const secureStorage: StateStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(sanitizeKey(key));
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(sanitizeKey(key), value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(sanitizeKey(key));
  },
};
