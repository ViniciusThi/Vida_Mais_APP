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
  },

  async cadastro(dados: {
    nome: string;
    idade: number;
    email: string;
    telefone: string;
    deficiencia?: string;
    senha: string;
  }) {
    const { data } = await api.post('/auth/cadastro', dados);
    return data;
  },

  async faceLogin(imagemBase64: string): Promise<LoginResponse> {
    const { data } = await api.post('/face/login', { imagemBase64 });
    return data;
  },

  async cadastrarRosto(imagemBase64: string): Promise<{ message: string; faceRegistrada: boolean }> {
    const { data } = await api.post('/face/registrar', { imagemBase64 });
    return data;
  },

  async removerRosto(): Promise<{ message: string }> {
    const { data } = await api.delete('/face/registrar');
    return data;
  },

  async statusRosto(): Promise<{ faceRegistrada: boolean }> {
    const { data } = await api.get('/face/status');
    return data;
  }
};

