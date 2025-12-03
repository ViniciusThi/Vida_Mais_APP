/**
 * Serviço de Machine Learning e Analytics
 */
import api from '../lib/api';

export const mlService = {
  // Analytics
  async getOverview() {
    const { data } = await api.get('/ml/analytics/overview');
    return data;
  },

  async getTurmaAnalytics(turmaId: string) {
    const { data } = await api.get(`/ml/analytics/turma/${turmaId}`);
    return data;
  },

  async getAlunoAnalytics(alunoId: string) {
    const { data } = await api.get(`/ml/analytics/aluno/${alunoId}`);
    return data;
  },

  // Predições
  async predictEvasao(turmaId: string) {
    const { data } = await api.post('/ml/predict/evasao', { turmaId });
    return data;
  },

  async predictDesempenho(alunoId: string) {
    const { data } = await api.post('/ml/predict/desempenho', { alunoId });
    return data;
  },

  // Padrões
  async getEngagementPatterns(turmaId?: string) {
    const url = turmaId 
      ? `/ml/patterns/engagement?turmaId=${turmaId}`
      : '/ml/patterns/engagement';
    const { data } = await api.get(url);
    return data;
  },

  async getResponsePatterns(questionarioId: string) {
    const { data } = await api.get(`/ml/patterns/responses?questionarioId=${questionarioId}`);
    return data;
  },

  // Modelos
  async trainModels() {
    const { data } = await api.post('/ml/train');
    return data;
  },

  async getModelsStatus() {
    const { data } = await api.get('/ml/models/status');
    return data;
  },

  async checkHealth() {
    try {
      const { data } = await api.get('/ml/health');
      return data;
    } catch (error) {
      return { status: 'error', message: 'Serviço ML indisponível' };
    }
  }
};

