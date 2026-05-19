import * as SecureStore from 'expo-secure-store';
import { secureStorage } from '../../storage/secureStorage';

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.resetAllMocks();
  mockSecureStore.getItemAsync.mockResolvedValue(null);
  mockSecureStore.setItemAsync.mockResolvedValue(undefined);
  mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);
});

describe('secureStorage.getItem', () => {
  it('delegates to SecureStore.getItemAsync', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('{"user":"test"}');
    const result = await secureStorage.getItem('ford-auth');
    expect(result).toBe('{"user":"test"}');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('ford-auth');
  });

  it('returns null when key not found', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    const result = await secureStorage.getItem('missing-key');
    expect(result).toBeNull();
  });

  it('sanitizes special characters in key', async () => {
    await secureStorage.getItem('key with spaces!');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('key_with_spaces_');
  });
});

describe('secureStorage.setItem', () => {
  it('delegates to SecureStore.setItemAsync', async () => {
    await secureStorage.setItem('ford-auth', '{"user":"jo"}');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('ford-auth', '{"user":"jo"}');
  });

  it('sanitizes key before storing', async () => {
    await secureStorage.setItem('ford/auth#1', 'value');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('ford_auth_1', 'value');
  });

  it('stores the exact value string unchanged', async () => {
    const json = JSON.stringify({ user: { name: 'Test', email: 't@ford.com' }, isAuthenticated: true });
    await secureStorage.setItem('ford-auth', json);
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('ford-auth', json);
  });
});

describe('secureStorage.removeItem', () => {
  it('delegates to SecureStore.deleteItemAsync', async () => {
    await secureStorage.removeItem('ford-auth');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('ford-auth');
  });

  it('sanitizes key before deleting', async () => {
    await secureStorage.removeItem('ford.auth');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('ford_auth');
  });
});

describe('secureStorage — key sanitization', () => {
  it('preserves alphanumeric characters', async () => {
    await secureStorage.getItem('fordAuth123');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('fordAuth123');
  });

  it('preserves hyphens and underscores', async () => {
    await secureStorage.getItem('ford-auth_store');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('ford-auth_store');
  });

  it('replaces spaces with underscores', async () => {
    await secureStorage.getItem('ford auth');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('ford_auth');
  });
});

describe('auth store — uses secureStorage', () => {
  it('auth store persist config uses ford-auth key', () => {
    const { useAuthStore } = require('../../store/auth');
    expect(useAuthStore.persist.getOptions().name).toBe('ford-auth');
  });

  it('auth store writes to SecureStore when state changes', async () => {
    const { useAuthStore } = require('../../store/auth');
    mockSecureStore.setItemAsync.mockClear();
    useAuthStore.getState().login({ name: 'Test', email: 'test@ford.com' });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('ford-auth', expect.any(String));
  });
});
