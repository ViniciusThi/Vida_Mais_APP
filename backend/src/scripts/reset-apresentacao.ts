import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  console.log('🗑️  Limpando dados de demonstração...');

  const emailsDemo = [
    'admin@vidamais.test',
    'demo_coord1@vidamais.test',
    'demo_coord2@vidamais.test',
    'demo_coord3@vidamais.test',
    'demo_maria@vidamais.test',
    'demo_jose@vidamais.test',
    'demo_ana@vidamais.test',
    'demo_antonio@vidamais.test',
    'demo_benedita@vidamais.test',
    'demo_francisco@vidamais.test',
    'demo_luiza@vidamais.test',
    'demo_raimundo@vidamais.test',
    'demo_sebastiana@vidamais.test',
    'demo_manoel@vidamais.test',
    'demo_conceicao@vidamais.test',
    'demo_pedro@vidamais.test',
    'demo_rosa@vidamais.test',
    'demo_geraldo@vidamais.test',
    'demo_irene@vidamais.test',
  ];

  const gruposIds = ['demo-grupo-1-2025', 'demo-grupo-2-2025', 'demo-grupo-3-2025'];
  const questionariosIds = ['demo-q1-2025', 'demo-q2-2025'];

  // 1. Respostas dos questionários demo
  const deletedRespostas = await prisma.resposta.deleteMany({
    where: { questionarioId: { in: questionariosIds } },
  });
  console.log(`   ✔ ${deletedRespostas.count} respostas removidas`);

  // 2. Convites vinculados aos grupos demo
  const deletedConvites = await prisma.convite.deleteMany({
    where: { turmaId: { in: gruposIds } },
  });
  console.log(`   ✔ ${deletedConvites.count} convites removidos`);

  // 3. Perguntas dos questionários demo
  const deletedPerguntas = await prisma.pergunta.deleteMany({
    where: { questionarioId: { in: questionariosIds } },
  });
  console.log(`   ✔ ${deletedPerguntas.count} perguntas removidas`);

  // 4. Questionários demo
  const deletedQs = await prisma.questionario.deleteMany({
    where: { id: { in: questionariosIds } },
  });
  console.log(`   ✔ ${deletedQs.count} questionários removidos`);

  // 5. Vínculos participante-grupo
  const users = await prisma.user.findMany({
    where: { email: { in: emailsDemo } },
    select: { id: true },
  });
  const userIds = users.map(u => u.id);

  const deletedVinculos = await prisma.alunoTurma.deleteMany({
    where: { alunoId: { in: userIds } },
  });
  console.log(`   ✔ ${deletedVinculos.count} vínculos participante-grupo removidos`);

  // 6. Grupos demo
  const deletedGrupos = await prisma.turma.deleteMany({
    where: { id: { in: gruposIds } },
  });
  console.log(`   ✔ ${deletedGrupos.count} grupos removidos`);

  // 7. Usuários demo
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { in: emailsDemo } },
  });
  console.log(`   ✔ ${deletedUsers.count} usuários removidos`);

  console.log('✅ Limpeza concluída!\n');
  await prisma.$disconnect();
}

reset().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
