# Decisões Técnicas — Vida Mais APP

## Stack Completa

### Backend
- **Node.js + Express + TypeScript** — API REST robusta com tipagem estática
- **Prisma ORM** — Source of truth do schema do banco; migrations versionadas
- **MySQL** — Banco relacional para dados estruturados de questionários e respostas
- **JWT** (7 dias de expiração) — Autenticação stateless, secret via `JWT_SECRET`
- **RBAC** (ADMIN / PROF / ALUNO) — Controle de acesso por papel

### Web Admin
- **React + Vite + TypeScript** — SPA rápida com build otimizado
- **Zustand** — Estado global leve, sem boilerplate do Redux
- **TanStack Query** — Cache e sincronização de estado do servidor
- **Nginx** — Proxy `/api/*` → `backend:3000` no Docker

### Mobile
- **React Native + Expo** — Cross-platform (iOS/Android) com ecosistema maduro
- **Expo Speech** — TTS nativo para acessibilidade
- **Expo SecureStore** — Armazenamento seguro de tokens
- **Zustand + TanStack Query** — Mesma estratégia de estado do web-admin

### ML Service
- **Python + Flask** — Microserviço leve para ML
- **scikit-learn** — Random Forest (risco de evasão) + Gradient Boosting (tendência de desempenho)
- Acessa MySQL diretamente (não via API backend)

## Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Monorepo | Sim | Facilita desenvolvimento e deploy conjunto |
| ORM | Prisma | Schema como código, migrations seguras, studio visual |
| Estado global | Zustand | Simples, sem boilerplate, funciona bem com TanStack Query |
| ML separado | Microserviço Flask | Isolamento de dependências Python do Node.js |
| Deploy | Docker Compose | Orquestração simples para todos os 4 serviços |
| Auth | JWT stateless | Escala sem sessões no servidor |

## Variáveis de Ambiente Críticas

```env
# Backend
DATABASE_URL=mysql://vidamais:vidamais2025@db:3306/vida_mais
JWT_SECRET=<secret>
ML_SERVICE_URL=http://ml-service:5000
PORT=3000
ALLOWED_ORIGINS=<origins>

# Web Admin
VITE_API_URL=<api_url>
```

## Tipos de Pergunta (enum TipoPergunta)
`TEXTO` | `MULTIPLA` | `UNICA` | `ESCALA` | `BOOLEAN`

## Tabelas Principais
`users`, `turmas`, `alunos_turmas` (M2M), `questionarios`, `perguntas`, `respostas`, `convites` (QR code)

---
_Última atualização: 2026-04-17_
