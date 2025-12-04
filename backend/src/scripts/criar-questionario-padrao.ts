import { PrismaClient, TipoPergunta } from '@prisma/client';
import { QUESTIONARIO_PADRAO_2025 } from '../data/questionario-padrao';

const prisma = new PrismaClient();

async function criarQuestionarioPadrao(ano: number) {
  try {
    console.log(`\n🔄 Criando questionário padrão para o ano ${ano}...`);

    // Verificar se já existe um questionário padrão para este ano
    const existente = await prisma.questionario.findFirst({
      where: {
        padrao: true,
        ano: ano
      }
    });

    if (existente) {
      console.log(`⚠️  Já existe um questionário padrão para o ano ${ano}`);
      console.log(`   ID: ${existente.id}`);
      console.log(`   Ativo: ${existente.ativo ? 'Sim' : 'Não'}`);
      return existente;
    }

    // Buscar o primeiro admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      throw new Error('Nenhum administrador encontrado no sistema');
    }

    // Criar o questionário padrão
    const questionario = await prisma.questionario.create({
      data: {
        titulo: `Pesquisa de Satisfação dos Usuários - ${ano}`,
        descricao: `Pesquisa com os Beneficiados do Forms Tech no ano de ${ano}`,
        criadoPor: admin.id, // Admin principal
        padrao: true,
        ano: ano,
        ativo: false, // Começa inativo até o admin lançar
        perguntas: {
          create: QUESTIONARIO_PADRAO_2025.map(p => ({
            enunciado: p.enunciado,
            tipo: TipoPergunta[p.tipo],
            opcoesJson: p.opcoes ? JSON.stringify(p.opcoes) : null,
            ordem: p.ordem,
            obrigatoria: p.obrigatoria
          }))
        }
      },
      include: {
        perguntas: true
      }
    });

    console.log(`✅ Questionário padrão criado com sucesso!`);
    console.log(`   ID: ${questionario.id}`);
    console.log(`   Título: ${questionario.titulo}`);
    console.log(`   Perguntas: ${questionario.perguntas.length}`);
    console.log(`   Ano: ${questionario.ano}`);
    console.log(`   Ativo: ${questionario.ativo ? 'Sim' : 'Não'}`);

    return questionario;
  } catch (error) {
    console.error('❌ Erro ao criar questionário padrão:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const ano = parseInt(process.argv[2]) || new Date().getFullYear();
  criarQuestionarioPadrao(ano)
    .then(() => {
      console.log('\n✨ Concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro:', error);
      process.exit(1);
    });
}

export { criarQuestionarioPadrao };

