import api from '../lib/api';

export const adminService = {
  // Professores
  async getProfessores() {
    const { data } = await api.get('/admin/professores');
    return data;
  },

  async createProfessor(professor: { nome: string; email: string; senha: string }) {
    const { data } = await api.post('/admin/professores', professor);
    return data;
  },

  async updateProfessor(id: string, professor: { nome?: string; email?: string; senha?: string }) {
    const { data } = await api.put(`/admin/professores/${id}`, professor);
    return data;
  },

  async deleteProfessor(id: string) {
    await api.delete(`/admin/professores/${id}`);
  },

  // Alunos
  async getAlunos() {
    const { data } = await api.get('/admin/alunos');
    return data;
  },

  async createAluno(aluno: { nome: string; email: string; senha: string }) {
    const { data } = await api.post('/admin/alunos', aluno);
    return data;
  },

  async updateAluno(id: string, aluno: { nome?: string; email?: string; senha?: string; telefone?: string; idade?: number; deficiencia?: string }) {
    const { data } = await api.put(`/admin/alunos/${id}`, aluno);
    return data;
  },

  async deleteAluno(id: string) {
    await api.delete(`/admin/alunos/${id}`);
  },

  async importAlunos(csv: string) {
    const { data } = await api.post('/admin/alunos/import', { csv });
    return data;
  },

  // Turmas
  async getTurmas() {
    const { data } = await api.get('/admin/turmas');
    return data;
  },

  async getTurma(id: string) {
    const { data } = await api.get(`/admin/turmas/${id}`);
    return data;
  },

  async createTurma(turma: { nome: string; ano: number; professorId: string }) {
    const { data } = await api.post('/admin/turmas', turma);
    return data;
  },

  async updateTurma(id: string, turma: { nome?: string; ano?: number; professorId?: string }) {
    const { data } = await api.put(`/admin/turmas/${id}`, turma);
    return data;
  },

  async deleteTurma(id: string) {
    await api.delete(`/admin/turmas/${id}`);
  },

  // Vincular aluno
  async vincularAluno(alunoId: string, turmaId: string) {
    const { data } = await api.post('/admin/vincular-aluno', { alunoId, turmaId });
    return data;
  },

  async desvincularAluno(vinculoId: string) {
    await api.delete(`/admin/vincular-aluno/${vinculoId}`);
  }
};

