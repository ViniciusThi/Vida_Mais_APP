# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vida Mais APP** is a digital survey/questionnaire platform designed for elderly users at FATEC (Faculdade de Tecnologia). It replaces paper-based satisfaction surveys with an accessibility-first digital system.

**Monorepo structure:**
- `backend/` — Node.js + Express + TypeScript REST API
- `web-admin/` — React + Vite + TypeScript admin dashboard
- `mobile/` — React Native + Expo mobile app
- `ml-service/` — Python + Flask analytics and ML service

## Development Commands

### Backend (`cd backend`)
```bash
npm run dev              # Dev server with hot reload (tsx watch)
npm run build            # Compile TypeScript to /dist
npm start                # Run production build
npm run db:migrate       # Run Prisma migrations (dev)
npm run db:migrate:prod  # Deploy migrations (production)
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio GUI
npm run lint             # ESLint
npm run test             # Jest
npm run test -- path/to/file.test.ts  # Run a single test file
npm run questionario:criar    # Create standard questionnaire
npm run questionario:recriar  # Recreate standard questionnaire
```

### Web Admin (`cd web-admin`)
```bash
npm run dev              # Vite dev server on port 5173
npm run build            # TypeScript check + Vite build to /dist
npm run lint             # ESLint
npm run preview          # Preview production build
npm run test             # Vitest (jsdom environment)
npm run test -- --run src/path/to/file.test.ts  # Run a single test file
```

### Mobile (`cd mobile`)
```bash
npm start                # Expo dev server
npm run android          # Build/run for Android
npm run ios              # Build/run for iOS
npm run test             # Jest (jest-expo preset)
npm run test -- path/to/file.test.ts  # Run a single test file
```

### ML Service (`cd ml-service`)
```bash
pip install -r requirements-dev.txt  # Install dev dependencies
pytest                               # Run all tests
pytest tests/test_specific.py        # Run a single test file
```

### Docker (root)
```bash
docker compose up -d --build   # Start all services
docker compose ps              # Check service status
docker compose logs -f backend # Follow logs for a service
```

## Architecture

### Request Flow
```
Mobile/Web → Nginx (port 80) → /api/* proxy → Backend (port 3000)
                                                    ↓
                                    MySQL (Prisma ORM) + ML Service (Flask, port 5000)
```

### Backend Route Structure (`backend/src/routes/`)
- `auth.routes.ts` — JWT login/authentication
- `admin.routes.ts` — User and class (turma) management (ADMIN role)
- `prof.routes.ts` — Questionnaire CRUD, reports, Excel export (PROF role)
- `aluno.routes.ts` — Response submission (ALUNO role)
- `ml.routes.ts` — Analytics and ML prediction endpoints

### RBAC Roles
- `ADMIN` — Full system control, user management, global reports
- `PROF` — Create questionnaires, view class reports
- `ALUNO` — Submit questionnaire responses (accessibility-focused elderly users)

### Database (MySQL via Prisma)
Key tables: `users`, `turmas` (classes), `alunos_turmas` (enrollment M2M), `questionarios`, `perguntas` (questions), `respostas` (responses), `convites` (QR code invites).

Question types (enum `TipoPergunta`): `TEXTO`, `MULTIPLA`, `UNICA`, `ESCALA`, `BOOLEAN`.

### State Management
Both `web-admin` and `mobile` use **Zustand** for global state and **TanStack Query** for server state/caching.

### ML Service (`ml-service/`)
Flask API with scikit-learn models for:
- Evasion (dropout) risk prediction per class — Random Forest
- Performance trend prediction per student — Gradient Boosting
- Engagement and response pattern analysis

The ML service queries MySQL directly (not through the backend API).

### Web Admin Nginx Proxy
`web-admin/nginx.conf` proxies `/api/*` to `backend:3000` in the Docker network. The Vite path alias `@/` maps to `src/`.

## Key Technical Decisions

- **Prisma schema** is the source of truth for database structure — always run `npm run db:migrate` after schema changes.
- **JWT expiration** defaults to 7 days; secret is `JWT_SECRET` env var.
- **Mobile accessibility**: TTS via Expo Speech, secure storage via Expo SecureStore, minimum 60×60px touch targets, large fonts (≥20px).
- **Excel/CSV export** is handled by `backend/src/services/excel-export.service.ts`.
- **Standard questionnaire template** is defined in `backend/src/data/questionario-padrao.ts`.

## Environment Variables

Backend requires: `DATABASE_URL`, `JWT_SECRET`, `ML_SERVICE_URL`, `PORT` (default 3000), `ALLOWED_ORIGINS`.

Web admin build requires: `VITE_API_URL` (injected at build time by Vite).

In Docker Compose, the database URL is `mysql://vidamais:vidamais2025@db:3306/vida_mais` — change credentials for production.
