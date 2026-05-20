import { PrismaClient } from '@prisma/client';
import {
  RekognitionClient,
  ListFacesCommand,
  DeleteFacesCommand,
} from '@aws-sdk/client-rekognition';

const prisma = new PrismaClient();

const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION_ID || 'vida-mais-faces';

function getClient() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) throw new Error('AWS credentials não configuradas');
  return new RekognitionClient({
    region: process.env.AWS_REGION || 'sa-east-1',
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function limparRostos() {
  console.log('🗑️  Limpando cadastros faciais...\n');

  const client = getClient();

  // 1. Listar e deletar todos os faces da collection AWS
  try {
    const listResp = await client.send(new ListFacesCommand({ CollectionId: COLLECTION_ID }));
    const faceIds = (listResp.Faces ?? []).map(f => f.FaceId!).filter(Boolean);

    if (faceIds.length > 0) {
      await client.send(new DeleteFacesCommand({ CollectionId: COLLECTION_ID, FaceIds: faceIds }));
      console.log(`   ✔ ${faceIds.length} rosto(s) removido(s) do Rekognition`);
    } else {
      console.log('   Nenhum rosto encontrado no Rekognition');
    }
  } catch (err: any) {
    console.warn(`   ⚠ Erro no Rekognition (continuando): ${err.message}`);
  }

  // 2. Zerar faceId e faceRegistrada no banco
  const result = await prisma.user.updateMany({
    where: { faceRegistrada: true },
    data: { faceId: null, faceRegistrada: false },
  });
  console.log(`   ✔ ${result.count} usuário(s) zerados no banco de dados`);

  console.log('\n✅ Cadastros faciais limpos. Todos podem registrar o rosto novamente.');
  await prisma.$disconnect();
}

limparRostos().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
