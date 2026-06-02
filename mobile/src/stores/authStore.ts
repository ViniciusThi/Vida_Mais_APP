import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  needsFaceSetup: boolean;
  loadToken: () => Promise<void>;
  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setNeedsFaceSetup: (val: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  needsFaceSetup: false,
  
  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      const needsFaceSetupStr = await SecureStore.getItemAsync('needsFaceSetup');
      const user = userStr ? JSON.parse(userStr) : null;
      const needsFaceSetup = needsFaceSetupStr === 'true';
      if (token) setAuthToken(token);
      set({ token, user, needsFaceSetup });
    } catch (error) {
      console.error('Error loading token:', error);
    }
  },
  
  setAuth: async (token: string, user: User) => {
    try {
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ token, user });
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },
  
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('needsFaceSetup');
      set({ token: null, user: null, needsFaceSetup: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  setNeedsFaceSetup: async (val: boolean) => {
    try {
      await SecureStore.setItemAsync('needsFaceSetup', val ? 'true' : 'false');
    } catch { /* silencioso — estado em memória ainda funciona */ }
    set({ needsFaceSetup: val });
  },
}));

