import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpeza de questionários e respostas...');

  const respostas = await prisma.resposta.deleteMany({});
  console.log(`✓ ${respostas.count} respostas removidas`);

  const perguntas = await prisma.pergunta.deleteMany({});
  console.log(`✓ ${perguntas.count} perguntas removidas`);

  const questionarios = await prisma.questionario.deleteMany({});
  console.log(`✓ ${questionarios.count} questionários removidos`);

  console.log('Limpeza concluída com sucesso.');
}

main()
  .catch((e) => {
    console.error('Erro durante a limpeza:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
