import api from '../lib/api';

export const questionarioService = {
  // Turmas do professor
  async getMinhasTurmas() {
    const { data } = await api.get('/prof/minhas-turmas');
    return data;
  },

  // Questionários
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

  async updateQuestionario(id: string, questionario: any) {
    const { data } = await api.put(`/prof/questionarios/${id}`, questionario);
    return data;
  },

  async deleteQuestionario(id: string) {
    await api.delete(`/prof/questionarios/${id}`);
  },

  // Perguntas
  async createPergunta(pergunta: any) {
    const { data } = await api.post('/prof/perguntas', pergunta);
    return data;
  },

  async updatePergunta(id: string, pergunta: any) {
    const { data } = await api.put(`/prof/perguntas/${id}`, pergunta);
    return data;
  },

  async deletePergunta(id: string) {
    await api.delete(`/prof/perguntas/${id}`);
  },

  // Relatórios
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
  }
};

