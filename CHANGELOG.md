# Changelog

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-10-21

### ✨ Adicionado
- Sistema completo de autenticação com JWT
- Gerenciamento de usuários (Admin, Professores, Alunos)
- CRUD completo de turmas
- Sistema de criação de questionários personalizáveis
- 5 tipos de perguntas: Texto, Múltipla Escolha, Escolha Única, Escala, Sim/Não
- Interface web responsiva para administração
- App mobile com interface acessível para idosos
- Leitura em voz (TTS) das perguntas
- Modo offline no app mobile
- Sistema de relatórios com gráficos
- Exportação de dados em Excel (XLSX) e CSV
- Documentação completa do projeto
- Guias de deploy na AWS
- Guias de publicação nas lojas (Google Play e App Store)

### 🔒 Segurança
- Senhas criptografadas com bcrypt
- Tokens JWT com expiração
- Proteção contra SQL Injection (Prisma ORM)
- CORS configurado
- Rate limiting
- Headers de segurança (Helmet)

### 📱 Acessibilidade
- Fontes grandes (≥ 20px)
- Alto contraste
- Botões grandes (60x60px mínimo)
- Leitura em voz das perguntas
- Interface simplificada
- Uma pergunta por tela
- Feedback visual e tátil

### 🛠️ Tecnologias
- **Backend:** Node.js 20, Express, Prisma, PostgreSQL
- **Web:** React 18, Vite, TailwindCSS, Chart.js
- **Mobile:** React Native, Expo, React Navigation
- **Deploy:** AWS EC2, Nginx, PM2
- **CI/CD:** GitHub Actions

### 📚 Documentação
- README completo com guia passo a passo
- Guia rápido para iniciantes
- Documentação da API REST
- Guia de deploy na AWS
- Guia de publicação mobile
- Documentação da arquitetura

---

## Formato das Versões

### [Não lançado] - YYYY-MM-DD

### Tipos de mudanças
- **Adicionado** - para novas funcionalidades
- **Modificado** - para mudanças em funcionalidades existentes
- **Descontinuado** - para funcionalidades que serão removidas
- **Removido** - para funcionalidades removidas
- **Corrigido** - para correções de bugs
- **Segurança** - em caso de vulnerabilidades

---

Para ver o histórico completo de mudanças, visite:
https://github.com/SEU_USUARIO/Vida_Mais_APP/commits/main

