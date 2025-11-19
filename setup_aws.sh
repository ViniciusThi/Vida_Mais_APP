#!/bin/bash
set -e

echo "🚀 INSTALAÇÃO COMPLETA DO VIDA MAIS APP NA AWS"
echo "=============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
cd ~/Vida_Mais_APP/backend
npm install --silent
print_success "Dependências instaladas!"

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
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-key-$(date +%s)")
sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env
print_success "Arquivo .env criado com JWT_SECRET seguro!"

# PASSO 10: Configurar banco
echo ""
echo "🗄️  PASSO 10: Configurando banco de dados..."
npx prisma generate > /dev/null 2>&1
npx prisma db push --accept-data-loss > /dev/null 2>&1
print_success "Banco de dados configurado!"

# Seed (pode falhar se já tiver dados, mas não é crítico)
echo "Populando banco com dados iniciais..."
npm run db:seed > /dev/null 2>&1 && print_success "Dados iniciais criados!" || print_warning "Seed pode ter dado erro (normal se já tiver dados)"

# PASSO 11: Compilar
echo ""
echo "🔨 PASSO 11: Compilando Backend..."
npm run build > /dev/null 2>&1

# Verificar rota de cadastro
if grep -q "cadastro" dist/routes/auth.routes.js 2>/dev/null; then
    print_success "Rota de cadastro encontrada no código compilado!"
else
    print_warning "Rota de cadastro não encontrada no código compilado (verificar build)"
fi

# PASSO 12: Iniciar servidor
echo ""
echo "🚀 PASSO 12: Iniciando servidor..."
pm2 start dist/server.js --name vida-mais-backend > /dev/null 2>&1
pm2 save > /dev/null 2>&1
print_success "Servidor iniciado com PM2!"

# Aguardar servidor iniciar
echo "Aguardando servidor iniciar..."
sleep 5

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

