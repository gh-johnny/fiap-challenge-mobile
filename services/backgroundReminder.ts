import * as BackgroundTask from 'expo-background-task';
import { BackgroundTaskResult, BackgroundTaskStatus } from 'expo-background-task';
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

    return BackgroundTaskResult.Success;
  } catch {
    return BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundReminder(): Promise<void> {
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTaskStatus.Restricted) return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_REMINDER_TASK);
  if (isRegistered) return;

  await BackgroundTask.registerTaskAsync(BACKGROUND_REMINDER_TASK, {
    minimumInterval: 12 * 60, // every 12 hours (in minutes)
  });
}
