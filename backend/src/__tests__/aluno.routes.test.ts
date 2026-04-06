import request from 'supertest';

// ── Mock do Prisma: mantém exports reais (Role, Prisma, enums) e só substitui PrismaClient ──
jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn(() => require('./helpers/prisma.mock').prismaMock),
  };
});

import app from '../server';
import { prismaMock } from './helpers/prisma.mock';
import { alunoToken, adminToken, authHeader } from './helpers/tokens';

const alunoAuth = authHeader(alunoToken);
const ALUNO_ID = 'aluno-id-1';

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// QUESTIONÁRIOS ATIVOS
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /aluno/questionarios-ativos', () => {
  it('deve listar questionários ativos para o aluno', async () => {
    prismaMock.alunoTurma.findMany.mockResolvedValue([{ turmaId: 'turma-1' }]);
    prismaMock.questionario.findMany.mockResolvedValue([
      {
        id: 'q-1',
        titulo: 'Satisfação',
        descricao: 'Pesquisa de satisfação',
        turma: { id: 'turma-1', nome: 'Turma A' },
        periodoInicio: null,
        periodoFim: null,
        _count: { perguntas: 3 },
      },
    ]);
    prismaMock.resposta.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/aluno/questionarios-ativos')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('respondido', false);
  });

  it('deve marcar questionário como respondido', async () => {
    prismaMock.alunoTurma.findMany.mockResolvedValue([{ turmaId: 'turma-1' }]);
    prismaMock.questionario.findMany.mockResolvedValue([
      { id: 'q-1', titulo: 'Satisfação', descricao: null, turma: null, periodoInicio: null, periodoFim: null, _count: { perguntas: 2 } },
    ]);
    prismaMock.resposta.findMany.mockResolvedValue([{ questionarioId: 'q-1' }]);

    const res = await request(app)
      .get('/aluno/questionarios-ativos')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body[0].respondido).toBe(true);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/aluno/questionarios-ativos');
    expect(res.status).toBe(401);
  });

  it('deve retornar 403 para role ADMIN', async () => {
    const res = await request(app)
      .get('/aluno/questionarios-ativos')
      .set(authHeader(adminToken));
    expect(res.status).toBe(403);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTIONÁRIO ESPECÍFICO
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /aluno/questionarios/:id', () => {
  const questionario = {
    id: 'q-1',
    titulo: 'Satisfação',
    descricao: 'Pesquisa',
    ativo: true,
    visibilidade: 'GLOBAL',
    turmaId: null,
    turma: null,
    periodoInicio: null,
    periodoFim: null,
    perguntas: [
      { id: 'p-1', enunciado: 'Como foi?', tipo: 'UNICA', obrigatoria: true, ordem: 1, opcoesJson: '["Boa","Ruim"]' },
    ],
  };

  it('deve retornar questionário com perguntas parseadas', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(questionario);

    const res = await request(app)
      .get('/aluno/questionarios/q-1')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Satisfação');
    expect(res.body.perguntas[0].opcoes).toEqual(['Boa', 'Ruim']);
  });

  it('deve retornar 404 para questionário inexistente', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/aluno/questionarios/inexistente')
      .set(alunoAuth);

    expect(res.status).toBe(404);
  });

  it('deve retornar 403 para questionário inativo', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue({ ...questionario, ativo: false });

    const res = await request(app)
      .get('/aluno/questionarios/q-1')
      .set(alunoAuth);

    expect(res.status).toBe(403);
  });

  it('deve retornar 403 se aluno não pertence à turma (TURMA)', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue({
      ...questionario,
      visibilidade: 'TURMA',
      turmaId: 'turma-1',
      turma: { id: 'turma-1', nome: 'Turma A' },
    });
    prismaMock.alunoTurma.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/aluno/questionarios/q-1')
      .set(alunoAuth);

    expect(res.status).toBe(403);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ENVIAR RESPOSTAS
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /aluno/respostas', () => {
  const Q_ID = '00000000-0000-0000-0000-000000000001';
  const P_ID = '00000000-0000-0000-0000-000000000002';

  const questionarioAtivo = {
    id: Q_ID,
    ativo: true,
    visibilidade: 'GLOBAL',
    turmaId: null,
    periodoInicio: null,
    periodoFim: null,
    perguntas: [{ id: P_ID, enunciado: 'Como foi?', obrigatoria: true }],
  };

  const payload = {
    questionarioId: Q_ID,
    respostas: [{ perguntaId: P_ID, valorOpcao: 'Boa' }],
  };

  it('deve salvar respostas corretamente', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(questionarioAtivo);
    prismaMock.alunoTurma.findFirst.mockResolvedValue({ alunoId: ALUNO_ID, turmaId: 'turma-1' });
    prismaMock.resposta.findFirst.mockResolvedValue(null);
    prismaMock.resposta.create.mockResolvedValue({ id: 'resp-1' });

    const res = await request(app)
      .post('/aluno/respostas')
      .set(alunoAuth)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(1);
  });

  it('deve retornar 409 se questionário já foi respondido', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(questionarioAtivo);
    prismaMock.alunoTurma.findFirst.mockResolvedValue({ alunoId: ALUNO_ID, turmaId: 'turma-1' });
    prismaMock.resposta.findFirst.mockResolvedValue({ id: 'resp-existente' });

    const res = await request(app)
      .post('/aluno/respostas')
      .set(alunoAuth)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/já respondeu/i);
  });

  it('deve retornar 404 para questionário inexistente', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/aluno/respostas')
      .set(alunoAuth)
      .send(payload);

    expect(res.status).toBe(404);
  });

  it('deve retornar 400 para payload com UUID inválido', async () => {
    const res = await request(app)
      .post('/aluno/respostas')
      .set(alunoAuth)
      .send({ questionarioId: 'nao-e-uuid', respostas: [] });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 se pergunta obrigatória não foi respondida', async () => {
    const outraPerguntaId = '00000000-0000-0000-0000-000000000099';
    prismaMock.questionario.findUnique.mockResolvedValue({
      ...questionarioAtivo,
      perguntas: [{ id: outraPerguntaId, enunciado: 'Obrigatória', obrigatoria: true }],
    });
    prismaMock.alunoTurma.findFirst.mockResolvedValue({ alunoId: ALUNO_ID, turmaId: 'turma-1' });
    prismaMock.resposta.findFirst.mockResolvedValue(null);

    // payload responde P_ID mas a pergunta obrigatória é outraPerguntaId
    const res = await request(app)
      .post('/aluno/respostas')
      .set(alunoAuth)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obrigatória/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MINHAS TURMAS
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /aluno/minhas-turmas', () => {
  it('deve retornar turmas do aluno', async () => {
    prismaMock.alunoTurma.findMany.mockResolvedValue([
      {
        turma: {
          id: 'turma-1',
          nome: 'Turma A',
          professor: { id: 'prof-1', nome: 'Prof Silva', email: 'prof@test.com' },
        },
      },
    ]);

    const res = await request(app)
      .get('/aluno/minhas-turmas')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nome).toBe('Turma A');
  });

  it('deve retornar array vazio se não há turmas', async () => {
    prismaMock.alunoTurma.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/aluno/minhas-turmas')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});
