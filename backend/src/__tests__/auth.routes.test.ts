import request from 'supertest';
import bcrypt from 'bcrypt';

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

describe('POST /auth/login', () => {
  const validUser = {
    id: 'user-1',
    nome: 'Teste Admin',
    email: 'admin@test.com',
    telefone: null,
    senhaHash: '',
    role: 'ADMIN' as const,
    ativo: true,
  };

  beforeAll(async () => {
    validUser.senhaHash = await bcrypt.hash('senha123', 10);
  });

  beforeEach(() => jest.clearAllMocks());

  it('deve fazer login com email e senha válidos', async () => {
    prismaMock.user.findFirst.mockResolvedValue(validUser);

    const res = await request(app)
      .post('/auth/login')
      .send({ emailOuTelefone: 'admin@test.com', senha: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ id: 'user-1', email: 'admin@test.com', role: 'ADMIN' });
  });

  it('deve retornar 401 quando email não encontrado', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ emailOuTelefone: 'naoexiste@test.com', senha: 'senha123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/inválidos/i);
  });

  it('deve retornar 401 quando senha incorreta', async () => {
    prismaMock.user.findFirst.mockResolvedValue(validUser);

    const res = await request(app)
      .post('/auth/login')
      .send({ emailOuTelefone: 'admin@test.com', senha: 'senhaerrada' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/inválidos/i);
  });

  it('deve retornar 401 quando usuário inativo', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ ...validUser, ativo: false });

    const res = await request(app)
      .post('/auth/login')
      .send({ emailOuTelefone: 'admin@test.com', senha: 'senha123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/inativo/i);
  });

  it('deve retornar 400 quando campos obrigatórios ausentes', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ emailOuTelefone: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('deve retornar 400 quando senha muito curta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ emailOuTelefone: 'admin@test.com', senha: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/cadastro', () => {
  const novoAluno = {
    nome: 'Maria Idosa',
    idade: 65,
    email: 'maria@test.com',
    telefone: '11999887766',
    senha: 'senha123',
  };

  beforeEach(() => jest.clearAllMocks());

  it('deve criar novo aluno com dados válidos', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'aluno-1',
      nome: novoAluno.nome,
      email: novoAluno.email,
      telefone: novoAluno.telefone,
      role: 'ALUNO',
      criadoEm: new Date(),
    });

    const res = await request(app)
      .post('/auth/cadastro')
      .send(novoAluno);

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.role).toBe('ALUNO');
  });

  it('deve retornar 409 quando email já cadastrado', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'existing' });

    const res = await request(app)
      .post('/auth/cadastro')
      .send(novoAluno);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it('deve retornar 409 quando telefone já cadastrado', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'existing' });

    const res = await request(app)
      .post('/auth/cadastro')
      .send(novoAluno);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/telefone/i);
  });

  it('deve retornar 400 para idade menor que 60', async () => {
    const res = await request(app)
      .post('/auth/cadastro')
      .send({ ...novoAluno, idade: 59 });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 para email inválido', async () => {
    const res = await request(app)
      .post('/auth/cadastro')
      .send({ ...novoAluno, email: 'nao-e-email' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 para senha muito curta', async () => {
    const res = await request(app)
      .post('/auth/cadastro')
      .send({ ...novoAluno, senha: '123' });

    expect(res.status).toBe(400);
  });

  it('deve aceitar campo deficiencia opcional', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'aluno-2',
      nome: novoAluno.nome,
      email: novoAluno.email,
      telefone: novoAluno.telefone,
      role: 'ALUNO',
      criadoEm: new Date(),
    });

    const res = await request(app)
      .post('/auth/cadastro')
      .send({ ...novoAluno, deficiencia: 'Visual' });

    expect(res.status).toBe(201);
  });
});
