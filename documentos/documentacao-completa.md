# Documentação Completa — Vida Mais APP

Plataforma digital de pesquisas de satisfação voltada a usuários idosos da FATEC, substituindo formulários físicos por um sistema acessível e digital.

---

## Sumário

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Stack de Tecnologias](#stack-de-tecnologias)
3. [AWS — Serviços Utilizados](#aws--serviços-utilizados)
4. [Banco de Dados — Modelos Prisma](#banco-de-dados--modelos-prisma)
5. [API REST — Todas as Rotas](#api-rest--todas-as-rotas)
6. [Serviço de ML](#serviço-de-ml)
7. [Aplicativo Mobile](#aplicativo-mobile)
8. [Web Admin](#web-admin)
9. [Infraestrutura e Deploy](#infraestrutura-e-deploy)
10. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Visão Geral do Sistema

```
Usuário Mobile / Web Admin
        │
        ▼
   Nginx (porta 80)
        │  /api/*
        ▼
  Backend Node.js (porta 3000)
        │                    │
        ▼                    ▼
   MySQL via Prisma    ML Service Flask (porta 5000)
                            │
                            ▼
                    MySQL (consulta direta)

  Backend ──────────────────────────────► AWS Rekognition (sa-east-1)
```

**Monorepo:**

| Módulo       | Tecnologia                  | Porta |
|--------------|-----------------------------|-------|
| `backend/`   | Node.js + Express + Prisma  | 3000  |
| `web-admin/` | React + Vite + TailwindCSS  | 5173 (dev) / 80 (prod) |
| `mobile/`    | React Native + Expo         | —     |
| `ml-service/`| Python + Flask + scikit-learn | 5000 |

---

## Stack de Tecnologias

### Backend (`backend/`)
| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 20 | Runtime |
| TypeScript | 5.3.3 | Tipagem estática |
| Express | 4.18.2 | Framework HTTP |
| Prisma | 5.20.0 | ORM — MySQL |
| JWT (jsonwebtoken) | 9.0.2 | Autenticação |
| bcrypt | 5.1.1 | Hash de senhas |
| Zod | 3.22.4 | Validação de schemas |
| ExcelJS | 4.4.0 | Exportação de relatórios .xlsx |
| fast-csv | 5.0.1 | Importação de alunos via CSV |
| Helmet | 7.1.0 | Cabeçalhos de segurança HTTP |
| @aws-sdk/client-rekognition | 3.1025.0 | Reconhecimento facial AWS |
| axios | 1.6.7 | HTTP client (proxy para ML) |

### Web Admin (`web-admin/`)
| Tecnologia | Versão | Função |
|---|---|---|
| React | 18.2.0 | UI |
| Vite | 6.4.1 | Build e dev server |
| TypeScript | 5.2.2 | Tipagem estática |
| TailwindCSS | 3.x | Estilização |
| TanStack Query | 5.x | Cache e fetch de dados do servidor |
| Zustand | 5.x | Estado global (auth) |
| Chart.js + react-chartjs-2 | — | Gráficos de relatórios |
| React Router DOM | 6.x | Navegação |
| axios | — | HTTP client |

### Mobile (`mobile/`)
| Tecnologia | Versão | Função |
|---|---|---|
| React Native + Expo | SDK 54 | Framework mobile |
| TypeScript | 5.x | Tipagem estática |
| TanStack Query | 5.x | Cache e fetch de dados |
| Zustand | 5.x | Estado global (auth) |
| expo-secure-store | — | Armazenamento seguro de token JWT |
| expo-camera | — | Captura de foto para reconhecimento facial |
| expo-image-manipulator | — | Redimensionamento de imagem (640px, JPEG 80%) |
| expo-speech | — | Text-to-speech para acessibilidade |
| AsyncStorage | — | Persistência da preferência de tamanho de fonte |
| axios | — | HTTP client |

### ML Service (`ml-service/`)
| Tecnologia | Versão | Função |
|---|---|---|
| Python | 3.11 | Runtime |
| Flask | 3.0.0 | Framework HTTP |
| scikit-learn | 1.3.2 | Modelos de ML |
| pandas | 2.1.4 | Manipulação de dados |
| numpy | 1.26.2 | Computação numérica |
| PyMySQL | — | Conexão direta com MySQL |

---

## AWS — Serviços Utilizados

### Amazon Rekognition

**Único serviço AWS utilizado atualmente.** Responsável por todo o fluxo de autenticação facial.

| Parâmetro | Valor |
|---|---|
| Região | `sa-east-1` (São Paulo) |
| Collection ID | `vida-mais-faces` |
| Similaridade mínima | **95%** |
| SDK | `@aws-sdk/client-rekognition` v3 |

**Operações utilizadas:**

| Comando AWS | Função no sistema | Rota que dispara |
|---|---|---|
| `IndexFacesCommand` | Cadastra/atualiza o rosto do aluno na collection | `POST /face/registrar` |
| `SearchFacesByImageCommand` | Busca correspondência facial para login | `POST /face/login` |
| `DeleteFacesCommand` | Remove o rosto da collection | `DELETE /face/registrar` e ao re-registrar |

**Fluxo de registro facial:**
1. Mobile captura foto → redimensiona para 640px de largura → codifica em base64 puro (sem prefixo `data:image/...`)
2. Backend recebe o base64 → chama `IndexFacesCommand` com `ExternalImageId = UUID do usuário Prisma`
3. Rekognition retorna um `FaceId` → salvo em `users.face_id` no banco
4. Flag `users.face_registrada = true`

**Fluxo de login facial:**
1. Mobile envia foto em base64 → `POST /face/login`
2. Backend chama `SearchFacesByImageCommand` com threshold de 95%
3. Se encontrado, recupera o `ExternalImageId` (UUID do usuário) → gera JWT
4. Restrito a usuários com role `ALUNO`

**Credenciais necessárias (variáveis de ambiente):**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION=sa-east-1
AWS_REKOGNITION_COLLECTION_ID=vida-mais-faces
```

> **Infraestrutura de hospedagem:** O backend está hospedado em uma instância EC2 na AWS (`54.233.110.183`). O banco MySQL pode estar em RDS ou na mesma instância via Docker. Não há código de infraestrutura IaC neste repositório.

---

## Banco de Dados — Modelos Prisma

Banco: **MySQL**. Schema em `backend/prisma/schema.prisma`.

### Enums

| Enum | Valores |
|---|---|
| `Role` | `ADMIN`, `PROF`, `ALUNO` |
| `Visibilidade` | `GLOBAL`, `TURMA` |
| `TipoPergunta` | `TEXTO`, `MULTIPLA`, `UNICA`, `ESCALA`, `BOOLEAN` |

### Modelo: `User` → tabela `users`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador único |
| `nome` | String | Nome completo |
| `email` | String unique | Email (login) |
| `telefone` | String? unique | Telefone (login alternativo) |
| `senhaHash` | String | Senha com bcrypt (10 rounds) |
| `role` | Role | `ADMIN`, `PROF` ou `ALUNO` |
| `idade` | Int? | Idade (obrigatória para associados, mín. 60) |
| `deficiencia` | String? | Descrição de deficiência (auditiva, visual, etc.) |
| `ativo` | Boolean | Conta ativa/inativa |
| `faceId` | String? unique | FaceId retornado pelo Rekognition |
| `faceRegistrada` | Boolean | Flag de rosto cadastrado |
| `criadoEm` | DateTime | Timestamp de criação |

### Modelo: `Turma` → tabela `turmas`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | — |
| `nome` | String | Nome da turma |
| `ano` | Int | Ano letivo |
| `professorId` | FK → User | Professor responsável |
| `ativo` | Boolean | Turma ativa |

### Modelo: `AlunoTurma` → tabela `alunos_turmas`

Relacionamento M:N entre `User (ALUNO)` e `Turma`. Chave única composta `(alunoId, turmaId)`. Cascade delete em ambos os lados.

### Modelo: `Questionario` → tabela `questionarios`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | — |
| `titulo` | String | Título do questionário |
| `descricao` | String? | Descrição opcional |
| `criadoPor` | FK → User | Quem criou |
| `visibilidade` | Visibilidade | `GLOBAL` (todos os alunos) ou `TURMA` (apenas turma vinculada) |
| `turmaId` | FK → Turma? | Obrigatório se `TURMA` |
| `ativo` | Boolean | Visível para alunos |
| `padrao` | Boolean | Questionário padrão anual |
| `ano` | Int? | Ano (para questionários padrão) |
| `periodoInicio` | DateTime? | Início do período de resposta |
| `periodoFim` | DateTime? | Fim do período de resposta |

### Modelo: `Pergunta` → tabela `perguntas`

| Campo | Tipo | Descrição |
|---|---|---|
| `questionarioId` | FK → Questionario | — |
| `ordem` | Int | Ordem de exibição |
| `tipo` | TipoPergunta | Tipo da pergunta |
| `enunciado` | String | Texto da pergunta |
| `obrigatoria` | Boolean | Se exige resposta |
| `opcoesJson` | String? | JSON array de strings (para MULTIPLA/UNICA) |

### Modelo: `Resposta` → tabela `respostas`

Armazena respostas polimórficas — apenas um dos campos de valor é preenchido conforme o tipo da pergunta:

| Campo valor | Tipo da pergunta |
|---|---|
| `valorTexto` | `TEXTO` |
| `valorNum` | `ESCALA` |
| `valorBool` | `BOOLEAN` |
| `valorOpcao` | `MULTIPLA` / `UNICA` |

### Modelo: `Convite` → tabela `convites`

QR codes de convite para turmas. Campos: `codigoQr` (unique), `turmaId`, `expiraEm`.

---

## API REST — Todas as Rotas

Base URL (produção): `http://54.233.110.183/api`

Autenticação: `Authorization: Bearer <token>` em todas as rotas protegidas.

### Autenticação — `/auth`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | Público | Login com email/telefone + senha. Retorna JWT + dados do usuário. |
| `POST` | `/auth/cadastro` | Público | Auto-cadastro de associado (cria com role `ALUNO`). Campos: `nome`, `idade` (mín. 60), `email`, `telefone`, `senha`, `deficiencia?`. |

### Reconhecimento Facial — `/face`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/face/login` | Público | Login por rosto. Body: `{ imagemBase64: string }` (base64 puro, sem prefixo). Somente para `ALUNO`. Retorna JWT + `similaridade`. |
| `GET` | `/face/status` | Qualquer role | Verifica se o usuário autenticado tem rosto cadastrado. Retorna `{ faceRegistrada: boolean }`. |
| `POST` | `/face/registrar` | `ALUNO` | Cadastra ou atualiza o rosto. Remove o FaceId antigo do Rekognition antes de indexar o novo. Body: `{ imagemBase64: string }`. |
| `DELETE` | `/face/registrar` | `ALUNO` | Remove o rosto da collection Rekognition e limpa `faceId`/`faceRegistrada` no banco. |

### Administração — `/admin` _(requer role `ADMIN`)_

**Professores:**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/admin/professores` | Lista todos os professores com contagem de turmas. |
| `POST` | `/admin/professores` | Cria professor. Body: `{ nome, email, senha }`. |
| `PUT` | `/admin/professores/:id` | Atualiza nome, email e/ou senha do professor. |
| `DELETE` | `/admin/professores/:id` | Remove professor. |

**Alunos:**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/admin/alunos` | Lista todos os alunos com turmas vinculadas. |
| `POST` | `/admin/alunos` | Cria aluno. Body: `{ nome, email, senha }`. |
| `PUT` | `/admin/alunos/:id` | Atualiza dados do aluno (nome, email, senha, telefone, idade, deficiencia). |
| `DELETE` | `/admin/alunos/:id` | Remove aluno (cascade nas respostas e vínculos). |
| `POST` | `/admin/alunos/import` | Importa alunos via CSV. Body: `{ csv: string }`. Formato: `nome,email,senha`. |

**Turmas:**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/admin/turmas` | Lista todas as turmas com professor e contagem de alunos. |
| `GET` | `/admin/turmas/:id` | Busca turma específica com lista de alunos. |
| `POST` | `/admin/turmas` | Cria turma. Body: `{ nome, ano, professorId }`. |
| `PUT` | `/admin/turmas/:id` | Atualiza nome, ano e/ou professorId. |
| `DELETE` | `/admin/turmas/:id` | Remove turma (cascade). |

**Vínculos Aluno-Turma:**

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/admin/vincular-aluno` | Vincula aluno à turma. Body: `{ alunoId, turmaId }`. |
| `DELETE` | `/admin/vincular-aluno/:id` | Remove vínculo pelo ID do registro `AlunoTurma`. |

### Professor — `/prof` _(requer role `PROF` ou `ADMIN`)_

**Turmas:**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/prof/minhas-turmas` | Lista turmas do professor autenticado com contagem de alunos e questionários. |
| `GET` | `/prof/turmas/:id/alunos` | Lista alunos de uma turma (apenas turmas do professor). |

**Questionários:**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/prof/questionarios` | Lista questionários criados pelo professor autenticado. |
| `GET` | `/prof/questionarios/:id` | Busca questionário com perguntas ordenadas. |
| `POST` | `/prof/questionarios` | Cria questionário. Body: `{ titulo, descricao?, visibilidade, turmaId?, periodoInicio?, periodoFim? }`. |
| `PUT` | `/prof/questionarios/:id` | Atualiza questionário. |
| `DELETE` | `/prof/questionarios/:id` | Remove questionário (cascade nas perguntas e respostas). |

**Questionários Padrão (anuais):**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/prof/questionarios-padrao` | Lista questionários padrão ordenados por ano. |
| `POST` | `/prof/questionarios-padrao` | Cria questionário padrão para um ano. Body: `{ ano, periodoInicio?, periodoFim? }`. |
| `POST` | `/prof/questionarios-padrao/:id/duplicar` | Duplica questionário padrão (com todas as perguntas) para outro ano. Body: `{ ano }`. |

**Perguntas:**

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/prof/perguntas` | Adiciona pergunta a um questionário. Body: `{ questionarioId, ordem, tipo, enunciado, obrigatoria, opcoes? }`. |
| `PUT` | `/prof/perguntas/:id` | Atualiza pergunta. |
| `DELETE` | `/prof/perguntas/:id` | Remove pergunta. |

**Relatórios:**

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/prof/relatorios/:questionarioId` | Relatório agregado por pergunta. TEXTO → respostas anônimas; ESCALA → média/min/max; BOOLEAN → contagem sim/não; MULTIPLA/UNICA → distribuição por opção. |

### Aluno — `/aluno` _(requer role `ALUNO`)_

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/aluno/questionarios-ativos` | Lista questionários disponíveis (GLOBAL + turmas do aluno), com flag `respondido`. Query param: `turmaId?`. Valida período de vigência. |
| `GET` | `/aluno/questionarios/:id` | Busca questionário completo com perguntas (verifica permissão de turma e período). |
| `POST` | `/aluno/respostas` | Envia respostas. Body: `{ questionarioId, turmaId?, respostas: [...] }`. Bloqueia reenvio (409 se já respondeu). Valida perguntas obrigatórias. |
| `GET` | `/aluno/minhas-turmas` | Lista turmas em que o aluno está matriculado. |

### Machine Learning — `/ml` _(requer autenticação; ADMIN ou PROF, exceto `/ml/health`)_

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/ml/health` | Health check do serviço ML. Público (sem autorização de role). |
| `GET` | `/ml/analytics/overview` | Visão geral das analytics de toda a plataforma. |
| `GET` | `/ml/analytics/turma/:id` | Analytics de uma turma específica. |
| `GET` | `/ml/analytics/aluno/:id` | Analytics de um aluno específico. |
| `POST` | `/ml/predict/evasao` | Predição de risco de evasão por turma. Body: `{ turmaId }`. |
| `POST` | `/ml/predict/desempenho` | Predição de desempenho de aluno. Body: `{ alunoId }`. |
| `GET` | `/ml/patterns/engagement` | Padrões de engajamento. Query param: `turmaId?`. |
| `GET` | `/ml/patterns/responses` | Padrões de respostas de um questionário. Query param: `questionarioId` (obrigatório). |
| `POST` | `/ml/train` | Retreina todos os modelos ML. |
| `GET` | `/ml/models/status` | Status dos modelos treinados. |

> Todas as rotas `/ml/*` são proxies para o serviço Flask em `ML_SERVICE_URL` (padrão: `http://localhost:5000`). O backend repassa os erros HTTP do ML diretamente ao cliente.

---

## Serviço de ML

**URL interna (Docker):** `http://ml-service:5000`

O ML Service conecta diretamente ao MySQL (não usa a API do backend). Modelos treinados com scikit-learn:

| Modelo | Algoritmo | Predição |
|---|---|---|
| Evasão (dropout) | Random Forest | Risco de abandono por turma |
| Desempenho | Gradient Boosting | Tendência de performance por aluno |

Análises adicionais: engajamento por turma, padrões de resposta por questionário.

---

## Aplicativo Mobile

**Telas por papel:**

| Papel | Tela | Função |
|---|---|---|
| Público | `LoginScreen` | Login email/telefone + senha |
| Público | `CadastroScreen` | Auto-cadastro de associado |
| Público | `FaceLoginScreen` | Login facial (apenas ALUNO) |
| Todos (auth) | `CadastrarRostoScreen` | Cadastro/atualização do rosto facial |
| ALUNO | `HomeScreen` | Lista questionários disponíveis |
| ALUNO | `QuestionarioScreen` | Responder questionário |
| ALUNO | `RevisarRespostasScreen` | Revisão antes de enviar |
| ALUNO | `SuccessScreen` | Confirmação de envio |
| ADMIN | `ProfessoresScreen` | Gestão de professores |
| ADMIN | `AlunosScreen` | Gestão de alunos |
| ADMIN | `TurmasScreen` | Gestão de turmas |
| ADMIN | `EditarTurmaScreen` | Edição de turma |
| ADMIN | `EditarProfessorScreen` | Edição de professor |
| ADMIN | `EditarAlunoScreen` | Edição de aluno |
| PROF | `MeusQuestionariosScreen` | Lista de questionários do professor |
| PROF | `CriarQuestionarioScreen` | Criação de questionário |
| PROF | `RelatorioScreen` | Visualização de relatório |
| PROF | `MinhasTurmasScreen` | Turmas do professor |
| PROF | `MLInsightsScreen` | Insights de ML por turma/aluno |

**Acessibilidade (obrigatório):**
- `maxFontSizeMultiplier: 1.3` em todos os `Text` e `TextInput` (configurado globalmente em `App.tsx`)
- Touch targets mínimos: 60×60px
- Fonte mínima: 18px (`xs`), padrão 24px (`md`)
- TTS via `expo-speech`
- 4 níveis de tamanho de fonte: `pequeno / normal / grande / muito-grande` (persistido em AsyncStorage)

**Configuração de API:** `src/config/api.ts` → `API_URL = 'http://54.233.110.183/api'`. Para desenvolvimento local, alterar para o IP LAN da máquina (ex.: `http://192.168.x.x/api`). `localhost` não funciona em dispositivo físico ou emulador.

---

## Web Admin

Dashboard para ADMIN e PROF. Consome a mesma API REST.

- **Roteamento:** React Router DOM com guardas de role
- **Gráficos:** Chart.js (relatórios de questionários)
- **Export:** Dispara download de `.xlsx` via backend (`ExcelJS`)
- **Build:** Vite injeta `VITE_API_URL` em tempo de build

---

## Infraestrutura e Deploy

### Docker Compose (4 serviços)

| Serviço | Imagem/Build | Porta |
|---|---|---|
| `db` | mysql:8.0 | 3306 |
| `ml-service` | `./ml-service` | 5000 |
| `backend` | `./backend` (multi-stage) | 3000 |
| `web-admin` | `./web-admin` (Nginx) | 80 |

**Build multi-stage do backend:** `dependencies` → `build` (tsc) → `runtime` (apenas dist/ + node_modules prod).

**Migrations:** O backend executa `prisma db push` na inicialização do container (aceita perda de dados em dev).

**Proxy Nginx (web-admin):** Requisições `/api/*` são proxiadas para `backend:3000` na rede interna Docker.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | `mysql://user:pass@host:3306/vida_mais` |
| `JWT_SECRET` | Sim | Chave secreta JWT (tokens expiram em 7 dias) |
| `ML_SERVICE_URL` | Não | URL do serviço ML (padrão: `http://localhost:5000`) |
| `PORT` | Não | Porta do servidor (padrão: 3000) |
| `ALLOWED_ORIGINS` | Não | Origins permitidas pelo CORS |
| `AWS_ACCESS_KEY_ID` | Sim | Credencial AWS |
| `AWS_SECRET_ACCESS_KEY` | Sim | Credencial AWS |
| `AWS_REGION` | Não | Região AWS (padrão: `sa-east-1`) |
| `AWS_REKOGNITION_COLLECTION_ID` | Não | Nome da collection (padrão: `vida-mais-faces`) |

### Web Admin (`web-admin/.env`)

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API, injetada no build pelo Vite |

### Docker Compose (padrões dev)

```
DATABASE_URL=mysql://vidamais:vidamais2025@db:3306/vida_mais
```

> Trocar credenciais em produção.
