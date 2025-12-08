# 🛠️ Forms Tech - Guia de Tecnologias

## 📋 Visão Geral da Arquitetura

O **Forms Tech** é um sistema completo de pesquisas e questionários com arquitetura moderna em três camadas:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Clientes)                         │
├─────────────────────────────┬───────────────────────────────────────┤
│     📱 Mobile (React Native) │     💻 Web Admin (React + Vite)       │
│     Expo SDK 54             │     Tailwind CSS                      │
└─────────────────────────────┴───────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (API REST)                          │
├─────────────────────────────────────────────────────────────────────┤
│     🟢 Node.js + Express.js + TypeScript                           │
│     Prisma ORM | JWT Auth | Helmet | Rate Limiting                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌──────────────────────────────────┐
│      🗄️ Banco de Dados         │   │     🤖 Serviço de ML (Python)     │
│      MySQL 8.0                │   │     Flask + Scikit-learn         │
│      AWS RDS / Local          │   │     Análise Preditiva            │
└───────────────────────────────┘   └──────────────────────────────────┘
```

---

## 📱 MOBILE - React Native + Expo

### Tecnologias Principais

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React Native** | 0.81.5 | Framework para desenvolvimento mobile multiplataforma |
| **Expo** | SDK 54 | Plataforma que simplifica o desenvolvimento React Native |
| **TypeScript** | 5.3.3 | Tipagem estática para JavaScript |

### Por que essas tecnologias?

- **React Native**: Permite desenvolver para Android e iOS com um único código, reduzindo tempo e custo de desenvolvimento em 50%.
- **Expo**: Elimina a necessidade de configurar Android Studio/Xcode, fornece APIs prontas (câmera, áudio, compartilhamento) e simplifica o deploy.
- **TypeScript**: Previne erros em tempo de desenvolvimento, melhora a documentação do código e facilita refatorações.

### Bibliotecas Utilizadas

```
📦 Navegação & Estado
├── @react-navigation/native       → Navegação entre telas
├── @react-navigation/native-stack → Stack navigation (pilha de telas)
├── zustand                        → Gerenciamento de estado global (auth, config)
└── @tanstack/react-query          → Cache e sincronização de dados da API

📦 Interface & UX
├── @react-native-community/slider → Barra deslizante (0-10 nas perguntas)
├── @react-native-picker/picker    → Seletor dropdown
└── react-native-screens           → Performance de navegação

📦 Armazenamento & Segurança
├── @react-native-async-storage    → Armazenamento local (configurações)
└── expo-secure-store              → Armazenamento seguro (tokens JWT)

📦 Funcionalidades Extras
├── expo-file-system               → Manipulação de arquivos (download Excel)
├── expo-sharing                   → Compartilhamento de arquivos
├── expo-speech                    → Text-to-Speech (acessibilidade)
└── expo-av                        → Áudio/Vídeo

📦 HTTP Client
└── axios                          → Requisições HTTP para a API
```

### Fluxo de Dados no Mobile

```
Usuário → Ação → Zustand Store → React Query → Axios → API Backend
                      ↓
               Cache Local → UI Atualizada
```

---

## 💻 WEB ADMIN - React + Vite + Tailwind

### Tecnologias Principais

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 18.2.0 | Biblioteca para construção de interfaces |
| **Vite** | 6.4.1 | Build tool extremamente rápido |
| **Tailwind CSS** | 3.4.0 | Framework CSS utility-first |
| **TypeScript** | 5.2.2 | Tipagem estática |

### Por que essas tecnologias?

- **React 18**: Virtual DOM eficiente, ecossistema maduro, facilita componentização.
- **Vite**: Hot Module Replacement instantâneo, build 10-100x mais rápido que Webpack.
- **Tailwind CSS**: Desenvolvimento rápido, design consistente, CSS final otimizado (remove classes não utilizadas).

### Bibliotecas Utilizadas

```
📦 Estado & Dados
├── zustand                    → Estado global (autenticação, preferências)
├── @tanstack/react-query      → Fetch, cache e sincronização de dados
└── @tanstack/react-table      → Tabelas interativas com ordenação/filtro

📦 Formulários & Validação
├── react-hook-form            → Gerenciamento de formulários performático
└── zod                        → Validação de schemas TypeScript-first

📦 Roteamento
└── react-router-dom           → Navegação SPA (Single Page Application)

📦 Visualização de Dados
├── chart.js                   → Biblioteca de gráficos
└── react-chartjs-2            → Wrapper React para Chart.js

📦 UI/UX
├── lucide-react               → Ícones modernos SVG
├── react-toastify             → Notificações toast
└── sonner                     → Toasts modernos e acessíveis

📦 HTTP Client
└── axios                      → Requisições HTTP
```

### Arquitetura de Componentes

```
src/
├── components/          → Componentes reutilizáveis
├── contexts/            → Contextos React (FontSize, Theme)
├── hooks/               → Custom hooks
├── layouts/             → Layouts (DashboardLayout)
├── pages/               → Páginas/Views
│   ├── admin/           → Páginas do administrador
│   └── ...
├── services/            → Serviços de API
├── stores/              → Zustand stores
└── types/               → TypeScript types/interfaces
```

---

## 🟢 BACKEND - Node.js + Express + Prisma

### Tecnologias Principais

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Node.js** | 20.x | Runtime JavaScript server-side |
| **Express.js** | 4.18.2 | Framework web minimalista |
| **TypeScript** | 5.3.3 | Tipagem estática |
| **Prisma** | 5.20.0 | ORM moderno para banco de dados |

### Por que essas tecnologias?

- **Node.js**: JavaScript no backend permite compartilhar código/tipos com frontend, excelente para I/O intensivo.
- **Express.js**: Simples, flexível, vasto ecossistema de middlewares.
- **Prisma**: Type-safe database client, migrations automáticas, Prisma Studio para debug.

### Bibliotecas de Segurança

```
📦 Autenticação & Autorização
├── jsonwebtoken (JWT)       → Tokens de autenticação stateless
└── bcrypt                   → Hash seguro de senhas (salt + rounds)

📦 Segurança HTTP
├── helmet                   → Headers de segurança (CSP, HSTS, etc.)
├── cors                     → Cross-Origin Resource Sharing
└── express-rate-limit       → Proteção contra DDoS/brute force
```

### Bibliotecas de Dados

```
📦 ORM & Database
├── @prisma/client           → Cliente Prisma para MySQL
└── prisma                   → CLI e schema management

📦 Validação
└── zod                      → Validação de entrada (request body)

📦 Exportação
├── exceljs                  → Geração de arquivos Excel (.xlsx)
└── fast-csv                 → Geração de arquivos CSV
```

### Arquitetura do Backend

```
src/
├── data/                → Dados estáticos (questionário padrão)
├── middlewares/         → Middlewares (auth, error, rate-limit)
├── prisma/              → Schema e seeds do banco
├── routes/              → Rotas da API REST
│   ├── admin.routes.ts  → Rotas do administrador
│   ├── aluno.routes.ts  → Rotas do aluno
│   ├── prof.routes.ts   → Rotas do professor
│   └── ml.routes.ts     → Proxy para serviço ML
├── scripts/             → Scripts utilitários
├── services/            → Serviços de negócio
├── types/               → TypeScript types
└── server.ts            → Entry point
```

### Fluxo de Autenticação JWT

```
1. Login: Usuário envia email/senha
2. Validação: Backend verifica com bcrypt
3. Token: Gera JWT com payload {id, email, role}
4. Cliente: Armazena token (SecureStore/localStorage)
5. Requisições: Envia token no header Authorization
6. Middleware: Valida token em rotas protegidas
```

---

## 🗄️ BANCO DE DADOS - MySQL + Prisma

### Schema Simplificado

```prisma
// Usuários do sistema
model User {
  id        String   @id @default(uuid())
  nome      String
  email     String   @unique
  senha     String   // Hash bcrypt
  role      Role     // ADMIN, PROFESSOR, ALUNO
  ativo     Boolean  @default(true)
}

// Turmas/Classes
model Turma {
  id          String   @id @default(uuid())
  nome        String
  descricao   String?
  professorId String
}

// Questionários
model Questionario {
  id          String   @id @default(uuid())
  titulo      String
  descricao   String?
  ativo       Boolean
  perguntas   Pergunta[]
}

// Perguntas
model Pergunta {
  id          String   @id @default(uuid())
  enunciado   String
  tipo        TipoPergunta  // ESCALA, TEXTO, BOOLEAN, UNICA, MULTIPLA
  opcoesJson  String?       // JSON para múltipla escolha
}

// Respostas
model Resposta {
  id           String   @id @default(uuid())
  alunoId      String
  perguntaId   String
  valorTexto   String?
  valorNum     Int?
}
```

### Por que MySQL?

- **Confiabilidade**: ACID compliant, transações seguras
- **Performance**: Índices, query optimizer maduro
- **Compatibilidade**: Suporte nativo no Prisma
- **AWS RDS**: Fácil deploy e backup automático

---

## 🤖 SERVIÇO DE ML - Python + Flask + Scikit-learn

### Tecnologias Principais

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Python** | 3.11+ | Linguagem padrão para ML/Data Science |
| **Flask** | 3.0.0 | Micro-framework web para API |
| **Scikit-learn** | 1.3.2 | Biblioteca de Machine Learning |
| **Pandas** | 2.1.4 | Manipulação de dados |

### Por que Python para ML?

- **Ecossistema**: Maior biblioteca de ML/AI disponível
- **Scikit-learn**: Algoritmos prontos, API consistente
- **Performance**: NumPy usa C/Fortran por baixo
- **Comunidade**: Documentação extensa, Stack Overflow

### Modelos Implementados

```python
# 1. Predição de Evasão - Random Forest Classifier
RandomForestClassifier(
    n_estimators=100,     # 100 árvores de decisão
    max_depth=10,         # Profundidade máxima
    random_state=42       # Reprodutibilidade
)

# 2. Predição de Desempenho - Gradient Boosting Regressor
GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3
)
```

### Features Analisadas

```
📊 Métricas por Aluno
├── Taxa de Resposta         → % questionários respondidos
├── Média de Notas           → Média das respostas numéricas
├── Tempo desde Cadastro     → Dias no sistema
├── Engajamento              → Frequência de respostas
└── Padrões de Resposta      → Variância, tendências
```

### Endpoints da API ML

```
GET  /health              → Status do serviço
GET  /models/status       → Estado dos modelos treinados
GET  /analytics/overview  → Visão geral das métricas
GET  /analytics/turma/:id → Análise por turma
POST /predict/evasao      → Predição de risco de evasão
POST /train/models        → Re-treinar modelos
GET  /patterns/engagement → Padrões de engajamento
```

---

## ☁️ INFRAESTRUTURA - AWS

### Serviços Utilizados

| Serviço | Função |
|---------|--------|
| **EC2** | Servidor para Backend + ML Service |
| **RDS** | Banco de dados MySQL gerenciado |
| **Security Groups** | Firewall (portas 3000, 5000, 22) |

### Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      EC2 Instance                        │   │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐ │   │
│  │  │   PM2 Manager   │    │        PM2 Manager          │ │   │
│  │  │  ┌───────────┐  │    │  ┌───────────────────────┐  │ │   │
│  │  │  │  Node.js  │  │    │  │   Python Flask        │  │ │   │
│  │  │  │  Backend  │  │    │  │   ML Service          │  │ │   │
│  │  │  │  :3000    │  │    │  │   :5000               │  │ │   │
│  │  │  └───────────┘  │    │  └───────────────────────┘  │ │   │
│  │  └─────────────────┘    └─────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    RDS MySQL                             │   │
│  │                    :3306                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### PM2 - Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'forms-tech-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false
    },
    {
      name: 'forms-tech-ml',
      script: './start-ml.sh',
      cwd: './ml-service',
      interpreter: '/bin/bash'
    }
  ]
};
```

---

## 🔄 FLUXO COMPLETO DE DADOS

```
1. MOBILE/WEB
   └─→ Usuário responde questionário
   
2. FRONTEND
   └─→ React/React Native valida dados
   └─→ Zustand atualiza estado local
   └─→ Axios envia para API
   
3. BACKEND NODE.JS
   └─→ Express recebe requisição
   └─→ Middleware valida JWT
   └─→ Zod valida payload
   └─→ Prisma salva no MySQL
   
4. ML SERVICE (PYTHON)
   └─→ Busca dados do MySQL
   └─→ Processa com Pandas
   └─→ Aplica modelos Scikit-learn
   └─→ Retorna predições
   
5. FRONTEND
   └─→ React Query atualiza cache
   └─→ Chart.js renderiza gráficos
   └─→ Usuário vê insights
```

---

## 📊 RESUMO DAS TECNOLOGIAS

| Camada | Tecnologia Principal | Linguagem |
|--------|---------------------|-----------|
| Mobile | React Native + Expo | TypeScript |
| Web | React + Vite + Tailwind | TypeScript |
| Backend | Node.js + Express + Prisma | TypeScript |
| ML | Flask + Scikit-learn | Python |
| Database | MySQL 8.0 | SQL |
| Deploy | AWS EC2 + RDS + PM2 | - |

### Contagem de Tecnologias

- **Linguagens**: 4 (TypeScript, JavaScript, Python, SQL)
- **Frameworks**: 6 (React, React Native, Express, Flask, Expo, Tailwind)
- **Bibliotecas**: 30+ principais
- **Serviços Cloud**: 3 (EC2, RDS, Security Groups)

---

*Documento criado para apresentação do projeto Forms Tech - Dezembro 2024*

