import { PrismaClient, TipoPergunta } from '@prisma/client';
import { QUESTIONARIO_PADRAO_2025 } from '../data/questionario-padrao';

const prisma = new PrismaClient();

async function recriarQuestionarioPadrao(ano: number) {
  try {
    console.log(`\n🔄 Recriando questionário padrão para o ano ${ano}...`);

    // 1. Deletar questionário padrão existente (se houver)
    const existente = await prisma.questionario.findFirst({
      where: {
        padrao: true,
        ano: ano
      },
      include: {
        perguntas: true,
        respostas: true
      }
    });

    if (existente) {
      console.log(`⚠️  Encontrado questionário padrão existente para ${ano}`);
      console.log(`   ID: ${existente.id}`);
      console.log(`   Perguntas: ${existente.perguntas.length}`);
      console.log(`   Respostas: ${existente.respostas.length}`);

      if (existente.respostas.length > 0) {
        console.log(`\n❌ ERRO: Este questionário já tem ${existente.respostas.length} respostas!`);
        console.log(`   Não é seguro deletar. Por favor, crie um questionário para ${ano + 1} ao invés disso.`);
        return;
      }

      // Deletar perguntas primeiro
      await prisma.pergunta.deleteMany({
        where: { questionarioId: existente.id }
      });

      // Deletar questionário
      await prisma.questionario.delete({
        where: { id: existente.id }
      });

      console.log(`✅ Questionário antigo deletado com sucesso!`);
    }

    // 2. Buscar o primeiro admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      throw new Error('Nenhum administrador encontrado no sistema');
    }

    // 3. Criar o novo questionário padrão
    console.log(`\n📝 Criando novo questionário com ${QUESTIONARIO_PADRAO_2025.length} perguntas...`);

    const questionario = await prisma.questionario.create({
      data: {
        titulo: `Pesquisa de Satisfação dos Usuários - ${ano}`,
        descricao: `Pesquisa com os Beneficiados do Vida Mais no ano de ${ano}`,
        criadoPor: admin.id,
        padrao: true,
        ano: ano,
        ativo: true, // Ativo por padrão
        visibilidade: 'GLOBAL',
        perguntas: {
          create: QUESTIONARIO_PADRAO_2025.map(p => {
            const pergunta: any = {
              enunciado: p.enunciado,
              tipo: TipoPergunta[p.tipo],
              ordem: p.ordem,
              obrigatoria: p.obrigatoria,
              opcoesJson: null
            };

            // ✅ Adicionar opções se houver
            if (p.opcoes && p.opcoes.length > 0) {
              pergunta.opcoesJson = JSON.stringify(p.opcoes);
              console.log(`   ✅ Pergunta ${p.ordem}: ${p.opcoes.length} opções`);
            }

            return pergunta;
          })
        }
      },
      include: {
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    console.log(`\n✅ Questionário padrão recriado com sucesso!`);
    console.log(`   ID: ${questionario.id}`);
    console.log(`   Título: ${questionario.titulo}`);
    console.log(`   Perguntas: ${questionario.perguntas.length}`);
    console.log(`   Ano: ${questionario.ano}`);
    console.log(`   Ativo: ${questionario.ativo ? 'Sim' : 'Não'}`);

    // Verificar perguntas com opções
    const perguntasComOpcoes = questionario.perguntas.filter(p => p.opcoesJson !== null);
    console.log(`   Perguntas com opções: ${perguntasComOpcoes.length}`);

    return questionario;
  } catch (error) {
    console.error('❌ Erro ao recriar questionário padrão:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const ano = parseInt(process.argv[2]) || new Date().getFullYear();
  recriarQuestionarioPadrao(ano)
    .then(() => {
      console.log('\n✨ Concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro:', error);
      process.exit(1);
    });
}

export { recriarQuestionarioPadrao };

