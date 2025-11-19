import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Schema de validação
const loginSchema = z.object({
  emailOuTelefone: z.string().min(1, 'Email ou telefone é obrigatório'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { emailOuTelefone, senha } = loginSchema.parse(req.body);

    // Buscar usuário por email ou telefone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOuTelefone },
          { telefone: emailOuTelefone }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        senhaHash: true,
        role: true,
        ativo: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email/telefone ou senha inválidos' });
    }

    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email/telefone ou senha inválidos' });
    }

    // Gerar token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: expiresIn as string });

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Schema de validação para cadastro
const cadastroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  idade: z.number().int().min(60, 'Idade mínima é 60 anos'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  deficiencia: z.string().optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

// POST /auth/cadastro - Cadastro público de associados
router.post('/cadastro', async (req, res, next) => {
  try {
    const data = cadastroSchema.parse(req.body);

    // Verificar se email já existe
    const emailExiste = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (emailExiste) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Verificar se telefone já existe
    if (data.telefone) {
      const telefoneExiste = await prisma.user.findUnique({
        where: { telefone: data.telefone }
      });

      if (telefoneExiste) {
        return res.status(409).json({ error: 'Telefone já cadastrado' });
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Criar associado
    const associado = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        idade: data.idade,
        deficiencia: data.deficiencia || null,
        senhaHash,
        role: 'ALUNO' // Associados têm role ALUNO
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        criadoEm: true
      }
    });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      user: associado
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };

