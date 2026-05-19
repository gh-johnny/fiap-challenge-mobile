import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { useServiceStore } from '@/store/service';

export const BACKGROUND_REMINDER_TASK = 'ford-service-reminder';
const DAYS_AHEAD = 3;

function getUpcomingAppointments() {
  const { appointments } = useServiceStore.getState();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() + DAYS_AHEAD);

  return appointments.filter((a) => {
    if (a.status !== 'upcoming') return false;
    const apptDate = new Date(a.date);
    return apptDate >= now && apptDate <= cutoff;
  });
}

TaskManager.defineTask(BACKGROUND_REMINDER_TASK, async () => {
  try {
    const upcoming = getUpcomingAppointments();
    if (upcoming.length === 0) return BackgroundFetch.BackgroundFetchResult.NoData;

    for (const appt of upcoming) {
      const daysLeft = Math.ceil(
        (new Date(appt.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔧 Upcoming Ford Service',
          body: `${appt.type} at ${appt.dealer} in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${appt.date} ${appt.time})`,
          data: { appointmentId: appt.id },
        },
        trigger: null, // immediate
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundReminder(): Promise<void> {
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_REMINDER_TASK);
  if (isRegistered) return;

  await BackgroundFetch.registerTaskAsync(BACKGROUND_REMINDER_TASK, {
    minimumInterval: 60 * 60 * 12, // every 12 hours
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
