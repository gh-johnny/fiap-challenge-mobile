import { act } from 'react';
import { useAuthStore } from '../../store/auth';

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    vehicle: null,
    isAuthenticated: false,
    hasOnboarded: false,
  });
});

describe('auth store — initial state', () => {
  it('user is null', () => expect(useAuthStore.getState().user).toBeNull());
  it('vehicle is null', () => expect(useAuthStore.getState().vehicle).toBeNull());
  it('isAuthenticated is false', () => expect(useAuthStore.getState().isAuthenticated).toBe(false));
  it('hasOnboarded is false', () => expect(useAuthStore.getState().hasOnboarded).toBe(false));
});

describe('auth store — login()', () => {
  const user = { name: 'João Silva', email: 'joao@ford.com' };

  beforeEach(() => act(() => { useAuthStore.getState().login(user); }));

  it('sets user', () => expect(useAuthStore.getState().user).toEqual(user));
  it('sets isAuthenticated to true', () => expect(useAuthStore.getState().isAuthenticated).toBe(true));
  it('does not touch vehicle', () => expect(useAuthStore.getState().vehicle).toBeNull());
  it('does not touch hasOnboarded', () => expect(useAuthStore.getState().hasOnboarded).toBe(false));
});

describe('auth store — signup()', () => {
  const user = { name: 'Maria Costa', email: 'maria@email.com' };

  beforeEach(() => act(() => { useAuthStore.getState().signup(user); }));

  it('sets user', () => expect(useAuthStore.getState().user).toEqual(user));
  it('sets isAuthenticated to true', () => expect(useAuthStore.getState().isAuthenticated).toBe(true));
  it('does not set vehicle', () => expect(useAuthStore.getState().vehicle).toBeNull());
});

describe('auth store — setVehicle()', () => {
  const vehicle = { model: 'Ranger', year: '2023', plate: 'ABC1D23' };

  beforeEach(() => act(() => { useAuthStore.getState().setVehicle(vehicle); }));

  it('sets vehicle', () => expect(useAuthStore.getState().vehicle).toEqual(vehicle));
  it('does not change isAuthenticated', () => expect(useAuthStore.getState().isAuthenticated).toBe(false));
});

describe('auth store — completeOnboarding()', () => {
  beforeEach(() => act(() => { useAuthStore.getState().completeOnboarding(); }));

  it('sets hasOnboarded to true', () => expect(useAuthStore.getState().hasOnboarded).toBe(true));
});

describe('auth store — logout()', () => {
  beforeEach(() => act(() => {
    useAuthStore.getState().login({ name: 'Test', email: 't@t.com' });
    useAuthStore.getState().setVehicle({ model: 'Ka', year: '2020', plate: 'XYZ0000' });
    useAuthStore.getState().completeOnboarding();
    useAuthStore.getState().logout();
  }));

  it('clears user', () => expect(useAuthStore.getState().user).toBeNull());
  it('clears vehicle', () => expect(useAuthStore.getState().vehicle).toBeNull());
  it('sets isAuthenticated to false', () => expect(useAuthStore.getState().isAuthenticated).toBe(false));
  it('sets hasOnboarded to false', () => expect(useAuthStore.getState().hasOnboarded).toBe(false));
});

describe('auth store — full flow', () => {
  it('login → setVehicle → completeOnboarding → logout resets everything', () => {
    const { login, setVehicle, completeOnboarding, logout } = useAuthStore.getState();
    act(() => {
      login({ name: 'Driver', email: 'd@ford.com' });
      setVehicle({ model: 'Mustang', year: '2024', plate: 'MUS0001' });
      completeOnboarding();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().hasOnboarded).toBe(true);

    act(() => logout());

    const { user, vehicle, isAuthenticated, hasOnboarded } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(vehicle).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(hasOnboarded).toBe(false);
  });
});
