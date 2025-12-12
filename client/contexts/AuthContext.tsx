import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import type { User } from '@shared/schema';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type AuthUser = Omit<User, 'password'>;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  loginWithApple: (identityToken: string, fullName?: { givenName?: string; familyName?: string } | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL('/api/auth/me', baseUrl).toString(), {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      registerForPushNotifications();
    }
  }, [user]);

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'web') return;
    if (!Device.isDevice) return;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('Push notifications require EAS projectId - skipping in Expo Go');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const pushToken = tokenData.data;
      
      await apiRequest('POST', '/api/push-token', { pushToken });
      console.log('Push token registered:', pushToken);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFCC00',
        });
      }
    } catch (error) {
      console.log('Push notification setup skipped:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const userData = await response.json();
    setUser(userData);
  };

  const register = async (email: string, password: string, name: string, role?: string) => {
    const response = await apiRequest('POST', '/api/auth/register', { 
      email, 
      password, 
      name,
      role: role || 'renter',
    });
    const userData = await response.json();
    setUser(userData);
  };

  const loginWithGoogle = async (accessToken: string) => {
    const response = await apiRequest('POST', '/api/auth/google', { accessToken });
    const userData = await response.json();
    setUser(userData);
  };

  const loginWithApple = async (identityToken: string, fullName?: { givenName?: string; familyName?: string } | null) => {
    const response = await apiRequest('POST', '/api/auth/apple', { 
      identityToken,
      fullName: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : undefined,
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = async () => {
    await apiRequest('POST', '/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, loginWithApple, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
