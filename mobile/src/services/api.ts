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

// Serviços do Admin
export const adminService = {
  async getProfessores() {
    const { data } = await api.get('/admin/professores');
    return data;
  },

  async createProfessor(professor: { nome: string; email: string; senha: string }) {
    const { data } = await api.post('/admin/professores', professor);
    return data;
  },

  async getAlunos() {
    const { data } = await api.get('/admin/alunos');
    return data;
  },

  async createAluno(aluno: { nome: string; email: string; senha: string }) {
    const { data } = await api.post('/admin/alunos', aluno);
    return data;
  },

  async getTurmas() {
    const { data } = await api.get('/admin/turmas');
    return data;
  },

  async createTurma(turma: { nome: string; ano: number; professorId: string }) {
    const { data } = await api.post('/admin/turmas', turma);
    return data;
  },

  async vincularAluno(alunoId: string, turmaId: string) {
    const { data } = await api.post('/admin/vincular-aluno', { alunoId, turmaId });
    return data;
  },

  async deleteProfessor(id: string) {
    await api.delete(`/admin/professores/${id}`);
  },

  async deleteAluno(id: string) {
    await api.delete(`/admin/alunos/${id}`);
  },

  async deleteTurma(id: string) {
    await api.delete(`/admin/turmas/${id}`);
  },

  async getTurma(id: string) {
    const { data } = await api.get(`/admin/turmas/${id}`);
    return data;
  },

  async desvincularAluno(alunoTurmaId: string) {
    await api.delete(`/admin/vincular-aluno/${alunoTurmaId}`);
  },

  async updateProfessor(id: string, data: { nome: string; email: string; senha?: string }) {
    const { data: result } = await api.put(`/admin/professores/${id}`, data);
    return result;
  },

  async updateAluno(id: string, data: { nome: string; email: string; senha?: string }) {
    const { data: result } = await api.put(`/admin/alunos/${id}`, data);
    return result;
  }
};

// Serviços do Professor
export const professorService = {
  async getMinhasTurmas() {
    const { data } = await api.get('/prof/minhas-turmas');
    return data;
  },

  async getQuestionarios() {
    const { data } = await api.get('/prof/questionarios');
    return data;
  },

  async getQuestionario(id: string) {
    const { data } = await api.get(`/prof/questionarios/${id}`);
    return data;
  },

  async createQuestionario(questionario: any) {
    const { data } = await api.post('/prof/questionarios', questionario);
    return data;
  },

  async createPergunta(pergunta: any) {
    const { data } = await api.post('/prof/perguntas', pergunta);
    return data;
  },

  async deletePergunta(id: string) {
    await api.delete(`/prof/perguntas/${id}`);
  },

  async getRelatorio(questionarioId: string) {
    const { data } = await api.get(`/prof/relatorios/${questionarioId}`);
    return data;
  },

  async exportar(questionarioId: string, formato: 'xlsx' | 'csv') {
    const response = await api.get(`/prof/export/${questionarioId}`, {
      params: { formato },
      responseType: 'blob'
    });
    return response.data;
  },

  async deleteQuestionario(id: string) {
    await api.delete(`/prof/questionarios/${id}`);
  }
};

// Serviços do Aluno
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

