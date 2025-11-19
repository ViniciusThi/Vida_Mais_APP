# 🚀 Instalação Manual Completa na AWS Ubuntu

Guia passo a passo para instalar tudo manualmente na AWS.

---

## 🧹 PASSO 1: Limpar Instância

Execute o script de limpeza:

```bash
cd ~
wget https://raw.githubusercontent.com/ViniciusThi/Vida_Mais_APP/main/limpar_aws.sh
chmod +x limpar_aws.sh
./limpar_aws.sh
```

**OU execute manualmente:**

```bash
pm2 stop all 2>/dev/null; pm2 delete all 2>/dev/null; pm2 kill 2>/dev/null
pkill -f node 2>/dev/null; sudo fuser -k 3000/tcp 2>/dev/null
cd ~ && rm -rf Vida_Mais_APP
npm uninstall -g pm2 2>/dev/null; sudo npm uninstall -g pm2 2>/dev/null
sudo systemctl stop mysql postgresql 2>/dev/null
sudo apt-get remove --purge mysql-server postgresql -y 2>/dev/null
sudo apt-get autoremove -y && sudo apt-get autoclean -y
sudo rm -rf /var/lib/mysql /var/lib/postgresql /etc/mysql /etc/postgresql
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

# Verificar
node --version
npm --version
```

**Deve mostrar:** Node.js v20.x.x e npm 10.x.x

---

## 📦 PASSO 4: Instalar MySQL

```bash
sudo apt-get install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Verificar se está rodando
sudo systemctl status mysql
```

**Pressione `q` para sair do status.**

---

## 🔧 PASSO 5: Configurar MySQL

```bash
# Tentar acesso direto (sem senha)
sudo mysql
```

**Dentro do MySQL, execute:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'vidamais2025';
FLUSH PRIVILEGES;
CREATE DATABASE vida_mais CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vidamais'@'localhost' IDENTIFIED BY 'vidamais2025';
GRANT ALL PRIVILEGES ON vida_mais.* TO 'vidamais'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**OU se der erro de acesso, execute tudo de uma vez:**

```bash
sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'vidamais2025';
FLUSH PRIVILEGES;
CREATE DATABASE vida_mais CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vidamais'@'localhost' IDENTIFIED BY 'vidamais2025';
GRANT ALL PRIVILEGES ON vida_mais.* TO 'vidamais'@'localhost';
FLUSH PRIVILEGES;
EOF
```

**Verificar se funcionou:**

```bash
sudo mysql -u vidamais -pvidamais2025 -e "USE vida_mais; SELECT 'Banco OK!' as status;"
```

---

## 📦 PASSO 6: Instalar PM2

```bash
sudo npm install -g pm2

# Verificar
pm2 --version
```

---

## 📦 PASSO 7: Instalar Ferramentas

```bash
sudo apt-get install -y git build-essential
```

---

## 📥 PASSO 8: Clonar Projeto

```bash
cd ~
git clone https://github.com/ViniciusThi/Vida_Mais_APP.git
cd Vida_Mais_APP

# Verificar
ls -la
```

---

## ⚙️ PASSO 9: Configurar Backend

```bash
cd ~/Vida_Mais_APP/backend

# Instalar dependências (pode levar alguns minutos)
npm install

# Verificar se node_modules foi criado
ls -la node_modules | head -5
```

---

## 📝 PASSO 10: Criar Arquivo .env

```bash
cd ~/Vida_Mais_APP/backend

# Criar arquivo .env
nano .env
```

**Cole este conteúdo no arquivo:**

```env
DATABASE_URL="mysql://vidamais:vidamais2025@localhost:3306/vida_mais"
JWT_SECRET="vida-mais-jwt-secret-key-2025-mude-isso-em-producao-123456789"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS="*"
JWT_EXPIRES_IN=7d
```

**Para gerar JWT_SECRET mais seguro, execute antes de criar o .env:**

```bash
openssl rand -base64 32
```

**Copie o resultado e use no lugar do JWT_SECRET acima.**

**Salvar no nano:** `Ctrl + O`, `Enter`, `Ctrl + X`

**OU criar automaticamente:**

```bash
cd ~/Vida_Mais_APP/backend
cat > .env << 'EOF'
DATABASE_URL="mysql://vidamais:vidamais2025@localhost:3306/vida_mais"
JWT_SECRET="vida-mais-jwt-secret-key-2025-mude-isso-em-producao-123456789"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS="*"
JWT_EXPIRES_IN=7d
EOF

# Gerar JWT_SECRET seguro e substituir
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env

# Verificar
cat .env
```

---

## 🗄️ PASSO 11: Configurar Banco de Dados

```bash
cd ~/Vida_Mais_APP/backend

# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma db push --accept-data-loss

# Verificar se as tabelas foram criadas
sudo mysql -u vidamais -pvidamais2025 -e "USE vida_mais; SHOW TABLES;"
```

**Deve mostrar as tabelas:** users, turmas, alunos_turmas, questionarios, perguntas, respostas, convites

---

## 🌱 PASSO 12: Popular Banco (Seed)

```bash
cd ~/Vida_Mais_APP/backend

# Popular com dados iniciais
npm run db:seed
```

**Deve criar:** Admin, Professores e Alunos de teste

---

## 🔨 PASSO 13: Compilar Backend

```bash
cd ~/Vida_Mais_APP/backend

# Compilar TypeScript
npm run build

# Verificar se compilou
ls -la dist/

# Verificar se a rota de cadastro está compilada
grep -n "cadastro" dist/routes/auth.routes.js
```

**Se aparecer linhas com "cadastro", está OK!**

---

## 🚀 PASSO 14: Iniciar Servidor

```bash
cd ~/Vida_Mais_APP/backend

# Parar processos antigos (se houver)
pm2 stop vida-mais-backend 2>/dev/null || true
pm2 delete vida-mais-backend 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true

# Iniciar servidor
pm2 start dist/server.js --name vida-mais-backend

# Salvar configuração
pm2 save

# Ver status
pm2 status

# Ver logs
pm2 logs vida-mais-backend --lines 30
```

**Pressione `Ctrl + C` para sair dos logs.**

---

## 🧪 PASSO 15: Testar API

```bash
# Aguardar alguns segundos
sleep 5

# Testar health check
curl http://localhost:3000/health

# Testar cadastro
curl -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","idade":65,"email":"joao@teste.com","telefone":"11999999999","senha":"123456"}'

# Testar login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOuTelefone":"admin@vidamais.com","senha":"admin123"}'
```

---

## ✅ Verificação Final

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs vida-mais-backend

# Verificar banco
sudo mysql -u vidamais -pvidamais2025 -e "USE vida_mais; SELECT COUNT(*) as total_usuarios FROM users;"
```

---

## 🔑 Credenciais Padrão (do Seed)

- **Admin:** `admin@vidamais.com` / `admin123`
- **Professor:** `prof1@vidamais.com` / `prof123`
- **Aluno:** `aluno1@vidamais.com` / `aluno123`

---

## 🐛 Se Algo Der Errado

### MySQL não conecta
```bash
sudo systemctl status mysql
sudo mysql -u root -p
# (tente sem senha primeiro)
```

### npm install trava
```bash
# Cancelar (Ctrl + C) e tentar:
npm install --no-audit --no-fund
```

### Prisma não funciona
```bash
# Verificar .env
cat ~/Vida_Mais_APP/backend/.env

# Testar conexão manual
sudo mysql -u vidamais -pvidamais2025 -e "USE vida_mais; SELECT 1;"
```

### Servidor não inicia
```bash
# Ver logs
pm2 logs vida-mais-backend --err

# Verificar se compilou
ls -la ~/Vida_Mais_APP/backend/dist/
```

---

## 📝 Comandos Rápidos de Referência

```bash
# Ver logs do servidor
pm2 logs vida-mais-backend

# Reiniciar servidor
pm2 restart vida-mais-backend

# Parar servidor
pm2 stop vida-mais-backend

# Ver status
pm2 status

# Testar API
curl http://localhost:3000/health
```

---

**Execute cada passo na ordem e me diga se algo der errado!**

