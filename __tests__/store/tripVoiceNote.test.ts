import { act } from '@testing-library/react-native';
import { buildTrip, useTripStore } from '../../store/trip';

beforeEach(() => {
  act(() => useTripStore.setState({ trips: [] }));
});

describe('useTripStore — setVoiceNote', () => {
  it('attaches a voice note URI to a trip', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    const id = useTripStore.getState().trips[0].id;
    act(() => {
      useTripStore.getState().setVoiceNote(id, 'file://note.m4a');
    });
    expect(useTripStore.getState().trips[0].voiceNoteUri).toBe('file://note.m4a');
  });

  it('clears voice note when URI is undefined', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    const id = useTripStore.getState().trips[0].id;
    act(() => { useTripStore.getState().setVoiceNote(id, 'file://note.m4a'); });
    act(() => { useTripStore.getState().setVoiceNote(id, undefined); });
    expect(useTripStore.getState().trips[0].voiceNoteUri).toBeUndefined();
  });

  it('does not affect other trips', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
      useTripStore.getState().addTrip(buildTrip(100, 200, 'Gasoline'));
    });
    const id = useTripStore.getState().trips[0].id;
    act(() => { useTripStore.getState().setVoiceNote(id, 'file://note.m4a'); });
    expect(useTripStore.getState().trips[1].voiceNoteUri).toBeUndefined();
  });

  it('is a no-op for non-existent trip id', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    expect(() => {
      act(() => { useTripStore.getState().setVoiceNote('nonexistent', 'file://note.m4a'); });
    }).not.toThrow();
    expect(useTripStore.getState().trips[0].voiceNoteUri).toBeUndefined();
  });

  it('voiceNoteUri defaults to undefined on new trip', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 50, 'Ethanol'));
    });
    expect(useTripStore.getState().trips[0].voiceNoteUri).toBeUndefined();
  });

  it('partialize still includes trips with voiceNoteUri', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    const id = useTripStore.getState().trips[0].id;
    act(() => { useTripStore.getState().setVoiceNote(id, 'file://note.m4a'); });

    const partialize = useTripStore.persist.getOptions().partialize!;
    const sliced = partialize(useTripStore.getState());
    expect(sliced.trips[0].voiceNoteUri).toBe('file://note.m4a');
  });
});
