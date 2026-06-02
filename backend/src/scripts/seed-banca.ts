import { PrismaClient, TipoPergunta, Visibilidade } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TURMAS = [
  { id: 'banca-turma-1-2026', nome: 'Dança de Salão', ano: 2026 },
  { id: 'banca-turma-2-2026', nome: 'Hidroginástica', ano: 2026 },
  { id: 'banca-turma-3-2026', nome: 'Artesanato — Vida e Arte', ano: 2026 },
  { id: 'banca-turma-4-2026', nome: 'Vida Digital — Informática', ano: 2026 },
  { id: 'banca-turma-5-2026', nome: 'Letramento & Memória', ano: 2026 },
];

const CEPS = [
  { cep: '13970000', logradouro: 'Rua XV de Novembro, 100 — Centro, Itapira/SP' },
  { cep: '13971000', logradouro: 'Av. Marginal, 250 — Bairro Industrial, Itapira/SP' },
  { cep: '13972000', logradouro: 'Rua Ouro Preto, 45 — Jardim América, Itapira/SP' },
  { cep: '13970390', logradouro: 'Rua Santos Dumont, 320 — Jardim São José, Itapira/SP' },
  { cep: '13971610', logradouro: 'Rua das Flores, 78 — Jardim São Paulo, Itapira/SP' },
];

// 5 alunos por turma — 25 no total
const ALUNOS: { nome: string; email: string; telefone: string; idade: number }[] = [
  // Turma 1 — Dança de Salão
  { nome: 'Maria Aparecida Silva',    email: 'banca_aluno1@vidamais.test',  telefone: '19991120001', idade: 67 },
  { nome: 'José Carlos Souza',        email: 'banca_aluno2@vidamais.test',  telefone: '19991120002', idade: 72 },
  { nome: 'Ana Lima Ferreira',        email: 'banca_aluno3@vidamais.test',  telefone: '19991120003', idade: 65 },
  { nome: 'Antonio Rodrigues',        email: 'banca_aluno4@vidamais.test',  telefone: '19991120004', idade: 78 },
  { nome: 'Benedita Costa Oliveira',  email: 'banca_aluno5@vidamais.test',  telefone: '19991120005', idade: 69 },
  // Turma 2 — Hidroginástica
  { nome: 'Francisco Alves',          email: 'banca_aluno6@vidamais.test',  telefone: '19991120006', idade: 73 },
  { nome: 'Luíza Pereira Santos',     email: 'banca_aluno7@vidamais.test',  telefone: '19991120007', idade: 66 },
  { nome: 'Raimundo Nonato',          email: 'banca_aluno8@vidamais.test',  telefone: '19991120008', idade: 80 },
  { nome: 'Sebastiana Gonçalves',     email: 'banca_aluno9@vidamais.test',  telefone: '19991120009', idade: 64 },
  { nome: 'Manoel de Jesus',          email: 'banca_aluno10@vidamais.test', telefone: '19991120010', idade: 71 },
  // Turma 3 — Artesanato — Vida e Arte
  { nome: 'Conceição Barros',         email: 'banca_aluno11@vidamais.test', telefone: '19991120011', idade: 75 },
  { nome: 'Pedro Henrique Lima',      email: 'banca_aluno12@vidamais.test', telefone: '19991120012', idade: 63 },
  { nome: 'Rosa Maria Teixeira',      email: 'banca_aluno13@vidamais.test', telefone: '19991120013', idade: 68 },
  { nome: 'Geraldo Augusto',          email: 'banca_aluno14@vidamais.test', telefone: '19991120014', idade: 77 },
  { nome: 'Irene Campos Rocha',       email: 'banca_aluno15@vidamais.test', telefone: '19991120015', idade: 70 },
  // Turma 4 — Vida Digital — Informática
  { nome: 'Gilberto Santos',          email: 'banca_aluno16@vidamais.test', telefone: '19991120016', idade: 74 },
  { nome: 'Neuza Ferreira',           email: 'banca_aluno17@vidamais.test', telefone: '19991120017', idade: 62 },
  { nome: 'Orlando Matos',            email: 'banca_aluno18@vidamais.test', telefone: '19991120018', idade: 79 },
  { nome: 'Teresinha Costa',          email: 'banca_aluno19@vidamais.test', telefone: '19991120019', idade: 66 },
  { nome: 'Valdomiro Lima',           email: 'banca_aluno20@vidamais.test', telefone: '19991120020', idade: 73 },
  // Turma 5 — Letramento & Memória
  { nome: 'Adelaide Rocha',           email: 'banca_aluno21@vidamais.test', telefone: '19991120021', idade: 68 },
  { nome: 'Bernardo Fonseca',         email: 'banca_aluno22@vidamais.test', telefone: '19991120022', idade: 76 },
  { nome: 'Célia Teixeira',           email: 'banca_aluno23@vidamais.test', telefone: '19991120023', idade: 63 },
  { nome: 'Dirceu Mendes',            email: 'banca_aluno24@vidamais.test', telefone: '19991120024', idade: 81 },
  { nome: 'Eunice Barbosa',           email: 'banca_aluno25@vidamais.test', telefone: '19991120025', idade: 70 },
];

const PERGUNTAS_Q1 = [
  { ordem: 1, tipo: TipoPergunta.ESCALA,  enunciado: 'Como você avalia sua qualidade de vida atual? (0 = muito ruim, 10 = excelente)', obrigatoria: true },
  { ordem: 2, tipo: TipoPergunta.BOOLEAN, enunciado: 'Você praticou alguma atividade física nos últimos 7 dias?', obrigatoria: true },
  { ordem: 3, tipo: TipoPergunta.UNICA,   enunciado: 'Com que frequência você participa das atividades do programa?', obrigatoria: true, opcoes: ['Sempre', 'Quase sempre', 'Às vezes', 'Raramente'] },
  { ordem: 4, tipo: TipoPergunta.ESCALA,  enunciado: 'Qual é o seu nível de satisfação com o programa Vida Mais? (0 = insatisfeito, 10 = muito satisfeito)', obrigatoria: true },
  { ordem: 5, tipo: TipoPergunta.TEXTO,   enunciado: 'O que mais gosta nas atividades do programa? (opcional)', obrigatoria: false },
];

function notaAleatoria(media: number, variancia: number) {
  return Math.max(0, Math.min(10, Math.round(media + (Math.random() - 0.5) * variancia * 2)));
}

async function seed() {
  console.log('🌱 Iniciando seed de banca...\n');

  const senhaHash = await bcrypt.hash('demo1234', 10);

  // Admin — mantém o existente ou cria um novo
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: { nome: 'Administrador', email: 'admin@vidamais.com', senhaHash, role: 'ADMIN', ativo: true },
    });
    console.log('   ✔ Admin criado (admin@vidamais.com / demo1234)');
  } else {
    console.log(`   ✔ Admin existente mantido (${admin.email})`);
  }

  // 1 Professor
  const prof = await prisma.user.upsert({
    where: { email: 'prof@vidamais.test' },
    update: {},
    create: {
      nome: 'Coordenadora Ana Paula Martins',
      email: 'prof@vidamais.test',
      telefone: '19991120000',
      senhaHash,
      role: 'PROF',
      ativo: true,
      idade: 42,
    },
  });
  console.log('   ✔ Professor criado (prof@vidamais.test / demo1234)');

  // 5 Turmas
  const turmas = [];
  for (const t of TURMAS) {
    const turma = await prisma.turma.upsert({
      where: { id: t.id } as any,
      update: {},
      create: { id: t.id, nome: t.nome, ano: t.ano, professorId: prof.id, ativo: true },
    });
    turmas.push(turma);
  }
  console.log('   ✔ 5 turmas criadas (Dança de Salão, Hidroginástica, Artesanato, Vida Digital, Letramento)');

  // 25 Alunos — 5 por turma, 1 CEP diferente por aluno dentro de cada turma
  const alunos = [];
  for (let i = 0; i < ALUNOS.length; i++) {
    const a = ALUNOS[i];
    const cepData = CEPS[i % 5]; // CEP varia dentro de cada turma (0..4, repetindo)
    const aluno = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        nome: a.nome,
        email: a.email,
        telefone: a.telefone,
        senhaHash,
        role: 'ALUNO',
        ativo: true,
        idade: a.idade,
        cep: cepData.cep,
        logradouro: cepData.logradouro,
      },
    });
    alunos.push(aluno);

    const turmaIdx = Math.floor(i / 5);
    await prisma.alunoTurma.upsert({
      where: { alunoId_turmaId: { alunoId: aluno.id, turmaId: turmas[turmaIdx].id } },
      update: {},
      create: { alunoId: aluno.id, turmaId: turmas[turmaIdx].id },
    });
  }
  console.log('   ✔ 25 alunos criados e vinculados (5 por turma, CEPs variados de Itapira)');

  // Questionário global com respostas simuladas
  const q = await prisma.questionario.upsert({
    where: { id: 'banca-q1-2026' } as any,
    update: {},
    create: {
      id: 'banca-q1-2026',
      titulo: 'Avaliação de Qualidade de Vida — 2026',
      descricao: 'Questionário anual de bem-estar dos participantes do Vida Mais',
      criadoPor: prof.id,
      visibilidade: Visibilidade.GLOBAL,
      ativo: true,
      padrao: true,
      ano: 2026,
      perguntas: {
        create: PERGUNTAS_Q1.map(({ opcoes, ...p }) => ({
          ...p,
          opcoesJson: opcoes ? JSON.stringify(opcoes) : null,
        })),
      },
    },
    include: { perguntas: true },
  });
  console.log('   ✔ Questionário "Avaliação de Qualidade de Vida — 2026" criado');

  // Respostas simuladas para todos os 25 alunos
  const textosSatisfacao = [
    'Adoro as atividades de dança!',
    'O convívio com os colegas é maravilhoso.',
    'As aulas de ginástica melhoraram muito minha saúde.',
    'Gosto muito das rodas de conversa e das aulas práticas.',
    'Me sinto muito bem aqui, é como uma segunda família.',
  ];

  let totalRespostas = 0;
  for (let i = 0; i < alunos.length; i++) {
    const aluno = alunos[i];
    const turmaIdx = Math.floor(i / 5);
    const nota = notaAleatoria(7.8, 2);

    for (const pergunta of q.perguntas) {
      let valorTexto = null, valorNum = null, valorBool = null, valorOpcao = null;

      if (pergunta.tipo === 'ESCALA') {
        valorNum = pergunta.ordem === 1 ? nota : notaAleatoria(8, 2);
      } else if (pergunta.tipo === 'BOOLEAN') {
        valorBool = Math.random() > 0.2;
      } else if (pergunta.tipo === 'UNICA') {
        const opcoes: string[] = JSON.parse(pergunta.opcoesJson || '[]');
        const idx = nota >= 7 ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
        valorOpcao = opcoes[Math.min(idx, opcoes.length - 1)];
      } else if (pergunta.tipo === 'TEXTO' && !pergunta.obrigatoria && Math.random() > 0.35) {
        valorTexto = textosSatisfacao[i % textosSatisfacao.length];
      }

      if (pergunta.tipo !== 'TEXTO' || valorTexto) {
        await prisma.resposta.create({
          data: {
            questionarioId: q.id,
            perguntaId: pergunta.id,
            alunoId: aluno.id,
            turmaId: turmas[turmaIdx].id,
            valorTexto,
            valorNum,
            valorBool,
            valorOpcao,
          },
        });
        totalRespostas++;
      }
    }
  }
  console.log(`   ✔ ${totalRespostas} respostas simuladas geradas`);

  console.log('\n🎉 Seed de banca concluído!\n');
  console.log('   Credenciais (senha: demo1234)');
  console.log(`   Admin:  ${admin.email}`);
  console.log('   Prof:   prof@vidamais.test');
  console.log('   Alunos: banca_aluno1@vidamais.test  até  banca_aluno25@vidamais.test\n');
  console.log('   Turmas:');
  TURMAS.forEach((t, i) => console.log(`     ${i + 1}. ${t.nome}`));

  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
