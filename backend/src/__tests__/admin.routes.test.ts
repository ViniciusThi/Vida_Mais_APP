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
import { adminToken, profToken, alunoToken, authHeader } from './helpers/tokens';

const adminAuth = authHeader(adminToken);

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// PROFESSORES
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /admin/professores', () => {
  it('deve criar professor com dados válidos (ADMIN)', async () => {
    prismaMock.user.create.mockResolvedValue({
      id: 'prof-1',
      nome: 'Prof Silva',
      email: 'prof@test.com',
      role: 'PROF',
      criadoEm: new Date(),
    });

    const res = await request(app)
      .post('/admin/professores')
      .set(adminAuth)
      .send({ nome: 'Prof Silva', email: 'prof@test.com', senha: 'senha123' });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('PROF');
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app)
      .post('/admin/professores')
      .send({ nome: 'Prof Silva', email: 'prof@test.com', senha: 'senha123' });

    expect(res.status).toBe(401);
  });

  it('deve retornar 403 para role PROF', async () => {
    const res = await request(app)
      .post('/admin/professores')
      .set(authHeader(profToken))
      .send({ nome: 'Prof Silva', email: 'prof@test.com', senha: 'senha123' });

    expect(res.status).toBe(403);
  });

  it('deve retornar 403 para role ALUNO', async () => {
    const res = await request(app)
      .post('/admin/professores')
      .set(authHeader(alunoToken))
      .send({ nome: 'Prof Silva', email: 'prof@test.com', senha: 'senha123' });

    expect(res.status).toBe(403);
  });

  it('deve retornar 400 com dados inválidos', async () => {
    const res = await request(app)
      .post('/admin/professores')
      .set(adminAuth)
      .send({ nome: 'AB', email: 'invalido', senha: '123' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /admin/professores/:id', () => {
  it('deve atualizar professor existente', async () => {
    // Rota usa findFirst (com filtro de role) para verificar se é PROF
    prismaMock.user.findFirst.mockResolvedValue({ id: 'prof-1', role: 'PROF' });
    prismaMock.user.update.mockResolvedValue({
      id: 'prof-1',
      nome: 'Prof Atualizado',
      email: 'prof@test.com',
      role: 'PROF',
    });

    const res = await request(app)
      .put('/admin/professores/prof-1')
      .set(adminAuth)
      .send({ nome: 'Prof Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Prof Atualizado');
  });

  it('deve retornar 404 para professor inexistente', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/admin/professores/naoexiste')
      .set(adminAuth)
      .send({ nome: 'Nome Novo' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /admin/professores/:id', () => {
  it('deve deletar professor existente', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'prof-1', role: 'PROF' });
    prismaMock.user.delete.mockResolvedValue({ id: 'prof-1' });

    const res = await request(app)
      .delete('/admin/professores/prof-1')
      .set(adminAuth);

    expect(res.status).toBe(204);
  });

  it('deve retornar 404 para professor inexistente', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/admin/professores/naoexiste')
      .set(adminAuth);

    expect(res.status).toBe(404);
  });
});

describe('GET /admin/professores', () => {
  it('deve listar professores para ADMIN', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'prof-1', nome: 'Prof Silva', email: 'prof@test.com', role: 'PROF', ativo: true },
    ]);

    const res = await request(app)
      .get('/admin/professores')
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// TURMAS
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /admin/turmas', () => {
  // Schema: nome (min 3), ano (int, min 2020), professorId (uuid)
  const professorId = '00000000-0000-0000-0000-000000000001';

  it('deve criar turma com dados válidos', async () => {
    prismaMock.turma.create.mockResolvedValue({
      id: 'turma-1',
      nome: 'Turma A',
      ano: 2025,
      professorId,
      professor: { id: professorId, nome: 'Prof Silva', email: 'prof@test.com' },
    });

    const res = await request(app)
      .post('/admin/turmas')
      .set(adminAuth)
      .send({ nome: 'Turma A', ano: 2025, professorId });

    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Turma A');
  });

  it('deve retornar 400 com nome muito curto', async () => {
    const res = await request(app)
      .post('/admin/turmas')
      .set(adminAuth)
      .send({ nome: 'T', ano: 2025, professorId });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 sem professorId', async () => {
    const res = await request(app)
      .post('/admin/turmas')
      .set(adminAuth)
      .send({ nome: 'Turma A', ano: 2025 });

    expect(res.status).toBe(400);
  });
});

describe('GET /admin/turmas', () => {
  it('deve listar turmas para ADMIN', async () => {
    prismaMock.turma.findMany.mockResolvedValue([
      { id: 'turma-1', nome: 'Turma A', professor: { id: 'prof-1', nome: 'Prof Silva' }, _count: { alunos: 0 } },
    ]);

    const res = await request(app)
      .get('/admin/turmas')
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ALUNOS
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /admin/alunos', () => {
  it('deve listar alunos para ADMIN', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'aluno-1', nome: 'Maria', email: 'maria@test.com', role: 'ALUNO', ativo: true, alunoTurmas: [] },
    ]);

    const res = await request(app)
      .get('/admin/alunos')
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('GET /rota-inexistente', () => {
  it('deve retornar 404 para rotas não encontradas', async () => {
    const res = await request(app).get('/rota-inexistente');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/não encontrada/i);
  });
});
