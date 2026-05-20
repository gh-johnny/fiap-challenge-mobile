import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/auth';
import { useServiceStore } from '../../store/service';
import { useSosStore } from '../../store/sos';

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

// ── Auth persist config ───────────────────────────────────────────────────────

describe('auth store — persist config', () => {
  it('has persist api', () => {
    expect(useAuthStore.persist).toBeDefined();
  });

  it('uses storage key ford-auth', () => {
    expect(useAuthStore.persist.getOptions().name).toBe('ford-auth');
  });

  it('partialize includes user and vehicle but not session flags', () => {
    const fullState = useAuthStore.getState();
    const partialize = useAuthStore.persist.getOptions().partialize!;
    const sliced = partialize(fullState);
    expect(sliced).toHaveProperty('user');
    expect(sliced).toHaveProperty('vehicle');
    expect(sliced).not.toHaveProperty('isAuthenticated');
    expect(sliced).not.toHaveProperty('hasOnboarded');
  });

  it('partialize excludes action functions', () => {
    const fullState = useAuthStore.getState();
    const partialize = useAuthStore.persist.getOptions().partialize!;
    const sliced = partialize(fullState);
    expect(sliced).not.toHaveProperty('login');
    expect(sliced).not.toHaveProperty('logout');
    expect(sliced).not.toHaveProperty('signup');
    expect(sliced).not.toHaveProperty('setVehicle');
    expect(sliced).not.toHaveProperty('completeOnboarding');
  });

  it('writes to SecureStore when state changes', async () => {
    mockSecureStore.setItemAsync.mockClear();
    useAuthStore.getState().login({ name: 'Test', email: 'test@ford.com' });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('ford-auth', expect.any(String));
  });

  it('saved payload contains state wrapper', async () => {
    mockSecureStore.setItemAsync.mockClear();
    useAuthStore.getState().setVehicle({ model: 'Ranger', year: '2024', plate: 'ABC1D23' });
    await new Promise((r) => setTimeout(r, 50));
    const raw = (mockSecureStore.setItemAsync as jest.Mock).mock.calls.at(-1)?.[1];
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveProperty('state');
    expect(parsed).toHaveProperty('version');
  });
});

// ── Service persist config ────────────────────────────────────────────────────

describe('service store — persist config', () => {
  it('has persist api', () => {
    expect(useServiceStore.persist).toBeDefined();
  });

  it('uses storage key ford-service', () => {
    expect(useServiceStore.persist.getOptions().name).toBe('ford-service');
  });

  it('partialize includes appointments only', () => {
    const fullState = useServiceStore.getState();
    const partialize = useServiceStore.persist.getOptions().partialize!;
    const sliced = partialize(fullState);
    expect(sliced).toHaveProperty('appointments');
    expect(sliced).not.toHaveProperty('addAppointment');
    expect(sliced).not.toHaveProperty('cancelAppointment');
  });

  it('writes to AsyncStorage when appointment is added', async () => {
    mockStorage.setItem.mockClear();
    useServiceStore.getState().addAppointment({
      type: 'Battery Check',
      date: '2026-08-01',
      time: '09:00',
      dealer: 'Ford Morumbi',
      status: 'upcoming',
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockStorage.setItem).toHaveBeenCalledWith('ford-service', expect.any(String));
  });
});

// ── SOS persist config ────────────────────────────────────────────────────────

describe('sos store — persist config', () => {
  it('has persist api', () => {
    expect(useSosStore.persist).toBeDefined();
  });

  it('uses storage key ford-sos', () => {
    expect(useSosStore.persist.getOptions().name).toBe('ford-sos');
  });

  it('partialize includes only emergencyContact', () => {
    const fullState = useSosStore.getState();
    const partialize = useSosStore.persist.getOptions().partialize!;
    const sliced = partialize(fullState);
    expect(sliced).toHaveProperty('emergencyContact');
    expect(sliced).not.toHaveProperty('isAssistModeOn');
    expect(sliced).not.toHaveProperty('persistentNotifId');
    expect(sliced).not.toHaveProperty('toggleAssistMode');
    expect(sliced).not.toHaveProperty('setEmergencyContact');
  });

  it('writes to AsyncStorage when emergencyContact is set', async () => {
    mockStorage.setItem.mockClear();
    useSosStore.getState().setEmergencyContact('(11) 99999-0000');
    await new Promise((r) => setTimeout(r, 50));
    expect(mockStorage.setItem).toHaveBeenCalledWith('ford-sos', expect.any(String));
  });
});
