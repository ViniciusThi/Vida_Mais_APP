# 📱 Forms Tech - Sistema de Pesquisa de Satisfação Digital

> Projeto Integrador V - Faculdade de Tecnologia (FATEC)  
> Sistema completo para digitalização de pesquisas de satisfação

---

## 📋 Sobre o Projeto

O **Forms Tech** é uma solução completa desenvolvida para digitalizar o processo de pesquisa anual de satisfação (agosto-setembro), que anteriormente era realizado manualmente em papel. O sistema oferece uma plataforma integrada com aplicativo mobile acessível para idosos, painel web administrativo e API robusta.

### 🎯 Problema Identificado

- Processo manual de pesquisa em papel
- Dificuldade na tabulação e análise dos dados
- Falta de acessibilidade para idosos com dificuldades visuais
- Tempo elevado para consolidação de resultados

### 💡 Solução Proposta

Sistema digital multiplataforma com:
- Interface mobile acessível (fontes grandes, alto contraste, leitura em voz)
- Painel web para criação de questionários e análise de dados
- Geração automática de relatórios e exportação para Excel/CSV
- Arquitetura escalável e segura hospedada na AWS

---

## 🏗️ Arquitetura do Sistema

### Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│  📱 Mobile App (React Native + Expo)                        │
│  └─ Interface acessível para idosos (iOS e Android)        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  🔧 Backend API (Node.js + Express + Prisma)                │
│  └─ Autenticação JWT, RBAC, Relatórios, Exportação         │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  🗄️ PostgreSQL                                              │
│  └─ 7 tabelas relacionais                                   │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Pastas

```
Vida_Mais_APP/
├── backend/          # API REST (Node.js + Express + PostgreSQL)
├── web-admin/        # Painel Administrativo (React + Vite)
├── mobile/           # Aplicativo Mobile (React Native + Expo)
└── docs/             # Documentação técnica completa
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js 20 LTS** - Runtime JavaScript/TypeScript
- **Express 4** - Framework web minimalista
- **TypeScript** - Superset tipado do JavaScript
- **Prisma ORM** - Object-Relational Mapping para PostgreSQL
- **PostgreSQL 15** - Banco de dados relacional
- **JWT (jsonwebtoken)** - Autenticação stateless
- **bcrypt** - Hash de senhas
- **Zod** - Validação de schemas
- **ExcelJS** - Geração de planilhas Excel
- **fast-csv** - Exportação CSV

### Frontend Web
- **React 18** - Biblioteca para interfaces de usuário
- **Vite** - Build tool de nova geração
- **TypeScript** - Type safety
- **TailwindCSS** - Framework CSS utility-first
- **React Router v6** - Roteamento SPA
- **TanStack Query (React Query)** - Data fetching e cache
- **Zustand** - Gerenciamento de estado
- **Chart.js** - Visualização de dados (gráficos)
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP

### Mobile
- **React Native** - Framework mobile multiplataforma
- **Expo** - Toolchain e serviços para React Native
- **TypeScript** - Type safety
- **React Navigation** - Navegação entre telas
- **TanStack Query** - Data fetching e sincronização
- **Zustand** - State management
- **Expo Speech** - Text-to-Speech (leitura em voz)
- **Expo SecureStore** - Armazenamento seguro de credenciais

### DevOps & Infraestrutura
- **AWS EC2** - Hospedagem do backend e frontend
- **Nginx** - Servidor web e proxy reverso
- **PM2** - Gerenciador de processos Node.js
- **GitHub Actions** - CI/CD pipeline
- **Let's Encrypt** - Certificados SSL gratuitos
- **Git/GitHub** - Controle de versão

## 🎯 Funcionalidades Implementadas

### Sistema de Papéis (RBAC)

**Administrador Geral:**
- Gerenciamento completo de usuários (professores e alunos)
- Criação e gestão de turmas
- Vinculação de alunos a turmas
- Criação de questionários globais
- Visualização de relatórios gerais
- Importação em massa via CSV

**Professor:**
- Criação de questionários personalizados para suas turmas
- Gerenciamento de 5 tipos de perguntas:
  - Texto livre
  - Escolha única (radio)
  - Múltipla escolha (checkbox)
  - Escala numérica (1-5)
  - Verdadeiro/Falso (Sim/Não)
- Visualização de relatórios com gráficos
- Exportação de dados (Excel/CSV)
- Definição de períodos de disponibilidade

**Aluno/Idoso:**
- Interface mobile acessível e intuitiva
- Visualização de questionários disponíveis
- Resposta de questionários com suporte a:
  - Leitura em voz (Text-to-Speech)
  - Navegação simplificada (uma pergunta por vez)
  - Alto contraste e fontes grandes
  - Botões grandes e espaçados
- Confirmação visual de envio

---

## 🗄️ Modelo de Dados

### Entidades Principais

```sql
users               # Usuários (Admin, Professor, Aluno)
├─ id, nome, email, senha_hash, role, ativo

turmas              # Turmas/Classes
├─ id, nome, ano, professor_id, ativo

alunos_turmas       # Relacionamento N:N
├─ id, aluno_id, turma_id

questionarios       # Questionários
├─ id, titulo, descricao, criado_por, visibilidade
├─ turma_id, ativo, periodo_inicio, periodo_fim

perguntas           # Perguntas dos questionários
├─ id, questionario_id, ordem, tipo, enunciado
├─ obrigatoria, opcoes_json

respostas           # Respostas dos alunos
├─ id, questionario_id, pergunta_id, aluno_id, turma_id
├─ valor_texto, valor_num, valor_bool, valor_opcao
```

**Total:** 7 tabelas com relacionamentos otimizados e índices

---

## 🔐 Segurança

- **Autenticação:** JWT com expiração configurável
- **Autorização:** RBAC (Role-Based Access Control)
- **Senhas:** Hash bcrypt (salt rounds: 10)
- **SQL Injection:** Prevenido via Prisma ORM
- **XSS:** Sanitização de inputs
- **CORS:** Configurado para origens específicas
- **Rate Limiting:** Proteção contra ataques de força bruta
- **Headers de Segurança:** Helmet.js

---

## ♿ Acessibilidade

Recursos implementados para idosos:

- **Visual:**
  - Fontes grandes (≥ 20px)
  - Alto contraste (WCAG 2.1 AA)
  - Espaçamento generoso entre elementos
  - Botões grandes (mínimo 60x60px)

- **Interação:**
  - Leitura em voz automática (TTS)
  - Uma pergunta por tela
  - Navegação simplificada
  - Feedback visual e tátil

- **Usabilidade:**
  - Fluxo linear e intuitivo
  - Confirmações visuais claras
  - Mensagens de erro compreensíveis

## 📊 Resultados e Impacto

### Benefícios Alcançados

- ✅ **Redução de 100% no uso de papel** nas pesquisas
- ✅ **Economia de tempo:** Tabulação automática vs. manual (horas → segundos)
- ✅ **Maior acessibilidade:** Interface adaptada para idosos com baixa visão
- ✅ **Dados em tempo real:** Visualização imediata de resultados
- ✅ **Escalabilidade:** Suporta crescimento da instituição sem custo adicional
- ✅ **Inclusão digital:** Facilita o acesso à tecnologia por idosos

### Métricas do Sistema

- **Linhas de código:** ~12.000+
- **Arquivos criados:** 70+
- **Endpoints da API:** 30+
- **Telas mobile:** 11 (3 perfis diferentes)
- **Páginas web:** 11
- **Documentação:** 300+ páginas

---

## 🎨 Diferenciais do Projeto

### Técnicos
- **Arquitetura moderna:** Separação clara de responsabilidades (Backend, Web, Mobile)
- **Type Safety:** 100% TypeScript em todos os módulos
- **ORM moderno:** Prisma para migrações type-safe e queries otimizadas
- **State management eficiente:** Zustand (leve e performático)
- **Responsividade:** Funciona em desktop, tablet e mobile
- **Offline-first:** App mobile com suporte a cache local

### UX/UI
- **Design acessível:** Especialmente desenvolvido para terceira idade
- **Multiplataforma:** Única codebase para iOS e Android
- **Feedback imediato:** Validações e confirmações em tempo real
- **Visualização de dados:** Gráficos interativos com Chart.js

### DevOps
- **CI/CD:** GitHub Actions para testes automatizados
- **Deploy automatizado:** Scripts de configuração completos
- **Monitoramento:** PM2 + logs estruturados
- **Auto-scaling ready:** Arquitetura preparada para crescimento

---

## 📈 Escalabilidade

O sistema foi projetado para crescer:

- **Banco de dados:** Índices otimizados para queries rápidas
- **API:** Stateless (JWT) permite balanceamento de carga
- **Frontend:** Build otimizado com code splitting
- **Mobile:** Bundle size < 50MB

### Capacidade Atual (t2.micro)
- ~500 usuários simultâneos
- ~10.000 respostas/dia
- ~100 questionários ativos

### Expansão Futura
- Load Balancer (múltiplas instâncias EC2)
- Redis para cache
- CDN para assets estáticos
- RDS Multi-AZ para alta disponibilidade

---

## 📸 Capturas de Tela

### Painel Web Administrativo
<div align="center">
  <img src="docs/screenshots/web-login.png" alt="Login Web" width="400"/>
  <img src="docs/screenshots/web-dashboard.png" alt="Dashboard" width="400"/>
</div>

### Aplicativo Mobile
<div align="center">
  <img src="docs/screenshots/mobile-login.png" alt="Login Mobile" width="250"/>
  <img src="docs/screenshots/mobile-questionario.png" alt="Questionário" width="250"/>
  <img src="docs/screenshots/mobile-relatorio.png" alt="Relatório" width="250"/>
</div>

*Nota: Screenshots ilustrativas do sistema em funcionamento*

---

## 🚀 Instalação e Execução

### Requisitos
- Node.js 20 LTS
- PostgreSQL 15+
- Git

### Início Rápido

```bash
# Clone o repositório
git clone https://github.com/ViniciusThi/Vida_Mais_APP.git
cd Vida_Mais_APP

# Backend
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Web Admin (novo terminal)
cd web-admin
npm install
npm run dev

# Mobile (novo terminal)
cd mobile
npm install
npm start
```

**Para instruções detalhadas, consulte:** [`GUIA_RAPIDO.md`](GUIA_RAPIDO.md)

---

## 🐳 Subir tudo na EC2 com Docker (recomendado)

Se você quer **ligar a EC2 e o sistema já subir automaticamente**, use o `docker-compose.yml` (sobe **MySQL + backend + ml-service + web-admin**).

### Pré-requisitos na EC2 (Ubuntu)

- Docker instalado
- Docker Compose Plugin instalado (comando `docker compose`)

### Subir o sistema

```bash
cd ~/Vida_Mais_APP
git pull origin main

docker compose up -d --build
docker compose ps
```

### Acessos

- **Painel Web**: `http://IP_DA_EC2/`
- **API (backend)**: `http://IP_DA_EC2/api/health`

### Observações importantes

- O `JWT_SECRET` do `docker-compose.yml` está como `change-me-in-production`. Em produção, **troque** por um segredo forte.
- O MySQL está exposto em `3306` no host por conveniência. Se quiser mais segurança, remova o `ports: "3306:3306"` do serviço `db`.

---

## 📚 Documentação

### Guias de Instalação e Uso
- [`GUIA_RAPIDO.md`](GUIA_RAPIDO.md) - Guia completo passo a passo
- [`COMANDOS_PRONTOS.txt`](COMANDOS_PRONTOS.txt) - Comandos prontos para copiar

### Documentação Técnica
- [`docs/REQUISITOS.md`](docs/REQUISITOS.md) - Requisitos funcionais e não funcionais do sistema
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) - Arquitetura detalhada e modelo de dados
- [`docs/API.md`](docs/API.md) - Documentação completa da API REST
- [`docs/DEPLOY_AWS.md`](docs/DEPLOY_AWS.md) - Deploy em produção na AWS
- [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md) - Publicação nas lojas (Play Store e App Store)
- [`docs/GIT_GITHUB.md`](docs/GIT_GITHUB.md) - Guia de Git e GitHub
- [`docs/TESTE_MOBILE.md`](docs/TESTE_MOBILE.md) - Testes mobile para todos os perfis

---

## 🎓 Contexto Acadêmico

### Projeto Integrador V - FATEC

**Disciplina:** Projeto Integrador V  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição Parceira:** Forms Tech  
**Período:** Agosto-Outubro 2025

### Objetivos de Aprendizagem

- ✅ Desenvolvimento Full Stack completo
- ✅ Integração de múltiplas tecnologias
- ✅ Deploy em ambiente de produção
- ✅ Metodologias ágeis e versionamento
- ✅ Acessibilidade e UX Design
- ✅ Documentação técnica profissional

---

## 👥 Equipe de Desenvolvimento

- **Desenvolvedor Full Stack:** Vinícius Tibério
- **Instituição Parceira:** Forms Tech
- **Orientação:** FATEC

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Linhas de Código | ~12.000+ |
| Arquivos Criados | 70+ |
| Commits no Git | 10+ |
| Documentação | 300+ páginas |
| Tecnologias | 25+ |
| Endpoints API | 30+ |
| Tempo de Desenvolvimento | 200+ horas |

---

## 🌟 Demonstração

**Sistema em Produção:** http://54.233.110.183

**Credenciais de Teste:**
- Admin: `admin@vidamais.com` / `admin123`
- Professor: `prof1@vidamais.com` / `prof123`
- Aluno: `aluno1@vidamais.com` / `aluno123`

**Repositório GitHub:** https://github.com/ViniciusThi/Vida_Mais_APP

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Consulte [`CONTRIBUINDO.md`](CONTRIBUINDO.md) para diretrizes.

---

## 📞 Contato

Para dúvidas ou sugestões:
- **Issues:** https://github.com/ViniciusThi/Vida_Mais_APP/issues
- **Email:** vinicius.tiberio@fatec.sp.gov.br

---

## 📖 Referências

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma ORM](https://www.prisma.io/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

<div align="center">

**Desenvolvido com ❤️ para o Forms Tech**

*Projeto Integrador V - FATEC 2025*

[![GitHub](https://img.shields.io/badge/GitHub-ViniciusThi-blue?logo=github)](https://github.com/ViniciusThi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

