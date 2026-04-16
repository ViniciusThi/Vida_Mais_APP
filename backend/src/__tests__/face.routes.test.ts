import request from 'supertest';

// ── Mock do Prisma ─────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('./helpers/prisma.mock').prismaMock),
  Role: { ADMIN: 'ADMIN', PROF: 'PROF', ALUNO: 'ALUNO' },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string; meta: any;
      constructor(msg: string, opts: any) { super(msg); this.code = opts.code; this.meta = opts.meta; }
    },
  },
}));

// ── Mock do Rekognition Service ────────────────────────────────────────────────
jest.mock('../services/rekognition.service', () => ({
  searchFace: jest.fn(),
  indexFace: jest.fn(),
  deleteFace: jest.fn(),
}));

import app from '../server';
import { prismaMock } from './helpers/prisma.mock';
import { alunoToken, profToken, authHeader } from './helpers/tokens';
import * as rekognition from '../services/rekognition.service';

const alunoAuth = authHeader(alunoToken);
const profAuth = authHeader(profToken);
const ALUNO_ID = 'aluno-id-1';

const mockSearchFace = rekognition.searchFace as jest.Mock;
const mockIndexFace = rekognition.indexFace as jest.Mock;
const mockDeleteFace = rekognition.deleteFace as jest.Mock;

// Imagem base64 simulada (>100 chars para passar validação Zod)
const FAKE_IMAGE = 'A'.repeat(200);

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// POST /face/login
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /face/login', () => {
  const alunoUser = {
    id: ALUNO_ID,
    nome: 'Maria Idosa',
    email: 'aluno@test.com',
    telefone: '11999887766',
    role: 'ALUNO',
    ativo: true,
  };

  it('deve fazer login facial com sucesso', async () => {
    mockSearchFace.mockResolvedValue({ userId: ALUNO_ID, similarity: 98.5 });
    prismaMock.user.findUnique.mockResolvedValue(alunoUser);

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('similaridade', 98.5);
    expect(res.body.user).toMatchObject({ id: ALUNO_ID, role: 'ALUNO' });
  });

  it('deve retornar 401 quando rosto não reconhecido', async () => {
    mockSearchFace.mockResolvedValue(null);

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/não reconhecido/i);
  });

  it('deve retornar 401 quando usuário não encontrado no banco', async () => {
    mockSearchFace.mockResolvedValue({ userId: 'ghost-id', similarity: 99 });
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(401);
  });

  it('deve retornar 403 quando usuário inativo', async () => {
    mockSearchFace.mockResolvedValue({ userId: ALUNO_ID, similarity: 95 });
    prismaMock.user.findUnique.mockResolvedValue({ ...alunoUser, ativo: false });

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/inativa/i);
  });

  it('deve retornar 403 quando usuário não é ALUNO', async () => {
    mockSearchFace.mockResolvedValue({ userId: 'prof-id-1', similarity: 97 });
    prismaMock.user.findUnique.mockResolvedValue({ ...alunoUser, id: 'prof-id-1', role: 'PROF' });

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/apenas para alunos/i);
  });

  it('deve retornar 400 para imagem inválida (muito curta)', async () => {
    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: 'curta' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 quando rosto não detectado pelo Rekognition', async () => {
    const err: any = new Error('FACE_NOT_DETECTED');
    mockSearchFace.mockRejectedValue(err);

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/não detectado/i);
  });

  it('deve retornar 400 para imagem muito grande (Rekognition)', async () => {
    const err: any = new Error('ImageTooLargeException');
    err.name = 'ImageTooLargeException';
    mockSearchFace.mockRejectedValue(err);

    const res = await request(app)
      .post('/face/login')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/muito grande/i);
  });

  it('deve retornar 400 sem campo imagemBase64', async () => {
    const res = await request(app)
      .post('/face/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /face/status
// ══════════════════════════════════════════════════════════════════════════════
describe('GET /face/status', () => {
  it('deve retornar status de cadastro facial', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceRegistrada: true });

    const res = await request(app)
      .get('/face/status')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('faceRegistrada', true);
  });

  it('deve retornar faceRegistrada false quando não cadastrado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceRegistrada: false });

    const res = await request(app)
      .get('/face/status')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body.faceRegistrada).toBe(false);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/face/status');
    expect(res.status).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /face/registrar
// ══════════════════════════════════════════════════════════════════════════════
describe('POST /face/registrar', () => {
  it('deve cadastrar rosto com sucesso (sem rosto anterior)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceId: null, faceRegistrada: false });
    mockIndexFace.mockResolvedValue('face-uuid-001');
    prismaMock.user.update.mockResolvedValue({});

    const res = await request(app)
      .post('/face/registrar')
      .set(alunoAuth)
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(200);
    expect(res.body.faceRegistrada).toBe(true);
    expect(mockIndexFace).toHaveBeenCalledWith(FAKE_IMAGE, ALUNO_ID);
    expect(mockDeleteFace).not.toHaveBeenCalled();
  });

  it('deve remover rosto antigo antes de cadastrar novo', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceId: 'old-face-id', faceRegistrada: true });
    mockDeleteFace.mockResolvedValue(undefined);
    mockIndexFace.mockResolvedValue('face-uuid-002');
    prismaMock.user.update.mockResolvedValue({});

    const res = await request(app)
      .post('/face/registrar')
      .set(alunoAuth)
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(200);
    expect(mockDeleteFace).toHaveBeenCalledWith('old-face-id');
    expect(mockIndexFace).toHaveBeenCalledWith(FAKE_IMAGE, ALUNO_ID);
  });

  it('deve retornar 400 para imagem inválida', async () => {
    const res = await request(app)
      .post('/face/registrar')
      .set(alunoAuth)
      .send({ imagemBase64: 'curta' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 403 para usuário que não é ALUNO', async () => {
    const res = await request(app)
      .post('/face/registrar')
      .set(profAuth)
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(403);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app)
      .post('/face/registrar')
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(401);
  });

  it('deve retornar 400 quando Rekognition não detecta rosto', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceId: null, faceRegistrada: false });
    const err: any = new Error('FACE_NOT_DETECTED');
    mockIndexFace.mockRejectedValue(err);

    const res = await request(app)
      .post('/face/registrar')
      .set(alunoAuth)
      .send({ imagemBase64: FAKE_IMAGE });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/não detectado/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /face/registrar
// ══════════════════════════════════════════════════════════════════════════════
describe('DELETE /face/registrar', () => {
  it('deve remover rosto cadastrado com sucesso', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceId: 'face-uuid-001', faceRegistrada: true });
    mockDeleteFace.mockResolvedValue(undefined);
    prismaMock.user.update.mockResolvedValue({});

    const res = await request(app)
      .delete('/face/registrar')
      .set(alunoAuth);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removido/i);
    expect(mockDeleteFace).toHaveBeenCalledWith('face-uuid-001');
  });

  it('deve retornar 404 quando nenhum rosto está cadastrado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ faceId: null, faceRegistrada: false });

    const res = await request(app)
      .delete('/face/registrar')
      .set(alunoAuth);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/nenhum rosto/i);
  });

  it('deve retornar 403 para usuário que não é ALUNO', async () => {
    const res = await request(app)
      .delete('/face/registrar')
      .set(profAuth);

    expect(res.status).toBe(403);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).delete('/face/registrar');
    expect(res.status).toBe(401);
  });
});
