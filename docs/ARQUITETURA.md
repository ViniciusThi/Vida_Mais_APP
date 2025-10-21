# 🏗️ Arquitetura do Sistema Vida Mais

Documentação técnica da arquitetura e modelo de dados.

## 📐 Visão Geral

O sistema Vida Mais é composto por 3 módulos principais:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Mobile App (React Native + Expo)                  │
│  ├─ Login de Alunos                                │
│  ├─ Visualizar Questionários                       │
│  ├─ Responder Questionários                        │
│  └─ Interface Acessível (TTS, botões grandes)      │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ HTTPS/REST API
                 ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Backend API (Node.js + Express + Prisma)          │
│  ├─ Autenticação (JWT)                             │
│  ├─ RBAC (Admin, Prof, Aluno)                      │
│  ├─ CRUD Usuários/Turmas/Questionários             │
│  ├─ Geração de Relatórios                          │
│  └─ Exportação XLSX/CSV                            │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Prisma ORM
                 ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Banco de Dados (PostgreSQL)                       │
│  ├─ users                                          │
│  ├─ turmas                                         │
│  ├─ alunos_turmas                                  │
│  ├─ questionarios                                  │
│  ├─ perguntas                                      │
│  ├─ respostas                                      │
│  └─ convites                                       │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│  Web Admin (React + Vite + TailwindCSS)            │
│  ├─ Dashboard                                      │
│  ├─ Gerenciar Professores/Alunos/Turmas           │
│  ├─ Criar/Editar Questionários                    │
│  ├─ Visualizar Relatórios com Gráficos            │
│  └─ Exportar Dados                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🗄️ Modelo de Dados

### Diagrama ER (Simplificado)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │    turmas    │         │ questionarios│
│──────────────│         │──────────────│         │──────────────│
│ id (PK)      │◄────┐   │ id (PK)      │◄────┐   │ id (PK)      │
│ nome         │     │   │ nome         │     │   │ titulo       │
│ email (UQ)   │     └───│ professor_id │     └───│ criado_por   │
│ senha_hash   │         │ ano          │         │ turma_id     │
│ role (ENUM)  │         │ ativo        │         │ visibilidade │
│ ativo        │         └──────┬───────┘         │ ativo        │
└───────┬──────┘                │                 │ periodo_*    │
        │                       │                 └──────┬───────┘
        │                       │                        │
        │         ┌─────────────┴──────────┐            │
        │         │                        │            │
        │    ┌────▼──────┐          ┌──────▼─────┐      │
        │    │alunos_    │          │ perguntas  │      │
        └───►│turmas     │          │────────────│      │
             │───────────│          │ id (PK)    │◄─────┘
             │ id (PK)   │          │ question_id│
             │ aluno_id  │          │ ordem      │
             │ turma_id  │          │ tipo (ENUM)│
             │ (UQ)      │          │ enunciado  │
             └────┬──────┘          │ opcoes_json│
                  │                 └──────┬─────┘
                  │                        │
                  │         ┌──────────────┘
                  │         │
             ┌────▼─────────▼───┐
             │    respostas     │
             │──────────────────│
             │ id (PK)          │
             │ questionario_id  │
             │ pergunta_id      │
             │ aluno_id         │
             │ turma_id         │
             │ valor_texto      │
             │ valor_num        │
             │ valor_bool       │
             │ valor_opcao      │
             │ criado_em        │
             └──────────────────┘
```

### Tabelas Principais

#### `users`
Armazena todos os usuários do sistema (Admin, Professores, Alunos).

| Campo         | Tipo      | Descrição                          |
|---------------|-----------|------------------------------------|
| id            | UUID      | Chave primária                     |
| nome          | String    | Nome completo                      |
| email         | String    | Email único                        |
| senha_hash    | String    | Senha criptografada (bcrypt)       |
| role          | Enum      | ADMIN, PROF ou ALUNO               |
| ativo         | Boolean   | Status do usuário                  |
| criado_em     | DateTime  | Data de criação                    |

**Índices:** email (único)

#### `turmas`
Representa as turmas/classes.

| Campo         | Tipo      | Descrição                          |
|---------------|-----------|------------------------------------|
| id            | UUID      | Chave primária                     |
| nome          | String    | Nome da turma                      |
| ano           | Int       | Ano letivo                         |
| professor_id  | UUID      | FK → users (professor)             |
| ativo         | Boolean   | Status da turma                    |
| criado_em     | DateTime  | Data de criação                    |

**Índices:** professor_id

#### `alunos_turmas`
Relacionamento muitos-para-muitos entre alunos e turmas.

| Campo         | Tipo      | Descrição                          |
|---------------|-----------|------------------------------------|
| id            | UUID      | Chave primária                     |
| aluno_id      | UUID      | FK → users (aluno)                 |
| turma_id      | UUID      | FK → turmas                        |
| criado_em     | DateTime  | Data de vinculação                 |

**Índices:** (aluno_id, turma_id) único, aluno_id, turma_id

#### `questionarios`
Armazena os questionários criados.

| Campo            | Tipo      | Descrição                       |
|------------------|-----------|---------------------------------|
| id               | UUID      | Chave primária                  |
| titulo           | String    | Título do questionário          |
| descricao        | String?   | Descrição opcional              |
| criado_por       | UUID      | FK → users (criador)            |
| visibilidade     | Enum      | GLOBAL ou TURMA                 |
| turma_id         | UUID?     | FK → turmas (se TURMA)          |
| ativo            | Boolean   | Status                          |
| periodo_inicio   | DateTime? | Início da disponibilidade       |
| periodo_fim      | DateTime? | Fim da disponibilidade          |
| criado_em        | DateTime  | Data de criação                 |

**Índices:** criado_por, turma_id, ativo

#### `perguntas`
Questões de cada questionário.

| Campo            | Tipo      | Descrição                       |
|------------------|-----------|---------------------------------|
| id               | UUID      | Chave primária                  |
| questionario_id  | UUID      | FK → questionarios              |
| ordem            | Int       | Ordem de exibição               |
| tipo             | Enum      | TEXTO, UNICA, MULTIPLA, etc.    |
| enunciado        | String    | Texto da pergunta               |
| obrigatoria      | Boolean   | Se é obrigatória                |
| opcoes_json      | String?   | Array JSON de opções            |
| criado_em        | DateTime  | Data de criação                 |

**Tipos de pergunta:**
- `TEXTO`: Resposta em texto livre
- `UNICA`: Escolha única (radio button)
- `MULTIPLA`: Múltipla escolha (checkbox)
- `ESCALA`: Escala numérica (1-5)
- `BOOLEAN`: Sim/Não

**Índices:** questionario_id

#### `respostas`
Respostas dos alunos.

| Campo            | Tipo      | Descrição                       |
|------------------|-----------|---------------------------------|
| id               | UUID      | Chave primária                  |
| questionario_id  | UUID      | FK → questionarios              |
| pergunta_id      | UUID      | FK → perguntas                  |
| aluno_id         | UUID      | FK → users (aluno)              |
| turma_id         | UUID      | FK → turmas                     |
| valor_texto      | String?   | Para tipo TEXTO                 |
| valor_num        | Int?      | Para tipo ESCALA                |
| valor_bool       | Boolean?  | Para tipo BOOLEAN               |
| valor_opcao      | String?   | Para tipo UNICA/MULTIPLA        |
| criado_em        | DateTime  | Data da resposta                |

**Índices:** questionario_id, pergunta_id, aluno_id, turma_id

## 🔐 Autenticação e Autorização

### JWT (JSON Web Token)
- Token gerado no login
- Validade: 7 dias (configurável)
- Payload: `{ id, email, role }`
- Secret: Armazenado em variável de ambiente

### Roles (RBAC)

| Role    | Permissões                                              |
|---------|---------------------------------------------------------|
| ADMIN   | Todas (CRUD usuários, turmas, questionários globais)    |
| PROF    | CRUD questionários de suas turmas, ver relatórios       |
| ALUNO   | Ver questionários ativos, responder questionários       |

### Fluxo de Autenticação

```
1. Login (POST /auth/login)
   ├─ Valida email + senha
   ├─ Gera JWT
   └─ Retorna { token, user }

2. Requisições protegidas
   ├─ Header: Authorization: Bearer <token>
   ├─ Middleware valida token
   ├─ Middleware verifica role
   └─ Executa ação se autorizado
```

## 📊 API Endpoints

### Autenticação
```
POST   /auth/login          Login de usuários
```

### Admin
```
GET    /admin/professores   Listar professores
POST   /admin/professores   Criar professor
GET    /admin/alunos        Listar alunos
POST   /admin/alunos        Criar aluno
POST   /admin/alunos/import Importar alunos via CSV
GET    /admin/turmas        Listar turmas
POST   /admin/turmas        Criar turma
POST   /admin/vincular-aluno Vincular aluno a turma
DELETE /admin/vincular-aluno/:id Desvincular
```

### Professor
```
GET    /prof/minhas-turmas  Listar turmas do professor
GET    /prof/questionarios  Listar questionários
POST   /prof/questionarios  Criar questionário
PUT    /prof/questionarios/:id Editar questionário
DELETE /prof/questionarios/:id Deletar questionário
POST   /prof/perguntas      Adicionar pergunta
PUT    /prof/perguntas/:id  Editar pergunta
DELETE /prof/perguntas/:id  Deletar pergunta
GET    /prof/relatorios/:id Relatório agregado
GET    /prof/export/:id     Exportar XLSX/CSV
```

### Aluno
```
GET    /aluno/minhas-turmas          Listar turmas do aluno
GET    /aluno/questionarios-ativos   Questionários disponíveis
GET    /aluno/questionarios/:id      Detalhes do questionário
POST   /aluno/respostas              Enviar respostas
```

## 🎨 Frontend - Web Admin

### Stack
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Chart.js** - Gráficos
- **ExcelJS** - Exportação

### Estrutura de Pastas
```
web-admin/
├─ src/
│  ├─ components/      # Componentes reutilizáveis
│  ├─ layouts/         # Layouts de página
│  ├─ pages/           # Páginas/Rotas
│  ├─ services/        # API calls
│  ├─ stores/          # Zustand stores
│  ├─ lib/             # Configurações (axios, etc)
│  └─ App.tsx          # Componente raiz
```

## 📱 Frontend - Mobile App

### Stack
- **React Native** - Framework mobile
- **Expo** - Tooling e build
- **React Navigation** - Navegação
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Expo Speech** - Text-to-speech
- **Expo SecureStore** - Armazenamento seguro

### Acessibilidade
- Fontes grandes (≥ 20px)
- Alto contraste
- Botões grandes (mínimo 60x60px)
- Espaçamento generoso
- Leitura em voz (TTS)
- Uma pergunta por vez
- Feedback visual e tátil

### Estrutura de Pastas
```
mobile/
├─ src/
│  ├─ screens/         # Telas da app
│  ├─ services/        # API calls
│  ├─ stores/          # Zustand stores
│  ├─ config/          # Configurações
│  └─ components/      # Componentes reutilizáveis
└─ App.tsx             # Componente raiz
```

## 🔄 Fluxos de Uso

### Fluxo do Admin
```
1. Login
2. Dashboard (visão geral)
3. Criar professores
4. Criar alunos (ou importar CSV)
5. Criar turmas e vincular professores
6. Vincular alunos às turmas
7. Criar questionários globais (opcional)
8. Visualizar relatórios gerais
```

### Fluxo do Professor
```
1. Login
2. Dashboard (suas turmas)
3. Criar questionário para uma turma
4. Adicionar perguntas
5. Ativar questionário
6. Aguardar respostas
7. Visualizar relatório com gráficos
8. Exportar dados (XLSX/CSV)
```

### Fluxo do Aluno
```
1. Login no app mobile
2. Ver questionários pendentes
3. Selecionar questionário
4. Responder perguntas (uma por vez)
   - Pode usar leitura em voz
   - Navega com botões grandes
5. Enviar respostas
6. Receber confirmação
```

## ⚡ Performance

### Backend
- Índices no banco para queries frequentes
- Paginação nas listagens
- Cache de queries (TanStack Query no frontend)

### Frontend Web
- Code splitting (Vite)
- Lazy loading de componentes
- Debounce em pesquisas

### Mobile
- AsyncStorage para cache offline
- Imagens otimizadas
- Bundle size < 50MB

## 🔒 Segurança

### Backend
- Senhas hasheadas (bcrypt)
- JWT com expiração
- Helmet para headers HTTP seguros
- Rate limiting
- CORS configurado
- SQL Injection prevenido (Prisma)
- XSS prevenido (sanitização)

### Mobile
- Token armazenado em SecureStore
- HTTPS obrigatório
- Validação de entrada

### Banco de Dados
- Backup diário (automático no RDS)
- Usuário com privilégios mínimos
- SSL/TLS na conexão

## 📈 Escalabilidade

### Para crescimento futuro:
- **Load Balancer:** Adicionar EC2 + ALB
- **Cache:** Redis para sessões
- **CDN:** CloudFront para assets
- **Database:** RDS Multi-AZ
- **Filas:** SQS para processamento assíncrono
- **Logs:** CloudWatch ou ELK Stack

---

Desenvolvido com ❤️ para a Instituição Vida Mais

