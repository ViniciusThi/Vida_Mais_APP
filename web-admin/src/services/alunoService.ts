import api from '../lib/api';

export const alunoService = {
  async getQuestionariosAtivos() {
    const { data } = await api.get('/aluno/questionarios-ativos');
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
  },

  async getMinhasTurmas() {
    const { data } = await api.get('/aluno/minhas-turmas');
    return data;
  }
};

