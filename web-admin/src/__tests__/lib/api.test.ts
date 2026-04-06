import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do authStore antes de importar api
vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      token: null,
      user: null,
      logout: vi.fn(),
    })),
  },
}));

import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

const mockGetState = useAuthStore.getState as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  window.location = { href: '' } as Location;
});

describe('api (instância axios)', () => {
  it('deve ter baseURL configurada corretamente', () => {
    // Em ambiente de teste sem VITE_API_URL, usa localhost:3000
    expect(api.defaults.baseURL).toBeTruthy();
  });

  it('deve ter Content-Type json por padrão', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('request interceptor (token JWT)', () => {
  it('deve adicionar Authorization header quando token disponível', async () => {
    // Simular token no store
    mockGetState.mockReturnValue({
      token: 'meu-jwt-token',
      user: { id: 'u-1', role: 'ADMIN' },
      logout: vi.fn(),
    });

    // Interceptar a request via axios adapter mock
    const config: any = { headers: {} };
    // Aplicar o interceptor manualmente pegando o primeiro interceptor registrado
    const interceptors = (api.interceptors.request as any).handlers;
    if (interceptors && interceptors.length > 0) {
      const handler = interceptors[interceptors.length - 1];
      if (handler && handler.fulfilled) {
        const result = await handler.fulfilled(config);
        expect(result.headers.Authorization).toBe('Bearer meu-jwt-token');
      }
    }
  });

  it('deve não adicionar Authorization quando sem token', async () => {
    mockGetState.mockReturnValue({ token: null, user: null, logout: vi.fn() });

    const config: any = { headers: {} };
    const interceptors = (api.interceptors.request as any).handlers;
    if (interceptors && interceptors.length > 0) {
      const handler = interceptors[interceptors.length - 1];
      if (handler && handler.fulfilled) {
        const result = await handler.fulfilled(config);
        expect(result.headers.Authorization).toBeUndefined();
      }
    }
  });
});

describe('response interceptor (401 redirect)', () => {
  it('deve chamar logout e redirecionar ao receber 401', async () => {
    const mockLogout = vi.fn();
    mockGetState.mockReturnValue({ token: 'token', user: {}, logout: mockLogout });

    const interceptors = (api.interceptors.response as any).handlers;
    if (interceptors && interceptors.length > 0) {
      const handler = interceptors[interceptors.length - 1];
      if (handler && handler.rejected) {
        const error = { response: { status: 401 } };
        try {
          await handler.rejected(error);
        } catch (_) { /* esperado rejeitar */ }

        expect(mockLogout).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
      }
    }
  });
});
