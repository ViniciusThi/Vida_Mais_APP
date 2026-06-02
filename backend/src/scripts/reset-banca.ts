import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetBanca() {
  console.log('🗑️  Limpeza completa para apresentação da banca...\n');

  const r1 = await prisma.resposta.deleteMany({});
  console.log(`   ✔ ${r1.count} respostas removidas`);

  const r2 = await prisma.convite.deleteMany({});
  console.log(`   ✔ ${r2.count} convites removidos`);

  const r3 = await prisma.pergunta.deleteMany({});
  console.log(`   ✔ ${r3.count} perguntas removidas`);

  const r4 = await prisma.questionario.deleteMany({});
  console.log(`   ✔ ${r4.count} questionários removidos`);

  const r5 = await prisma.alunoTurma.deleteMany({});
  console.log(`   ✔ ${r5.count} vínculos aluno-turma removidos`);

  const r6 = await prisma.turma.deleteMany({});
  console.log(`   ✔ ${r6.count} turmas removidas`);

  const r7 = await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
  console.log(`   ✔ ${r7.count} usuários não-admin removidos`);

  console.log('\n✅ Banco limpo. Pronto para seed de banca.\n');
  await prisma.$disconnect();
}

resetBanca().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
