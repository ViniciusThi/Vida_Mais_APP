import api from '../lib/api';

export interface LoginCredentials {
  emailOuTelefone: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    role: 'ADMIN' | 'PROF' | 'ALUNO';
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  }
};

