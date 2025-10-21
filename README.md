# 📱 Vida Mais APP - Sistema de Pesquisa de Satisfação

Sistema completo para digitalizar pesquisas de satisfação da Instituição Vida Mais, com suporte para iOS e Android.

## 🎯 Funcionalidades

- **Admin Geral**: Gerencia professores, alunos, turmas e questionários globais
- **Professores**: Criam questionários para suas turmas e visualizam relatórios
- **Alunos/Idosos**: Respondem questionários com interface acessível

## 🏗️ Arquitetura

```
Vida_Mais_APP/
├── backend/          # API Node.js + Express + PostgreSQL
├── web-admin/        # Painel Web React + Vite
├── mobile/           # App React Native + Expo
└── docs/             # Documentação adicional
```

## 📋 Pré-requisitos (Instale na sua máquina)

### 1. Node.js (versão 20 LTS)
- Baixe em: https://nodejs.org/
- Durante a instalação, marque "Add to PATH"
- Verifique a instalação abrindo o PowerShell e digitando:
  ```bash
  node --version
  npm --version
  ```

### 2. Git
- Baixe em: https://git-scm.com/download/win
- Durante a instalação, use as opções padrão
- Verifique no PowerShell:
  ```bash
  git --version
  ```

### 3. PostgreSQL (Banco de Dados)
- Baixe em: https://www.postgresql.org/download/windows/
- Durante a instalação:
  - Defina a senha do usuário `postgres` (guarde essa senha!)
  - Porta padrão: 5432
- Verifique no PowerShell:
  ```bash
  psql --version
  ```

### 4. Visual Studio Code (Editor)
- Baixe em: https://code.visualstudio.com/
- Instale as extensões: "ES7+ React/Redux", "Prisma", "ESLint"

### 5. Expo CLI (Para o app mobile)
- Abra o PowerShell e digite:
  ```bash
  npm install -g expo-cli
  ```

## 🚀 Passo a Passo - Configuração Inicial

### PASSO 1: Clonar ou iniciar o projeto no GitHub

#### Opção A: Se ainda não tem repositório no GitHub
1. Acesse https://github.com e faça login
2. Clique em "New repository"
3. Nome: `Vida_Mais_APP`
4. Marque "Public" (ou Private se preferir)
5. NÃO marque "Add README" (já temos aqui)
6. Clique em "Create repository"
7. No PowerShell, na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "Estrutura inicial do projeto"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/Vida_Mais_APP.git
   git push -u origin main
   ```

#### Opção B: Se já tem o repositório
```bash
git clone https://github.com/SEU_USUARIO/Vida_Mais_APP.git
cd Vida_Mais_APP
```

### PASSO 2: Configurar o Backend (API)

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Abra o arquivo `backend/.env` e edite com suas informações:
   ```
   DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/vida_mais"
   JWT_SECRET="sua_chave_secreta_aqui_mude_isso"
   PORT=3000
   ```

4. Crie o banco de dados:
   ```bash
   npm run db:setup
   ```

5. Execute as migrações (criar tabelas):
   ```bash
   npm run db:migrate
   ```

6. (Opcional) Popule com dados de exemplo:
   ```bash
   npm run db:seed
   ```

7. Inicie o servidor:
   ```bash
   npm run dev
   ```
   - O backend estará rodando em: http://localhost:3000
   - Teste acessando: http://localhost:3000/health

### PASSO 3: Configurar o Painel Web (Admin/Professores)

1. Abra um NOVO PowerShell e entre na pasta web:
   ```bash
   cd web-admin
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o endereço da API:
   - Abra o arquivo `web-admin/.env` e edite:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   - O painel web estará em: http://localhost:5173

5. **Login padrão (após seed)**:
   - Admin: admin@vidamais.com / senha: admin123
   - Professor: prof@vidamais.com / senha: prof123

### PASSO 4: Configurar o App Mobile (iOS e Android)

1. Abra um TERCEIRO PowerShell e entre na pasta mobile:
   ```bash
   cd mobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o endereço da API:
   - Abra o arquivo `mobile/src/config/api.ts` e edite:
   ```typescript
   // Para testar no seu celular, use o IP da sua máquina:
   // Descubra seu IP digitando no PowerShell: ipconfig
   // Procure por "IPv4 Address"
   export const API_URL = 'http://SEU_IP:3000'; // Ex: http://192.168.1.100:3000
   ```

4. Inicie o Expo:
   ```bash
   npm start
   ```

5. **Testar no celular**:
   - Instale o app "Expo Go" no seu celular (iOS ou Android)
   - Escaneie o QR Code que apareceu no terminal
   - O app abrirá no seu celular!

### PASSO 5: Testar o Sistema Completo

1. **Backend deve estar rodando** (PowerShell 1) em http://localhost:3000
2. **Web deve estar rodando** (PowerShell 2) em http://localhost:5173
3. **Mobile deve estar rodando** (PowerShell 3) via Expo

**Fluxo de teste:**
1. Acesse o painel web e faça login como Admin
2. Crie uma turma e vincule alunos
3. Crie um questionário
4. No app mobile, faça login como aluno e responda o questionário
5. No painel web, veja os relatórios e exporte para Excel

## 📱 Como Publicar o App (iOS e Android)

### Para Android (Google Play)
```bash
cd mobile
eas build --platform android
```

### Para iOS (App Store)
```bash
cd mobile
eas build --platform ios
```

Consulte o guia completo em: `docs/PUBLICACAO.md`

## 🔧 Comandos Úteis

### Backend
```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Compila para produção
npm start            # Inicia em produção
npm run db:migrate   # Executa migrações
npm run db:seed      # Popula dados de exemplo
npm test             # Executa testes
```

### Web Admin
```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Compila para produção
npm run preview      # Preview da build
```

### Mobile
```bash
npm start            # Inicia Expo
npm run android      # Abre no emulador Android
npm run ios          # Abre no simulador iOS (só no Mac)
eas build            # Cria build de produção
```

## 🚀 Deploy na AWS (Produção)

Consulte o guia completo: `docs/DEPLOY_AWS.md`

Resumo:
1. Configure uma instância EC2 (Ubuntu)
2. Instale Node.js, PostgreSQL e Nginx
3. Clone o repositório
4. Configure SSL com Let's Encrypt
5. Use PM2 para manter a API rodando

## 🐛 Solução de Problemas Comuns

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Confirme a senha no arquivo `.env`
- Verifique se o banco `vida_mais` foi criado

### Erro: "Port 3000 already in use"
- Algo já está usando a porta 3000
- Mude a porta no arquivo `backend/.env`

### Mobile não conecta na API
- Certifique-se de usar o IP correto (não use localhost!)
- Backend e celular devem estar na mesma rede WiFi
- Desative o firewall temporariamente para testar

### Expo não inicia
- Limpe o cache: `npx expo start --clear`
- Delete a pasta `node_modules` e rode `npm install` novamente

## 📚 Documentação Adicional

- [Guia de Deploy AWS](docs/DEPLOY_AWS.md)
- [Guia de Publicação Mobile](docs/PUBLICACAO.md)
- [Arquitetura e Banco de Dados](docs/ARQUITETURA.md)
- [API - Endpoints](docs/API.md)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e pertence à Instituição Vida Mais.

## 📞 Suporte

Para dúvidas ou problemas, abra uma "Issue" no GitHub.

---

Desenvolvido com ❤️ para a Instituição Vida Mais

