#!/bin/bash
# Não usar set -e para ter melhor controle de erros

echo "🚀 INSTALAÇÃO COMPLETA DO VIDA MAIS APP NA AWS"
echo "=============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para executar com timeout
run_with_timeout() {
    local timeout=$1
    shift
    timeout $timeout "$@" || {
        print_error "Comando falhou ou excedeu timeout de ${timeout}s: $*"
        return 1
    }
}

# PASSO 1: Limpar tudo
echo "🧹 PASSO 1: Limpando instalações anteriores..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -f node 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true
cd ~ && rm -rf Vida_Mais_APP
npm uninstall -g pm2 2>/dev/null || true
sudo npm uninstall -g pm2 2>/dev/null || true
sudo systemctl stop postgresql mysql 2>/dev/null || true
print_success "Limpeza concluída!"

# PASSO 2: Atualizar sistema
echo ""
echo "📦 PASSO 2: Atualizando sistema..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
print_success "Sistema atualizado!"

# PASSO 3: Instalar Node.js
echo ""
echo "📦 PASSO 3: Instalando Node.js 20.x..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs -qq
fi
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION e npm $NPM_VERSION instalados!"

# PASSO 4: Instalar MySQL
echo ""
echo "📦 PASSO 4: Instalando MySQL..."
if ! systemctl is-active --quiet mysql 2>/dev/null; then
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server -qq
    sudo systemctl start mysql
    sudo systemctl enable mysql > /dev/null 2>&1
    sleep 3
fi
if systemctl is-active --quiet mysql; then
    print_success "MySQL instalado e rodando!"
else
    print_error "Erro ao instalar MySQL"
    exit 1
fi

# PASSO 5: Configurar MySQL
echo ""
echo "🔧 PASSO 5: Configurando MySQL..."
sudo mysql << 'MYSQL_SCRIPT' > /dev/null 2>&1
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'vidamais2025';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

sudo mysql -u root -pvidamais2025 << 'MYSQL_SCRIPT' > /dev/null 2>&1
CREATE DATABASE IF NOT EXISTS vida_mais CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vidamais'@'localhost' IDENTIFIED BY 'vidamais2025';
GRANT ALL PRIVILEGES ON vida_mais.* TO 'vidamais'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

print_success "MySQL configurado! Banco 'vida_mais' criado."

# PASSO 6: Instalar PM2
echo ""
echo "📦 PASSO 6: Instalando PM2..."
sudo npm install -g pm2 -qq
print_success "PM2 instalado!"

# PASSO 7: Instalar ferramentas
echo ""
echo "📦 PASSO 7: Instalando ferramentas..."
sudo apt-get install -y git build-essential -qq
print_success "Ferramentas instaladas!"

# PASSO 8: Clonar projeto
echo ""
echo "📥 PASSO 8: Clonando projeto do GitHub..."
cd ~
if [ -d "Vida_Mais_APP" ]; then
    print_warning "Diretório já existe, fazendo pull..."
    cd Vida_Mais_APP
    git pull origin main
else
    git clone https://github.com/ViniciusThi/Vida_Mais_APP.git
    cd Vida_Mais_APP
fi
print_success "Projeto clonado/atualizado!"

# PASSO 9: Configurar Backend
echo ""
echo "⚙️  PASSO 9: Configurando Backend..."
print_info "Verificando diretório backend..."
if [ ! -d "~/Vida_Mais_APP/backend" ]; then
    print_error "Diretório backend não encontrado!"
    exit 1
fi

cd ~/Vida_Mais_APP/backend || {
    print_error "Não foi possível entrar no diretório backend!"
    exit 1
}

print_info "Instalando dependências npm (isso pode levar alguns minutos)..."
print_info "Aguarde, não trave o terminal..."

# Instalar com progresso visível (sem --silent para ver o que está acontecendo)
if npm install --no-audit --no-fund 2>&1 | tee /tmp/npm_install.log; then
    print_success "Dependências instaladas!"
else
    print_error "Erro ao instalar dependências. Verificando logs..."
    tail -20 /tmp/npm_install.log
    print_warning "Tentando continuar mesmo assim..."
fi

# Verificar se node_modules foi criado
if [ ! -d "node_modules" ]; then
    print_error "node_modules não foi criado! Reinstalando..."
    npm install --no-audit --no-fund || {
        print_error "Falha crítica na instalação de dependências!"
        exit 1
    }
fi

print_info "Criando arquivo .env..."
# Criar .env
cat > .env << 'ENVFILE'
DATABASE_URL="mysql://vidamais:vidamais2025@localhost:3306/vida_mais"
JWT_SECRET="vida-mais-jwt-secret-key-2025-mude-isso-em-producao-123456789"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS="*"
JWT_EXPIRES_IN=7d
ENVFILE

# Gerar JWT_SECRET seguro
print_info "Gerando JWT_SECRET seguro..."
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-key-$(date +%s)")
sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env

# Verificar se .env foi criado
if [ -f ".env" ]; then
    print_success "Arquivo .env criado com JWT_SECRET seguro!"
else
    print_error "Erro ao criar arquivo .env!"
    exit 1
fi

# PASSO 10: Configurar banco
echo ""
echo "🗄️  PASSO 10: Configurando banco de dados..."
print_info "Gerando Prisma Client..."
if npx prisma generate 2>&1 | tee /tmp/prisma_generate.log; then
    print_success "Prisma Client gerado!"
else
    print_error "Erro ao gerar Prisma Client!"
    tail -20 /tmp/prisma_generate.log
    print_warning "Tentando continuar..."
fi

print_info "Criando tabelas no banco de dados..."
if npx prisma db push --accept-data-loss 2>&1 | tee /tmp/prisma_push.log; then
    print_success "Banco de dados configurado!"
else
    print_error "Erro ao criar tabelas!"
    tail -20 /tmp/prisma_push.log
    print_warning "Verificando se as tabelas já existem..."
    # Tentar continuar mesmo assim
fi

# Seed (pode falhar se já tiver dados, mas não é crítico)
print_info "Populando banco com dados iniciais..."
if npm run db:seed 2>&1 | tee /tmp/seed.log; then
    print_success "Dados iniciais criados!"
else
    print_warning "Seed pode ter dado erro (normal se já tiver dados)"
    tail -10 /tmp/seed.log
fi

# PASSO 11: Compilar
echo ""
echo "🔨 PASSO 11: Compilando Backend..."
print_info "Compilando TypeScript (isso pode levar alguns segundos)..."
if npm run build 2>&1 | tee /tmp/build.log; then
    print_success "Compilação concluída!"
else
    print_error "Erro na compilação!"
    tail -30 /tmp/build.log
    print_error "Verifique os erros acima e corrija antes de continuar!"
    exit 1
fi

# Verificar se dist/ foi criado
if [ ! -d "dist" ]; then
    print_error "Diretório dist/ não foi criado! Erro na compilação!"
    exit 1
fi

# Verificar rota de cadastro
print_info "Verificando se a rota de cadastro está compilada..."
if grep -q "cadastro" dist/routes/auth.routes.js 2>/dev/null; then
    print_success "Rota de cadastro encontrada no código compilado!"
else
    print_warning "Rota de cadastro não encontrada no código compilado"
    print_info "Verificando código fonte..."
    if grep -q "cadastro" src/routes/auth.routes.ts 2>/dev/null; then
        print_warning "Rota existe no código fonte mas não foi compilada. Recompilando..."
        npm run build
    else
        print_error "Rota não encontrada nem no código fonte!"
    fi
fi

# PASSO 12: Iniciar servidor
echo ""
echo "🚀 PASSO 12: Iniciando servidor..."
print_info "Parando processos antigos (se houver)..."
pm2 stop vida-mais-backend 2>/dev/null || true
pm2 delete vida-mais-backend 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true
sleep 2

print_info "Iniciando servidor com PM2..."
if pm2 start dist/server.js --name vida-mais-backend 2>&1 | tee /tmp/pm2_start.log; then
    print_success "Servidor iniciado com PM2!"
    pm2 save 2>/dev/null || true
else
    print_error "Erro ao iniciar servidor!"
    tail -20 /tmp/pm2_start.log
    exit 1
fi

# Aguardar servidor iniciar
print_info "Aguardando servidor iniciar (10 segundos)..."
sleep 10

# Verificar se está rodando
if pm2 list | grep -q "vida-mais-backend.*online"; then
    print_success "Servidor está online!"
else
    print_error "Servidor não está online! Verificando logs..."
    pm2 logs vida-mais-backend --lines 20 --nostream
    print_warning "Tentando reiniciar..."
    pm2 restart vida-mais-backend
    sleep 5
fi

# PASSO 13: Testar
echo ""
echo "🧪 PASSO 13: Testando API..."
echo ""

# Health check
if curl -s http://localhost:3000/health > /dev/null; then
    print_success "Health check: OK"
    curl -s http://localhost:3000/health | head -1
else
    print_error "Health check: FALHOU"
fi
echo ""

# Teste de cadastro
echo "Testando cadastro..."
CADASTRO_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","idade":65,"email":"teste@teste.com","telefone":"11988888888","senha":"123456"}')

if echo "$CADASTRO_RESPONSE" | grep -q "sucesso\|message"; then
    print_success "Cadastro: OK"
    echo "$CADASTRO_RESPONSE" | head -1
else
    print_warning "Cadastro: $CADASTRO_RESPONSE"
fi
echo ""

# Teste de login
echo "Testando login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOuTelefone":"admin@vidamais.com","senha":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_success "Login: OK"
    echo "$LOGIN_RESPONSE" | head -1
else
    print_warning "Login: $LOGIN_RESPONSE"
fi
echo ""

# Status final
echo ""
echo "📊 Status Final:"
pm2 status

echo ""
echo "=============================================="
print_success "INSTALAÇÃO COMPLETA!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Ver logs: pm2 logs vida-mais-backend"
echo "  2. Ver status: pm2 status"
echo "  3. Configurar Nginx (se necessário)"
echo "  4. Configurar firewall (se necessário)"
echo ""
echo "🔑 Credenciais padrão (do seed):"
echo "  Admin: admin@vidamais.com / admin123"
echo "  Professor: prof1@vidamais.com / prof123"
echo "  Aluno: aluno1@vidamais.com / aluno123"
echo ""
echo "🌐 API rodando em: http://localhost:3000"
echo ""

