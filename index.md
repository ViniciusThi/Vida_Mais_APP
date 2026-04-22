# Vida Mais APP — Mapa do Projeto

> Mapa central de navegação. Atualizado a cada mudança relevante.

## Estrutura do Monorepo

| Pasta | Tecnologia | Função |
|-------|-----------|--------|
| `backend/` | Node.js + Express + TypeScript + Prisma | API REST, autenticação JWT, RBAC |
| `web-admin/` | React + Vite + TypeScript + Zustand | Dashboard administrativo |
| `mobile/` | React Native + Expo + TypeScript | App para alunos idosos (acessibilidade) |
| `ml-service/` | Python + Flask + scikit-learn | Análise de dados e predições |

## Documentação Interna

- [`CLAUDE.md`](./CLAUDE.md) — Instruções para Claude Code (comandos, arquitetura, decisões)
- [`README.md`](./README.md) — Visão geral do projeto
- [`COMPREHENSIVE_DOCUMENTATION.md`](./COMPREHENSIVE_DOCUMENTATION.md) — Documentação técnica detalhada
- [`TESTS.md`](./TESTS.md) — Guia de testes
- [`docs/projeto_contexto.md`](./docs/projeto_contexto.md) — **Cliente, missão, regras de negócio da Vida Mais Itapira**
- [`docs/referencias/`](./docs/referencias/) — Documentos da instituição (missão, visão, números)
- [`documentos/`](./documentos/) — Documentos do projeto (requisitos, apresentações)

## Memória do Claude

- [`.claude_memory/contexto_projeto.md`](./.claude_memory/contexto_projeto.md) — O que é o app, cliente e objetivos
- [`.claude_memory/decisoes_tecnicas.md`](./.claude_memory/decisoes_tecnicas.md) — Stack e decisões de arquitetura
- [`.claude_memory/estilo_codificacao.md`](./.claude_memory/estilo_codificacao.md) — Preferências de código e UI
- [`.claude_memory/log_aprendizado.md`](./.claude_memory/log_aprendizado.md) — Log de erros difíceis e soluções (SNMP, Grafana, integrações)

## Fluxo de Dados

```
Mobile/Web → Nginx (porta 80) → /api/* → Backend (porta 3000)
                                               ↓
                               MySQL (Prisma ORM) + ML Service (Flask, porta 5000)
```

## Roles RBAC

| Role | Permissões |
|------|-----------|
| `ADMIN` | Gestão de usuários, relatórios globais, controle total |
| `PROF` | Criar questionários, ver relatórios por turma |
| `ALUNO` | Responder questionários (foco em acessibilidade para idosos) |

## Comandos Rápidos

```bash
# Backend
cd backend && npm run dev

# Web Admin
cd web-admin && npm run dev

# Mobile
cd mobile && npm start

# Tudo via Docker
docker compose up -d --build
```

## Terminologia UI

Os nomes internos do código (`aluno`, `turma`, `professor`) **não mudam** — só os labels visíveis ao usuário:
- Aluno → Participante | Professor → Coordenador | Turma → Grupo
- ML: "Risco de Evasão" → "Risco de Abandono das Atividades"

---
_Última atualização: 2026-04-21_
