import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import { indexFace, searchFace, deleteFace } from '../services/rekognition.service';

const router = Router();
const prisma = new PrismaClient();

const imageSchema = z.object({
  imagemBase64: z.string().min(100, 'Imagem inválida ou muito pequena'),
});

// ========== POST /face/login — público ==========
router.post('/login', async (req, res, next) => {
  try {
    const { imagemBase64 } = imageSchema.parse(req.body);

    const match = await searchFace(imagemBase64);
    if (!match) {
      return res.status(401).json({ error: 'Rosto não reconhecido. Tente novamente.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: match.userId },
      select: { id: true, nome: true, email: true, telefone: true, role: true, ativo: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Rosto não reconhecido. Tente novamente.' });
    }
    if (!user.ativo) {
      return res.status(403).json({ error: 'Conta inativa. Contate o administrador.' });
    }
    if (user.role !== Role.ALUNO) {
      return res.status(403).json({ error: 'Login facial disponível apenas para alunos.' });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        role: user.role,
      },
      similaridade: match.similarity,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (
      error.name === 'InvalidParameterException' ||
      error.message === 'FACE_NOT_DETECTED'
    ) {
      return res
        .status(400)
        .json({ error: 'Rosto não detectado. Use boa iluminação e centralize o rosto.' });
    }
    if (error.name === 'ImageTooLargeException') {
      return res.status(400).json({ error: 'Imagem muito grande. Tente novamente.' });
    }
    next(error);
  }
});

// Todas as rotas abaixo exigem autenticação
router.use(authenticate);

// ========== GET /face/status ==========
router.get('/status', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { faceRegistrada: true },
    });
    res.json({ faceRegistrada: user?.faceRegistrada ?? false });
  } catch (error) {
    next(error);
  }
});

// ========== POST /face/registrar — ALUNO ==========
router.post('/registrar', authorize(Role.ALUNO), async (req: AuthRequest, res, next) => {
  try {
    const { imagemBase64 } = imageSchema.parse(req.body);

    const userAtual = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { faceId: true, faceRegistrada: true },
    });

    // Se já tem face cadastrada, remove a antiga antes de indexar a nova
    if (userAtual?.faceRegistrada && userAtual.faceId) {
      await deleteFace(userAtual.faceId);
    }

    const novoFaceId = await indexFace(imagemBase64, req.user!.id);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { faceId: novoFaceId, faceRegistrada: true },
    });

    res.json({ message: 'Rosto cadastrado com sucesso', faceRegistrada: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (
      error.name === 'InvalidParameterException' ||
      error.message === 'FACE_NOT_DETECTED'
    ) {
      return res
        .status(400)
        .json({ error: 'Rosto não detectado. Use boa iluminação e centralize o rosto.' });
    }
    if (error.name === 'ImageTooLargeException') {
      return res.status(400).json({ error: 'Imagem muito grande. Tente novamente.' });
    }
    next(error);
  }
});

// ========== DELETE /face/registrar — ALUNO ==========
router.delete('/registrar', authorize(Role.ALUNO), async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { faceId: true, faceRegistrada: true },
    });

    if (!user?.faceRegistrada || !user.faceId) {
      return res.status(404).json({ error: 'Nenhum rosto cadastrado.' });
    }

    await deleteFace(user.faceId);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { faceId: null, faceRegistrada: false },
    });

    res.json({ message: 'Cadastro facial removido com sucesso' });
  } catch (error) {
    next(error);
  }
});

export { router as faceRouter };
