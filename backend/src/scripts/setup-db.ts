import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🔧 Configurando banco de dados...\n');

  // Extrair informações da DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não encontrada no .env');
    process.exit(1);
  }

  // Parse da URL: postgresql://user:password@host:port/dbname
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    console.error('❌ Formato inválido de DATABASE_URL');
    process.exit(1);
  }

  const [, user, password, host, port, dbname] = match;

  console.log(`📊 Criando banco de dados: ${dbname}`);
  console.log(`   Host: ${host}:${port}`);
  console.log(`   Usuário: ${user}\n`);

  try {
    // Tentar criar o banco de dados
    const createDbCommand = `psql -h ${host} -p ${port} -U ${user} -c "CREATE DATABASE ${dbname};"`;
    
    console.log('Executando criação do banco...');
    
    // No Windows, pode ser necessário definir PGPASSWORD
    const env = { ...process.env, PGPASSWORD: password };
    
    try {
      await execAsync(createDbCommand, { env });
      console.log('✅ Banco de dados criado com sucesso!\n');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Banco de dados já existe, continuando...\n');
      } else {
        throw error;
      }
    }

    console.log('✅ Setup concluído! Agora execute: npm run db:migrate');
  } catch (error: any) {
    console.error('❌ Erro ao configurar banco de dados:');
    console.error(error.message);
    console.log('\n💡 Dica: Certifique-se de que o PostgreSQL está rodando');
    console.log('   e que as credenciais no .env estão corretas.\n');
    process.exit(1);
  }
}

setupDatabase();

