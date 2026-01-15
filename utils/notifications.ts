import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default-v2', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: "notification_sound_1", // Remove .wav extension
    });
  }

  return token;
}

export async function scheduleRecurringReminder(
  title: string,
  body: string,
  minutes: number
): Promise<string> {
  // Expo notifications 'interval' trigger needs at least 60 seconds
  const seconds = Math.max(60, minutes * 60);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: false, // On Android 8.0+, sound is handled by the channel.
      // @ts-ignore
      channelId: "default-v2", // Ensure this matches the channel created above
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: true,
    },
  });

  return identifier;
}

export async function cancelReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
