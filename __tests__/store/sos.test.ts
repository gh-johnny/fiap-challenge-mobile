import { act } from 'react';
import { useSosStore } from '../../store/sos';

beforeEach(() => {
  useSosStore.setState({
    isAssistModeOn: false,
    emergencyContact: null,
    persistentNotifId: null,
  });
});

describe('sos store — initial state', () => {
  it('isAssistModeOn is false', () => expect(useSosStore.getState().isAssistModeOn).toBe(false));
  it('emergencyContact is null', () => expect(useSosStore.getState().emergencyContact).toBeNull());
  it('persistentNotifId is null', () => expect(useSosStore.getState().persistentNotifId).toBeNull());
});

describe('sos store — toggleAssistMode()', () => {
  it('toggles false → true', () => {
    act(() => useSosStore.getState().toggleAssistMode());
    expect(useSosStore.getState().isAssistModeOn).toBe(true);
  });

  it('toggles true → false', () => {
    act(() => {
      useSosStore.getState().toggleAssistMode();
      useSosStore.getState().toggleAssistMode();
    });
    expect(useSosStore.getState().isAssistModeOn).toBe(false);
  });

  it('toggling 3 times ends on true', () => {
    act(() => {
      useSosStore.getState().toggleAssistMode();
      useSosStore.getState().toggleAssistMode();
      useSosStore.getState().toggleAssistMode();
    });
    expect(useSosStore.getState().isAssistModeOn).toBe(true);
  });

  it('does not change emergencyContact', () => {
    act(() => {
      useSosStore.getState().setEmergencyContact('+55 11 99999-9999');
      useSosStore.getState().toggleAssistMode();
    });
    expect(useSosStore.getState().emergencyContact).toBe('+55 11 99999-9999');
  });
});

describe('sos store — setEmergencyContact()', () => {
  it('sets a phone number', () => {
    act(() => useSosStore.getState().setEmergencyContact('11999998888'));
    expect(useSosStore.getState().emergencyContact).toBe('11999998888');
  });

  it('overwrites previous contact', () => {
    act(() => {
      useSosStore.getState().setEmergencyContact('111');
      useSosStore.getState().setEmergencyContact('222');
    });
    expect(useSosStore.getState().emergencyContact).toBe('222');
  });

  it('accepts international numbers', () => {
    act(() => useSosStore.getState().setEmergencyContact('+1-800-555-0000'));
    expect(useSosStore.getState().emergencyContact).toBe('+1-800-555-0000');
  });
});

describe('sos store — setPersistentNotifId()', () => {
  it('sets a notification id', () => {
    act(() => useSosStore.getState().setPersistentNotifId('abc-123'));
    expect(useSosStore.getState().persistentNotifId).toBe('abc-123');
  });

  it('clears by setting null', () => {
    act(() => {
      useSosStore.getState().setPersistentNotifId('abc-123');
      useSosStore.getState().setPersistentNotifId(null);
    });
    expect(useSosStore.getState().persistentNotifId).toBeNull();
  });

  it('overwrites previous id', () => {
    act(() => {
      useSosStore.getState().setPersistentNotifId('old-id');
      useSosStore.getState().setPersistentNotifId('new-id');
    });
    expect(useSosStore.getState().persistentNotifId).toBe('new-id');
  });
});
