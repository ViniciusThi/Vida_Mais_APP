import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { errorHandler } from '../../middlewares/error.middleware';

// ── Helpers ────────────────────────────────────────────────────────────────────
const mockReq = {} as Request;

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('errorHandler middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('deve retornar 400 para ZodError com detalhes de campos', () => {
    const issues: ZodIssue[] = [
      { code: 'too_small', path: ['nome'], message: 'Nome obrigatório', minimum: 1, type: 'string', inclusive: true },
    ];
    const zodError = new ZodError(issues);
    const res = mockRes();

    errorHandler(zodError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Erro de validação');
    expect(body.details).toHaveLength(1);
    expect(body.details[0].field).toBe('nome');
  });

  it('deve retornar 409 para Prisma P2002 (unique constraint)', () => {
    const prismaError = new PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '5.0', meta: { target: ['email'] } }
    );
    const res = mockRes();

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Registro já existe');
    expect(body.field).toBe('email');
  });

  it('deve retornar 404 para Prisma P2025 (record not found)', () => {
    const prismaError = new PrismaClientKnownRequestError(
      'Record not found',
      { code: 'P2025', clientVersion: '5.0', meta: {} }
    );
    const res = mockRes();

    errorHandler(prismaError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({ error: 'Registro não encontrado' });
  });

  it('deve retornar 500 para erro genérico sem expor mensagem em produção', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Erro interno crítico');
    const res = mockRes();

    errorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error).toBe('Erro interno do servidor');
    expect(body.message).toBeUndefined(); // não expõe em produção
  });

  it('deve expor mensagem em modo development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Detalhe do erro');
    const res = mockRes();

    errorHandler(error, mockReq, res, mockNext);

    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.message).toBe('Detalhe do erro');
  });
});
