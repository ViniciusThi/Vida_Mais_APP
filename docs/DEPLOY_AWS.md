# 🚀 Guia de Deploy na AWS

Este guia mostra como fazer o deploy do sistema Vida Mais na AWS (Amazon Web Services).

## 📋 Pré-requisitos

- Conta na AWS (https://aws.amazon.com)
- Conhecimento básico de Linux/Ubuntu
- Cliente SSH (PuTTY no Windows ou terminal no Mac/Linux)

## 🌐 Passo 1: Criar Instância EC2

### 1.1 Acessar o Console AWS
1. Faça login em: https://console.aws.amazon.com
2. Procure por "EC2" na barra de busca
3. Clique em "Instâncias" no menu lateral
4. Clique em "Executar instância"

### 1.2 Configurar a Instância
1. **Nome:** `vida-mais-server`
2. **Imagem (AMI):** Ubuntu Server 22.04 LTS
3. **Tipo de instância:** `t2.micro` (elegível para free tier)
4. **Par de chaves:** 
   - Clique em "Criar novo par de chaves"
   - Nome: `vida-mais-key`
   - Formato: `.pem` (Mac/Linux) ou `.ppk` (Windows/PuTTY)
   - **GUARDE ESTE ARQUIVO EM LOCAL SEGURO!**
5. **Configurações de rede:**
   - Marque "Permitir tráfego HTTPS"
   - Marque "Permitir tráfego HTTP"
   - Marque "Permitir tráfego SSH"
6. **Armazenamento:** 20 GB (padrão)
7. Clique em "Executar instância"

### 1.3 Configurar IP Elástico (Opcional mas Recomendado)
1. No menu EC2, clique em "IPs elásticos"
2. Clique em "Alocar endereço IP elástico"
3. Clique em "Alocar"
4. Selecione o IP alocado
5. Clique em "Ações" → "Associar endereço IP elástico"
6. Escolha sua instância `vida-mais-server`
7. Clique em "Associar"

**Anote o IP público** - você vai usar ele para acessar o servidor.

## 🔌 Passo 2: Conectar na Instância via SSH

### No Windows (usando PowerShell):
```bash
# Vá até a pasta onde salvou a chave .pem
cd C:\Users\SEU_USUARIO\Downloads

# Dê permissão para a chave (necessário apenas uma vez)
icacls vida-mais-key.pem /inheritance:r
icacls vida-mais-key.pem /grant:r "%USERNAME%:R"

# Conecte no servidor (substitua SEU_IP pelo IP da instância)
ssh -i vida-mais-key.pem ubuntu@SEU_IP
```

### No Mac/Linux:
```bash
# Vá até a pasta onde salvou a chave
cd ~/Downloads

# Dê permissão para a chave (necessário apenas uma vez)
chmod 400 vida-mais-key.pem

# Conecte no servidor
ssh -i vida-mais-key.pem ubuntu@SEU_IP
```

## ⚙️ Passo 3: Configurar o Servidor

### 3.1 Atualizar o Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Instalar Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Deve mostrar v20.x.x
```

### 3.3 Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar senha do usuário postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'SUA_SENHA_FORTE_AQUI';"

# Criar banco de dados
sudo -u postgres createdb vida_mais
```

### 3.4 Instalar Git
```bash
sudo apt install -y git
```

### 3.5 Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.6 Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2
```

## 📦 Passo 4: Clonar e Configurar o Projeto

### 4.1 Clonar o Repositório
```bash
cd ~
git clone https://github.com/SEU_USUARIO/Vida_Mais_APP.git
cd Vida_Mais_APP
```

### 4.2 Configurar o Backend
```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

Cole o seguinte conteúdo (ajuste conforme necessário):
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/vida_mais"
JWT_SECRET="sua_chave_secreta_super_forte_e_aleatoria_aqui_2025"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="production"
ALLOWED_ORIGINS="https://seudominio.com,http://SEU_IP"
```

Salve com `Ctrl+O`, Enter, `Ctrl+X`

### 4.3 Executar Migrações
```bash
npx prisma migrate deploy
npx prisma generate

# (Opcional) Popular com dados de exemplo
npm run db:seed
```

### 4.4 Compilar o Backend
```bash
npm run build
```

### 4.5 Iniciar com PM2
```bash
pm2 start dist/server.js --name vida-mais-api
pm2 save
pm2 startup
# Execute o comando que o PM2 mostrar
```

### 4.6 Compilar o Frontend Web
```bash
cd ~/Vida_Mais_APP/web-admin
npm install
npm run build
```

## 🌐 Passo 5: Configurar Nginx

### 5.1 Criar Configuração do Site
```bash
sudo nano /etc/nginx/sites-available/vida-mais
```

Cole o seguinte conteúdo:
```nginx
server {
    listen 80;
    server_name SEU_IP_OU_DOMINIO;

    # Frontend Web Admin
    location / {
        root /home/ubuntu/Vida_Mais_APP/web-admin/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve e saia.

### 5.2 Ativar o Site
```bash
sudo ln -s /etc/nginx/sites-available/vida-mais /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

## 🔒 Passo 6: Configurar HTTPS com Let's Encrypt (Opcional mas Recomendado)

### 6.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Obter Certificado SSL
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

Siga as instruções. O Certbot vai configurar automaticamente o Nginx com HTTPS.

### 6.3 Renovação Automática
O Certbot configura automaticamente a renovação. Para testar:
```bash
sudo certbot renew --dry-run
```

## 📱 Passo 7: Configurar o App Mobile para Produção

No seu computador local:

### 7.1 Atualizar API URL
```bash
# Edite: mobile/src/config/api.ts
export const API_URL = 'https://seudominio.com/api'; // ou http://SEU_IP/api
```

### 7.2 Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 7.3 Fazer Login na Expo
```bash
eas login
```

### 7.4 Configurar o Projeto
```bash
cd mobile
eas build:configure
```

### 7.5 Build para Android
```bash
eas build --platform android
```

### 7.6 Build para iOS (requer Mac e conta Apple Developer)
```bash
eas build --platform ios
```

Consulte `docs/PUBLICACAO.md` para mais detalhes sobre publicação nas lojas.

## 🔧 Comandos Úteis no Servidor

### Ver logs da API:
```bash
pm2 logs vida-mais-api
```

### Reiniciar a API:
```bash
pm2 restart vida-mais-api
```

### Ver status:
```bash
pm2 status
```

### Atualizar o projeto:
```bash
cd ~/Vida_Mais_APP
git pull
cd backend
npm install
npm run build
pm2 restart vida-mais-api

cd ../web-admin
npm install
npm run build
sudo systemctl reload nginx
```

## 💰 Custos Estimados

### Free Tier (12 meses):
- **EC2 t2.micro:** 750 horas/mês (grátis)
- **Transferência de dados:** 15 GB/mês (grátis)
- **Após 12 meses:** ~$10-15/mês

### RDS (Opcional):
- **Free tier:** 750 horas/mês db.t2.micro (12 meses)
- **Após 12 meses:** ~$15-20/mês adicional

**Dica:** Para economizar após o free tier, mantenha o PostgreSQL na própria EC2.

## 🆘 Solução de Problemas

### Erro: "Cannot connect to database"
```bash
# Verifique se o PostgreSQL está rodando
sudo systemctl status postgresql

# Reinicie se necessário
sudo systemctl restart postgresql
```

### Erro 502 Bad Gateway
```bash
# Verifique se a API está rodando
pm2 status

# Veja os logs
pm2 logs
```

### Erro de permissão no Nginx
```bash
# Dê permissões corretas
sudo chown -R www-data:www-data /home/ubuntu/Vida_Mais_APP/web-admin/dist
```

## 📞 Suporte

Para dúvidas, abra uma Issue no GitHub ou consulte a documentação oficial:
- AWS EC2: https://docs.aws.amazon.com/ec2
- Nginx: https://nginx.org/en/docs
- PM2: https://pm2.keymetrics.io/docs

---

✅ **Seu sistema Vida Mais está online!** Acesse via: `http://SEU_IP` ou `https://seudominio.com`

