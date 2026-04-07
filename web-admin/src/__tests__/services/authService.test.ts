import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do módulo api para isolar o serviço
vi.mock('../../lib/api', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mockApi, api: mockApi };
});

import api from '../../lib/api';
import { authService } from '../../services/authService';

const mockedApi = api as unknown as { post: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.login', () => {
  it('deve retornar token e user em caso de sucesso', async () => {
    const mockResponse = {
      data: {
        token: 'jwt-token-123',
        user: { id: 'u-1', nome: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
      },
    };
    mockedApi.post.mockResolvedValue(mockResponse);

    const result = await authService.login({
      emailOuTelefone: 'admin@test.com',
      senha: 'senha123',
    });

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
      emailOuTelefone: 'admin@test.com',
      senha: 'senha123',
    });
    expect(result.token).toBe('jwt-token-123');
    expect(result.user.role).toBe('ADMIN');
  });

  it('deve propagar erro em caso de falha', async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 401, data: { error: 'Credenciais inválidas' } } });

    await expect(
      authService.login({ emailOuTelefone: 'x@x.com', senha: 'errada' })
    ).rejects.toMatchObject({ response: { status: 401 } });
  });
});

describe('authService.cadastro', () => {
  it('deve criar usuário e retornar dados', async () => {
    const mockResponse = {
      data: {
        message: 'Cadastro realizado com sucesso',
        user: { id: 'u-2', nome: 'Maria', email: 'maria@test.com', role: 'ALUNO' },
      },
    };
    mockedApi.post.mockResolvedValue(mockResponse);

    const result = await authService.cadastro({
      nome: 'Maria',
      idade: 65,
      email: 'maria@test.com',
      telefone: '11999887766',
      senha: 'senha123',
    });

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/cadastro', expect.objectContaining({
      nome: 'Maria',
      email: 'maria@test.com',
    }));
    expect(result.user.role).toBe('ALUNO');
  });

  it('deve propagar erro 409 para email duplicado', async () => {
    mockedApi.post.mockRejectedValue({
      response: { status: 409, data: { error: 'Email já cadastrado' } }
    });

    await expect(
      authService.cadastro({
        nome: 'Teste',
        idade: 65,
        email: 'existente@test.com',
        telefone: '11000000000',
        senha: 'senha123',
      })
    ).rejects.toMatchObject({ response: { status: 409 } });
  });
});
