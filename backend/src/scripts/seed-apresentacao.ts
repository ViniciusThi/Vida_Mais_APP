import { PrismaClient, TipoPergunta, Visibilidade } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const GRUPOS = [
  { nome: 'Grupo Manhã', ano: 2025 },
  { nome: 'Grupo Tarde', ano: 2025 },
  { nome: 'Grupo Noite', ano: 2025 },
];

const PARTICIPANTES = [
  { nome: 'Maria Aparecida Silva', email: 'demo_maria@vidamais.test', telefone: '19991110001', idade: 67, cep: '13970000', logradouro: 'Rua XV de Novembro, Centro - Itapira/SP' },
  { nome: 'José Carlos Souza', email: 'demo_jose@vidamais.test', telefone: '19991110002', idade: 72, cep: '13970000', logradouro: 'Rua XV de Novembro, Centro - Itapira/SP' },
  { nome: 'Ana Lima Ferreira', email: 'demo_ana@vidamais.test', telefone: '19991110003', idade: 65, cep: '13971000', logradouro: 'Av. Marginal, Bairro Industrial - Itapira/SP' },
  { nome: 'Antonio Rodrigues', email: 'demo_antonio@vidamais.test', telefone: '19991110004', idade: 78, cep: '13971000', logradouro: 'Av. Marginal, Bairro Industrial - Itapira/SP' },
  { nome: 'Benedita Costa Oliveira', email: 'demo_benedita@vidamais.test', telefone: '19991110005', idade: 69, cep: '13972000', logradouro: 'Rua Ouro Preto, Jardim América - Itapira/SP' },
  { nome: 'Francisco Alves', email: 'demo_francisco@vidamais.test', telefone: '19991110006', idade: 73, cep: '13972000', logradouro: 'Rua Ouro Preto, Jardim América - Itapira/SP' },
  { nome: 'Luíza Pereira Santos', email: 'demo_luiza@vidamais.test', telefone: '19991110007', idade: 66, cep: '13970000', logradouro: 'Rua XV de Novembro, Centro - Itapira/SP' },
  { nome: 'Raimundo Nonato', email: 'demo_raimundo@vidamais.test', telefone: '19991110008', idade: 80, cep: '13971000', logradouro: 'Av. Marginal, Bairro Industrial - Itapira/SP' },
  { nome: 'Sebastiana Gonçalves', email: 'demo_sebastiana@vidamais.test', telefone: '19991110009', idade: 64, cep: '13972000', logradouro: 'Rua Ouro Preto, Jardim América - Itapira/SP' },
  { nome: 'Manoel de Jesus', email: 'demo_manoel@vidamais.test', telefone: '19991110010', idade: 71, cep: '13970000', logradouro: 'Rua XV de Novembro, Centro - Itapira/SP' },
  { nome: 'Conceição Barros', email: 'demo_conceicao@vidamais.test', telefone: '19991110011', idade: 75, cep: '13971000', logradouro: 'Av. Marginal, Bairro Industrial - Itapira/SP' },
  { nome: 'Pedro Henrique Lima', email: 'demo_pedro@vidamais.test', telefone: '19991110012', idade: 63, cep: '13972000', logradouro: 'Rua Ouro Preto, Jardim América - Itapira/SP' },
  { nome: 'Rosa Maria Teixeira', email: 'demo_rosa@vidamais.test', telefone: '19991110013', idade: 68, cep: '13970000', logradouro: 'Rua XV de Novembro, Centro - Itapira/SP' },
  { nome: 'Geraldo Augusto', email: 'demo_geraldo@vidamais.test', telefone: '19991110014', idade: 77, cep: '13971000', logradouro: 'Av. Marginal, Bairro Industrial - Itapira/SP' },
  { nome: 'Irene Campos Rocha', email: 'demo_irene@vidamais.test', telefone: '19991110015', idade: 70, cep: '13972000', logradouro: 'Rua Ouro Preto, Jardim América - Itapira/SP' },
];

const PERGUNTAS_Q1 = [
  { ordem: 1, tipo: TipoPergunta.ESCALA, enunciado: 'Como você avalia sua qualidade de vida atual? (0 = muito ruim, 10 = excelente)', obrigatoria: true },
  { ordem: 2, tipo: TipoPergunta.BOOLEAN, enunciado: 'Você praticou alguma atividade física nos últimos 7 dias?', obrigatoria: true },
  { ordem: 3, tipo: TipoPergunta.UNICA, enunciado: 'Com que frequência você participa das atividades do programa?', obrigatoria: true, opcoes: ['Sempre', 'Quase sempre', 'Às vezes', 'Raramente'] },
  { ordem: 4, tipo: TipoPergunta.ESCALA, enunciado: 'Qual é o seu nível de satisfação com o programa Vida Mais? (0 = insatisfeito, 10 = muito satisfeito)', obrigatoria: true },
  { ordem: 5, tipo: TipoPergunta.TEXTO, enunciado: 'O que mais gosta nas atividades do programa? (opcional)', obrigatoria: false },
];

const PERGUNTAS_Q2 = [
  { ordem: 1, tipo: TipoPergunta.ESCALA, enunciado: 'Como você avalia seu bem-estar emocional esta semana? (0 = muito ruim, 10 = ótimo)', obrigatoria: true },
  { ordem: 2, tipo: TipoPergunta.BOOLEAN, enunciado: 'Você dormiu bem nos últimos 3 dias?', obrigatoria: true },
  { ordem: 3, tipo: TipoPergunta.UNICA, enunciado: 'Como está sua alimentação?', obrigatoria: true, opcoes: ['Muito boa', 'Boa', 'Regular', 'Ruim'] },
  { ordem: 4, tipo: TipoPergunta.BOOLEAN, enunciado: 'Você se sentiu acompanhado e apoiado nesta semana?', obrigatoria: true },
  { ordem: 5, tipo: TipoPergunta.ESCALA, enunciado: 'Quanto você recomendaria o programa para um amigo? (0 a 10)', obrigatoria: true },
];

function notaAleatoria(media: number, variancia: number): number {
  const v = Math.round(media + (Math.random() - 0.5) * variancia * 2);
  return Math.max(0, Math.min(10, v));
}

async function seed() {
  console.log('🌱 Iniciando seed de apresentação...');

  const senhaHash = await bcrypt.hash('demo1234', 10);

  // Buscar ou criar admin
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: { nome: 'Administrador Demo', email: 'admin@vidamais.test', senhaHash, role: 'ADMIN', ativo: true, idade: 40 },
    });
    console.log('✅ Admin criado');
  }

  // Criar 3 coordenadores (PROF)
  const profs = [];
  for (let i = 0; i < GRUPOS.length; i++) {
    const prof = await prisma.user.upsert({
      where: { email: `demo_coord${i + 1}@vidamais.test` },
      update: {},
      create: {
        nome: `Coordenadora ${['Ana', 'Beatriz', 'Carlos'][i]}`,
        email: `demo_coord${i + 1}@vidamais.test`,
        telefone: `199911200${i + 1}`,
        senhaHash,
        role: 'PROF',
        ativo: true,
        idade: 35 + i * 5,
      },
    });
    profs.push(prof);
  }
  console.log('✅ 3 coordenadores criados');

  // Criar 3 grupos
  const grupos = [];
  for (let i = 0; i < GRUPOS.length; i++) {
    const grupo = await prisma.turma.upsert({
      where: { id: `demo-grupo-${i + 1}-2025` } as any,
      update: {},
      create: {
        id: `demo-grupo-${i + 1}-2025`,
        nome: GRUPOS[i].nome,
        ano: GRUPOS[i].ano,
        professorId: profs[i].id,
        ativo: true,
      },
    });
    grupos.push(grupo);
  }
  console.log('✅ 3 grupos criados');

  // Criar participantes e distribuir nos grupos
  const participantes = [];
  for (let i = 0; i < PARTICIPANTES.length; i++) {
    const p = PARTICIPANTES[i];
    const part = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        nome: p.nome,
        email: p.email,
        telefone: p.telefone,
        senhaHash,
        role: 'ALUNO',
        ativo: true,
        idade: p.idade,
        cep: p.cep,
        logradouro: p.logradouro,
      },
    });
    participantes.push(part);

    // Distribuir: 5 por grupo
    const grupoIdx = Math.floor(i / 5);
    const grupo = grupos[grupoIdx] ?? grupos[grupos.length - 1];

    await prisma.alunoTurma.upsert({
      where: { alunoId_turmaId: { alunoId: part.id, turmaId: grupo.id } },
      update: {},
      create: { alunoId: part.id, turmaId: grupo.id },
    });
  }
  console.log(`✅ ${participantes.length} participantes criados e vinculados`);

  // Criar questionários
  const q1 = await prisma.questionario.upsert({
    where: { id: 'demo-q1-2025' } as any,
    update: {},
    create: {
      id: 'demo-q1-2025',
      titulo: 'Avaliação de Qualidade de Vida — 2025',
      descricao: 'Questionário semestral de bem-estar dos participantes',
      criadoPor: profs[0].id,
      visibilidade: Visibilidade.GLOBAL,
      ativo: true,
      padrao: true,
      ano: 2025,
      perguntas: {
        create: PERGUNTAS_Q1.map((p) => ({
          ...p,
          opcoesJson: p.opcoes ? JSON.stringify(p.opcoes) : null,
        })),
      },
    },
    include: { perguntas: true },
  });

  const q2 = await prisma.questionario.upsert({
    where: { id: 'demo-q2-2025' } as any,
    update: {},
    create: {
      id: 'demo-q2-2025',
      titulo: 'Check-in Semanal de Bem-Estar',
      descricao: 'Acompanhamento semanal rápido',
      criadoPor: profs[1].id,
      turmaId: grupos[1].id,
      visibilidade: Visibilidade.TURMA,
      ativo: true,
      perguntas: {
        create: PERGUNTAS_Q2.map((p) => ({
          ...p,
          opcoesJson: p.opcoes ? JSON.stringify(p.opcoes) : null,
        })),
      },
    },
    include: { perguntas: true },
  });
  console.log('✅ 2 questionários criados');

  // Gerar respostas para Q1 (todos os participantes)
  let respostasQ1 = 0;
  for (let i = 0; i < participantes.length; i++) {
    const part = participantes[i];
    const grupoIdx = Math.floor(i / 5);
    const grupo = grupos[grupoIdx] ?? grupos[grupos.length - 1];
    const nota = notaAleatoria(7.5, 2.5);

    for (const pergunta of q1.perguntas) {
      const existing = await prisma.resposta.findFirst({
        where: { questionarioId: q1.id, alunoId: part.id, perguntaId: pergunta.id },
      });
      if (existing) continue;

      let valorTexto = null, valorNum = null, valorBool = null, valorOpcao = null;

      if (pergunta.tipo === 'ESCALA') {
        valorNum = pergunta.ordem === 1 ? nota : notaAleatoria(8, 2);
      } else if (pergunta.tipo === 'BOOLEAN') {
        valorBool = Math.random() > 0.3;
      } else if (pergunta.tipo === 'UNICA') {
        const opcoes = JSON.parse(pergunta.opcoesJson || '[]');
        const idx = nota >= 7 ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
        valorOpcao = opcoes[Math.min(idx, opcoes.length - 1)];
      } else if (pergunta.tipo === 'TEXTO' && !pergunta.obrigatoria && Math.random() > 0.4) {
        const textos = ['Adoro as atividades físicas!', 'O convívio com os colegas é ótimo.', 'As dançasé minha parte favorita.', 'Gosto muito das rodas de conversa.'];
        valorTexto = textos[Math.floor(Math.random() * textos.length)];
      }

      if (pergunta.tipo !== 'TEXTO' || valorTexto) {
        await prisma.resposta.create({
          data: { questionarioId: q1.id, perguntaId: pergunta.id, alunoId: part.id, turmaId: grupo.id, valorTexto, valorNum, valorBool, valorOpcao },
        });
        respostasQ1++;
      }
    }
  }
  console.log(`✅ ${respostasQ1} respostas geradas para Q1`);

  // Gerar respostas para Q2 (apenas grupo Tarde — q2 é TURMA)
  const participantesTarde = participantes.slice(5, 10);
  let respostasQ2 = 0;
  for (const part of participantesTarde) {
    for (const pergunta of q2.perguntas) {
      const existing = await prisma.resposta.findFirst({
        where: { questionarioId: q2.id, alunoId: part.id, perguntaId: pergunta.id },
      });
      if (existing) continue;

      let valorNum = null, valorBool = null, valorOpcao = null;
      if (pergunta.tipo === 'ESCALA') {
        valorNum = notaAleatoria(7, 3);
      } else if (pergunta.tipo === 'BOOLEAN') {
        valorBool = Math.random() > 0.25;
      } else if (pergunta.tipo === 'UNICA') {
        const opcoes = JSON.parse(pergunta.opcoesJson || '[]');
        valorOpcao = opcoes[Math.floor(Math.random() * opcoes.length)];
      }

      await prisma.resposta.create({
        data: { questionarioId: q2.id, perguntaId: pergunta.id, alunoId: part.id, turmaId: grupos[1].id, valorNum, valorBool, valorOpcao },
      });
      respostasQ2++;
    }
  }
  console.log(`✅ ${respostasQ2} respostas geradas para Q2`);

  console.log('\n🎉 Seed de apresentação concluído!');
  console.log('   Credenciais de acesso: senha = demo1234');
  console.log('   Admin:       admin@vidamais.test');
  console.log('   Coord 1:     demo_coord1@vidamais.test (Grupo Manhã)');
  console.log('   Coord 2:     demo_coord2@vidamais.test (Grupo Tarde)');
  console.log('   Coord 3:     demo_coord3@vidamais.test (Grupo Noite)');
  console.log('   Participante: demo_maria@vidamais.test');

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
