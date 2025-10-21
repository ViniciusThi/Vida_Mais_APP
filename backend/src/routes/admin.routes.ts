import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import { parse } from 'fast-csv';
import { Readable } from 'stream';

const router = Router();
const prisma = new PrismaClient();

// Aplicar autenticação e autorização para todas as rotas
router.use(authenticate);
router.use(authorize(Role.ADMIN));

// ========== PROFESSORES ==========

const createProfessorSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6)
});

// POST /admin/professores - Criar professor
router.post('/professores', async (req: AuthRequest, res, next) => {
  try {
    const { nome, email, senha } = createProfessorSchema.parse(req.body);

    const senhaHash = await bcrypt.hash(senha, 10);

    const professor = await prisma.user.create({
      data: {
        nome,
        email,
        senhaHash,
        role: Role.PROF
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true
      }
    });

    res.status(201).json(professor);
  } catch (error) {
    next(error);
  }
});

// GET /admin/professores - Listar professores
router.get('/professores', async (req, res, next) => {
  try {
    const professores = await prisma.user.findMany({
      where: { role: Role.PROF },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        criadoEm: true,
        _count: {
          select: { turmasProfessor: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(professores);
  } catch (error) {
    next(error);
  }
});

// PUT /admin/professores/:id - Atualizar professor
router.put('/professores/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    // Verifica se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!professor || professor.role !== Role.PROF) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }

    const updateData: any = { nome, email };
    
    if (senha) {
      updateData.senhaHash = await bcrypt.hash(senha, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /admin/professores/:id - Deletar professor
router.delete('/professores/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verifica se o professor existe e é realmente um professor
    const professor = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!professor || professor.role !== Role.PROF) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }

    // Deleta o professor (cascade vai remover as turmas associadas)
    await prisma.user.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ========== ALUNOS ==========

const createAlunoSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6)
});

// POST /admin/alunos - Criar aluno
router.post('/alunos', async (req: AuthRequest, res, next) => {
  try {
    const { nome, email, senha } = createAlunoSchema.parse(req.body);

    const senhaHash = await bcrypt.hash(senha, 10);

    const aluno = await prisma.user.create({
      data: {
        nome,
        email,
        senhaHash,
        role: Role.ALUNO
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true
      }
    });

    res.status(201).json(aluno);
  } catch (error) {
    next(error);
  }
});

// GET /admin/alunos - Listar alunos
router.get('/alunos', async (req, res, next) => {
  try {
    const alunos = await prisma.user.findMany({
      where: { role: Role.ALUNO },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        criadoEm: true,
        alunoTurmas: {
          select: {
            turma: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(alunos);
  } catch (error) {
    next(error);
  }
});

// PUT /admin/alunos/:id - Atualizar aluno
router.put('/alunos/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    // Verifica se o aluno existe
    const aluno = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!aluno || aluno.role !== Role.ALUNO) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const updateData: any = { nome, email };
    
    if (senha) {
      updateData.senhaHash = await bcrypt.hash(senha, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /admin/alunos/:id - Deletar aluno
router.delete('/alunos/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verifica se o aluno existe e é realmente um aluno
    const aluno = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!aluno || aluno.role !== Role.ALUNO) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Deleta o aluno (cascade vai remover os vínculos e respostas)
    await prisma.user.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /admin/alunos/import - Importar alunos via CSV
router.post('/alunos/import', async (req: AuthRequest, res, next) => {
  try {
    // Espera um CSV no body com formato: nome,email,senha
    const { csv } = req.body;

    if (!csv || typeof csv !== 'string') {
      return res.status(400).json({ error: 'CSV inválido' });
    }

    const alunos: any[] = [];
    const stream = Readable.from([csv]);

    stream
      .pipe(parse({ headers: true, trim: true }))
      .on('data', (row: any) => alunos.push(row))
      .on('end', async () => {
        try {
          const created = [];

          for (const alunoData of alunos) {
            if (!alunoData.nome || !alunoData.email || !alunoData.senha) {
              continue;
            }

            const senhaHash = await bcrypt.hash(alunoData.senha, 10);

            const aluno = await prisma.user.create({
              data: {
                nome: alunoData.nome,
                email: alunoData.email,
                senhaHash,
                role: Role.ALUNO
              },
              select: {
                id: true,
                nome: true,
                email: true
              }
            });

            created.push(aluno);
          }

          res.json({ imported: created.length, alunos: created });
        } catch (err) {
          next(err);
        }
      });
  } catch (error) {
    next(error);
  }
});

// ========== TURMAS ==========

const createTurmaSchema = z.object({
  nome: z.string().min(3),
  ano: z.number().int().min(2020),
  professorId: z.string().uuid()
});

// POST /admin/turmas - Criar turma
router.post('/turmas', async (req: AuthRequest, res, next) => {
  try {
    const { nome, ano, professorId } = createTurmaSchema.parse(req.body);

    const turma = await prisma.turma.create({
      data: {
        nome,
        ano,
        professorId
      },
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(turma);
  } catch (error) {
    next(error);
  }
});

// GET /admin/turmas - Listar turmas
router.get('/turmas', async (req, res, next) => {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        _count: {
          select: { alunos: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(turmas);
  } catch (error) {
    next(error);
  }
});

// GET /admin/turmas/:id - Buscar turma específica com alunos
router.get('/turmas/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        alunos: {
          include: {
            aluno: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    res.json(turma);
  } catch (error) {
    next(error);
  }
});

// DELETE /admin/turmas/:id - Deletar turma
router.delete('/turmas/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verifica se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id }
    });

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Deleta a turma (cascade vai remover os vínculos)
    await prisma.turma.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ========== VINCULAR ALUNO ==========

const vincularAlunoSchema = z.object({
  alunoId: z.string().uuid(),
  turmaId: z.string().uuid()
});

// POST /admin/vincular-aluno
router.post('/vincular-aluno', async (req: AuthRequest, res, next) => {
  try {
    const { alunoId, turmaId } = vincularAlunoSchema.parse(req.body);

    const vinculo = await prisma.alunoTurma.create({
      data: {
        alunoId,
        turmaId
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        turma: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json(vinculo);
  } catch (error) {
    next(error);
  }
});

// DELETE /admin/vincular-aluno/:id - Desvincular aluno
router.delete('/vincular-aluno/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.alunoTurma.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };

