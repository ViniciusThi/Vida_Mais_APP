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
import { profToken, adminToken, alunoToken, authHeader } from './helpers/tokens';

const profAuth = authHeader(profToken);
const adminAuth = authHeader(adminToken);
const PROF_ID = 'prof-id-1';

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// TURMAS DO PROFESSOR
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /prof/minhas-turmas', () => {
  it('deve listar turmas do professor autenticado', async () => {
    prismaMock.turma.findMany.mockResolvedValue([
      { id: 'turma-1', nome: 'Turma A', professorId: PROF_ID, _count: { alunos: 5, questionarios: 2 } },
    ]);

    const res = await request(app)
      .get('/prof/minhas-turmas')
      .set(profAuth);

    expect(res.status).toBe(200);
    expect(res.body[0].nome).toBe('Turma A');
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/prof/minhas-turmas');
    expect(res.status).toBe(401);
  });

  it('deve retornar 403 para ALUNO', async () => {
    const res = await request(app)
      .get('/prof/minhas-turmas')
      .set(authHeader(alunoToken));
    expect(res.status).toBe(403);
  });

  it('deve permitir acesso para ADMIN também', async () => {
    prismaMock.turma.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/prof/minhas-turmas')
      .set(adminAuth);

    expect(res.status).toBe(200);
  });
});

describe('GET /prof/turmas/:id/alunos', () => {
  it('deve listar alunos da turma do professor', async () => {
    prismaMock.turma.findUnique.mockResolvedValue({ id: 'turma-1', professorId: PROF_ID });
    prismaMock.alunoTurma.findMany.mockResolvedValue([
      { aluno: { id: 'aluno-1', nome: 'Maria', email: 'maria@test.com' } },
    ]);

    const res = await request(app)
      .get('/prof/turmas/turma-1/alunos')
      .set(profAuth);

    expect(res.status).toBe(200);
    expect(res.body[0].aluno.nome).toBe('Maria');
  });

  it('deve retornar 403 se turma não pertence ao professor', async () => {
    prismaMock.turma.findUnique.mockResolvedValue({ id: 'turma-1', professorId: 'outro-prof' });

    const res = await request(app)
      .get('/prof/turmas/turma-1/alunos')
      .set(profAuth);

    expect(res.status).toBe(403);
  });

  it('deve retornar 403 se turma não existe', async () => {
    prismaMock.turma.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/prof/turmas/inexistente/alunos')
      .set(profAuth);

    expect(res.status).toBe(403);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// QUESTIONÁRIOS
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /prof/questionarios', () => {
  it('deve criar questionário GLOBAL', async () => {
    prismaMock.questionario.create.mockResolvedValue({
      id: 'q-1',
      titulo: 'Satisfação Geral',
      descricao: null,
      visibilidade: 'GLOBAL',
      turmaId: null,
      turma: null,
      ativo: true,
      criadoEm: new Date(),
    });

    const res = await request(app)
      .post('/prof/questionarios')
      .set(profAuth)
      .send({ titulo: 'Satisfação Geral', visibilidade: 'GLOBAL' });

    expect(res.status).toBe(201);
    expect(res.body.visibilidade).toBe('GLOBAL');
  });

  it('deve retornar 400 quando TURMA sem turmaId', async () => {
    const res = await request(app)
      .post('/prof/questionarios')
      .set(profAuth)
      .send({ titulo: 'Questionário Turma', visibilidade: 'TURMA' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/turmaId/i);
  });

  it('deve retornar 400 com título muito curto', async () => {
    const res = await request(app)
      .post('/prof/questionarios')
      .set(profAuth)
      .send({ titulo: 'AB', visibilidade: 'GLOBAL' });

    expect(res.status).toBe(400);
  });
});

describe('GET /prof/questionarios', () => {
  it('deve listar questionários criados pelo professor', async () => {
    prismaMock.questionario.findMany.mockResolvedValue([
      {
        id: 'q-1',
        titulo: 'Satisfação',
        descricao: null,
        visibilidade: 'GLOBAL',
        ativo: true,
        criadoEm: new Date(),
        turma: null,
        _count: { perguntas: 3, respostas: 5 },
      },
    ]);

    const res = await request(app)
      .get('/prof/questionarios')
      .set(profAuth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /prof/questionarios/:id', () => {
  it('deve atualizar questionário existente', async () => {
    // Rota usa findUnique e verifica criadoPor
    prismaMock.questionario.findUnique.mockResolvedValue({
      id: 'q-1',
      titulo: 'Antigo',
      criadoPor: PROF_ID, // mesmo id do token prof
    });
    prismaMock.questionario.update.mockResolvedValue({
      id: 'q-1',
      titulo: 'Novo Título',
      descricao: null,
      visibilidade: 'GLOBAL',
      ativo: true,
      turma: null,
      perguntas: [],
    });

    const res = await request(app)
      .put('/prof/questionarios/q-1')
      .set(profAuth)
      .send({ titulo: 'Novo Título' });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Novo Título');
  });

  it('deve retornar 404 para questionário inexistente', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/prof/questionarios/naoexiste')
      .set(profAuth)
      .send({ titulo: 'Novo Título' });

    expect(res.status).toBe(404);
  });

  it('deve retornar 403 se questionário pertence a outro professor', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue({
      id: 'q-1',
      criadoPor: 'outro-prof-id',
    });

    const res = await request(app)
      .put('/prof/questionarios/q-1')
      .set(profAuth)
      .send({ titulo: 'Novo Título' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /prof/questionarios/:id', () => {
  it('deve deletar questionário existente', async () => {
    // Rota usa findUnique e depois questionario.delete diretamente
    prismaMock.questionario.findUnique.mockResolvedValue({
      id: 'q-1',
      criadoPor: PROF_ID,
    });
    prismaMock.questionario.delete.mockResolvedValue({ id: 'q-1' });

    const res = await request(app)
      .delete('/prof/questionarios/q-1')
      .set(profAuth);

    expect(res.status).toBe(204);
  });

  it('deve retornar 404 para questionário inexistente', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/prof/questionarios/naoexiste')
      .set(profAuth);

    expect(res.status).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PERGUNTAS — endpoint: POST /prof/perguntas (corpo com questionarioId)
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /prof/perguntas', () => {
  const Q_ID = '00000000-0000-0000-0000-000000000001';

  it('deve adicionar pergunta ao questionário', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue({
      id: Q_ID,
      criadoPor: PROF_ID,
    });
    prismaMock.pergunta.create.mockResolvedValue({
      id: 'p-1',
      questionarioId: Q_ID,
      enunciado: 'Como foi o atendimento?',
      tipo: 'UNICA',
      obrigatoria: true,
      ordem: 1,
      opcoesJson: null,
    });

    const res = await request(app)
      .post('/prof/perguntas')
      .set(profAuth)
      .send({
        questionarioId: Q_ID,
        enunciado: 'Como foi o atendimento?',
        tipo: 'UNICA',
        obrigatoria: true,
        ordem: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.enunciado).toBe('Como foi o atendimento?');
  });

  it('deve retornar 404 para questionário inexistente', async () => {
    prismaMock.questionario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/prof/perguntas')
      .set(profAuth)
      .send({
        questionarioId: Q_ID,
        enunciado: 'Pergunta teste',
        tipo: 'TEXTO',
        obrigatoria: false,
        ordem: 1,
      });

    expect(res.status).toBe(404);
  });

  it('deve retornar 400 para enunciado muito curto', async () => {
    const res = await request(app)
      .post('/prof/perguntas')
      .set(profAuth)
      .send({
        questionarioId: Q_ID,
        enunciado: 'AB',  // menos de 5 chars
        tipo: 'TEXTO',
        obrigatoria: false,
        ordem: 1,
      });

    expect(res.status).toBe(400);
  });
});
