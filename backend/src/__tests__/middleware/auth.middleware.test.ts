import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, AuthRequest } from '../../middlewares/auth.middleware';

const SECRET = process.env.JWT_SECRET!;

// ── Helpers ────────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// ══════════════════════════════════════════════════════════════════════════════
// authenticate
// ══════════════════════════════════════════════════════════════════════════════
describe('authenticate middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve chamar next() com token válido', () => {
    const token = jwt.sign({ id: 'u-1', email: 'a@b.com', role: 'ADMIN' }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 'u-1', email: 'a@b.com', role: 'ADMIN' });
  });

  it('deve retornar 401 sem header Authorization', () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar 401 com token malformado', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
  });

  it('deve retornar 401 com token expirado', () => {
    const token = jwt.sign({ id: 'u-1', email: 'a@b.com', role: 'ADMIN' }, SECRET, { expiresIn: -1 });
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('deve retornar 401 sem prefixo Bearer', () => {
    const token = jwt.sign({ id: 'u-1', email: 'a@b.com', role: 'ADMIN' }, SECRET);
    const req = { headers: { authorization: token } } as AuthRequest;
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// authorize
// ══════════════════════════════════════════════════════════════════════════════
describe('authorize middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve chamar next() quando role é permitida', () => {
    const req = { user: { id: 'u-1', email: 'a@b.com', role: 'ADMIN' } } as AuthRequest;
    const res = mockRes();
    const middleware = authorize('ADMIN' as any, 'PROF' as any);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('deve retornar 403 quando role não é permitida', () => {
    const req = { user: { id: 'u-1', email: 'a@b.com', role: 'ALUNO' } } as AuthRequest;
    const res = mockRes();
    const middleware = authorize('ADMIN' as any, 'PROF' as any);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sem permissão para acessar este recurso' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando req.user está ausente', () => {
    const req = {} as AuthRequest;
    const res = mockRes();
    const middleware = authorize('ADMIN' as any);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Não autenticado' });
  });

  it('deve aceitar múltiplos roles', () => {
    const req = { user: { id: 'u-1', email: 'p@b.com', role: 'PROF' } } as AuthRequest;
    const res = mockRes();
    const middleware = authorize('ADMIN' as any, 'PROF' as any, 'ALUNO' as any);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});
