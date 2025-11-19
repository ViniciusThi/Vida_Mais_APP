import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Role, Visibilidade, TipoPergunta } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import ExcelJS from 'exceljs';

const router = Router();
const prisma = new PrismaClient();

// Aplicar autenticação e autorização
router.use(authenticate);
router.use(authorize(Role.PROF, Role.ADMIN));

// ========== TURMAS ==========

// GET /prof/minhas-turmas
router.get('/minhas-turmas', async (req: AuthRequest, res, next) => {
  try {
    const turmas = await prisma.turma.findMany({
      where: { professorId: req.user!.id },
      include: {
        _count: {
          select: { alunos: true, questionarios: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(turmas);
  } catch (error) {
    next(error);
  }
});

// GET /prof/turmas/:id/alunos - Buscar alunos de uma turma (somente visualização)
router.get('/turmas/:id/alunos', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verifica se a turma pertence ao professor
    const turma = await prisma.turma.findUnique({
      where: { id },
      select: { professorId: true }
    });

    if (!turma || turma.professorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado a esta turma' });
    }

    const alunos = await prisma.alunoTurma.findMany({
      where: { turmaId: id },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        aluno: { nome: 'asc' }
      }
    });

    res.json(alunos);
  } catch (error) {
    next(error);
  }
});

// ========== QUESTIONÁRIOS ==========

const createQuestionarioSchema = z.object({
  titulo: z.string().min(3),
  descricao: z.string().optional(),
  visibilidade: z.nativeEnum(Visibilidade),
  turmaId: z.string().uuid().optional(),
  periodoInicio: z.string().datetime().optional(),
  periodoFim: z.string().datetime().optional()
});

// POST /prof/questionarios
router.post('/questionarios', async (req: AuthRequest, res, next) => {
  try {
    const data = createQuestionarioSchema.parse(req.body);

    // Se visibilidade é TURMA, turmaId é obrigatório
    if (data.visibilidade === Visibilidade.TURMA && !data.turmaId) {
      return res.status(400).json({ error: 'turmaId é obrigatório para questionários de turma' });
    }

    // Verificar se o professor é dono da turma (se não for admin)
    if (req.user!.role === Role.PROF && data.turmaId) {
      const turma = await prisma.turma.findFirst({
        where: {
          id: data.turmaId,
          professorId: req.user!.id
        }
      });

      if (!turma) {
        return res.status(403).json({ error: 'Você não tem permissão para essa turma' });
      }
    }

    const questionario = await prisma.questionario.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        criadoPor: req.user!.id,
        visibilidade: data.visibilidade,
        turmaId: data.turmaId,
        periodoInicio: data.periodoInicio ? new Date(data.periodoInicio) : null,
        periodoFim: data.periodoFim ? new Date(data.periodoFim) : null
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json(questionario);
  } catch (error) {
    next(error);
  }
});

// GET /prof/questionarios
router.get('/questionarios', async (req: AuthRequest, res, next) => {
  try {
    const where: any = {
      criadoPor: req.user!.id
    };

    const questionarios = await prisma.questionario.findMany({
      where,
      include: {
        turma: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: { perguntas: true, respostas: true }
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    res.json(questionarios);
  } catch (error) {
    next(error);
  }
});

// GET /prof/questionarios/:id
router.get('/questionarios/:id', async (req: AuthRequest, res, next) => {
  try {
    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.id },
      include: {
        turma: true,
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    // Verificar permissão
    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    res.json(questionario);
  } catch (error) {
    next(error);
  }
});

// PUT /prof/questionarios/:id
router.put('/questionarios/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = createQuestionarioSchema.partial().parse(req.body);

    // Verificar permissão
    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.id }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const updated = await prisma.questionario.update({
      where: { id: req.params.id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        visibilidade: data.visibilidade,
        turmaId: data.turmaId,
        periodoInicio: data.periodoInicio ? new Date(data.periodoInicio) : undefined,
        periodoFim: data.periodoFim ? new Date(data.periodoFim) : undefined
      },
      include: {
        turma: true,
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /prof/questionarios/:id
router.delete('/questionarios/:id', async (req: AuthRequest, res, next) => {
  try {
    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.id }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await prisma.questionario.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ========== PERGUNTAS ==========

const createPerguntaSchema = z.object({
  questionarioId: z.string().uuid(),
  ordem: z.number().int().min(1),
  tipo: z.nativeEnum(TipoPergunta),
  enunciado: z.string().min(5),
  obrigatoria: z.boolean().default(true),
  opcoes: z.array(z.string()).optional()
});

// POST /prof/perguntas
router.post('/perguntas', async (req: AuthRequest, res, next) => {
  try {
    const data = createPerguntaSchema.parse(req.body);

    // Verificar permissão
    const questionario = await prisma.questionario.findUnique({
      where: { id: data.questionarioId }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const pergunta = await prisma.pergunta.create({
      data: {
        questionarioId: data.questionarioId,
        ordem: data.ordem,
        tipo: data.tipo,
        enunciado: data.enunciado,
        obrigatoria: data.obrigatoria,
        opcoesJson: data.opcoes ? JSON.stringify(data.opcoes) : null
      }
    });

    res.status(201).json({
      ...pergunta,
      opcoes: pergunta.opcoesJson ? JSON.parse(pergunta.opcoesJson) : null
    });
  } catch (error) {
    next(error);
  }
});

// PUT /prof/perguntas/:id
router.put('/perguntas/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = createPerguntaSchema.omit({ questionarioId: true }).partial().parse(req.body);

    // Verificar permissão
    const pergunta = await prisma.pergunta.findUnique({
      where: { id: req.params.id },
      include: { questionario: true }
    });

    if (!pergunta) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }

    if (req.user!.role === Role.PROF && pergunta.questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const updated = await prisma.pergunta.update({
      where: { id: req.params.id },
      data: {
        ordem: data.ordem,
        tipo: data.tipo,
        enunciado: data.enunciado,
        obrigatoria: data.obrigatoria,
        opcoesJson: data.opcoes ? JSON.stringify(data.opcoes) : undefined
      }
    });

    res.json({
      ...updated,
      opcoes: updated.opcoesJson ? JSON.parse(updated.opcoesJson) : null
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /prof/perguntas/:id
router.delete('/perguntas/:id', async (req: AuthRequest, res, next) => {
  try {
    const pergunta = await prisma.pergunta.findUnique({
      where: { id: req.params.id },
      include: { questionario: true }
    });

    if (!pergunta) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }

    if (req.user!.role === Role.PROF && pergunta.questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await prisma.pergunta.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ========== QUESTIONÁRIOS PADRÃO ==========

// GET /prof/questionarios-padrao - Listar questionários padrão
router.get('/questionarios-padrao', async (req: AuthRequest, res, next) => {
  try {
    const questionarios = await prisma.questionario.findMany({
      where: {
        padrao: true
      },
      include: {
        _count: {
          select: { perguntas: true, respostas: true }
        }
      },
      orderBy: { ano: 'desc' }
    });

    res.json(questionarios);
  } catch (error) {
    next(error);
  }
});

// POST /prof/questionarios-padrao - Criar questionário padrão para um ano
router.post('/questionarios-padrao', async (req: AuthRequest, res, next) => {
  try {
    const { ano, periodoInicio, periodoFim } = z.object({
      ano: z.number().int().min(2020),
      periodoInicio: z.string().datetime().optional(),
      periodoFim: z.string().datetime().optional()
    }).parse(req.body);

    // Verificar se já existe questionário padrão para este ano
    const existe = await prisma.questionario.findFirst({
      where: {
        padrao: true,
        ano: ano
      }
    });

    if (existe) {
      return res.status(409).json({ error: `Já existe um questionário padrão para o ano ${ano}` });
    }

    // Criar questionário padrão
    const questionario = await prisma.questionario.create({
      data: {
        titulo: `Pesquisa de Satisfação ${ano}`,
        descricao: `Questionário padrão anual de satisfação do Vida Mais - ${ano}`,
        criadoPor: req.user!.id,
        visibilidade: Visibilidade.GLOBAL,
        padrao: true,
        ano: ano,
        ativo: true,
        periodoInicio: periodoInicio ? new Date(periodoInicio) : null,
        periodoFim: periodoFim ? new Date(periodoFim) : null
      }
    });

    res.status(201).json(questionario);
  } catch (error) {
    next(error);
  }
});

// POST /prof/questionarios-padrao/:id/duplicar - Duplicar questionário padrão de um ano para outro
router.post('/questionarios-padrao/:id/duplicar', async (req: AuthRequest, res, next) => {
  try {
    const { ano } = z.object({
      ano: z.number().int().min(2020)
    }).parse(req.body);

    const questionarioOriginal = await prisma.questionario.findUnique({
      where: { id: req.params.id },
      include: {
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!questionarioOriginal) {
      return res.status(404).json({ error: 'Questionário padrão não encontrado' });
    }

    if (!questionarioOriginal.padrao) {
      return res.status(400).json({ error: 'Este não é um questionário padrão' });
    }

    // Verificar se já existe questionário padrão para o novo ano
    const existe = await prisma.questionario.findFirst({
      where: {
        padrao: true,
        ano: ano
      }
    });

    if (existe) {
      return res.status(409).json({ error: `Já existe um questionário padrão para o ano ${ano}` });
    }

    // Criar novo questionário padrão
    const novoQuestionario = await prisma.questionario.create({
      data: {
        titulo: `Pesquisa de Satisfação ${ano}`,
        descricao: `Questionário padrão anual de satisfação do Vida Mais - ${ano}`,
        criadoPor: req.user!.id,
        visibilidade: Visibilidade.GLOBAL,
        padrao: true,
        ano: ano,
        ativo: true,
        periodoInicio: questionarioOriginal.periodoInicio,
        periodoFim: questionarioOriginal.periodoFim
      }
    });

    // Duplicar perguntas
    for (const pergunta of questionarioOriginal.perguntas) {
      await prisma.pergunta.create({
        data: {
          questionarioId: novoQuestionario.id,
          ordem: pergunta.ordem,
          tipo: pergunta.tipo,
          enunciado: pergunta.enunciado,
          obrigatoria: pergunta.obrigatoria,
          opcoesJson: pergunta.opcoesJson
        }
      });
    }

    const questionarioCompleto = await prisma.questionario.findUnique({
      where: { id: novoQuestionario.id },
      include: {
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    res.status(201).json(questionarioCompleto);
  } catch (error) {
    next(error);
  }
});

// ========== RELATÓRIOS ==========

// GET /prof/relatorios/:questionarioId
router.get('/relatorios/:questionarioId', async (req: AuthRequest, res, next) => {
  try {
    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.questionarioId },
      include: {
        perguntas: {
          orderBy: { ordem: 'asc' }
        },
        turma: true
      }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    // Verificar permissão
    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    // Buscar todas as respostas
    const respostas = await prisma.resposta.findMany({
      where: { questionarioId: questionario.id },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true
          }
        },
        pergunta: true
      }
    });

    // Agregar dados por pergunta
    const relatorio = questionario.perguntas.map(pergunta => {
      const respostasPergunta = respostas.filter(r => r.perguntaId === pergunta.id);
      
      let agregacao: any = {};

      if (pergunta.tipo === TipoPergunta.TEXTO) {
        // Respostas anônimas - sem nome do aluno
        agregacao.respostas = respostasPergunta.map((r, index) => ({
          id: index + 1, // ID anônimo sequencial
          texto: r.valorTexto
        }));
      } else if (pergunta.tipo === TipoPergunta.ESCALA) {
        const valores = respostasPergunta.map(r => r.valorNum || 0);
        agregacao.media = valores.length > 0 
          ? valores.reduce((a, b) => a + b, 0) / valores.length 
          : 0;
        agregacao.min = valores.length > 0 ? Math.min(...valores) : 0;
        agregacao.max = valores.length > 0 ? Math.max(...valores) : 0;
      } else if (pergunta.tipo === TipoPergunta.BOOLEAN) {
        const sim = respostasPergunta.filter(r => r.valorBool === true).length;
        const nao = respostasPergunta.filter(r => r.valorBool === false).length;
        agregacao.sim = sim;
        agregacao.nao = nao;
      } else if ([TipoPergunta.MULTIPLA, TipoPergunta.UNICA].includes(pergunta.tipo)) {
        const opcoes = pergunta.opcoesJson ? JSON.parse(pergunta.opcoesJson) : [];
        const distribuicao: Record<string, number> = {};
        
        opcoes.forEach((opcao: string) => {
          distribuicao[opcao] = 0;
        });

        respostasPergunta.forEach(r => {
          if (r.valorOpcao) {
            distribuicao[r.valorOpcao] = (distribuicao[r.valorOpcao] || 0) + 1;
          }
        });

        agregacao.distribuicao = distribuicao;
      }

      return {
        pergunta: {
          id: pergunta.id,
          ordem: pergunta.ordem,
          enunciado: pergunta.enunciado,
          tipo: pergunta.tipo
        },
        totalRespostas: respostasPergunta.length,
        agregacao
      };
    });

    res.json({
      questionario: {
        id: questionario.id,
        titulo: questionario.titulo,
        turma: questionario.turma?.nome
      },
      totalRespondentes: new Set(respostas.map(r => r.alunoId)).size,
      relatorio
    });
  } catch (error) {
    next(error);
  }
});

// GET /prof/relatorios/:questionarioId/respondentes - Lista de quem já respondeu
router.get('/relatorios/:questionarioId/respondentes', async (req: AuthRequest, res, next) => {
  try {
    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.questionarioId },
      select: {
        id: true,
        criadoPor: true
      }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    // Verificar permissão
    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    // Buscar alunos únicos que responderam
    const respostas = await prisma.resposta.findMany({
      where: { questionarioId: questionario.id },
      select: {
        alunoId: true,
        criadoEm: true
      },
      distinct: ['alunoId']
    });

    // Buscar informações dos alunos
    const alunoIds = respostas.map(r => r.alunoId);
    const alunos = await prisma.user.findMany({
      where: {
        id: { in: alunoIds },
        role: Role.ALUNO
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true
      }
    });

    // Combinar dados
    const respondentes = alunos.map(aluno => {
      const resposta = respostas.find(r => r.alunoId === aluno.id);
      return {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.telefone,
        respondidoEm: resposta?.criadoEm
      };
    });

    res.json({
      total: respondentes.length,
      respondentes: respondentes.sort((a, b) => 
        (a.respondidoEm?.getTime() || 0) - (b.respondidoEm?.getTime() || 0)
      )
    });
  } catch (error) {
    next(error);
  }
});

// GET /prof/export/:questionarioId
router.get('/export/:questionarioId', async (req: AuthRequest, res, next) => {
  try {
    const formato = req.query.formato as string || 'xlsx';

    const questionario = await prisma.questionario.findUnique({
      where: { id: req.params.questionarioId },
      include: {
        perguntas: {
          orderBy: { ordem: 'asc' }
        },
        turma: true
      }
    });

    if (!questionario) {
      return res.status(404).json({ error: 'Questionário não encontrado' });
    }

    // Verificar permissão
    if (req.user!.role === Role.PROF && questionario.criadoPor !== req.user!.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    // Buscar respostas
    const respostas = await prisma.resposta.findMany({
      where: { questionarioId: questionario.id },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        pergunta: true
      },
      orderBy: [
        { alunoId: 'asc' },
        { pergunta: { ordem: 'asc' } }
      ]
    });

    if (formato === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Respostas');

      // Cabeçalhos
      const headers = ['Aluno', 'Email', ...questionario.perguntas.map(p => p.enunciado)];
      worksheet.addRow(headers);

      // Agrupar por aluno
      const alunosUnicos = [...new Set(respostas.map(r => r.alunoId))];

      alunosUnicos.forEach(alunoId => {
        const respostasAluno = respostas.filter(r => r.alunoId === alunoId);
        const aluno = respostasAluno[0]?.aluno;
        
        const row = [
          aluno?.nome || '',
          aluno?.email || ''
        ];

        questionario.perguntas.forEach(pergunta => {
          const resposta = respostasAluno.find(r => r.perguntaId === pergunta.id);
          let valor = '';

          if (resposta) {
            if (resposta.valorTexto) valor = resposta.valorTexto;
            else if (resposta.valorNum !== null) valor = String(resposta.valorNum);
            else if (resposta.valorBool !== null) valor = resposta.valorBool ? 'Sim' : 'Não';
            else if (resposta.valorOpcao) valor = resposta.valorOpcao;
          }

          row.push(valor);
        });

        worksheet.addRow(row);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=questionario-${questionario.id}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=questionario-${questionario.id}.csv`);

      // Cabeçalho
      const headers = ['Aluno', 'Email', ...questionario.perguntas.map(p => p.enunciado)];
      res.write(headers.join(',') + '\n');

      // Dados
      const alunosUnicos = [...new Set(respostas.map(r => r.alunoId))];

      alunosUnicos.forEach(alunoId => {
        const respostasAluno = respostas.filter(r => r.alunoId === alunoId);
        const aluno = respostasAluno[0]?.aluno;
        
        const row = [
          aluno?.nome || '',
          aluno?.email || ''
        ];

        questionario.perguntas.forEach(pergunta => {
          const resposta = respostasAluno.find(r => r.perguntaId === pergunta.id);
          let valor = '';

          if (resposta) {
            if (resposta.valorTexto) valor = resposta.valorTexto;
            else if (resposta.valorNum !== null) valor = String(resposta.valorNum);
            else if (resposta.valorBool !== null) valor = resposta.valorBool ? 'Sim' : 'Não';
            else if (resposta.valorOpcao) valor = resposta.valorOpcao;
          }

          row.push(`"${valor}"`);
        });

        res.write(row.join(',') + '\n');
      });

      res.end();
    }
  } catch (error) {
    next(error);
  }
});

export { router as profRouter };

