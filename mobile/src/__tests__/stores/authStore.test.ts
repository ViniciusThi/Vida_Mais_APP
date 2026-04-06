// Mock do expo-secure-store antes de qualquer import
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../stores/authStore';

const mockGetItem = SecureStore.getItemAsync as jest.Mock;
const mockSetItem = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItem = SecureStore.deleteItemAsync as jest.Mock;

const mockUser = {
  id: 'aluno-1',
  nome: 'Maria Idosa',
  email: 'maria@test.com',
  role: 'ALUNO',
};

beforeEach(() => {
  jest.clearAllMocks();
  // Resetar estado do store
  useAuthStore.setState({ token: null, user: null });
});

describe('useAuthStore (mobile)', () => {
  describe('loadToken', () => {
    it('deve carregar token e user do SecureStore', async () => {
      mockGetItem
        .mockResolvedValueOnce('token-salvo')
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      await useAuthStore.getState().loadToken();

      const state = useAuthStore.getState();
      expect(state.token).toBe('token-salvo');
      expect(state.user).toEqual(mockUser);
    });

    it('deve manter user null se SecureStore retorna null', async () => {
      mockGetItem.mockResolvedValue(null);

      await useAuthStore.getState().loadToken();

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('deve tratar erro silenciosamente', async () => {
      mockGetItem.mockRejectedValue(new Error('SecureStore error'));

      // Não deve lançar erro
      await expect(useAuthStore.getState().loadToken()).resolves.not.toThrow();
    });
  });

  describe('setAuth', () => {
    it('deve salvar token e user no SecureStore e atualizar estado', async () => {
      mockSetItem.mockResolvedValue(undefined);

      await useAuthStore.getState().setAuth('novo-token', mockUser);

      expect(mockSetItem).toHaveBeenCalledWith('token', 'novo-token');
      expect(mockSetItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));

      const state = useAuthStore.getState();
      expect(state.token).toBe('novo-token');
      expect(state.user).toEqual(mockUser);
    });

    it('deve tratar erro de SecureStore silenciosamente', async () => {
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(
        useAuthStore.getState().setAuth('token', mockUser)
      ).resolves.not.toThrow();
    });
  });

  describe('logout', () => {
    it('deve remover token e user do SecureStore e limpar estado', async () => {
      // Primeiro fazer login
      mockSetItem.mockResolvedValue(undefined);
      await useAuthStore.getState().setAuth('token-ativo', mockUser);

      // Agora fazer logout
      mockDeleteItem.mockResolvedValue(undefined);
      await useAuthStore.getState().logout();

      expect(mockDeleteItem).toHaveBeenCalledWith('token');
      expect(mockDeleteItem).toHaveBeenCalledWith('user');

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
    });

    it('deve tratar erro de SecureStore silenciosamente no logout', async () => {
      mockDeleteItem.mockRejectedValue(new Error('Delete error'));

      await expect(useAuthStore.getState().logout()).resolves.not.toThrow();
    });
  });
});
