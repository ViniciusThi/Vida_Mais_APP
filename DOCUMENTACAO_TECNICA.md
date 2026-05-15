# Documentação Técnica — Vida Mais APP

> Plataforma digital de questionários de satisfação para idosos — FATEC

---

## 1. Visão Geral

O **Vida Mais APP** substitui formulários de papel por uma plataforma digital acessível voltada a usuários idosos. O sistema coleta respostas de satisfação via mobile, consolida dados no painel web administrativo e aplica modelos de Machine Learning para análise preditiva de engajamento e evasão.

**Contexto:** FATEC (Faculdade de Tecnologia) — projeto de inclusão digital com foco em acessibilidade.

---

## 2. Tecnologias Utilizadas

### 2.1 Backend — `backend/`
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 20+ | Runtime JavaScript server-side |
| TypeScript | 5.x | Tipagem estática |
| Express | 4.x | Framework HTTP REST API |
| Prisma ORM | 5.x | Acesso ao banco de dados (MySQL) |
| JWT (jsonwebtoken) | — | Autenticação stateless |
| bcrypt | — | Hash de senhas |
| Helmet | — | Headers de segurança HTTP |
| express-rate-limit | — | Rate limiting por IP |
| CORS | — | Controle de origens permitidas |
| ExcelJS | — | Exportação de relatórios Excel/CSV |
| Jest + ts-jest | — | Testes unitários e de integração |
| tsx | — | Hot reload em desenvolvimento |

### 2.2 Web Admin — `web-admin/`
| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.x | Framework UI |
| Vite | 5.x | Bundler e dev server (porta 5173) |
| TypeScript | 5.x | Tipagem estática |
| TanStack Query | 5.x | Cache e sincronização de estado servidor |
| TanStack Table | 8.x | Tabelas de dados avançadas |
| Zustand | 4.x | Gerenciamento de estado global |
| React Hook Form | 7.x | Formulários performáticos |
| Chart.js | 4.x | Gráficos e dashboards analíticos |
| Tailwind CSS | 3.x | Estilização utilitária |
| Vitest + jsdom | — | Testes unitários de componentes |

### 2.3 Mobile — `mobile/`
| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.81.5 | Framework mobile cross-platform |
| React | 19.x | Framework UI |
| Expo | SDK 53 | Ecossistema de build e APIs nativas |
| Expo Camera | — | Captura de imagem para reconhecimento facial |
| Expo Speech | — | Text-to-Speech (acessibilidade) |
| Expo SecureStore | — | Armazenamento seguro de tokens |
| Expo FileSystem | — | Acesso ao sistema de arquivos |
| Expo Sharing | — | Compartilhamento de arquivos |
| TanStack Query | 5.x | Cache e requisições ao backend |
| Zustand | 4.x | Estado global local |
| Jest + jest-expo | — | Testes unitários mobile |

### 2.4 ML Service — `ml-service/`
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Python | 3.11+ | Runtime |
| Flask | 3.x | API REST leve |
| scikit-learn | 1.x | Modelos de ML |
| pandas | 2.x | Processamento de dados tabulares |
| NumPy | 1.x | Operações numéricas |
| mysql-connector-python | — | Conexão direta ao MySQL |
| pytest | — | Testes unitários Python |

### 2.5 Infraestrutura
| Tecnologia | Finalidade |
|---|---|
| Docker + Docker Compose | Orquestração de todos os serviços |
| MySQL 8.0 | Banco de dados relacional principal |
| Nginx | Reverse proxy, SSL/TLS termination |
| Let's Encrypt | Certificados TLS gratuitos |
| AWS Rekognition | Reconhecimento facial para autenticação biométrica |
| AWS (EC2/VPS) | Hospedagem dos containers em produção |

---

## 3. Estrutura do Banco de Dados

**SGBD:** MySQL 8.0 — **ORM:** Prisma — **Database:** `vida_mais`

### 3.1 Enumerações (Enums)

```
Role          → ADMIN | PROF | ALUNO
Visibilidade  → GLOBAL | TURMA
TipoPergunta  → TEXTO | MULTIPLA | UNICA | ESCALA | BOOLEAN
```

### 3.2 Modelos (Tabelas)

#### `users`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| nome | String | Nome completo |
| email | String (UNIQUE) | E-mail de acesso |
| telefone | String? (UNIQUE) | Telefone (opcional) |
| senha_hash | String | Senha hasheada com bcrypt |
| role | Role | Perfil de acesso (ADMIN/PROF/ALUNO) |
| idade | Int? | Idade (relevante para acessibilidade) |
| deficiencia | String? | Descrição de deficiência (auditiva, visual...) |
| ativo | Boolean | Conta ativa/inativa |
| face_id | String? (UNIQUE) | ID da face no AWS Rekognition |
| face_registrada | Boolean | Biometria cadastrada |
| criado_em | DateTime | Timestamp de criação |
| atualizado_em | DateTime | Timestamp de atualização |

#### `turmas` (Grupos)
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| nome | String | Nome do grupo |
| ano | Int | Ano letivo |
| professor_id | UUID (FK → users) | Coordenador responsável |
| ativo | Boolean | Status ativo |

#### `alunos_turmas`
Tabela M2M (many-to-many) ligando participantes a grupos.
- `aluno_id` FK → users (CASCADE DELETE)
- `turma_id` FK → turmas (CASCADE DELETE)
- Unique constraint em (aluno_id, turma_id)

#### `questionarios`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| titulo | String | Título do questionário |
| descricao | String? | Descrição opcional |
| criado_por | UUID (FK → users) | Autor |
| visibilidade | Visibilidade | GLOBAL ou restrito a uma turma |
| turma_id | UUID? (FK → turmas) | Turma associada (quando TURMA) |
| ativo | Boolean | Publicado/ativo |
| padrao | Boolean | Template padrão anual reutilizável |
| ano | Int? | Ano do questionário padrão |
| periodo_inicio | DateTime? | Início do período de resposta |
| periodo_fim | DateTime? | Fim do período de resposta |

#### `perguntas`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| questionario_id | UUID (FK) | Questionário pai (CASCADE DELETE) |
| ordem | Int | Posição na sequência |
| tipo | TipoPergunta | Tipo da resposta esperada |
| enunciado | String | Texto da pergunta |
| obrigatoria | Boolean | Resposta obrigatória |
| opcoes_json | String? | JSON array de opções (para MULTIPLA/UNICA) |

#### `respostas`
Armazena cada resposta individualmente com campo polimórfico por tipo:
- `valor_texto` — para perguntas TEXTO
- `valor_num` — para perguntas ESCALA
- `valor_bool` — para perguntas BOOLEAN
- `valor_opcao` — para perguntas MULTIPLA/UNICA

Relacionamentos: questionario_id, pergunta_id, aluno_id, turma_id (todos com CASCADE DELETE).

#### `convites` (QR Code)
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| codigo_qr | String (UNIQUE) | Token único do QR Code |
| turma_id | UUID (FK → turmas) | Turma de destino |
| expira_em | DateTime | Validade do convite |

### 3.3 Diagrama de Relacionamentos (simplificado)

```
User (PROF) ──────────────────────── Turma (1:N via professor_id)
User (ALUNO) ────────────────────── AlunoTurma (M:N) ─── Turma
User ──────────────────────────────── Questionario (1:N via criado_por)
Turma ─────────────────────────────── Questionario (1:N)
Questionario ──────────────────────── Pergunta (1:N)
Questionario + Pergunta + User ──── Resposta (N:N:N)
Turma ─────────────────────────────── Convite (1:N)
```

---

## 4. Arquitetura de Serviços

```
Internet
    │
    ▼
Nginx (porta 80/443) — TLS 1.2+ + Let's Encrypt
    │
    ├── /* ────────── Web Admin (React SPA, build estático)
    │
    └── /api/* ────── Backend (Node.js Express, porta 3000)
                           │
                           ├── MySQL 8.0 (Prisma ORM)
                           │
                           ├── ML Service (Flask, porta 5000)
                           │       └── MySQL (leitura direta para analytics)
                           │
                           └── AWS Rekognition (API externa)

Mobile App (Expo)
    └── HTTPS → Nginx → Backend (mesma rota /api/*)
```

### Rotas Backend
| Arquivo | Prefixo | Role requerida |
|---|---|---|
| `auth.routes.ts` | `/api/auth` | Pública |
| `admin.routes.ts` | `/api/admin` | ADMIN |
| `prof.routes.ts` | `/api/prof` | PROF |
| `aluno.routes.ts` | `/api/aluno` | ALUNO |
| `ml.routes.ts` | `/api/ml` | PROF / ADMIN |
| `face.routes.ts` | `/api/face` | Autenticado |

---

## 5. Segurança do Sistema

### 5.1 Autenticação e Autorização
- **JWT (JSON Web Token)** com expiração de 7 dias — renovação automática via refresh
- **RBAC (Role-Based Access Control)** com 3 níveis: ADMIN > PROF > ALUNO
- **bcrypt** para hash de senhas (salt rounds configurável)
- **Biometria facial** via AWS Rekognition — coleta de imagem pelo mobile, comparação na nuvem (coleção `vida-mais-faces`, região `sa-east-1`)

### 5.2 Hardening da API
- **Helmet.js** — define headers de segurança HTTP (CSP, HSTS, X-Frame-Options, etc.)
- **express-rate-limit** — proteção contra brute force e DDoS por IP
- **CORS restrito** — apenas origens `vidamais-app.com` aceitas em produção
- **HTTPS obrigatório** — Nginx força redirect HTTP → HTTPS
- **TLS 1.2+** — protocolos legados desabilitados no Nginx

### 5.3 Banco de Dados
- Credenciais em variáveis de ambiente (`.env`) — nunca hardcoded em código
- Usuário MySQL com privilégios mínimos (`vidamais`) — sem acesso root
- Volumes Docker para persistência isolada (`db_data`)
- Cascades controlados via Prisma — deleção em cascata auditada

### 5.4 Mobile
- **Expo SecureStore** — tokens JWT armazenados em keychain seguro do SO (não em AsyncStorage)
- **TLS pinning** — comunicação apenas via HTTPS com certificado válido
- Câmera usada somente no fluxo de cadastro/autenticação biométrica (permissão explícita)

### 5.5 AWS
- Credenciais via variáveis de ambiente no container — nunca commitadas
- IAM com permissões mínimas: apenas `rekognition:IndexFaces`, `rekognition:SearchFacesByImage`, `rekognition:DeleteFaces`
- Região: `sa-east-1` (São Paulo) — dados dos usuários permanecem no Brasil (LGPD)

### 5.6 Conformidade LGPD
- Dados biométricos (face_id) armazenados somente com consentimento explícito
- Campo `deficiencia` sensível tratado com acesso restrito a ADMIN
- Usuários podem ser desativados (`ativo: false`) preservando histórico de respostas

---

## 6. ML Service — Modelos Analíticos

| Modelo | Algoritmo | Finalidade |
|---|---|---|
| Risco de evasão | Random Forest | Predição de dropout por turma |
| Tendência de desempenho | Gradient Boosting | Evolução de notas/engajamento por participante |
| Padrão de respostas | Análise estatística | Detecção de anomalias e padrões de engajamento |

O ML Service conecta-se **diretamente ao MySQL** para leituras analíticas pesadas, sem passar pelo backend, evitando overhead na API principal.

---

## 7. Acessibilidade (Foco no Público Idoso)

- **TTS integrado** — Expo Speech lê perguntas em voz alta ao toque
- **Touch targets mínimos de 60×60px** — área de toque ampliada para motricidade reduzida
- **Fonte mínima de 20px** — legibilidade para baixa visão
- **Fluxo simplificado** — número mínimo de passos para responder um questionário
- **QR Code de ingresso** — elimina necessidade de digitar código de turma
- **Autenticação biométrica** — alternativa à senha para usuários com dificuldade de digitação

---

## 8. Custos AWS

### Serviço Utilizado
- **AWS Rekognition** — Reconhecimento facial (coleção `vida-mais-faces`, região São Paulo)
- **Hospedagem** — EC2 ou VPS com containers Docker

### Histórico de Custos (Maio 2026)

| Métrica | Valor |
|---|---|
| **Custo acumulado no mês (1–7 mai)** | **US$ 9,66** |
| Custo do mesmo período no mês passado (1–7 abr) | US$ 10,98 |
| Variação vs. mesmo período | **↓ 12% (economia)** |
| **Previsão total para maio 2026** | **US$ 40,73** |
| Total real do mês passado (abril 2026) | US$ 38,87 |
| Variação prevista vs. mês passado | **↑ 5%** |

### Análise
A redução de 12% no consumo dos primeiros 7 dias (de US$ 10,98 para US$ 9,66) indica otimização no uso do Rekognition — provavelmente pela cache de autenticações ou redução de chamadas redundantes. A previsão mensal de US$ 40,73 representa um crescimento controlado de 5% sobre abril, consistente com o aumento gradual de usuários na plataforma.

---

## 9. Benefícios do Vida Mais

### Para os Participantes (Idosos)
- **Eliminação de formulários físicos** — sem papel, sem caneta, sem perda de documento
- **Acessibilidade total** — TTS, fontes grandes, interface simplificada
- **Autenticação biométrica** — sem necessidade de memorizar senhas
- **Respostas a qualquer hora** — acesso via smartphone pessoal
- **Privacidade garantida** — dados armazenados no Brasil (LGPD)

### Para Coordenadores (PROF)
- **Dashboard em tempo real** — resultados atualizados instantaneamente após cada resposta
- **Exportação Excel/CSV** — relatórios prontos para apresentação institucional
- **QR Code de acesso** — onboarding de novos participantes em segundos
- **Análise preditiva** — identificação antecipada de participantes em risco de evasão
- **Histórico longitudinal** — comparação de engajamento ao longo dos semestres

### Para a Instituição (FATEC / ADMIN)
- **Visão consolidada** — relatórios globais cruzando todos os grupos
- **Redução de custo operacional** — fim da impressão, distribuição e tabulação manual de formulários
- **Tomada de decisão baseada em dados** — ML identifica tendências de desempenho coletivo
- **Escalabilidade** — arquitetura containerizada permite crescimento sem reengenharia
- **Conformidade LGPD** — dados sensíveis de saúde e biometria tratados com controles adequados

### Impacto Técnico
- **Zero dependência de papel** — processo 100% digital do convite à análise
- **Multi-plataforma** — funciona em Android e iOS via Expo
- **Monorepo** — backend, frontend e ML versionados juntos, facilitando CI/CD
- **Open source stack** — sem licenças proprietárias (exceto AWS Rekognition)

---

## 10. Variáveis de Ambiente (Produção)

```env
# Backend
DATABASE_URL=mysql://vidamais:<senha>@db:3306/vida_mais
JWT_SECRET=<segredo-forte-aleatório>
JWT_EXPIRES_IN=7d
PORT=3000
ALLOWED_ORIGINS=https://vidamais-app.com,https://www.vidamais-app.com
ML_SERVICE_URL=http://ml-service:5000

# AWS
AWS_ACCESS_KEY_ID=<chave-iam>
AWS_SECRET_ACCESS_KEY=<segredo-iam>
AWS_REGION=sa-east-1
AWS_REKOGNITION_COLLECTION_ID=vida-mais-faces

# Web Admin (build time)
VITE_API_URL=/api

# ML Service
DB_HOST=db
DB_PORT=3306
DB_USER=vidamais
DB_PASSWORD=<senha>
DB_NAME=vida_mais
```

---

*Documento gerado em 07/05/2026 — Vida Mais APP v1.x*
