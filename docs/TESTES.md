# Documentação da Suíte de Testes — Vida Mais APP

## Visão Geral

O projeto é um monorepo com 4 módulos, cada um com sua própria suíte de testes:

| Módulo | Framework | Arquivos de Teste | Total de Testes |
|--------|-----------|-------------------|-----------------|
| `backend/` | Jest + Supertest | 8 arquivos | 117 testes |
| `web-admin/` | Vitest + Testing Library | 3 arquivos | 14 testes |
| `mobile/` | Jest Expo + Testing Library RN | 2 arquivos | 15 testes |
| `ml-service/` | Pytest | 2 arquivos | ~30 testes |

**Status atual: todos os testes passando (100%).**

---

## Como Executar

```bash
# Backend
cd backend
npm test                  # todos os testes
npm run test:coverage     # com relatório de cobertura
npm run test -- --watch   # modo watch

# Web Admin
cd web-admin
npm test                  # todos os testes (Vitest run)
npm run test:coverage     # com cobertura (V8)
npm run test:watch        # modo watch interativo

# Mobile
cd mobile
npm test                  # todos os testes
npm run test:coverage     # com cobertura

# ML Service
cd ml-service
pytest                    # todos os testes
pytest -v                 # verbose
pytest tests/test_app.py  # arquivo específico
```

---

## Backend (`backend/src/__tests__/`)

### Arquitetura dos Testes

O backend usa **Jest** com **ts-jest** e **Supertest** para testes de integração de rotas HTTP.

```
src/__tests__/
├── setup.ts                          ← variáveis de ambiente (JWT_SECRET, etc.)
├── helpers/
│   ├── prisma.mock.ts                ← mock compartilhado do PrismaClient
│   └── tokens.ts                     ← tokens JWT pré-gerados por role
├── middleware/
│   ├── auth.middleware.test.ts       ← testa authenticate() e authorize()
│   └── error.middleware.test.ts      ← testa errorHandler()
├── auth.routes.test.ts               ← POST /auth/login, POST /auth/cadastro
├── admin.routes.test.ts              ← CRUD professores, turmas, alunos (role ADMIN)
├── prof.routes.test.ts               ← questionários, perguntas, relatórios (role PROF)
├── aluno.routes.test.ts              ← questionários ativos, submissão de respostas (role ALUNO)
├── ml.routes.test.ts                 ← analytics, predições, padrões (proxy ML Service)
└── face.routes.test.ts               ← login facial, cadastro/remoção de rosto (AWS Rekognition)
```

### Estratégia de Mock

**Prisma (banco de dados):** O `PrismaClient` é completamente substituído por um objeto de funções `jest.fn()` definido em `helpers/prisma.mock.ts`. Nenhum banco de dados real é acessado durante os testes.

```ts
// helpers/prisma.mock.ts — exemplo de uso no teste
prismaMock.user.findFirst.mockResolvedValue({ id: 'prof-1', role: 'PROF' });
prismaMock.user.update.mockResolvedValue({ id: 'prof-1', nome: 'Novo Nome' });
```

**Importante:** O mock do `@prisma/client` deve ser **inline** (sem `jest.requireActual`) para evitar que o módulo real do Prisma corrompa o registry do `zod` e quebre o `instanceof ZodError` no errorHandler:

```ts
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('./helpers/prisma.mock').prismaMock),
  Role: { ADMIN: 'ADMIN', PROF: 'PROF', ALUNO: 'ALUNO' },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error { ... },
  },
}));
```

**Axios (ML Service):** As rotas de ML fazem proxy para o serviço Python. O axios é mockado para controlar respostas sem depender do serviço rodando:

```ts
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValue({ data: { totalAlunos: 100 } });
```

**Rekognition (AWS):** O serviço de reconhecimento facial é mockado via `jest.mock('../services/rekognition.service')`:

```ts
jest.mock('../services/rekognition.service', () => ({
  searchFace: jest.fn(),
  indexFace: jest.fn(),
  deleteFace: jest.fn(),
}));
```

**Tokens JWT:** Os tokens de teste são gerados com o mesmo `JWT_SECRET` configurado no `setup.ts`, garantindo que a autenticação funcione normalmente sem precisar de login real:

```ts
// helpers/tokens.ts
export const adminToken = makeToken({ id: 'admin-id-1', email: 'admin@test.com', role: 'ADMIN' });
export const profToken  = makeToken({ id: 'prof-id-1',  email: 'prof@test.com',  role: 'PROF'  });
export const alunoToken = makeToken({ id: 'aluno-id-1', email: 'aluno@test.com', role: 'ALUNO' });
```

### Cobertura por Arquivo

| Arquivo de Teste | Rotas/Funções Cobertas | Casos Notáveis |
|-----------------|------------------------|----------------|
| `auth.middleware.test.ts` | `authenticate()`, `authorize()` | token válido, expirado, sem Bearer, role incorreta |
| `error.middleware.test.ts` | `errorHandler()` | ZodError→400, Prisma P2002→409, P2025→404, genérico→500 |
| `auth.routes.test.ts` | `POST /auth/login`, `POST /auth/cadastro` | credenciais inválidas, usuário inativo, validação Zod |
| `admin.routes.test.ts` | CRUD professores, turmas, alunos | RBAC (401/403), validações, not found |
| `prof.routes.test.ts` | Questionários, perguntas, relatórios, export | permissões PROF vs ADMIN vs ALUNO |
| `aluno.routes.test.ts` | Questionários ativos, submissão de respostas | resposta duplicada, convite QR code |
| `ml.routes.test.ts` | Analytics, predições, padrões, modelos | proxy de erros do ML Service, validação de payload |
| `face.routes.test.ts` | Login facial, status, cadastro, remoção | FACE_NOT_DETECTED, ImageTooLarge, sem rosto cadastrado |

---

## Web Admin (`web-admin/src/__tests__/`)

### Arquitetura dos Testes

Usa **Vitest** (integrado ao Vite) com **@testing-library/react** e **jsdom**.

```
src/__tests__/
├── lib/
│   └── api.test.ts                   ← instância axios, interceptors, setAuthToken
├── services/
│   └── authService.test.ts           ← login, logout, persistência de token
└── stores/
    └── authStore.test.ts             ← estado Zustand: setAuth, logout, roles
```

**Setup** (`src/test/setup.ts`): importa `@testing-library/jest-dom` e mocka `window.location` para testes de redirecionamento.

**Configuração Vitest** (`vite.config.ts`): ambiente `jsdom`, resolve alias `@/` → `src/`.

### O que é Testado

- **`api.test.ts`**: verifica que a instância axios aponta para a URL correta, que `setAuthToken` injeta o header `Authorization: Bearer <token>`, e que chamadas sem token não enviam o header.
- **`authService.test.ts`**: testa `login()` (post para `/auth/login`, retorna token+user), `logout()` (limpa estado), e tratamento de erro HTTP.
- **`authStore.test.ts`**: testa o store Zustand — estado inicial nulo, `setAuth` atualiza token e user, `logout` limpa ambos, sobrescrita de auth anterior.

---

## Mobile (`mobile/src/__tests__/`)

### Arquitetura dos Testes

Usa **jest-expo** como preset com **@testing-library/react-native**.

```
src/__tests__/
├── screens/
│   └── LoginScreen.test.tsx          ← renderização, interação, alertas, acessibilidade
└── stores/
    └── authStore.test.ts             ← loadToken, setAuth, logout com SecureStore
```

### Mocks Necessários

O ambiente React Native exige mocks para módulos nativos:

```ts
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), reset: jest.fn() }),
}));
```

### Interação com Botões — Atenção Importante

A `LoginScreen` contém dois botões com a palavra "ENTRAR":
- Botão principal: `✓ ENTRAR` (`accessibilityLabel="Botão de login"`)
- Botão facial: `🪪 ENTRAR COM ROSTO`

**Usar `getByText(/Entrar/i)` causa "Found multiple elements"**. A abordagem correta é usar o `accessibilityLabel`:

```ts
// ✗ ERRADO — ambíguo
fireEvent.press(getByText(/Entrar/i));

// ✓ CORRETO — específico
fireEvent.press(getByLabelText('Botão de login'));
```

### O que é Testado

- **`LoginScreen.test.tsx`**: renderização dos campos, alerta para campos vazios, chamada da API com credenciais corretas, `setAuthToken` após login bem-sucedido, alerta de erro, mensagem de fallback sem detalhe de erro, `accessibilityLabel` dos campos.
- **`authStore.test.ts`**: `loadToken` carrega do SecureStore, `setAuth` persiste token e user, `logout` remove do SecureStore e limpa estado, tratamento silencioso de erros do SecureStore.

---

## ML Service (`ml-service/tests/`)

### Arquitetura dos Testes

Usa **Pytest** com `unittest.mock` para isolar dependências de banco de dados e modelos ML.

```
tests/
├── __init__.py
├── test_app.py                       ← endpoints Flask (health, analytics, predições, padrões, modelos)
└── test_analytics.py                 ← lógica de AnalyticsService isolada
```

**Fixture principal** (`test_app.py`): cria um cliente Flask de teste com `DatabaseService`, `MLPredictor` e `AnalyticsService` completamente mockados, sem depender de MySQL real.

### O que é Testado

- **`test_app.py`**: todos os endpoints Flask — `/health`, `/analytics/overview`, `/analytics/turma/:id`, `/predict/evasao`, `/predict/desempenho`, `/patterns/engagement`, `/patterns/responses`, `/models/status`, `/models/train`.
- **`test_analytics.py`**: funções de cálculo do `AnalyticsService` com dados de fixtures.

---

## Problemas Encontrados e Corrigidos

### 1. `console.error` travando com `ZodError` no Jest

**Causa**: O `@jest/console` (CustomConsole) trava ao serializar um `ZodError` — o objeto tem getters internos que causam `TypeError: Cannot read properties of undefined (reading 'value')`. Isso fazia o `errorHandler` lançar exceção antes de retornar 400, e o Express retornava 500.

**Impacto**: 7 testes falhando em 4 arquivos diferentes (todos relacionados a validação Zod).

**Correção** (`error.middleware.ts`):
```ts
// Antes:
console.error('❌ Erro:', error);

// Depois:
console.error('❌ Erro:', error instanceof Error ? `${error.constructor.name}: ${error.message}` : String(error));
```

### 2. `jest.requireActual('@prisma/client')` corrompendo o mock de Role

**Causa**: `auth.routes.test.ts` usava `jest.requireActual` no mock do Prisma, mas as outras rotas (admin, prof, etc.) precisam que `Role` esteja disponível no mock. Ao carregar o módulo real, `Role` podia não ser corretamente exposto.

**Correção** (`auth.routes.test.ts`): substituído por mock inline com `Role`, `Visibilidade`, `TipoPergunta` e `Prisma` explícitos.

### 3. `getByText(/Entrar/i)` ambíguo na `LoginScreen` (Mobile)

**Causa**: A tela tem dois botões com "ENTRAR". O `getByText(/Entrar/i)` retornava "Found multiple elements".

**Correção** (`LoginScreen.test.tsx`): substituído por `getByLabelText('Botão de login')` em todos os 5 testes que interagiam com o botão.

### 4. Mock incorreto `findUnique` vs `findFirst` no admin test

**Causa**: Os testes de `PUT` e `DELETE /admin/professores/:id` mockavam `prismaMock.user.findUnique`, mas a rota usa `prisma.user.findFirst` (com filtro de role). O `findFirst` retornava `undefined` → rota retornava 404.

**Correção** (`admin.routes.test.ts`): trocado `findUnique` por `findFirst` nos 4 casos afetados.

### 5. Ausência de testes para `face.routes.ts`

**Causa**: O arquivo `face.routes.ts` (login facial, cadastro/remoção de rosto via AWS Rekognition) não tinha nenhum teste.

**Solução**: Criado `face.routes.test.ts` com 16 casos de teste cobrindo todos os 4 endpoints e seus casos de erro.

---

## Configurações de Jest/Vitest

### Backend (`backend/jest.config.js`)

```js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: false }]
  },
};
```

`diagnostics: false` no ts-jest desabilita type-checking durante os testes (os mocks não satisfazem os tipos reais do Prisma). Type-checking completo é feito pelo `tsc` separadamente.

### Web Admin (`web-admin/vitest.config.ts`)

Vitest usa a configuração do `vite.config.ts` com adição de:
```ts
test: {
  environment: 'jsdom',
  setupFiles: ['src/test/setup.ts'],
}
```

### Mobile (`mobile/jest.config.js`)

```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo...)',
  ],
};
```

O `transformIgnorePatterns` longo é necessário porque muitos pacotes Expo/React Native distribuem código ESM que precisa ser transpilado pelo Babel.
