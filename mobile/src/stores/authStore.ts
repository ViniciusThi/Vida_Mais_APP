import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
  setNeedsFaceSetup: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  needsFaceSetup: false,
  
  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      const user = userStr ? JSON.parse(userStr) : null;
      set({ token, user });
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
      set({ token: null, user: null, needsFaceSetup: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  setNeedsFaceSetup: (val: boolean) => set({ needsFaceSetup: val }),
}));

