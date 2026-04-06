import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-jest-tests-only';

export const makeToken = (payload: { id: string; email: string; role: string }) =>
  jwt.sign(payload, SECRET, { expiresIn: '1h' });

export const adminToken = makeToken({ id: 'admin-id-1', email: 'admin@test.com', role: 'ADMIN' });
export const profToken = makeToken({ id: 'prof-id-1', email: 'prof@test.com', role: 'PROF' });
export const alunoToken = makeToken({ id: 'aluno-id-1', email: 'aluno@test.com', role: 'ALUNO' });

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });
