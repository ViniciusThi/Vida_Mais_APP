# Jest - Ferramenta de Automação de Testes de Software

**Disciplina:** Qualidade e Testes de Software
**Aluno:** Vinicius Santos
**Curso:** FATEC
**Data:** Abril/2026

---

## 1. Identificação da Ferramenta

**Nome:** Jest

**Tipo:** Framework de testes automatizados para JavaScript e TypeScript.

**Mantenedor:** Originalmente criado e mantido pela Meta (Facebook). Em 2022, a manutenção foi transferida para a OpenJS Foundation, mantendo-o como projeto open source.

**Site oficial:** https://jestjs.io

**Versão usada na demonstração:** 29.7.0 (versão presente no `package.json` do projeto Vida Mais APP).

**Descrição inicial:** Jest é um framework de testes "tudo-em-um" para JavaScript/TypeScript. Em uma única dependência, ele entrega o executor de testes (test runner), a biblioteca de asserções (`expect`), o sistema de mocks (`jest.fn`, `jest.mock`), o relatório de cobertura de código e o snapshot testing. É amplamente utilizado para testar código de backend Node.js, bibliotecas, aplicações React, React Native e serviços REST.

---

## 2. Pesquisa e Caracterização

### 2.1 Histórico

O Jest começou em 2011 dentro do Facebook como uma ferramenta interna para testar a base de código do site. Foi tornado open source em 2014 por Christoph Pojer e ganhou tração rápida na comunidade JavaScript por uma proposta forte: "delightful testing" - testes prazerosos, com configuração mínima.

Pontos-chave da evolução:

- **2014:** Lançamento público.
- **2016-2018:** Tornou-se padrão em projetos React (era o framework recomendado pelo `create-react-app`).
- **2020+:** Suporte oficial a TypeScript via `ts-jest` se consolidou.
- **2022:** Manutenção transferida da Meta para a OpenJS Foundation.
- **Hoje:** É o framework de testes JavaScript mais baixado no npm, com mais de 20 milhões de downloads semanais.

### 2.2 Propósito

O Jest existe para responder a uma necessidade simples: validar de forma automática se o código JavaScript/TypeScript continua se comportando como esperado a cada mudança. Em vez de testar manualmente cada vez que algo é alterado, o desenvolvedor escreve testes uma vez e os reexecuta sempre que necessário, em segundos.

Ele substitui (ou complementa) ferramentas mais antigas como Mocha + Chai + Sinon, agrupando todas essas responsabilidades em uma única ferramenta coesa.

### 2.3 Principais Funcionalidades

| Recurso | Descrição |
|---|---|
| **Test Runner** | Executor que descobre arquivos `*.test.ts` automaticamente, roda em paralelo e exibe resultados coloridos no terminal. |
| **`expect` (asserções)** | API rica: `toBe`, `toEqual`, `toMatchObject`, `toThrow`, `toHaveBeenCalledWith`, etc. |
| **Mocks** | `jest.fn()`, `jest.mock('modulo')`, `jest.spyOn()` para isolar dependências externas. |
| **Snapshot Testing** | Salva uma "foto" da saída e compara nas próximas execuções (ótimo para componentes de UI). |
| **Coverage** | Relatório de cobertura embutido com `--coverage` (linhas, branches, funções, statements). |
| **Watch Mode** | `jest --watch` reexecuta apenas testes afetados pelas mudanças no código. |
| **Suporte assíncrono** | Trabalha nativamente com Promises, async/await e callbacks. |
| **Hooks** | `beforeEach`, `afterEach`, `beforeAll`, `afterAll` para preparar e limpar o ambiente. |
| **Múltiplos ambientes** | `node` para backend, `jsdom` para código que simula o navegador. |

### 2.4 Facilidades de Uso

**É fácil de configurar?** Sim. Para JavaScript puro, basta:

```bash
npm install --save-dev jest
```

E pronto - o Jest descobre automaticamente arquivos `*.test.js`. Para TypeScript ou React Native exige um pouco mais de configuração (instalar `ts-jest` ou usar o preset `jest-expo`, conforme aplicado no nosso projeto).

**Possui interface gráfica?** Não nativamente. O Jest é uma ferramenta de linha de comando. Porém, existem extensões muito boas para IDEs:

- **VS Code:** "Jest" (Orta) - mostra ícones verdes/vermelhos ao lado de cada teste.
- **WebStorm/IntelliJ:** suporte integrado a Jest.

**Precisa de programação?** Sim. Os testes são código em JavaScript ou TypeScript. Não há gravador de macros ou interface "no-code" - é uma ferramenta para desenvolvedores.

### 2.5 Vantagens

1. **Zero-config para casos simples** - já vem com tudo o que se precisa.
2. **All-in-one** - um único pacote substitui runner, assertions, mocks e coverage.
3. **Excelente integração com TypeScript** via `ts-jest`.
4. **Mock system poderoso** - mocka módulos inteiros com uma linha (`jest.mock('axios')`).
5. **Performance** - executa testes em paralelo automaticamente.
6. **Snapshot testing** - recurso quase exclusivo, ótimo para detectar regressões em UI.
7. **Comunidade enorme** - praticamente qualquer dúvida tem resposta no Stack Overflow.
8. **Watch mode inteligente** - reexecuta só o que mudou.
9. **Documentação oficial muito boa** - com exemplos práticos em `jestjs.io`.
10. **Compatível com bibliotecas populares** - React Testing Library, Supertest, Testing Library, etc.

### 2.6 Desvantagens

1. **Sem GUI nativa** - quem prefere ferramentas visuais (estilo Selenium IDE) precisa de extensões.
2. **Mocking pode ficar complexo** em aplicações com muitas dependências (foi necessário criar um `prisma.mock.ts` no nosso projeto, por exemplo).
3. **Configuração ESM ainda é instável** - quando o projeto usa ES Modules puros, a configuração fica mais delicada.
4. **Suporte a React Native exige preset específico** (`jest-expo` no nosso caso).
5. **Pode ficar lento em projetos grandes** se mal configurado (muitos arquivos transformados pelo `ts-jest` sem cache).
6. **Não foi feito para testes E2E** - para isso o ecossistema usa Cypress, Playwright ou Puppeteer.
7. **Aprender a usar mocks corretamente leva tempo** - mockar mais do que o necessário gera testes frágeis.

---

## 3. Classificação dentro da Estrutura de Testes

### 3.1 Níveis de Teste em que se aplica

| Nível | Aplica-se? | Como |
|---|---|---|
| **Unitário** | Sim (foco principal) | Testar funções isoladas, classes, middlewares, reducers. Exemplo no projeto: `auth.middleware.test.ts`. |
| **Integração** | Sim (com Supertest) | Testar rotas Express completas, com mocks de banco/serviços. Exemplo no projeto: `ml.routes.test.ts`. |
| **Sistema** | Parcialmente | Pode ser combinado com Puppeteer/Playwright, mas não é o ideal. |
| **Aceitação** | Não | Não é a finalidade do Jest; ferramentas como Cucumber são mais adequadas. |

### 3.2 Tipos de Teste apoiados

- **Funcional:** sim. Verifica se uma entrada produz a saída esperada.
- **Regressão:** sim. A suíte de testes é reexecutada a cada mudança - se algo quebrar, descobrimos imediatamente.
- **Segurança (parcial):** sim, no que diz respeito a regras de autorização e autenticação. No nosso projeto, testamos que apenas usuários com role correta acessam endpoints sensíveis.
- **Não-funcional / desempenho / carga:** **não é o foco.** Para isso usam-se ferramentas como JMeter, k6 ou Artillery.

### 3.3 Técnicas de Teste

Jest é flexível e suporta as duas técnicas principais:

- **Caixa-preta** (foca em entrada x saída, sem se importar com a estrutura interna):
  - Quando testamos uma rota REST com Supertest, mandando uma requisição e verificando a resposta, estamos usando caixa-preta.
  - Exemplo: `ml.routes.test.ts` testa o endpoint `/ml/analytics/overview` apenas verificando status HTTP e o body retornado.

- **Caixa-branca** (conhece a lógica interna, força caminhos específicos do código):
  - Quando testamos a função `authenticate` do middleware, sabemos que ela tem três caminhos (sem header, header inválido, token expirado) e testamos cada ramo.
  - Exemplo: `auth.middleware.test.ts` cobre cada `if/else` da função.

---

## 4. Demonstração Prática

A demonstração foi feita usando o próprio projeto interdisciplinar **Vida Mais APP**, um sistema de questionários acessíveis para idosos da FATEC. O backend (Node.js + Express + TypeScript) já tem Jest configurado.

### 4.1 Configuração do Jest no projeto

Arquivo `backend/jest.config.js`:

```javascript
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { ... }]
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/prisma/**'
  ]
};
```

Pontos importantes desta configuração:

- `testEnvironment: 'node'` - simula ambiente Node, sem DOM.
- `testMatch` - convenção: arquivos dentro de pastas `__tests__` terminados em `.test.ts`.
- `clearMocks: true` - limpa mocks entre testes para evitar contaminação.
- `transform` - usa `ts-jest` para compilar TypeScript em tempo de execução.
- `collectCoverageFrom` - lista o que entra e o que NÃO entra no relatório de cobertura.

### 4.2 Exemplo 1 - Teste Unitário (Caixa-branca)

Arquivo `backend/src/__tests__/middleware/auth.middleware.test.ts`. Testa o middleware que valida o JWT.

```typescript
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../../middlewares/auth.middleware';

const SECRET = process.env.JWT_SECRET!;

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authenticate middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve chamar next() com token válido', () => {
    const token = jwt.sign({ id: 'u-1', email: 'a@b.com', role: 'ADMIN' }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;
    const res = mockRes();
    const mockNext = jest.fn();

    authenticate(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 'u-1', role: 'ADMIN' });
  });

  it('deve retornar 401 sem header Authorization', () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();
    const mockNext = jest.fn();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
```

O que está sendo demonstrado:

- **`describe`** agrupa testes do mesmo assunto.
- **`it`** declara um caso de teste com nome legível em português.
- **`expect`** faz a asserção. Note os matchers: `toHaveBeenCalledWith`, `toMatchObject`, `not.toHaveBeenCalled`.
- **`jest.fn()`** cria uma função "espiã" para verificar se `next()` foi (ou não) chamada.
- **`beforeEach`** zera os mocks entre testes - evita que um teste influencie o outro.

### 4.3 Exemplo 2 - Teste de Integração (Caixa-preta)

Arquivo `backend/src/__tests__/ml.routes.test.ts`. Testa a rota `/ml/analytics/overview` chamando o serviço HTTP de fora, com o banco e o ML Service mockados.

```typescript
import request from 'supertest';
import axios from 'axios';

jest.mock('@prisma/client', () => ({ /* mock do Prisma */ }));
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import app from '../server';
import { adminToken, alunoToken, authHeader } from './helpers/tokens';

describe('GET /ml/analytics/overview', () => {
  it('deve retornar overview para ADMIN', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { totalAlunos: 100, totalTurmas: 10, mediaRespostas: 75 }
    });

    const res = await request(app)
      .get('/ml/analytics/overview')
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalAlunos');
  });

  it('deve retornar 403 para ALUNO', async () => {
    const res = await request(app)
      .get('/ml/analytics/overview')
      .set(authHeader(alunoToken));

    expect(res.status).toBe(403);
  });

  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/ml/analytics/overview');
    expect(res.status).toBe(401);
  });
});
```

Pontos importantes:

- **`jest.mock('axios')`** intercepta toda chamada HTTP para o ML Service - o teste roda **sem precisar** que o Flask esteja rodando.
- **`supertest`** faz uma requisição real à app Express em memória - testa o fluxo inteiro: middleware de auth, controller, response.
- **Cobre RBAC:** ADMIN passa, ALUNO recebe 403, sem token recebe 401. Os três caminhos críticos.

### 4.4 Como executar

```bash
cd backend

# Roda toda a suíte
npm test

# Roda só um arquivo
npm test -- src/__tests__/middleware/auth.middleware.test.ts

# Modo watch (re-roda ao salvar)
npm run test:watch

# Com cobertura
npm run test:coverage
```

### 4.5 Saída esperada (estilo do terminal Jest)

```
 PASS  src/__tests__/middleware/auth.middleware.test.ts
  authenticate middleware
    ✓ deve chamar next() com token válido (4 ms)
    ✓ deve retornar 401 sem header Authorization (1 ms)
    ✓ deve retornar 401 com token malformado (2 ms)
    ✓ deve retornar 401 com token expirado (1 ms)
    ✓ deve retornar 401 sem prefixo Bearer
  authorize middleware
    ✓ deve chamar next() quando role é permitida
    ✓ deve retornar 403 quando role não é permitida (1 ms)
    ✓ deve retornar 401 quando req.user está ausente
    ✓ deve aceitar múltiplos roles

 PASS  src/__tests__/ml.routes.test.ts
  GET /ml/analytics/overview
    ✓ deve retornar overview para ADMIN (45 ms)
    ✓ deve retornar overview para PROF (3 ms)
    ✓ deve retornar 403 para ALUNO (2 ms)
    ✓ deve retornar 401 sem autenticação (1 ms)

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        2.847 s
```

Recomendação: na hora da apresentação, abrir o terminal, rodar `npm test` e tirar um print da saída acima.

---

## 5. Impressões Pessoais

**O que achei da ferramenta?** Achei muito boa. O Jest tem uma vantagem importante: ele "sai do caminho". Você instala, escreve `describe/it/expect` e funciona. Não precisa montar pipeline de execução, importar runner separado, configurar reporter - já vem tudo.

**Foi fácil ou difícil aprender?** A sintaxe básica é fácil em poucas horas. As funções `describe`, `it`, `expect`, `beforeEach` são claras e leem como inglês. O que leva mais tempo é dominar **mocks** - especialmente quando se precisa mockar módulos com importações complexas, como o Prisma Client. Foi necessário criar um arquivo `prisma.mock.ts` específico só para isso.

**É útil para profissionais da área?** Sim, sem dúvida. Hoje, qualquer vaga de desenvolvedor JavaScript/TypeScript séria espera familiaridade com testes automatizados, e Jest é o padrão de fato. Em entrevistas técnicas, é comum perguntar sobre matchers do `expect`, diferença entre `mock` e `spy`, e como testar código assíncrono. Conhecer Jest é uma habilidade que paga retorno claro.

**Pontos que mais me marcaram:**

- **Confiança ao mexer no código.** Depois que existe uma boa suíte, você refatora sem medo: se quebrar, o teste avisa.
- **Detecção precoce de bugs.** No nosso projeto, ao testar o RBAC, conseguimos pegar um caso onde o `authorize` não retornava 401 corretamente quando `req.user` estava ausente.
- **Velocidade.** A suíte do backend toda roda em menos de 3 segundos - isso encoraja a testar mais.

---

## 6. Reflexão (Questão Final)

**Utilizaria esta ferramenta no projeto interdisciplinar? Por quê?**

**Sim - e na prática já está sendo usada.** O projeto **Vida Mais APP** já adotou Jest desde o início, tanto no backend (Node.js + Express + TypeScript) quanto no app mobile (React Native com Expo). As razões são:

1. **A stack pede.** Como o projeto inteiro é JS/TS, Jest é a escolha natural - não precisa misturar ferramentas de linguagens diferentes.

2. **Tem regras de negócio críticas.** O sistema controla acesso por papéis (`ADMIN`, `PROF`, `ALUNO`) e processa respostas de questionários que viram dados acadêmicos. Um bug aqui pode comprometer a credibilidade da pesquisa - testes automatizados são uma rede de proteção barata.

3. **O usuário-alvo é idoso.** Por motivo de acessibilidade, não dá para depender só de testes manuais com a equipe. Os testes garantem que regressões não cheguem ao usuário final, que pode ter mais dificuldade em reportar problemas.

4. **Permite integração contínua.** Com Jest configurado, é trivial rodar a suíte automaticamente em cada `git push` (via GitHub Actions, por exemplo), bloqueando merges que quebram comportamento existente.

5. **Documentação viva.** Os testes mostram **como** o sistema deve se comportar. Um novo membro da equipe lê `auth.middleware.test.ts` e entende imediatamente o que `authenticate` deve fazer - melhor que qualquer comentário no código.

A única coisa que eu adicionaria, para complementar o Jest, seria uma ferramenta de testes E2E (como Cypress ou Detox) para validar o fluxo completo do usuário no app mobile. Jest cobre unidades e integração; E2E cobriria a experiência ponta a ponta - juntas, formariam a "pirâmide de testes" recomendada pela engenharia de software moderna.

---

## Referências

- Documentação oficial: https://jestjs.io
- Repositório oficial: https://github.com/jestjs/jest
- Mantenedor atual: OpenJS Foundation
- Código fonte do projeto Vida Mais APP (backend e mobile) - testes em `backend/src/__tests__/` e `mobile/src/__tests__/`.
