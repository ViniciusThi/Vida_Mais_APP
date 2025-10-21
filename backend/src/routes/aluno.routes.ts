import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Aplicar autenticação e autorização
router.use(authenticate);
router.use(authorize(Role.ALUNO));

// ========== QUESTIONÁRIOS ATIVOS ==========

// GET /aluno/questionarios-ativos
router.get('/questionarios-ativos', async (req: AuthRequest, res, next) => {
  try {
    const turmaId = req.query.turmaId as string;

    // Buscar turmas do aluno
    const minhasTurmas = await prisma.alunoTurma.findMany({
      where: { alunoId: req.user!.id },
      select: { turmaId: true }
    });

    const turmaIds = minhasTurmas.map(t => t.turmaId);

    // Filtrar por turmaId se fornecido
    const where: any = {
      ativo: true,
      OR: [
        { visibilidade: 'GLOBAL' },
        { turmaId: { in: turmaId ? [turmaId] : turmaIds } }
      ]
    };

    // Verificar período
    const agora = new Date();
    where.AND = [
      {
        OR: [
          { periodoInicio: null },
          { periodoInicio: { lte: agora } }
        ]
      },
      {
        OR: [
          { periodoFim: null },
          { periodoFim: { gte: agora } }
        ]
      }
    ];

    const questionarios = await prisma.questionario.findMany({
      where,
      select: {
        id: true,
        titulo: true,
        descricao: true,
        turma: {
          select: {
            id: true,
            nome: true
          }
        },
        periodoInicio: true,
        periodoFim: true,
        _count: {
          select: { perguntas: true }
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    // Verificar quais o aluno já respondeu
    const respondidos = await prisma.resposta.findMany({
      where: {
        alunoId: req.user!.id,
        questionarioId: { in: questionarios.map(q => q.id) }
      },
      select: {
        questionarioId: true
      },
      distinct: ['questionarioId']
    });

    const respondidosSet = new Set(respondidos.map(r => r.questionarioId));

    const resultado = questionarios.map(q => ({
      ...q,
      respondido: respondidosSet.has(q.id)
    }));

    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

// GET /aluno/questionarios/:id
router.get('/questionarios/:id', async (req: AuthRequest, res, next) => {
  try {
    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.id },
      include: {
        turma: {
          select: {
            id: true,
            nome: true
          }
        },
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    if (!questionario.ativo) {
      return res.status(403).json({ error: 'Questionário inativo' });
    }

    // Verificar período
    const agora = new Date();
    if (questionario.periodoInicio && agora < questionario.periodoInicio) {
      return res.status(403).json({ error: 'Questionário ainda não iniciado' });
    }
    if (questionario.periodoFim && agora > questionario.periodoFim) {
      return res.status(403).json({ error: 'Questionário já encerrado' });
    }

    // Verificar se o aluno pertence à turma (se não for global)
    if (questionario.visibilidade === 'TURMA' && questionario.turmaId) {
      const vinculo = await prisma.alunoTurma.findFirst({
        where: {
          alunoId: req.user!.id,
          turmaId: questionario.turmaId
        }
      });

      if (!vinculo) {
        return res.status(403).json({ error: 'Você não pertence a esta turma' });
      }
    }

    // Retornar com opções parseadas
    const perguntas = questionario.perguntas.map(p => ({
      ...p,
      opcoes: p.opcoesJson ? JSON.parse(p.opcoesJson) : null,
      opcoesJson: undefined
    }));

    res.json({
      ...questionario,
      perguntas
    });
  } catch (error) {
    next(error);
  }
});

// ========== ENVIAR RESPOSTAS ==========

const enviarRespostasSchema = z.object({
  questionarioId: z.string().uuid(),
  turmaId: z.string().uuid(),
  respostas: z.array(
    z.object({
      perguntaId: z.string().uuid(),
      valorTexto: z.string().optional(),
      valorNum: z.number().optional(),
      valorBool: z.boolean().optional(),
      valorOpcao: z.string().optional()
    })
  )
});

// POST /aluno/respostas
router.post('/respostas', async (req: AuthRequest, res, next) => {
  try {
    const data = enviarRespostasSchema.parse(req.body);

    // Verificar se o questionário existe e está ativo
    const questionario = await prisma.questionario.findUnique({
      where: { id: data.questionarioId },
      include: {
        perguntas: true
      }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    if (!questionario.ativo) {
      return res.status(403).json({ error: 'Questionário inativo' });
    }

    // Verificar período
    const agora = new Date();
    if (questionario.periodoInicio && agora < questionario.periodoInicio) {
      return res.status(403).json({ error: 'Questionário ainda não iniciado' });
    }
    if (questionario.periodoFim && agora > questionario.periodoFim) {
      return res.status(403).json({ error: 'Questionário já encerrado' });
    }

    // Verificar se o aluno pertence à turma
    const vinculo = await prisma.alunoTurma.findFirst({
      where: {
        alunoId: req.user!.id,
        turmaId: data.turmaId
      }
    });

    if (!vinculo) {
      return res.status(403).json({ error: 'Você não pertence a esta turma' });
    }

    // Verificar se já respondeu
    const jaRespondeu = await prisma.resposta.findFirst({
      where: {
        questionarioId: data.questionarioId,
        alunoId: req.user!.id
      }
    });

    if (jaRespondeu) {
      return res.status(409).json({ error: 'Você já respondeu este questionário' });
    }

    // Validar perguntas obrigatórias
    const perguntasObrigatorias = questionario.perguntas.filter(p => p.obrigatoria);
    const respostasPerguntasIds = data.respostas.map(r => r.perguntaId);

    for (const pergunta of perguntasObrigatorias) {
      if (!respostasPerguntasIds.includes(pergunta.id)) {
        return res.status(400).json({ 
          error: `Pergunta obrigatória não respondida: ${pergunta.enunciado}` 
        });
      }
    }

    // Salvar respostas
    const respostasSalvas = await Promise.all(
      data.respostas.map(resposta =>
        prisma.resposta.create({
          data: {
            questionarioId: data.questionarioId,
            perguntaId: resposta.perguntaId,
            alunoId: req.user!.id,
            turmaId: data.turmaId,
            valorTexto: resposta.valorTexto,
            valorNum: resposta.valorNum,
            valorBool: resposta.valorBool,
            valorOpcao: resposta.valorOpcao
          }
        })
      )
    );

    res.status(201).json({
      message: 'Respostas enviadas com sucesso',
      total: respostasSalvas.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /aluno/minhas-turmas
router.get('/minhas-turmas', async (req: AuthRequest, res, next) => {
  try {
    const turmas = await prisma.alunoTurma.findMany({
      where: { alunoId: req.user!.id },
      include: {
        turma: {
          include: {
            professor: {
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

    res.json(turmas.map(t => t.turma));
  } catch (error) {
    next(error);
  }
});

export { router as alunoRouter };

