import { PrismaClient } from '@prisma/client';
import { deleteFace } from '../services/rekognition.service';

const prisma = new PrismaClient();

async function limparRostos() {
  console.log('🗑️  Limpando cadastros faciais...');

  const usuarios = await prisma.user.findMany({
    where: { faceRegistrada: true },
    select: { id: true, nome: true, email: true, faceId: true },
  });

  if (usuarios.length === 0) {
    console.log('   Nenhum rosto cadastrado encontrado.');
    await prisma.$disconnect();
    return;
  }

  console.log(`   Encontrados ${usuarios.length} usuário(s) com rosto cadastrado.`);

  let removidos = 0;
  let erros = 0;

  for (const user of usuarios) {
    try {
      if (user.faceId) {
        await deleteFace(user.faceId);
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { faceId: null, faceRegistrada: false },
      });
      console.log(`   ✔ ${user.nome} (${user.email})`);
      removidos++;
    } catch (err: any) {
      console.error(`   ✖ Erro em ${user.email}: ${err.message}`);
      // Mesmo com erro no Rekognition, limpa o banco
      await prisma.user.update({
        where: { id: user.id },
        data: { faceId: null, faceRegistrada: false },
      });
      erros++;
    }
  }

  console.log(`\n✅ Concluído: ${removidos} removidos, ${erros} com erro no Rekognition (banco limpo de qualquer forma).`);
  await prisma.$disconnect();
}

limparRostos().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
