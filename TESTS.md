# Guia de Testes — Vida Mais APP

## Instalação das Dependências de Teste

### Backend

```bash
cd backend
npm install
```

### Web-Admin

```bash
cd web-admin
npm install
```

### Mobile

```bash
cd mobile
npm install
```

### ML Service

```bash
cd ml-service
pip install -r requirements-dev.txt
```

---

## Executar Testes

### Backend (Jest + Supertest)

```bash
cd backend
npm test                # Executar todos os testes
npm run test:watch      # Modo watch (re-executa ao salvar)
npm run test:coverage   # Com relatório de cobertura
```

**Suítes de teste:**
- `auth.routes.test.ts` — Login, cadastro, validações
- `admin.routes.test.ts` — CRUD professores, turmas, alunos + health check
- `aluno.routes.test.ts` — Questionários ativos, envio de respostas, minhas turmas
- `prof.routes.test.ts` — Turmas do professor, CRUD questionários, perguntas
- `ml.routes.test.ts` — Analytics, predições, padrões, health do ML service
- `middleware/auth.middleware.test.ts` — authenticate, authorize
- `middleware/error.middleware.test.ts` — Zod errors, Prisma errors, erros genéricos

### Web-Admin (Vitest + React Testing Library)

```bash
cd web-admin
npm test                # Executar todos os testes
npm run test:watch      # Modo watch interativo
npm run test:coverage   # Com cobertura (lcov + texto)
```

**Suítes de teste:**
- `stores/authStore.test.ts` — Estado de autenticação (setAuth, logout)
- `services/authService.test.ts` — Chamadas API login e cadastro
- `lib/api.test.ts` — Interceptors de request/response do Axios

### Mobile (Jest + React Native Testing Library)

```bash
cd mobile
npm test                # Executar todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
```

**Suítes de teste:**
- `stores/authStore.test.ts` — SecureStore: loadToken, setAuth, logout
- `screens/LoginScreen.test.tsx` — Renderização, interação, feedback de erros

### ML Service (pytest)

```bash
cd ml-service
pytest                  # Executar todos os testes
pytest -v               # Modo verboso
pytest --tb=long        # Stack trace completo em falhas
pytest tests/test_app.py           # Apenas endpoints Flask
pytest tests/test_analytics.py    # Apenas AnalyticsService
```

**Suítes de teste:**
- `tests/test_app.py` — Todos os endpoints Flask (health, analytics, predições, padrões, modelos)
- `tests/test_analytics.py` — Lógica do AnalyticsService (overview, turma, aluno)

---

## Estrutura dos Testes

```
backend/src/__tests__/
├── setup.ts                          # Env vars para testes (JWT_SECRET, PORT=0)
├── helpers/
│   ├── prisma.mock.ts                # Mock compartilhado do PrismaClient
│   └── tokens.ts                    # Geradores de JWT para ADMIN/PROF/ALUNO
├── auth.routes.test.ts
├── admin.routes.test.ts
├── aluno.routes.test.ts
├── prof.routes.test.ts
├── ml.routes.test.ts
└── middleware/
    ├── auth.middleware.test.ts
    └── error.middleware.test.ts

web-admin/src/
├── test/setup.ts                     # @testing-library/jest-dom
└── __tests__/
    ├── stores/authStore.test.ts
    ├── services/authService.test.ts
    └── lib/api.test.ts

mobile/src/__tests__/
├── stores/authStore.test.ts
└── screens/LoginScreen.test.tsx

ml-service/tests/
├── __init__.py
├── test_app.py                       # Endpoints Flask
└── test_analytics.py                 # AnalyticsService
```

---

## Estratégia de Mocking

| Módulo | Estratégia |
|--------|-----------|
| PrismaClient (backend) | `jest.mock('@prisma/client')` com factory que injeta `prismaMock` compartilhado |
| Axios ML Service (backend) | `jest.mock('axios')` com `jest.Mocked<typeof axios>` |
| API (web-admin) | `vi.mock('../../lib/api')` com objeto simulado |
| expo-secure-store (mobile) | `jest.mock('expo-secure-store')` com funções assíncronas |
| DatabaseService (ml-service) | `unittest.mock.MagicMock` via `pytest-mock` |
