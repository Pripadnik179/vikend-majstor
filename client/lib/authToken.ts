import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'vikend_majstor_auth_token';

let memoryToken: string | null = null;

export async function saveAuthToken(token: string): Promise<void> {
  memoryToken = token;
  
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (e) {
      console.log('localStorage not available');
    }
  } else {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (e) {
      console.log('SecureStore not available, using memory');
    }
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  
  if (Platform.OS === 'web') {
    try {
      memoryToken = localStorage.getItem(AUTH_TOKEN_KEY);
      return memoryToken;
    } catch (e) {
      return null;
    }
  } else {
    try {
      memoryToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      return memoryToken;
    } catch (e) {
      return null;
    }
  }
}

export async function clearAuthToken(): Promise<void> {
  memoryToken = null;
  
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {
      // ignore
    }
  } else {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (e) {
      // ignore
    }
  }
}

export function getAuthTokenSync(): string | null {
  return memoryToken;
}
