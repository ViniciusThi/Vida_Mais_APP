# 🚀 Guia Completo de Instalação na AWS Ubuntu

Este guia vai instalar tudo do zero na AWS, usando MySQL como banco de dados.

## 📋 Pré-requisitos

- Instância Ubuntu na AWS (Ubuntu 20.04 ou superior)
- Acesso SSH à instância
- Usuário com permissões sudo

---

## 🧹 PASSO 1: Limpar Tudo (se já tiver algo instalado)

```bash
# Parar todos os serviços
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -f node 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true

# Remover diretório do projeto
cd ~
rm -rf Vida_Mais_APP

# Desinstalar PM2
npm uninstall -g pm2 2>/dev/null || true
sudo npm uninstall -g pm2 2>/dev/null || true

# Remover bancos antigos (se houver)
sudo systemctl stop postgresql 2>/dev/null || true
sudo apt-get remove --purge postgresql postgresql-contrib mysql-server mysql-client -y 2>/dev/null || true
sudo apt-get autoremove -y
sudo apt-get autoclean -y
```

---

## 📦 PASSO 2: Atualizar Sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

---

## 📦 PASSO 3: Instalar Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

**Saída esperada:** Node.js v20.x.x e npm 10.x.x

---

## 📦 PASSO 4: Instalar MySQL

```bash
# Instalar MySQL Server
sudo apt-get install -y mysql-server

# Iniciar e habilitar MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Verificar status
sudo systemctl status mysql
```

---

## 🔧 PASSO 5: Configurar MySQL

```bash
# Configurar MySQL (definir senha do root)
sudo mysql_secure_installation
```

**Durante a instalação, responda:**
- **VALIDATE PASSWORD PLUGIN:** N (ou Y se quiser validação)
- **Password for root:** `vidamais2025` (ou uma senha segura)
- **Remove anonymous users:** Y
- **Disallow root login remotely:** Y
- **Remove test database:** Y
- **Reload privilege tables:** Y

**OU configure automaticamente:**

```bash
# Configurar senha do root automaticamente
sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'vidamais2025';
FLUSH PRIVILEGES;
EOF

# Criar banco de dados
sudo mysql -u root -pvidamais2025 << 'EOF'
CREATE DATABASE IF NOT EXISTS vida_mais CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vidamais'@'localhost' IDENTIFIED BY 'vidamais2025';
GRANT ALL PRIVILEGES ON vida_mais.* TO 'vidamais'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
EOF
```

---

## 📦 PASSO 6: Instalar PM2

```bash
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

---

## 📦 PASSO 7: Instalar Ferramentas Úteis

```bash
sudo apt-get install -y git build-essential
```

---

## 📥 PASSO 8: Clonar Projeto do GitHub

```bash
cd ~
git clone https://github.com/ViniciusThi/Vida_Mais_APP.git
cd Vida_Mais_APP

# Verificar se clonou
ls -la
```

---

## ⚙️ PASSO 9: Configurar Backend

```bash
cd ~/Vida_Mais_APP/backend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << 'EOF'
DATABASE_URL="mysql://vidamais:vidamais2025@localhost:3306/vida_mais"
JWT_SECRET="vida-mais-jwt-secret-key-2025-mude-isso-em-producao-123456789"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS="*"
JWT_EXPIRES_IN=7d
EOF

# Gerar JWT_SECRET seguro
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env

# Verificar arquivo criado
echo "✅ Arquivo .env criado:"
cat .env | sed 's/:.*@/:****@/' | sed 's/JWT_SECRET=.*/JWT_SECRET=****/'
```

---

## 🗄️ PASSO 10: Configurar Banco de Dados

```bash
cd ~/Vida_Mais_APP/backend

# Gerar Prisma Client
npx prisma generate

# Criar todas as tabelas
npx prisma db push --accept-data-loss

# OU usar migrações (se tiver)
# npx prisma migrate deploy

# Popular banco com dados iniciais
npm run db:seed
```

**Se der erro no seed, pode continuar - os dados serão criados depois.**

---

## 🔨 PASSO 11: Compilar Backend

```bash
cd ~/Vida_Mais_APP/backend

# Compilar TypeScript
npm run build

# Verificar se compilou
ls -la dist/

# Verificar se a rota de cadastro está compilada
grep -n "cadastro" dist/routes/auth.routes.js && echo "✅ Rota de cadastro encontrada!" || echo "⚠️  Rota não encontrada no código compilado"
```

---

## 🚀 PASSO 12: Iniciar Servidor

```bash
cd ~/Vida_Mais_APP/backend

# Iniciar com PM2
pm2 start dist/server.js --name vida-mais-backend

# Salvar configuração
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer na tela (algo como: sudo env PATH=... pm2 startup systemd -u ubuntu --hp /home/ubuntu)

# Ver logs
pm2 logs vida-mais-backend --lines 30
```

---

## 🧪 PASSO 13: Testar API

```bash
# Aguardar servidor iniciar
sleep 5

# Testar health check
echo "=== Testando Health Check ==="
curl http://localhost:3000/health
echo ""

# Testar cadastro
echo "=== Testando Cadastro ==="
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","idade":65,"email":"joao@teste.com","telefone":"11999999999","senha":"123456"}'
echo ""

# Testar login
echo "=== Testando Login ==="
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOuTelefone":"admin@vidamais.com","senha":"admin123"}'
echo ""

# Ver status PM2
echo "=== Status PM2 ==="
pm2 status
```

---

## 📦 PASSO 14: Configurar Web-Admin (Opcional)

```bash
cd ~/Vida_Mais_APP/web-admin

# Instalar dependências
npm install

# Compilar para produção
npm run build

# Se quiser servir com PM2 também:
# pm2 start npm --name vida-mais-web -- run start
# pm2 save
```

---

## ✅ Verificação Final

```bash
# Verificar se tudo está rodando
pm2 status

# Ver logs em tempo real
pm2 logs vida-mais-backend

# Verificar banco de dados
sudo mysql -u vidamais -pvidamais2025 -e "USE vida_mais; SHOW TABLES;"
```

---

## 🔑 Credenciais Padrão (do Seed)

Após executar `npm run db:seed`, você terá:

- **Admin:** `admin@vidamais.com` / `admin123`
- **Professor:** `prof1@vidamais.com` / `prof123`
- **Aluno:** `aluno1@vidamais.com` / `aluno123`

---

## 🐛 Troubleshooting

### MySQL não inicia
```bash
sudo systemctl status mysql
sudo journalctl -u mysql -n 50
```

### Erro de conexão com banco
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
sudo mysql -u vidamais -pvidamais2025 -e "SELECT 1;"

# Verificar .env
cat ~/Vida_Mais_APP/backend/.env | grep DATABASE_URL
```

### PM2 não inicia
```bash
# Ver logs
pm2 logs vida-mais-backend --err

# Reiniciar
pm2 restart vida-mais-backend
```

### Porta 3000 em uso
```bash
sudo fuser -k 3000/tcp
pm2 restart vida-mais-backend
```

---

## 📝 Script Único Completo

Veja o arquivo `setup_aws.sh` para um script que faz tudo automaticamente.

---

## 🎉 Pronto!

Seu sistema está instalado e rodando! Acesse a API em `http://seu-ip-aws:3000`

