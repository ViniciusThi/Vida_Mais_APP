# ⚡ Guia Rápido de Início - Vida Mais

Guia simplificado para iniciantes. Para detalhes completos, consulte `README.md`.

## 🎯 O que você precisa instalar (pela primeira vez)

### 1. Node.js
- Baixe em: https://nodejs.org/
- Escolha a versão LTS (recomendada)
- Durante instalação, marque "Add to PATH"

### 2. Git
- Baixe em: https://git-scm.com/download/win
- Use as opções padrão

### 3. PostgreSQL
- Baixe em: https://www.postgresql.org/download/windows/
- Durante instalação:
  - Defina uma senha (ex: `postgres`)
  - Guarde essa senha!
  - Porta: 5432 (padrão)

### 4. Visual Studio Code
- Baixe em: https://code.visualstudio.com/

## 🚀 Passo a Passo (Primeira Vez)

### 1️⃣ Abrir o PowerShell
- Aperte `Win + X`
- Clique em "Windows PowerShell" ou "Terminal"

### 2️⃣ Ir até a pasta do projeto
```bash
cd Desktop\PI5\Vida_Mais_APP
```

### 3️⃣ Configurar o Backend

```bash
# Entrar na pasta
cd backend

# Instalar dependências (demora um pouco)
npm install

# IMPORTANTE: Editar o arquivo .env
# Abra: backend\.env no VS Code
# Mude a senha do PostgreSQL se for diferente
```

No arquivo `.env`, ajuste a linha:
```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/vida_mais"
```

```bash
# Criar o banco de dados
npm run db:setup

# Criar as tabelas
npm run db:migrate

# Adicionar dados de exemplo (opcional mas recomendado)
npm run db:seed

# Iniciar o servidor
npm run dev
```

✅ O backend está rodando em: http://localhost:3000

### 4️⃣ Configurar o Painel Web

Abra um **NOVO** PowerShell (deixe o outro rodando):

```bash
cd Desktop\PI5\Vida_Mais_APP\web-admin

# Instalar dependências
npm install

# Iniciar o servidor
npm run dev
```

✅ O painel web está rodando em: http://localhost:5173

**Acesse no navegador e faça login:**
- Email: `admin@vidamais.com`
- Senha: `admin123`

### 5️⃣ Configurar o App Mobile

Abra um **TERCEIRO** PowerShell:

```bash
cd Desktop\PI5\Vida_Mais_APP\mobile

# Instalar dependências
npm install

# Instalar o Expo CLI globalmente
npm install -g expo-cli

# IMPORTANTE: Descobrir seu IP
ipconfig
```

Procure por **"Endereço IPv4"** na sua conexão WiFi. Exemplo: `192.168.1.100`

```bash
# Editar o arquivo de configuração
# Abra: mobile\src\config\api.ts no VS Code
# Mude a linha para usar SEU IP:
# export const API_URL = 'http://192.168.1.100:3000';
```

```bash
# Iniciar o Expo
npm start
```

✅ O Expo está rodando!

### 6️⃣ Testar no Celular

1. **Instale o app "Expo Go"** no seu celular:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Escaneie o QR Code** que apareceu no terminal

3. **Faça login:**
   - Email: `aluno1@vidamais.com`
   - Senha: `aluno123`

## 🔄 Dias Seguintes (Como iniciar novamente)

Você só precisa iniciar os servidores. As dependências já estão instaladas!

### PowerShell 1 (Backend):
```bash
cd Desktop\PI5\Vida_Mais_APP\backend
npm run dev
```

### PowerShell 2 (Web):
```bash
cd Desktop\PI5\Vida_Mais_APP\web-admin
npm run dev
```

### PowerShell 3 (Mobile):
```bash
cd Desktop\PI5\Vida_Mais_APP\mobile
npm start
```

## 🆘 Problemas Comuns

### ❌ "Port 3000 is already in use"
Alguém já está usando a porta. Solução:
```bash
# Descobrir quem está usando
netstat -ano | findstr :3000

# Encerrar o processo (substitua PID pelo número que apareceu)
taskkill /PID NUMERO /F
```

### ❌ "Cannot connect to database"
O PostgreSQL não está rodando. Solução:
1. Aperte `Win + R`
2. Digite `services.msc`
3. Procure por "postgresql"
4. Clique com direito → "Iniciar"

### ❌ Mobile não conecta
- Certifique-se de que **backend** e **celular** estão na **mesma rede WiFi**
- Verifique se o IP em `mobile/src/config/api.ts` está correto
- Desative o Firewall do Windows temporariamente para testar

### ❌ "npm: command not found"
Node.js não foi instalado corretamente:
1. Reinstale o Node.js
2. **Marque** "Add to PATH" durante instalação
3. Feche e abra o PowerShell novamente

## 📦 Estrutura do Projeto

```
Vida_Mais_APP/
├── backend/           ← API (Node.js)
├── web-admin/         ← Painel Web (React)
├── mobile/            ← App Mobile (React Native)
├── docs/              ← Documentação
├── README.md          ← Guia completo
└── GUIA_RAPIDO.md     ← Este arquivo
```

## 🎓 Fluxo de Teste Completo

1. **Painel Web** (http://localhost:5173)
   - Login: `admin@vidamais.com` / `admin123`
   - Vá em "Turmas"
   - Veja que já existem turmas criadas
   - Vá em "Questionários"
   - Clique em "Relatório" de um questionário

2. **App Mobile** (no celular)
   - Login: `aluno1@vidamais.com` / `aluno123`
   - Veja questionários disponíveis
   - Responda um questionário
   - Envie as respostas

3. **Painel Web** (de novo)
   - Atualize o relatório
   - Veja que as novas respostas aparecem!
   - Clique em "Exportar" → "Excel" para baixar os dados

## 📱 Usuários de Teste

Após rodar `npm run db:seed`, você tem:

**Admin:**
- `admin@vidamais.com` / `admin123`

**Professores:**
- `prof1@vidamais.com` / `prof123`
- `prof2@vidamais.com` / `prof123`

**Alunos:**
- `aluno1@vidamais.com` / `aluno123`
- `aluno2@vidamais.com` / `aluno123`
- ... até `aluno8@vidamais.com` / `aluno123`

## 🌐 Próximos Passos

- [ ] Testar criar seu próprio questionário
- [ ] Adicionar seus próprios professores e alunos
- [ ] Personalizar as cores (veja `web-admin/src/index.css`)
- [ ] Adicionar logo da instituição
- [ ] Fazer deploy na AWS (veja `docs/DEPLOY_AWS.md`)
- [ ] Publicar o app nas lojas (veja `docs/PUBLICACAO.md`)

## 💡 Dicas

- **Mantenha os 3 PowerShell abertos** enquanto desenvolve
- **Use Ctrl+C** em cada PowerShell para parar os servidores
- **Git:** Use `git add .` e `git commit -m "mensagem"` regularmente
- **Backup:** Faça push no GitHub: `git push origin main`

## 📞 Precisa de Ajuda?

1. Leia o `README.md` completo
2. Consulte a documentação em `docs/`
3. Abra uma Issue no GitHub
4. Procure no Stack Overflow

---

🚀 **Bom desenvolvimento!** Qualquer dúvida, consulte a documentação completa.

