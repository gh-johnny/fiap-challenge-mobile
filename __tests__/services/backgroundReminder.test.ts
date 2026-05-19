import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { BACKGROUND_REMINDER_TASK, registerBackgroundReminder } from '../../services/backgroundReminder';

const mockBgFetch = BackgroundFetch as jest.Mocked<typeof BackgroundFetch>;
const mockTaskManager = TaskManager as jest.Mocked<typeof TaskManager>;
const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

// Capture the task callback before any beforeEach resets clear mock.calls
let taskCallback: () => Promise<string>;
beforeAll(() => {
  const calls = (mockTaskManager.defineTask as jest.Mock).mock.calls;
  taskCallback = calls[calls.length - 1][1];
});

beforeEach(() => {
  jest.resetAllMocks();
  (mockBgFetch.getStatusAsync as jest.Mock).mockResolvedValue(
    BackgroundFetch.BackgroundFetchStatus.Available,
  );
  (mockTaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
  (mockBgFetch.registerTaskAsync as jest.Mock).mockResolvedValue(undefined);
  (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (mockNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif-id');
});

// ─── Task name ────────────────────────────────────────────────────────────────

describe('BACKGROUND_REMINDER_TASK', () => {
  it('has the expected task name', () => {
    expect(BACKGROUND_REMINDER_TASK).toBe('ford-service-reminder');
  });
});

// ─── registerBackgroundReminder ───────────────────────────────────────────────

describe('registerBackgroundReminder', () => {
  it('registers the task when permissions granted and not yet registered', async () => {
    await registerBackgroundReminder();
    expect(mockBgFetch.registerTaskAsync).toHaveBeenCalledWith(
      BACKGROUND_REMINDER_TASK,
      expect.objectContaining({ minimumInterval: expect.any(Number) }),
    );
  });

  it('uses stopOnTerminate=false and startOnBoot=true', async () => {
    await registerBackgroundReminder();
    expect(mockBgFetch.registerTaskAsync).toHaveBeenCalledWith(
      BACKGROUND_REMINDER_TASK,
      expect.objectContaining({ stopOnTerminate: false, startOnBoot: true }),
    );
  });

  it('does NOT register when notification permission is denied', async () => {
    (mockNotifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    await registerBackgroundReminder();
    expect(mockBgFetch.registerTaskAsync).not.toHaveBeenCalled();
  });

  it('does NOT register when background fetch is restricted', async () => {
    (mockBgFetch.getStatusAsync as jest.Mock).mockResolvedValueOnce(
      BackgroundFetch.BackgroundFetchStatus.Restricted,
    );
    await registerBackgroundReminder();
    expect(mockBgFetch.registerTaskAsync).not.toHaveBeenCalled();
  });

  it('does NOT register when background fetch is denied', async () => {
    (mockBgFetch.getStatusAsync as jest.Mock).mockResolvedValueOnce(
      BackgroundFetch.BackgroundFetchStatus.Denied,
    );
    await registerBackgroundReminder();
    expect(mockBgFetch.registerTaskAsync).not.toHaveBeenCalled();
  });

  it('does NOT register when task is already registered', async () => {
    (mockTaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValueOnce(true);
    await registerBackgroundReminder();
    expect(mockBgFetch.registerTaskAsync).not.toHaveBeenCalled();
  });

  it('checks the correct task name for registration', async () => {
    await registerBackgroundReminder();
    expect(mockTaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(BACKGROUND_REMINDER_TASK);
  });

  it('sets minimum interval to 12 hours', async () => {
    await registerBackgroundReminder();
    const call = (mockBgFetch.registerTaskAsync as jest.Mock).mock.calls[0][1];
    expect(call.minimumInterval).toBe(60 * 60 * 12);
  });
});

// ─── Task definition ──────────────────────────────────────────────────────────

describe('TaskManager.defineTask', () => {
  it('defineTask is called with the correct task name on module load', () => {
    jest.isolateModules(() => {
      const tm = require('expo-task-manager');
      require('../../services/backgroundReminder');
      expect(tm.defineTask).toHaveBeenCalledWith(
        BACKGROUND_REMINDER_TASK,
        expect.any(Function),
      );
    });
  });
});

// ─── Task callback execution ──────────────────────────────────────────────────

function makeFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

describe('task callback — no upcoming appointments', () => {
  it('returns NoData when store has no upcoming appointments', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({ appointments: [] });

    const result = await taskCallback();
    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
  });

  it('returns NoData when all appointments are completed/cancelled', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'Oil Change', date: makeFutureDate(1), time: '10:00', dealer: 'Ford', status: 'completed' },
        { id: '2', type: 'Oil Change', date: makeFutureDate(1), time: '10:00', dealer: 'Ford', status: 'cancelled' },
      ],
    });

    
    const result = await taskCallback();
    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
  });

  it('returns NoData when upcoming appointment is outside 3-day window', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'Oil Change', date: makeFutureDate(5), time: '10:00', dealer: 'Ford', status: 'upcoming' },
      ],
    });

    
    const result = await taskCallback();
    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
  });
});

describe('task callback — with upcoming appointments', () => {
  it('returns NewData and schedules notifications for upcoming appointments in window', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'Oil Change', date: makeFutureDate(1), time: '09:00', dealer: 'Ford Morumbi', status: 'upcoming' },
        { id: '2', type: 'Tire Rotation', date: makeFutureDate(2), time: '11:00', dealer: 'Ford Morumbi', status: 'upcoming' },
      ],
    });

    
    const result = await taskCallback();
    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
    expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('notification body includes appointment type and dealer', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'Brake Inspection', date: makeFutureDate(1), time: '14:00', dealer: 'Ford Santo André', status: 'upcoming' },
      ],
    });

    
    await taskCallback();
    const callArg = (mockNotifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(callArg.content.body).toContain('Brake Inspection');
    expect(callArg.content.body).toContain('Ford Santo André');
  });

  it('notification uses trigger: null (immediate)', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'General Check', date: makeFutureDate(1), time: '10:00', dealer: 'Ford Morumbi', status: 'upcoming' },
      ],
    });

    
    await taskCallback();
    const callArg = (mockNotifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(callArg.trigger).toBeNull();
  });

  it('uses singular "day" for 1 day ahead', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'Oil Change', date: makeFutureDate(1), time: '10:00', dealer: 'Ford', status: 'upcoming' },
      ],
    });

    
    await taskCallback();
    const callArg = (mockNotifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(callArg.content.body).toMatch(/1 day[^s]/);
  });
});

describe('task callback — error handling', () => {
  it('returns Failed when notification scheduling throws', async () => {
    const { useServiceStore } = require('../../store/service');
    useServiceStore.setState({
      appointments: [
        { id: '1', type: 'Oil Change', date: makeFutureDate(1), time: '10:00', dealer: 'Ford', status: 'upcoming' },
      ],
    });
    (mockNotifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(new Error('perm denied'));

    
    const result = await taskCallback();
    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
  });
});
