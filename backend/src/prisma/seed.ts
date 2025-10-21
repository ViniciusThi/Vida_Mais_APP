import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Criar usuários
  console.log('👤 Criando usuários...');

  const senhaHashAdmin = await bcrypt.hash('admin123', 10);
  const senhaHashProf = await bcrypt.hash('prof123', 10);
  const senhaHashAluno = await bcrypt.hash('aluno123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vidamais.com' },
    update: {},
    create: {
      nome: 'Administrador Geral',
      email: 'admin@vidamais.com',
      senhaHash: senhaHashAdmin,
      role: Role.ADMIN
    }
  });
  console.log(`   ✅ Admin: ${admin.email} (senha: admin123)`);

  const prof1 = await prisma.user.upsert({
    where: { email: 'prof1@vidamais.com' },
    update: {},
    create: {
      nome: 'Maria Silva',
      email: 'prof1@vidamais.com',
      senhaHash: senhaHashProf,
      role: Role.PROF
    }
  });
  console.log(`   ✅ Professor: ${prof1.email} (senha: prof123)`);

  const prof2 = await prisma.user.upsert({
    where: { email: 'prof2@vidamais.com' },
    update: {},
    create: {
      nome: 'João Santos',
      email: 'prof2@vidamais.com',
      senhaHash: senhaHashProf,
      role: Role.PROF
    }
  });
  console.log(`   ✅ Professor: ${prof2.email} (senha: prof123)`);

  // Criar alunos
  const alunos = [];
  const nomesAlunos = [
    'Ana Costa', 'Carlos Oliveira', 'Fernanda Lima', 'José Pereira',
    'Mariana Souza', 'Paulo Rodrigues', 'Rita Alves', 'Sérgio Nunes'
  ];

  for (let i = 0; i < nomesAlunos.length; i++) {
    const aluno = await prisma.user.upsert({
      where: { email: `aluno${i + 1}@vidamais.com` },
      update: {},
      create: {
        nome: nomesAlunos[i],
        email: `aluno${i + 1}@vidamais.com`,
        senhaHash: senhaHashAluno,
        role: Role.ALUNO
      }
    });
    alunos.push(aluno);
  }
  console.log(`   ✅ ${alunos.length} alunos criados (senha: aluno123)\n`);

  // Criar turmas
  console.log('🎓 Criando turmas...');

  const turma1 = await prisma.turma.create({
    data: {
      nome: 'Turma Manhã - 2025',
      ano: 2025,
      professorId: prof1.id
    }
  });
  console.log(`   ✅ ${turma1.nome} (Prof. ${prof1.nome})`);

  const turma2 = await prisma.turma.create({
    data: {
      nome: 'Turma Tarde - 2025',
      ano: 2025,
      professorId: prof2.id
    }
  });
  console.log(`   ✅ ${turma2.nome} (Prof. ${prof2.nome})\n`);

  // Vincular alunos às turmas
  console.log('🔗 Vinculando alunos às turmas...');

  // Metade na turma 1, metade na turma 2
  for (let i = 0; i < alunos.length; i++) {
    const turmaId = i < alunos.length / 2 ? turma1.id : turma2.id;
    await prisma.alunoTurma.create({
      data: {
        alunoId: alunos[i].id,
        turmaId
      }
    });
  }
  console.log(`   ✅ ${alunos.length} vínculos criados\n`);

  // Criar questionário de exemplo
  console.log('📝 Criando questionário de exemplo...');

  const questionario = await prisma.questionario.create({
    data: {
      titulo: 'Pesquisa de Satisfação 2025',
      descricao: 'Pesquisa anual de satisfação dos alunos',
      criadoPor: prof1.id,
      visibilidade: 'TURMA',
      turmaId: turma1.id,
      ativo: true,
      periodoInicio: new Date('2025-01-01'),
      periodoFim: new Date('2025-12-31')
    }
  });
  console.log(`   ✅ ${questionario.titulo}`);

  // Criar perguntas
  await prisma.pergunta.createMany({
    data: [
      {
        questionarioId: questionario.id,
        ordem: 1,
        tipo: 'ESCALA',
        enunciado: 'Como você avalia as atividades oferecidas?',
        obrigatoria: true,
        opcoesJson: null
      },
      {
        questionarioId: questionario.id,
        ordem: 2,
        tipo: 'UNICA',
        enunciado: 'Você se sente acolhido na instituição?',
        obrigatoria: true,
        opcoesJson: JSON.stringify(['Sempre', 'Às vezes', 'Raramente', 'Nunca'])
      },
      {
        questionarioId: questionario.id,
        ordem: 3,
        tipo: 'BOOLEAN',
        enunciado: 'Você recomendaria a Vida Mais para outros?',
        obrigatoria: true,
        opcoesJson: null
      },
      {
        questionarioId: questionario.id,
        ordem: 4,
        tipo: 'TEXTO',
        enunciado: 'Deixe sua sugestão ou comentário:',
        obrigatoria: false,
        opcoesJson: null
      }
    ]
  });
  console.log(`   ✅ 4 perguntas criadas\n`);

  console.log('✅ Seed concluído com sucesso!\n');
  console.log('📋 Resumo:');
  console.log(`   - 1 Admin: admin@vidamais.com / admin123`);
  console.log(`   - 2 Professores: prof1@vidamais.com / prof123`);
  console.log(`   - ${alunos.length} Alunos: aluno1@vidamais.com / aluno123 (e assim por diante)`);
  console.log(`   - 2 Turmas com alunos vinculados`);
  console.log(`   - 1 Questionário de exemplo`);
  console.log();
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

