import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '../../stores/authStore';

// Limpar o store entre testes
beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
});

const mockUser = {
  id: 'user-1',
  nome: 'Teste Admin',
  email: 'admin@test.com',
  role: 'ADMIN' as const,
};

describe('useAuthStore', () => {
  it('deve iniciar com token e user nulos', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('deve atualizar token e user ao chamar setAuth', () => {
    act(() => {
      useAuthStore.getState().setAuth('meu-token-jwt', mockUser);
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('meu-token-jwt');
    expect(state.user).toEqual(mockUser);
  });

  it('deve limpar token e user ao chamar logout', () => {
    act(() => {
      useAuthStore.getState().setAuth('meu-token-jwt', mockUser);
    });

    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('deve preservar dados do user intactos após setAuth', () => {
    const profUser = { id: 'p-1', nome: 'Prof Silva', email: 'prof@test.com', role: 'PROF' as const };

    act(() => {
      useAuthStore.getState().setAuth('token-prof', profUser);
    });

    expect(useAuthStore.getState().user).toMatchObject({
      id: 'p-1',
      role: 'PROF',
    });
  });

  it('deve sobrescrever setAuth anterior', () => {
    act(() => {
      useAuthStore.getState().setAuth('token-1', mockUser);
    });

    const outroUser = { ...mockUser, id: 'user-2', email: 'outro@test.com' };
    act(() => {
      useAuthStore.getState().setAuth('token-2', outroUser);
    });

    expect(useAuthStore.getState().token).toBe('token-2');
    expect(useAuthStore.getState().user?.id).toBe('user-2');
  });
});
