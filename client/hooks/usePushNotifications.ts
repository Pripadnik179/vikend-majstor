import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiRequest } from '@/lib/query-client';

// Dynamic import to avoid Expo Go SDK 53+ console errors
let Notifications: typeof import('expo-notifications') | null = null;

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  useEffect(() => {
    // Early exit: Check for EAS projectId BEFORE any imports to avoid Expo Go SDK 53+ errors
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    // Skip entirely if no projectId (Expo Go) or web platform or not physical device
    if (!projectId || Platform.OS === 'web' || !Device.isDevice) {
      return;
    }

    let isMounted = true;

    const setupNotifications = async () => {
      try {
        Notifications = await import('expo-notifications');
        if (!isMounted || !Notifications) return;
        
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const token = await registerForPushNotificationsAsync();
        if (token && isMounted) {
          setExpoPushToken(token);
          savePushTokenToServer(token);
        }

        if (isMounted && Notifications) {
          notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
            setNotification(notif);
          });

          responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            console.log('Notification tapped:', data);
          });
        }
      } catch {
        // Silent catch - notifications not available
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
}

async function savePushTokenToServer(pushToken: string) {
  try {
    await apiRequest('POST', '/api/push-token', { pushToken });
    console.log('Push token saved to server');
  } catch (error) {
    console.error('Failed to save push token:', error);
  }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) return null;
  
  let token: string | null = null;

  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    token = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFCC00',
      });
    }
  } catch {
    // Silent catch - push notifications may not be available
  }

  return token;
}
