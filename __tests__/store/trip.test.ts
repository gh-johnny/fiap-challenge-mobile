import { act } from '@testing-library/react-native';
import {
  buildTrip,
  CONSUMPTION_ESTIMATES,
  useTripStore,
} from '../../store/trip';

beforeEach(() => {
  act(() => useTripStore.setState({ trips: [] }));
});

// ─── buildTrip ────────────────────────────────────────────────────────────────

describe('buildTrip', () => {
  it('calculates distance from kmStart and kmEnd', () => {
    const trip = buildTrip(42000, 42150, 'Flex');
    expect(trip.distanceKm).toBe(150);
  });

  it('assigns correct consumption estimate for Gasoline', () => {
    const trip = buildTrip(0, 100, 'Gasoline');
    expect(trip.consumptionL100km).toBe(CONSUMPTION_ESTIMATES.Gasoline);
  });

  it('assigns correct consumption estimate for Ethanol', () => {
    const trip = buildTrip(0, 100, 'Ethanol');
    expect(trip.consumptionL100km).toBe(CONSUMPTION_ESTIMATES.Ethanol);
  });

  it('assigns correct consumption estimate for Flex', () => {
    const trip = buildTrip(0, 100, 'Flex');
    expect(trip.consumptionL100km).toBe(CONSUMPTION_ESTIMATES.Flex);
  });

  it('returns 0 distance when kmEnd <= kmStart', () => {
    const trip = buildTrip(42000, 41999, 'Gasoline');
    expect(trip.distanceKm).toBe(0);
  });

  it('returns 0 distance when kmEnd equals kmStart', () => {
    const trip = buildTrip(42000, 42000, 'Ethanol');
    expect(trip.distanceKm).toBe(0);
  });

  it('preserves kmStart and kmEnd', () => {
    const trip = buildTrip(1000, 1250, 'Flex');
    expect(trip.kmStart).toBe(1000);
    expect(trip.kmEnd).toBe(1250);
    expect(trip.fuelType).toBe('Flex');
  });
});

// ─── CONSUMPTION_ESTIMATES ────────────────────────────────────────────────────

describe('CONSUMPTION_ESTIMATES', () => {
  it('Ethanol is higher than Gasoline (less efficient)', () => {
    expect(CONSUMPTION_ESTIMATES.Ethanol).toBeGreaterThan(CONSUMPTION_ESTIMATES.Gasoline);
  });

  it('Flex is between Gasoline and Ethanol', () => {
    expect(CONSUMPTION_ESTIMATES.Flex).toBeGreaterThan(CONSUMPTION_ESTIMATES.Gasoline);
    expect(CONSUMPTION_ESTIMATES.Flex).toBeLessThan(CONSUMPTION_ESTIMATES.Ethanol);
  });

  it('all estimates are positive numbers', () => {
    Object.values(CONSUMPTION_ESTIMATES).forEach((v) => {
      expect(v).toBeGreaterThan(0);
    });
  });
});

// ─── useTripStore ─────────────────────────────────────────────────────────────

describe('useTripStore — addTrip', () => {
  it('starts empty', () => {
    expect(useTripStore.getState().trips).toHaveLength(0);
  });

  it('adds a trip', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(42000, 42150, 'Flex'));
    });
    expect(useTripStore.getState().trips).toHaveLength(1);
  });

  it('assigns a unique id to each trip', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(1000, 1100, 'Gasoline'));
      useTripStore.getState().addTrip(buildTrip(1100, 1200, 'Gasoline'));
    });
    const [a, b] = useTripStore.getState().trips;
    expect(a.id).not.toBe(b.id);
  });

  it('assigns today ISO date to trip', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    const today = new Date().toISOString().split('T')[0];
    expect(useTripStore.getState().trips[0].date).toBe(today);
  });

  it('prepends new trips (most recent first)', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 50, 'Flex'));
      useTripStore.getState().addTrip(buildTrip(50, 150, 'Gasoline'));
    });
    expect(useTripStore.getState().trips[0].distanceKm).toBe(100);
  });
});

describe('useTripStore — deleteTrip', () => {
  it('removes the trip with matching id', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    const id = useTripStore.getState().trips[0].id;
    act(() => { useTripStore.getState().deleteTrip(id); });
    expect(useTripStore.getState().trips).toHaveLength(0);
  });

  it('does not affect other trips', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
      useTripStore.getState().addTrip(buildTrip(100, 200, 'Gasoline'));
    });
    const idToDelete = useTripStore.getState().trips[0].id;
    act(() => { useTripStore.getState().deleteTrip(idToDelete); });
    expect(useTripStore.getState().trips).toHaveLength(1);
  });

  it('is a no-op for non-existent id', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
    });
    act(() => { useTripStore.getState().deleteTrip('nonexistent'); });
    expect(useTripStore.getState().trips).toHaveLength(1);
  });
});

describe('useTripStore — clearTrips', () => {
  it('removes all trips', () => {
    act(() => {
      useTripStore.getState().addTrip(buildTrip(0, 100, 'Flex'));
      useTripStore.getState().addTrip(buildTrip(100, 200, 'Gasoline'));
    });
    act(() => { useTripStore.getState().clearTrips(); });
    expect(useTripStore.getState().trips).toHaveLength(0);
  });
});

describe('useTripStore — persist config', () => {
  it('has persist API', () => {
    expect(useTripStore.persist).toBeDefined();
  });

  it('uses storage key ford-trips', () => {
    expect(useTripStore.persist.getOptions().name).toBe('ford-trips');
  });

  it('partialize includes trips only', () => {
    const partialize = useTripStore.persist.getOptions().partialize!;
    const sliced = partialize(useTripStore.getState());
    expect(sliced).toHaveProperty('trips');
    expect(sliced).not.toHaveProperty('addTrip');
    expect(sliced).not.toHaveProperty('deleteTrip');
    expect(sliced).not.toHaveProperty('clearTrips');
  });
});
