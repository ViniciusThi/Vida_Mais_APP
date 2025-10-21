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

  // Alunos
  async getAlunos() {
    const { data } = await api.get('/admin/alunos');
    return data;
  },

  async createAluno(aluno: { nome: string; email: string; senha: string }) {
    const { data } = await api.post('/admin/alunos', aluno);
    return data;
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

  async createTurma(turma: { nome: string; ano: number; professorId: string }) {
    const { data } = await api.post('/admin/turmas', turma);
    return data;
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

