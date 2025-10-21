import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const authService = {
  async login(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha });
    return data;
  }
};

export const alunoService = {
  async getMinhasTurmas() {
    const { data } = await api.get('/aluno/minhas-turmas');
    return data;
  },

  async getQuestionariosAtivos(turmaId?: string) {
    const { data } = await api.get('/aluno/questionarios-ativos', {
      params: { turmaId }
    });
    return data;
  },

  async getQuestionario(id: string) {
    const { data } = await api.get(`/aluno/questionarios/${id}`);
    return data;
  },

  async enviarRespostas(payload: {
    questionarioId: string;
    turmaId: string;
    respostas: Array<{
      perguntaId: string;
      valorTexto?: string;
      valorNum?: number;
      valorBool?: boolean;
      valorOpcao?: string;
    }>;
  }) {
    const { data } = await api.post('/aluno/respostas', payload);
    return data;
  }
};

export default api;

