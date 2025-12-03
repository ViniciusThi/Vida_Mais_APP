# 🤖 Instalação do Sistema de ML e Novas Funcionalidades

Este documento descreve como instalar e configurar as novas funcionalidades:
1. **Download de Excel no Mobile**
2. **Sistema de Machine Learning para Análise Preditiva**

---

## 📱 **PARTE 1: Download de Excel no Mobile**

### Instalação de Dependências

```bash
cd mobile
npm install expo-file-system expo-sharing
```

### Teste

1. Abra o app mobile
2. Faça login como professor
3. Acesse um questionário que tenha respostas
4. Clique em "Relatório"
5. Clique em "📊 Excel" ou "📄 CSV"
6. O arquivo será baixado e você poderá abrir com Excel/Sheets

---

## 🤖 **PARTE 2: Sistema de Machine Learning**

### 1. Instalar Python (se não tiver)

**Windows:**
```bash
# Download em: https://www.python.org/downloads/
# Certifique-se de marcar "Add Python to PATH" durante a instalação
python --version
```

**Linux/Mac:**
```bash
sudo apt install python3 python3-pip  # Ubuntu/Debian
brew install python3                  # Mac
```

### 2. Configurar Serviço ML

```bash
cd ml-service

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `ml-service`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=vida_mais

# Server
PORT=5000
NODE_API_URL=http://localhost:3000

# ML Config
MODEL_PATH=./models
TRAIN_THRESHOLD=30
```

**⚠️ IMPORTANTE:** Se estiver na AWS, use o host do RDS!

### 4. Iniciar Serviço ML

```bash
cd ml-service
python app.py
```

Você verá:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### 5. Atualizar Backend Node

```bash
cd backend

# Adicionar variável de ambiente
echo "ML_SERVICE_URL=http://localhost:5000" >> .env

# Rebuild e reiniciar
npm run build
pm2 restart vida-mais-backend
```

### 6. Atualizar Frontend Web

```bash
cd web-admin
npm install  # Garantir dependências atualizadas
npm run dev  # Ou rebuild se estiver em produção
```

---

## 🚀 **Deploy na AWS**

### 1. Instalar Python na AWS

```bash
ssh ubuntu@54.233.110.183

# Instalar Python e pip
sudo apt update
sudo apt install python3 python3-pip python3-venv -y
```

### 2. Fazer Deploy do ML Service

```bash
cd ~/Vida_Mais_APP
git pull origin main

cd ml-service

# Criar e ativar venv
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
nano .env
# Copie as configurações e salve (Ctrl+O, Enter, Ctrl+X)
```

Conteúdo do `.env`:
```env
DB_HOST=seu-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=sua_senha_rds
DB_NAME=vida_mais
PORT=5000
NODE_API_URL=http://localhost:3000
MODEL_PATH=./models
TRAIN_THRESHOLD=30
```

### 3. Configurar PM2 para o ML Service

```bash
# Criar arquivo de configuração PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'vida-mais-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'vida-mais-ml',
      script: 'app.py',
      interpreter: './venv/bin/python',
      cwd: './ml-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PYTHONUNBUFFERED: '1'
      }
    }
  ]
};
EOF

# Reiniciar todos os serviços
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Configurar para iniciar no boot
```

### 4. Abrir Porta 5000 na AWS

1. Acesse o Console AWS → EC2
2. Security Groups
3. Selecione o security group da instância
4. Inbound Rules → Edit
5. Add Rule:
   - Type: Custom TCP
   - Port: 5000
   - Source: 0.0.0.0/0 (ou IP específico para mais segurança)
6. Save

### 5. Atualizar Backend Node na AWS

```bash
cd ~/Vida_Mais_APP/backend

# Adicionar variável ao .env
echo "ML_SERVICE_URL=http://localhost:5000" >> .env

# Rebuild
rm -rf dist
npm run build

# Restart
pm2 restart vida-mais-backend
```

### 6. Verificar se está funcionando

```bash
# Health check do ML Service
curl http://localhost:5000/health

# Deve retornar:
# {"status":"healthy","service":"ML Analytics Service","version":"1.0.0"}

# Ver logs
pm2 logs vida-mais-ml
pm2 logs vida-mais-backend
```

---

## 📊 **Como Usar o Sistema de ML**

### 1. Acessar Dashboard de Insights

No painel web:
1. Faça login como Admin ou Professor
2. Clique em "Insights Preditivos 🤖"
3. Você verá:
   - Visão geral do sistema
   - Status dos modelos de ML
   - Análise por turma
   - Predição de risco de evasão
   - Padrões de engajamento

### 2. Analisar Risco de Evasão

1. Selecione uma turma
2. O sistema irá analisar automaticamente
3. Verá alunos classificados por risco:
   - 🔴 **Risco Alto**: Alunos inativos há 30+ dias
   - 🟡 **Risco Médio**: Baixa participação recente
   - 🟢 **Risco Baixo**: Engajamento normal

### 3. Treinar Modelos de ML

Quando houver **30 ou mais alunos** com dados:
1. Acesse "Insights Preditivos"
2. Clique em "Retreinar Modelos"
3. Os modelos serão treinados com dados reais
4. A predição ficará mais precisa

**Nota:** Até ter dados suficientes, o sistema usa **heurística** (regras simples) para fazer as predições.

---

## 🔍 **Funcionalidades do ML**

### 1. Predição de Evasão
- Identifica alunos em risco de abandono
- Fatores analisados:
  - Dias sem responder
  - Taxa de participação
  - Média de notas
  - Padrões de engajamento

### 2. Análise de Desempenho
- Identifica tendências (melhorando/piorando/estável)
- Gera recomendações personalizadas
- Histórico temporal de notas

### 3. Padrões de Engajamento
- Classifica alunos por nível de engajamento
- Identifica melhores alunos e alunos em risco
- Gera insights automáticos

### 4. Analytics Avançado
- Distribuição de notas
- Taxa de engajamento por turma
- Estatísticas detalhadas

---

## 🛠️ **Troubleshooting**

### Serviço ML não inicia

```bash
# Verificar logs
pm2 logs vida-mais-ml

# Problemas comuns:
# 1. Porta em uso
sudo lsof -i :5000
sudo kill -9 <PID>

# 2. Dependências faltando
cd ml-service
source venv/bin/activate
pip install -r requirements.txt

# 3. Problemas com MySQL
# Verificar conexão no .env
```

### Frontend não conecta ao ML

```bash
# 1. Verificar se ML está rodando
curl http://localhost:5000/health

# 2. Verificar variável de ambiente no backend
cat backend/.env | grep ML_SERVICE_URL

# 3. Verificar logs do backend
pm2 logs vida-mais-backend
```

### Download no mobile não funciona

```bash
cd mobile

# Reinstalar dependências
rm -rf node_modules
npm install

# Limpar cache do Expo
npx expo start -c
```

---

## 📈 **Próximos Passos**

1. ✅ Colete dados de pelo menos 30 alunos
2. ✅ Treine os modelos de ML
3. ✅ Use as predições para intervir cedo
4. ✅ Monitore padrões de engajamento
5. ✅ Exporte relatórios em Excel/CSV

---

## 🤝 **Suporte**

Em caso de problemas:
1. Verifique os logs: `pm2 logs`
2. Verifique a conexão com o banco de dados
3. Certifique-se que todas as portas estão abertas
4. Consulte este documento para referência

---

**🎉 Pronto! O sistema de ML está configurado e funcionando!**

