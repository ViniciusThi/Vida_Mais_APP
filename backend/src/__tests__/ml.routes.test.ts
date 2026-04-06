import request from 'supertest';
import axios from 'axios';

// ── Mock do Prisma ─────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('./helpers/prisma.mock').prismaMock),
  Role: { ADMIN: 'ADMIN', PROF: 'PROF', ALUNO: 'ALUNO' },
  Visibilidade: { GLOBAL: 'GLOBAL', TURMA: 'TURMA' },
  TipoPergunta: { TEXTO: 'TEXTO', MULTIPLA: 'MULTIPLA', UNICA: 'UNICA', ESCALA: 'ESCALA', BOOLEAN: 'BOOLEAN' },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string; meta: any;
      constructor(msg: string, opts: any) { super(msg); this.code = opts.code; this.meta = opts.meta; }
    }
  }
}));

// ── Mock do Axios (cliente HTTP para o ML Service) ──────────────────────────
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import app from '../server';
import { profToken, adminToken, alunoToken, authHeader } from './helpers/tokens';

const profAuth = authHeader(profToken);
const adminAuth = authHeader(adminToken);

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /ml/analytics/overview', () => {
  it('deve retornar overview para ADMIN', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { totalAlunos: 100, totalTurmas: 10, mediaRespostas: 75 }
    });

    const res = await request(app)
      .get('/ml/analytics/overview')
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalAlunos');
  });

  it('deve retornar overview para PROF', async () => {
    mockedAxios.get.mockResolvedValue({ data: { totalAlunos: 20 } });

    const res = await request(app)
      .get('/ml/analytics/overview')
      .set(profAuth);

    expect(res.status).toBe(200);
  });

  it('deve retornar 403 para ALUNO', async () => {
    const res = await request(app)
      .get('/ml/analytics/overview')
      .set(authHeader(alunoToken));

    expect(res.status).toBe(403);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/ml/analytics/overview');
    expect(res.status).toBe(401);
  });

  it('deve repassar erros do ML Service', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 500, data: { error: 'ML service error' } }
    });

    const res = await request(app)
      .get('/ml/analytics/overview')
      .set(adminAuth);

    expect(res.status).toBe(500);
  });
});

describe('GET /ml/analytics/turma/:id', () => {
  it('deve retornar analytics da turma', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { turmaId: 'turma-1', mediaEngajamento: 80 }
    });

    const res = await request(app)
      .get('/ml/analytics/turma/turma-1')
      .set(profAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('turmaId');
  });
});

describe('GET /ml/analytics/aluno/:id', () => {
  it('deve retornar analytics do aluno', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { alunoId: 'aluno-1', riscoEvasao: 0.2 }
    });

    const res = await request(app)
      .get('/ml/analytics/aluno/aluno-1')
      .set(profAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('alunoId');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PREDIÇÕES
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /ml/predict/evasao', () => {
  it('deve retornar predição de evasão', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { turmaId: 'turma-1', predictions: [] }
    });

    const res = await request(app)
      .post('/ml/predict/evasao')
      .set(profAuth)
      .send({ turmaId: 'turma-1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('predictions');
  });

  it('deve retornar 400 sem turmaId', async () => {
    const res = await request(app)
      .post('/ml/predict/evasao')
      .set(profAuth)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/turmaId/i);
  });
});

describe('POST /ml/predict/desempenho', () => {
  it('deve retornar predição de desempenho', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { alunoId: 'aluno-1', tendencia: 'CRESCENTE' }
    });

    const res = await request(app)
      .post('/ml/predict/desempenho')
      .set(profAuth)
      .send({ alunoId: 'aluno-1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tendencia');
  });

  it('deve retornar 400 sem alunoId', async () => {
    const res = await request(app)
      .post('/ml/predict/desempenho')
      .set(profAuth)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/alunoId/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PADRÕES
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /ml/patterns/engagement', () => {
  it('deve retornar padrões de engajamento', async () => {
    mockedAxios.get.mockResolvedValue({ data: { patterns: [] } });

    const res = await request(app)
      .get('/ml/patterns/engagement')
      .set(profAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('patterns');
  });
});

describe('GET /ml/patterns/responses', () => {
  it('deve retornar 400 sem questionarioId', async () => {
    const res = await request(app)
      .get('/ml/patterns/responses')
      .set(profAuth);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/questionarioId/i);
  });

  it('deve retornar padrões de resposta com questionarioId', async () => {
    mockedAxios.get.mockResolvedValue({ data: { questionarioId: 'q-1', patterns: [] } });

    const res = await request(app)
      .get('/ml/patterns/responses?questionarioId=q-1')
      .set(profAuth);

    expect(res.status).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MODELOS
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /ml/models/status', () => {
  it('deve retornar status dos modelos', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { trained: true, lastTraining: '2026-01-01' }
    });

    const res = await request(app)
      .get('/ml/models/status')
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('trained');
  });
});

describe('GET /ml/health', () => {
  it('deve retornar status connected quando ML online', async () => {
    mockedAxios.get.mockResolvedValue({ data: { status: 'healthy' } });

    const res = await request(app).get('/ml/health').set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('connected');
  });

  it('deve retornar status disconnected quando ML offline', async () => {
    mockedAxios.get.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await request(app).get('/ml/health').set(adminAuth);

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('disconnected');
  });
});
