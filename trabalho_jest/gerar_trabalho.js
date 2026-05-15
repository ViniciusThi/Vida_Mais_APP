/**
 * gerar_trabalho.js
 *
 * Gera dois arquivos a partir do conteudo deste script:
 *   - Trabalho_Jest.docx       (documento escrito)
 *   - Apresentacao_Jest.pptx   (apresentacao 10 slides)
 *
 * Como rodar (uma vez so):
 *   npm init -y
 *   npm install docx pptxgenjs
 *   node gerar_trabalho.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1) DOCUMENTO WORD
// ============================================================================
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, PageBreak,
} = require('docx');

// helpers ---------------------------------------------------------------------
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  ...opts,
  children: opts.children || [new TextRun({ text, font: 'Calibri', size: 22 })],
});

const H = (text, level = HeadingLevel.HEADING_1) => new Paragraph({
  heading: level,
  spacing: { before: 240, after: 160 },
  children: [new TextRun({ text, bold: true, font: 'Calibri', size: level === HeadingLevel.HEADING_1 ? 32 : 28 })],
});

const Bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
  children: [new TextRun({ text, font: 'Calibri', size: 22 })],
});

const Code = (lines) => new Paragraph({
  spacing: { before: 120, after: 120 },
  shading: { type: ShadingType.CLEAR, fill: 'F3F3F3' },
  border: {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
  },
  children: lines.flatMap((line, i) => {
    const runs = [new TextRun({ text: line, font: 'Consolas', size: 18 })];
    if (i < lines.length - 1) runs.push(new TextRun({ text: '', break: 1 }));
    return runs;
  }),
});

const cell = (text, opts = {}) => new TableCell({
  width: { size: opts.w || 4680, type: WidthType.DXA },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
  children: [new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: 22, bold: !!opts.bold })],
  })],
});

const tableBorders = (() => {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' };
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
})();

// conteudo --------------------------------------------------------------------
const docChildren = [
  // capa
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 240 },
    children: [new TextRun({ text: 'JEST', bold: true, font: 'Calibri', size: 96, color: '1E2761' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: 'Framework de Testes Automatizados para JavaScript e TypeScript', italics: true, font: 'Calibri', size: 28 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800, after: 120 },
    children: [new TextRun({ text: 'Trabalho de Qualidade e Testes de Software', font: 'Calibri', size: 26 })],
  }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FATEC', font: 'Calibri', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: 'Aluno: Vinicius Santos', font: 'Calibri', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Abril de 2026', font: 'Calibri', size: 24 })] }),
  new Paragraph({ children: [new PageBreak()] }),

  // 1. Identificacao
  H('1. Identificacao da Ferramenta'),
  P('Nome: Jest.'),
  P('Tipo: Framework de testes automatizados para JavaScript e TypeScript.'),
  P('Mantenedor: Originalmente criado pela Meta (Facebook). Desde 2022 a manutencao foi transferida para a OpenJS Foundation.'),
  P('Site oficial: https://jestjs.io'),
  P('Versao usada na demonstracao: 29.7.0 (versao presente no package.json do projeto Vida Mais APP).'),
  P('Descricao inicial: Jest e um framework de testes "tudo-em-um" para JavaScript / TypeScript. Em uma unica dependencia ele entrega o executor de testes, a biblioteca de assercoes (expect), o sistema de mocks (jest.fn, jest.mock), o relatorio de cobertura de codigo e o snapshot testing. E amplamente usado em backends Node.js, bibliotecas, aplicacoes React e React Native, e servicos REST.'),

  // 2. Pesquisa
  H('2. Pesquisa e Caracterizacao'),
  H('2.1 Historico', HeadingLevel.HEADING_2),
  P('O Jest comecou em 2011 como ferramenta interna do Facebook para testar a base de codigo do site. Foi tornado open source em 2014 por Christoph Pojer com a proposta de "delightful testing", testes prazerosos e com configuracao minima.'),
  P('Marcos importantes:'),
  Bullet('2014: lancamento publico.'),
  Bullet('2016 a 2018: tornou-se padrao em projetos React (era o framework recomendado pelo create-react-app).'),
  Bullet('2020 em diante: o suporte a TypeScript via ts-jest se consolidou.'),
  Bullet('2022: manutencao transferida da Meta para a OpenJS Foundation.'),
  Bullet('Hoje: e o framework de testes JavaScript mais baixado no npm, com mais de 20 milhoes de downloads semanais.'),

  H('2.2 Proposito', HeadingLevel.HEADING_2),
  P('O Jest existe para responder a uma necessidade simples: validar de forma automatica se o codigo continua se comportando como esperado a cada mudanca. Em vez de testar manualmente cada vez que algo e alterado, o desenvolvedor escreve testes uma vez e os reexecuta sempre que necessario, em segundos. Ele substitui ou complementa ferramentas mais antigas como Mocha + Chai + Sinon, agrupando essas responsabilidades em uma unica ferramenta coesa.'),

  H('2.3 Principais Funcionalidades', HeadingLevel.HEADING_2),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2700, 6660],
    borders: tableBorders,
    rows: [
      new TableRow({ children: [cell('Recurso', { w: 2700, fill: 'D5E8F0', bold: true }), cell('Descricao', { w: 6660, fill: 'D5E8F0', bold: true })] }),
      new TableRow({ children: [cell('Test Runner', { w: 2700 }), cell('Executor que descobre arquivos *.test.ts automaticamente, roda em paralelo e exibe resultados coloridos no terminal.', { w: 6660 })] }),
      new TableRow({ children: [cell('Assertions (expect)', { w: 2700 }), cell('API rica: toBe, toEqual, toMatchObject, toThrow, toHaveBeenCalledWith.', { w: 6660 })] }),
      new TableRow({ children: [cell('Mocks', { w: 2700 }), cell('jest.fn(), jest.mock(modulo), jest.spyOn() para isolar dependencias externas.', { w: 6660 })] }),
      new TableRow({ children: [cell('Snapshot Testing', { w: 2700 }), cell('Salva uma "foto" da saida e compara nas execucoes seguintes - util para componentes de UI.', { w: 6660 })] }),
      new TableRow({ children: [cell('Coverage', { w: 2700 }), cell('Relatorio de cobertura embutido com --coverage (linhas, branches, funcoes, statements).', { w: 6660 })] }),
      new TableRow({ children: [cell('Watch Mode', { w: 2700 }), cell('jest --watch reexecuta apenas testes afetados pelas mudancas no codigo.', { w: 6660 })] }),
      new TableRow({ children: [cell('Async', { w: 2700 }), cell('Trabalha nativamente com Promises, async/await e callbacks.', { w: 6660 })] }),
      new TableRow({ children: [cell('Hooks', { w: 2700 }), cell('beforeEach, afterEach, beforeAll, afterAll para preparar e limpar o ambiente.', { w: 6660 })] }),
    ],
  }),
  P(''),

  H('2.4 Facilidades de Uso', HeadingLevel.HEADING_2),
  P('E facil de configurar? Sim. Para JavaScript puro, basta instalar a dependencia (npm install --save-dev jest) e o Jest descobre os arquivos *.test.js automaticamente. Para TypeScript ou React Native exige um pouco mais de configuracao, instalando ts-jest ou usando o preset jest-expo (caso aplicado no nosso projeto).'),
  P('Possui interface grafica? Nao nativamente. O Jest e uma ferramenta de linha de comando. Existem extensoes muito boas para IDEs como VS Code (a extensao "Jest" mostra icones verdes/vermelhos ao lado de cada teste).'),
  P('Precisa de programacao? Sim. Os testes sao codigo em JavaScript ou TypeScript. Nao ha gravador de macros nem interface "no-code".'),

  H('2.5 Vantagens', HeadingLevel.HEADING_2),
  Bullet('Zero-config para casos simples.'),
  Bullet('All-in-one: um pacote substitui runner, assertions, mocks e coverage.'),
  Bullet('Excelente integracao com TypeScript via ts-jest.'),
  Bullet('Mock system poderoso, mocka modulos inteiros com uma linha.'),
  Bullet('Performance: executa testes em paralelo automaticamente.'),
  Bullet('Snapshot testing - recurso quase exclusivo, otimo para regressoes em UI.'),
  Bullet('Comunidade enorme e documentacao oficial muito boa.'),
  Bullet('Watch mode inteligente.'),
  Bullet('Compativel com React Testing Library, Supertest e a maior parte do ecossistema.'),

  H('2.6 Desvantagens', HeadingLevel.HEADING_2),
  Bullet('Sem GUI nativa. Quem prefere ferramentas visuais precisa de extensoes.'),
  Bullet('Mocking pode ficar complexo em apps com muitas dependencias.'),
  Bullet('Configuracao de ES Modules ainda e instavel.'),
  Bullet('Suporte a React Native exige preset especifico (jest-expo).'),
  Bullet('Pode ficar lento em projetos grandes se mal configurado.'),
  Bullet('Nao foi feito para testes E2E - usa-se Cypress ou Playwright.'),

  // 3. Classificacao
  H('3. Classificacao dentro da Estrutura de Testes'),
  H('3.1 Niveis de Teste', HeadingLevel.HEADING_2),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 1700, 5460],
    borders: tableBorders,
    rows: [
      new TableRow({ children: [cell('Nivel', { w: 2200, fill: 'D5E8F0', bold: true }), cell('Aplica?', { w: 1700, fill: 'D5E8F0', bold: true }), cell('Como', { w: 5460, fill: 'D5E8F0', bold: true })] }),
      new TableRow({ children: [cell('Unitario', { w: 2200 }), cell('Sim (foco principal)', { w: 1700 }), cell('Funcoes isoladas, classes, middlewares, reducers. Exemplo no projeto: auth.middleware.test.ts.', { w: 5460 })] }),
      new TableRow({ children: [cell('Integracao', { w: 2200 }), cell('Sim (com Supertest)', { w: 1700 }), cell('Rotas Express completas com mocks de banco e servicos. Exemplo: ml.routes.test.ts.', { w: 5460 })] }),
      new TableRow({ children: [cell('Sistema', { w: 2200 }), cell('Parcialmente', { w: 1700 }), cell('Pode ser combinado com Puppeteer/Playwright, mas nao e o ideal.', { w: 5460 })] }),
      new TableRow({ children: [cell('Aceitacao', { w: 2200 }), cell('Nao', { w: 1700 }), cell('Ferramentas como Cucumber sao mais adequadas.', { w: 5460 })] }),
    ],
  }),
  P(''),

  H('3.2 Tipos de Teste', HeadingLevel.HEADING_2),
  Bullet('Funcional: sim - verifica se uma entrada produz a saida esperada.'),
  Bullet('Regressao: sim - a suite e reexecutada a cada mudanca; quebras aparecem na hora.'),
  Bullet('Seguranca (parcial): sim, no que diz respeito a regras de autorizacao e autenticacao. No nosso projeto testamos que apenas usuarios com a role correta acessam endpoints sensiveis.'),
  Bullet('Nao-funcional, desempenho, carga: nao e o foco. Nesses casos usam-se ferramentas como JMeter, k6 ou Artillery.'),

  H('3.3 Tecnicas de Teste', HeadingLevel.HEADING_2),
  P('Jest e flexivel e suporta as duas tecnicas principais:'),
  P('Caixa-preta (foca em entrada x saida, sem se importar com a estrutura interna):'),
  Bullet('Quando testamos uma rota REST com Supertest, mandando uma requisicao e verificando a resposta, estamos usando caixa-preta.'),
  Bullet('Exemplo no projeto: ml.routes.test.ts testa o endpoint /ml/analytics/overview apenas verificando status HTTP e o body retornado.'),
  P('Caixa-branca (conhece a logica interna, forca caminhos especificos do codigo):'),
  Bullet('Quando testamos a funcao authenticate do middleware, sabemos que ela tem tres caminhos (sem header, header invalido, token expirado) e testamos cada um.'),
  Bullet('Exemplo no projeto: auth.middleware.test.ts cobre cada if/else.'),

  // 4. Demonstracao
  new Paragraph({ children: [new PageBreak()] }),
  H('4. Demonstracao Pratica'),
  P('A demonstracao foi feita no proprio projeto interdisciplinar Vida Mais APP, sistema de questionarios acessiveis para idosos da FATEC. O backend (Node.js + Express + TypeScript) ja tem Jest configurado.'),

  H('4.1 Configuracao do Jest', HeadingLevel.HEADING_2),
  P('Arquivo backend/jest.config.js (resumido):'),
  Code([
    "module.exports = {",
    "  testEnvironment: 'node',",
    "  roots: ['<rootDir>/src'],",
    "  testMatch: ['**/__tests__/**/*.test.ts'],",
    "  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],",
    "  clearMocks: true,",
    "  restoreMocks: true,",
    "  transform: { '^.+\\\\.tsx?$': ['ts-jest', { /* ... */ }] },",
    "  coverageDirectory: 'coverage',",
    "  collectCoverageFrom: [",
    "    'src/**/*.ts',",
    "    '!src/**/*.d.ts',",
    "    '!src/prisma/**'",
    "  ]",
    "};",
  ]),
  P('Pontos importantes desta configuracao:'),
  Bullet('testEnvironment: node - simula ambiente Node, sem DOM.'),
  Bullet('testMatch - convencao: arquivos dentro de pastas __tests__ terminados em .test.ts.'),
  Bullet('clearMocks: true - limpa mocks entre testes para evitar contaminacao.'),
  Bullet('transform - usa ts-jest para compilar TypeScript em tempo de execucao.'),
  Bullet('collectCoverageFrom - lista o que entra e o que NAO entra no relatorio de cobertura.'),

  H('4.2 Exemplo 1 - Teste Unitario (Caixa-branca)', HeadingLevel.HEADING_2),
  P('Arquivo backend/src/__tests__/middleware/auth.middleware.test.ts. Testa o middleware que valida o JWT.'),
  Code([
    "describe('authenticate middleware', () => {",
    "  beforeEach(() => jest.clearAllMocks());",
    "",
    "  it('deve chamar next() com token valido', () => {",
    "    const token = jwt.sign({ id: 'u-1', email: 'a@b.com', role: 'ADMIN' }, SECRET);",
    "    const req = { headers: { authorization: `Bearer ${token}` } } as AuthRequest;",
    "    const res = mockRes();",
    "    const mockNext = jest.fn();",
    "",
    "    authenticate(req, res, mockNext);",
    "",
    "    expect(mockNext).toHaveBeenCalledWith();",
    "    expect(req.user).toMatchObject({ id: 'u-1', role: 'ADMIN' });",
    "  });",
    "",
    "  it('deve retornar 401 sem header Authorization', () => {",
    "    const req = { headers: {} } as AuthRequest;",
    "    const res = mockRes();",
    "    const mockNext = jest.fn();",
    "",
    "    authenticate(req, res, mockNext);",
    "",
    "    expect(res.status).toHaveBeenCalledWith(401);",
    "    expect(res.json).toHaveBeenCalledWith({ error: 'Token nao fornecido' });",
    "    expect(mockNext).not.toHaveBeenCalled();",
    "  });",
    "});",
  ]),
  P('O que esta sendo demonstrado:'),
  Bullet('describe agrupa testes do mesmo assunto.'),
  Bullet('it declara um caso de teste com nome legivel em portugues - vira documentacao viva.'),
  Bullet('expect faz a assercao. Note os matchers: toHaveBeenCalledWith, toMatchObject, not.toHaveBeenCalled.'),
  Bullet('jest.fn() cria uma funcao espia para verificar se next() foi (ou nao) chamada.'),
  Bullet('beforeEach zera os mocks entre testes - evita que um teste influencie o outro.'),

  H('4.3 Exemplo 2 - Teste de Integracao (Caixa-preta)', HeadingLevel.HEADING_2),
  P('Arquivo backend/src/__tests__/ml.routes.test.ts. Testa a rota /ml/analytics/overview, com banco e ML Service mockados.'),
  Code([
    "jest.mock('@prisma/client', () => ({ /* mock do Prisma */ }));",
    "jest.mock('axios');",
    "const mockedAxios = axios as jest.Mocked<typeof axios>;",
    "",
    "describe('GET /ml/analytics/overview', () => {",
    "  it('deve retornar overview para ADMIN', async () => {",
    "    mockedAxios.get.mockResolvedValue({",
    "      data: { totalAlunos: 100, totalTurmas: 10, mediaRespostas: 75 }",
    "    });",
    "",
    "    const res = await request(app)",
    "      .get('/ml/analytics/overview')",
    "      .set(authHeader(adminToken));",
    "",
    "    expect(res.status).toBe(200);",
    "    expect(res.body).toHaveProperty('totalAlunos');",
    "  });",
    "",
    "  it('deve retornar 403 para ALUNO', async () => {",
    "    const res = await request(app)",
    "      .get('/ml/analytics/overview')",
    "      .set(authHeader(alunoToken));",
    "    expect(res.status).toBe(403);",
    "  });",
    "",
    "  it('deve retornar 401 sem autenticacao', async () => {",
    "    const res = await request(app).get('/ml/analytics/overview');",
    "    expect(res.status).toBe(401);",
    "  });",
    "});",
  ]),
  P('Pontos importantes:'),
  Bullet('jest.mock(axios) intercepta toda chamada HTTP - o teste roda sem precisar que o Flask esteja rodando.'),
  Bullet('supertest faz uma requisicao real a app Express em memoria - testa middleware, controller e response juntos.'),
  Bullet('Cobre o RBAC do projeto: ADMIN passa, ALUNO recebe 403, sem token recebe 401.'),

  H('4.4 Como executar', HeadingLevel.HEADING_2),
  Code([
    "cd backend",
    "npm test                                                    # roda toda a suite",
    "npm test -- src/__tests__/middleware/auth.middleware.test.ts  # roda um arquivo",
    "npm run test:watch                                          # modo watch",
    "npm run test:coverage                                       # com cobertura",
  ]),

  H('4.5 Saida esperada (terminal Jest)', HeadingLevel.HEADING_2),
  Code([
    " PASS  src/__tests__/middleware/auth.middleware.test.ts",
    "  authenticate middleware",
    "    ok deve chamar next() com token valido (4 ms)",
    "    ok deve retornar 401 sem header Authorization (1 ms)",
    "    ok deve retornar 401 com token malformado (2 ms)",
    "    ok deve retornar 401 com token expirado (1 ms)",
    "    ok deve retornar 401 sem prefixo Bearer",
    "  authorize middleware",
    "    ok deve chamar next() quando role e permitida",
    "    ok deve retornar 403 quando role nao e permitida (1 ms)",
    "    ok deve retornar 401 quando req.user esta ausente",
    "    ok deve aceitar multiplos roles",
    "",
    " PASS  src/__tests__/ml.routes.test.ts",
    "  GET /ml/analytics/overview",
    "    ok deve retornar overview para ADMIN (45 ms)",
    "    ok deve retornar overview para PROF (3 ms)",
    "    ok deve retornar 403 para ALUNO (2 ms)",
    "    ok deve retornar 401 sem autenticacao (1 ms)",
    "",
    "Test Suites: 2 passed, 2 total",
    "Tests:       13 passed, 13 total",
    "Time:        2.847 s",
  ]),

  // 5. Impressoes
  new Paragraph({ children: [new PageBreak()] }),
  H('5. Impressoes Pessoais'),
  P('O que achei da ferramenta? Achei muito boa. O Jest tem uma vantagem importante: ele "sai do caminho". Voce instala, escreve describe/it/expect e funciona. Nao precisa montar pipeline de execucao, importar runner separado, configurar reporter - ja vem tudo.'),
  P('Foi facil ou dificil aprender? A sintaxe basica e facil em poucas horas. As funcoes describe, it, expect e beforeEach sao claras e leem como ingles. O que leva mais tempo e dominar mocks - especialmente quando se precisa mockar modulos com importacoes complexas, como o Prisma Client. No nosso projeto foi necessario criar um arquivo prisma.mock.ts especifico so para isso.'),
  P('E util para profissionais da area? Sim, sem duvida. Hoje, qualquer vaga de desenvolvedor JavaScript ou TypeScript seria espera familiaridade com testes automatizados, e Jest e o padrao de fato. Em entrevistas tecnicas, e comum perguntar sobre matchers do expect, diferenca entre mock e spy, e como testar codigo assincrono. Conhecer Jest paga retorno claro.'),
  P('Pontos que mais marcaram:'),
  Bullet('Confianca ao mexer no codigo. Depois que existe uma boa suite, voce refatora sem medo: se quebrar, o teste avisa.'),
  Bullet('Deteccao precoce de bugs. Ao testar o RBAC do nosso sistema, conseguimos pegar um caso onde authorize nao retornava 401 corretamente quando req.user estava ausente.'),
  Bullet('Velocidade. A suite do backend toda roda em menos de 3 segundos - isso encoraja a testar mais.'),

  // 6. Reflexao
  H('6. Reflexao (Questao Final)'),
  P('Utilizaria esta ferramenta no projeto interdisciplinar? Por que?'),
  P('Sim - e na pratica ja esta sendo usada. O projeto Vida Mais APP ja adotou Jest desde o inicio, tanto no backend (Node.js + Express + TypeScript) quanto no app mobile (React Native com Expo). As razoes sao:'),
  Bullet('A stack pede. Como o projeto inteiro e JS/TS, Jest e a escolha natural - nao precisa misturar ferramentas de linguagens diferentes.'),
  Bullet('Tem regras de negocio criticas. O sistema controla acesso por papeis (ADMIN, PROF, ALUNO) e processa respostas de questionarios que viram dados academicos. Um bug aqui pode comprometer a credibilidade da pesquisa - testes automatizados sao uma rede de protecao barata.'),
  Bullet('O usuario-alvo e idoso. Por motivo de acessibilidade, nao da para depender so de testes manuais. Os testes automatizados garantem que regressoes nao cheguem ao usuario final.'),
  Bullet('Permite integracao continua. Com Jest configurado, e trivial rodar a suite automaticamente em cada git push (via GitHub Actions, por exemplo), bloqueando merges que quebrem comportamento existente.'),
  Bullet('Documentacao viva. Os testes mostram como o sistema deve se comportar. Um novo membro da equipe le o auth.middleware.test.ts e entende imediatamente o que authenticate deve fazer.'),
  P('A unica coisa que adicionaria, para complementar o Jest, seria uma ferramenta de testes E2E (como Cypress ou Detox) para validar o fluxo completo do usuario no app mobile. Jest cobre unidades e integracao; E2E cobriria a experiencia ponta a ponta - juntas, formariam a "piramide de testes" recomendada pela engenharia de software moderna.'),

  // Referencias
  H('Referencias'),
  Bullet('Documentacao oficial: https://jestjs.io'),
  Bullet('Repositorio oficial: https://github.com/jestjs/jest'),
  Bullet('Mantenedor atual: OpenJS Foundation.'),
  Bullet('Codigo fonte do projeto Vida Mais APP - testes em backend/src/__tests__/ e mobile/src/__tests__/.'),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Calibri', color: '1E2761' },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Calibri', color: '1E2761' },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: docChildren,
  }],
});

console.log('Gerando Trabalho_Jest.docx ...');
Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, 'Trabalho_Jest.docx');
  fs.writeFileSync(out, buf);
  console.log('OK: ' + out);
  gerarPptx();
});

// ============================================================================
// 2) APRESENTACAO POWERPOINT
// ============================================================================
function gerarPptx() {
  const PptxGenJS = require('pptxgenjs');
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  const NAVY = '1E2761';
  const ICE = 'CADCFC';
  const DARK = '212121';
  const ACCENT = 'F96167';
  const LIGHT = 'F5F7FA';

  console.log('Gerando Apresentacao_Jest.pptx ...');

  // helpers de slide
  function addTitle(slide, txt) {
    slide.addText(txt, { x: 0.5, y: 0.4, w: 12.3, h: 0.9,
      fontFace: 'Calibri', fontSize: 32, bold: true, color: NAVY });
  }

  // SLIDE 1 - capa
  let s = pptx.addSlide();
  s.background = { color: NAVY };
  s.addText('JEST', { x: 0.5, y: 1.8, w: 12.3, h: 1.6,
    fontFace: 'Calibri', fontSize: 96, bold: true, color: 'FFFFFF', align: 'center' });
  s.addText('Framework de Testes Automatizados', { x: 0.5, y: 3.4, w: 12.3, h: 0.6,
    fontFace: 'Calibri', fontSize: 28, italic: true, color: ICE, align: 'center' });
  s.addText('Trabalho de Qualidade e Testes de Software', { x: 0.5, y: 5.4, w: 12.3, h: 0.5,
    fontFace: 'Calibri', fontSize: 22, color: 'FFFFFF', align: 'center' });
  s.addText('Vinicius Santos | FATEC | Abril 2026', { x: 0.5, y: 5.9, w: 12.3, h: 0.5,
    fontFace: 'Calibri', fontSize: 18, color: ICE, align: 'center' });

  // SLIDE 2 - Identificacao
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '1. Identificacao');
  s.addShape('rect', { x: 0.5, y: 1.5, w: 5.5, h: 5.4, fill: { color: NAVY }, line: { type: 'none' } });
  s.addText('Jest', { x: 0.5, y: 2.4, w: 5.5, h: 1.4,
    fontFace: 'Calibri', fontSize: 72, bold: true, color: 'FFFFFF', align: 'center' });
  s.addText('jestjs.io', { x: 0.5, y: 3.7, w: 5.5, h: 0.5,
    fontFace: 'Calibri', fontSize: 18, italic: true, color: ICE, align: 'center' });
  s.addText('OpenJS Foundation', { x: 0.5, y: 5.6, w: 5.5, h: 0.4,
    fontFace: 'Calibri', fontSize: 16, color: ICE, align: 'center' });
  const id_items = [
    { t: 'Tipo', d: 'Framework de testes para JavaScript / TypeScript.' },
    { t: 'Origem', d: 'Criado pelo Facebook em 2014.' },
    { t: 'Hoje', d: 'Mantido pela OpenJS Foundation desde 2022.' },
    { t: 'Versao usada', d: '29.7.0 (no projeto Vida Mais APP).' },
    { t: 'Caracteristica', d: 'All-in-one: runner, assertions, mocks, coverage.' },
  ];
  id_items.forEach((it, i) => {
    const y = 1.7 + i * 1.0;
    s.addText(it.t, { x: 6.4, y, w: 6.5, h: 0.35, fontFace: 'Calibri', fontSize: 18, bold: true, color: NAVY });
    s.addText(it.d, { x: 6.4, y: y + 0.35, w: 6.5, h: 0.55, fontFace: 'Calibri', fontSize: 14, color: DARK });
  });

  // SLIDE 3 - Funcionalidades
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '2. Principais Funcionalidades');
  const funcs = [
    { t: 'Test Runner', d: 'Descobre e roda *.test.ts em paralelo.' },
    { t: 'expect (assertions)', d: 'API rica: toBe, toEqual, toMatchObject, toThrow.' },
    { t: 'Mocks', d: 'jest.fn, jest.mock, jest.spyOn - isola dependencias.' },
    { t: 'Snapshot Testing', d: 'Compara saida com uma "foto" anterior - util em UI.' },
    { t: 'Coverage', d: 'Relatorio embutido com flag --coverage.' },
    { t: 'Watch Mode', d: 'Reexecuta apenas o que mudou no codigo.' },
  ];
  funcs.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 6.4;
    const y = 1.6 + row * 1.7;
    s.addShape('roundRect', { x, y, w: 6.0, h: 1.5, fill: { color: LIGHT }, line: { color: NAVY, width: 1 }, rectRadius: 0.1 });
    s.addText(f.t, { x: x + 0.2, y: y + 0.15, w: 5.6, h: 0.45, fontFace: 'Calibri', fontSize: 18, bold: true, color: NAVY });
    s.addText(f.d, { x: x + 0.2, y: y + 0.65, w: 5.6, h: 0.7, fontFace: 'Calibri', fontSize: 13, color: DARK });
  });

  // SLIDE 4 - Vantagens vs Desvantagens
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '3. Vantagens e Desvantagens');
  // verde
  s.addShape('roundRect', { x: 0.5, y: 1.5, w: 6.0, h: 5.4, fill: { color: 'E8F5E9' }, line: { type: 'none' }, rectRadius: 0.1 });
  s.addText('Vantagens', { x: 0.7, y: 1.6, w: 5.6, h: 0.5, fontFace: 'Calibri', fontSize: 22, bold: true, color: '2E7D32' });
  s.addText([
    { text: 'Zero-config para casos simples.', options: { bullet: true } },
    { text: 'All-in-one (runner + mocks + coverage).', options: { bullet: true } },
    { text: 'Excelente integracao com TypeScript.', options: { bullet: true } },
    { text: 'Mock system poderoso.', options: { bullet: true } },
    { text: 'Roda em paralelo.', options: { bullet: true } },
    { text: 'Snapshot testing.', options: { bullet: true } },
    { text: 'Comunidade enorme e doc oficial otima.', options: { bullet: true } },
  ], { x: 0.8, y: 2.2, w: 5.4, h: 4.5, fontFace: 'Calibri', fontSize: 14, color: DARK, paraSpaceAfter: 6 });

  // vermelho
  s.addShape('roundRect', { x: 6.8, y: 1.5, w: 6.0, h: 5.4, fill: { color: 'FFEBEE' }, line: { type: 'none' }, rectRadius: 0.1 });
  s.addText('Desvantagens', { x: 7.0, y: 1.6, w: 5.6, h: 0.5, fontFace: 'Calibri', fontSize: 22, bold: true, color: 'C62828' });
  s.addText([
    { text: 'Sem GUI nativa - apenas terminal.', options: { bullet: true } },
    { text: 'Mocking pode ficar complexo.', options: { bullet: true } },
    { text: 'ES Modules ainda da trabalho.', options: { bullet: true } },
    { text: 'React Native exige preset (jest-expo).', options: { bullet: true } },
    { text: 'Pode ficar lento sem otimizacao.', options: { bullet: true } },
    { text: 'Nao foi feito para E2E (use Cypress).', options: { bullet: true } },
  ], { x: 7.1, y: 2.2, w: 5.4, h: 4.5, fontFace: 'Calibri', fontSize: 14, color: DARK, paraSpaceAfter: 6 });

  // SLIDE 5 - Classificacao
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '4. Classificacao na Estrutura de Testes');
  // piramide simulada
  s.addShape('rect', { x: 1.0, y: 5.5, w: 5.0, h: 0.8, fill: { color: NAVY }, line: { type: 'none' } });
  s.addText('Unitario   (foco principal)', { x: 1.0, y: 5.5, w: 5.0, h: 0.8, fontFace: 'Calibri', fontSize: 18, bold: true, color: 'FFFFFF', align: 'center' });
  s.addShape('rect', { x: 1.5, y: 4.5, w: 4.0, h: 0.8, fill: { color: '1C7293' }, line: { type: 'none' } });
  s.addText('Integracao   (com Supertest)', { x: 1.5, y: 4.5, w: 4.0, h: 0.8, fontFace: 'Calibri', fontSize: 16, bold: true, color: 'FFFFFF', align: 'center' });
  s.addShape('rect', { x: 2.0, y: 3.5, w: 3.0, h: 0.8, fill: { color: ICE }, line: { type: 'none' } });
  s.addText('Sistema  (parcial)', { x: 2.0, y: 3.5, w: 3.0, h: 0.8, fontFace: 'Calibri', fontSize: 14, color: DARK, align: 'center' });
  s.addShape('rect', { x: 2.5, y: 2.5, w: 2.0, h: 0.8, fill: { color: 'EAEAEA' }, line: { type: 'none' } });
  s.addText('Aceitacao  (nao)', { x: 2.5, y: 2.5, w: 2.0, h: 0.8, fontFace: 'Calibri', fontSize: 12, color: '888888', align: 'center', italic: true });

  // direita: tipos e tecnicas
  s.addText('Tipos suportados', { x: 7.0, y: 1.6, w: 5.8, h: 0.4, fontFace: 'Calibri', fontSize: 18, bold: true, color: NAVY });
  s.addText([
    { text: 'Funcional: sim.', options: { bullet: true } },
    { text: 'Regressao: sim.', options: { bullet: true } },
    { text: 'Seguranca (autorizacao): parcial - sim.', options: { bullet: true } },
    { text: 'Nao-funcional / desempenho: nao e o foco.', options: { bullet: true } },
  ], { x: 7.0, y: 2.0, w: 5.8, h: 1.8, fontFace: 'Calibri', fontSize: 14, color: DARK, paraSpaceAfter: 4 });

  s.addText('Tecnicas', { x: 7.0, y: 4.0, w: 5.8, h: 0.4, fontFace: 'Calibri', fontSize: 18, bold: true, color: NAVY });
  s.addText([
    { text: 'Caixa-preta: testes via API (ml.routes.test.ts).', options: { bullet: true } },
    { text: 'Caixa-branca: ramos do codigo (auth.middleware.test.ts).', options: { bullet: true } },
  ], { x: 7.0, y: 4.4, w: 5.8, h: 1.5, fontFace: 'Calibri', fontSize: 14, color: DARK, paraSpaceAfter: 4 });

  // SLIDE 6 - Configuracao no projeto
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '5. Demo: Configuracao no Vida Mais APP');
  s.addText('backend/jest.config.js', { x: 0.5, y: 1.4, w: 12.3, h: 0.4, fontFace: 'Calibri', fontSize: 14, italic: true, color: '666666' });
  s.addShape('roundRect', { x: 0.5, y: 1.85, w: 12.3, h: 4.6, fill: { color: '1E1E1E' }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText([
    "module.exports = {",
    "  testEnvironment: 'node',",
    "  roots: ['<rootDir>/src'],",
    "  testMatch: ['**/__tests__/**/*.test.ts'],",
    "  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],",
    "  clearMocks: true,",
    "  restoreMocks: true,",
    "  transform: {",
    "    '^.+\\\\.tsx?$': ['ts-jest', { /* ... */ }]",
    "  },",
    "  collectCoverageFrom: [",
    "    'src/**/*.ts',",
    "    '!src/prisma/**'",
    "  ]",
    "};",
  ].join('\n'), { x: 0.7, y: 2.0, w: 11.9, h: 4.3, fontFace: 'Consolas', fontSize: 14, color: 'D4D4D4' });
  s.addText('Caracteristica: configuracao toda em ~30 linhas - uma das mais enxutas do mercado.',
    { x: 0.5, y: 6.6, w: 12.3, h: 0.4, fontFace: 'Calibri', fontSize: 14, italic: true, color: '666666' });

  // SLIDE 7 - Teste unitario
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '6. Demo: Teste Unitario (Caixa-branca)');
  s.addText('auth.middleware.test.ts - valida o JWT do nosso RBAC',
    { x: 0.5, y: 1.4, w: 12.3, h: 0.4, fontFace: 'Calibri', fontSize: 14, italic: true, color: '666666' });
  s.addShape('roundRect', { x: 0.5, y: 1.85, w: 12.3, h: 5.0, fill: { color: '1E1E1E' }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText([
    "describe('authenticate middleware', () => {",
    "  beforeEach(() => jest.clearAllMocks());",
    "",
    "  it('deve chamar next() com token valido', () => {",
    "    const token = jwt.sign({ id: 'u-1', role: 'ADMIN' }, SECRET);",
    "    const req = { headers: { authorization: `Bearer ${token}` } };",
    "    authenticate(req, mockRes(), mockNext);",
    "    expect(mockNext).toHaveBeenCalledWith();",
    "    expect(req.user).toMatchObject({ id: 'u-1', role: 'ADMIN' });",
    "  });",
    "",
    "  it('deve retornar 401 sem header Authorization', () => {",
    "    const req = { headers: {} };",
    "    const res = mockRes();",
    "    authenticate(req, res, mockNext);",
    "    expect(res.status).toHaveBeenCalledWith(401);",
    "    expect(mockNext).not.toHaveBeenCalled();",
    "  });",
    "});",
  ].join('\n'), { x: 0.7, y: 2.0, w: 11.9, h: 4.7, fontFace: 'Consolas', fontSize: 13, color: 'D4D4D4' });

  // SLIDE 8 - Teste de integracao
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '7. Demo: Teste de Integracao (Caixa-preta)');
  s.addText('ml.routes.test.ts - testa rota REST com Supertest e axios mockado',
    { x: 0.5, y: 1.4, w: 12.3, h: 0.4, fontFace: 'Calibri', fontSize: 14, italic: true, color: '666666' });
  s.addShape('roundRect', { x: 0.5, y: 1.85, w: 12.3, h: 5.0, fill: { color: '1E1E1E' }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText([
    "jest.mock('axios');",
    "const mockedAxios = axios as jest.Mocked<typeof axios>;",
    "",
    "describe('GET /ml/analytics/overview', () => {",
    "  it('deve retornar overview para ADMIN', async () => {",
    "    mockedAxios.get.mockResolvedValue({",
    "      data: { totalAlunos: 100, totalTurmas: 10 }",
    "    });",
    "    const res = await request(app)",
    "      .get('/ml/analytics/overview')",
    "      .set(authHeader(adminToken));",
    "    expect(res.status).toBe(200);",
    "  });",
    "",
    "  it('deve retornar 403 para ALUNO', async () => {",
    "    const res = await request(app)",
    "      .get('/ml/analytics/overview')",
    "      .set(authHeader(alunoToken));",
    "    expect(res.status).toBe(403);",
    "  });",
    "});",
  ].join('\n'), { x: 0.7, y: 2.0, w: 11.9, h: 4.7, fontFace: 'Consolas', fontSize: 13, color: 'D4D4D4' });

  // SLIDE 9 - Saida e comandos
  s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
  addTitle(s, '8. Saida do Terminal e Comandos');
  s.addShape('roundRect', { x: 0.5, y: 1.5, w: 7.5, h: 5.4, fill: { color: '0C0C0C' }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText([
    " PASS  src/__tests__/middleware/auth.middleware.test.ts",
    "   authenticate middleware",
    "     [ok] deve chamar next() com token valido (4 ms)",
    "     [ok] deve retornar 401 sem header Authorization (1 ms)",
    "     [ok] deve retornar 401 com token expirado (1 ms)",
    "   authorize middleware",
    "     [ok] deve chamar next() quando role e permitida",
    "     [ok] deve retornar 403 quando role nao e permitida",
    "",
    " PASS  src/__tests__/ml.routes.test.ts",
    "   GET /ml/analytics/overview",
    "     [ok] deve retornar overview para ADMIN (45 ms)",
    "     [ok] deve retornar 403 para ALUNO (2 ms)",
    "     [ok] deve retornar 401 sem autenticacao (1 ms)",
    "",
    " Test Suites: 2 passed, 2 total",
    " Tests:       13 passed, 13 total",
    " Time:        2.847 s",
  ].join('\n'), { x: 0.7, y: 1.65, w: 7.1, h: 5.1, fontFace: 'Consolas', fontSize: 11, color: '8AE234' });

  s.addText('Comandos do dia a dia', { x: 8.3, y: 1.6, w: 4.6, h: 0.5, fontFace: 'Calibri', fontSize: 18, bold: true, color: NAVY });
  s.addShape('roundRect', { x: 8.3, y: 2.15, w: 4.6, h: 0.7, fill: { color: LIGHT }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText('npm test', { x: 8.4, y: 2.2, w: 4.4, h: 0.6, fontFace: 'Consolas', fontSize: 14, color: NAVY, bold: true });
  s.addShape('roundRect', { x: 8.3, y: 3.0, w: 4.6, h: 0.7, fill: { color: LIGHT }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText('npm test -- arquivo.ts', { x: 8.4, y: 3.05, w: 4.4, h: 0.6, fontFace: 'Consolas', fontSize: 14, color: NAVY, bold: true });
  s.addShape('roundRect', { x: 8.3, y: 3.85, w: 4.6, h: 0.7, fill: { color: LIGHT }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText('npm run test:watch', { x: 8.4, y: 3.9, w: 4.4, h: 0.6, fontFace: 'Consolas', fontSize: 14, color: NAVY, bold: true });
  s.addShape('roundRect', { x: 8.3, y: 4.7, w: 4.6, h: 0.7, fill: { color: LIGHT }, line: { type: 'none' }, rectRadius: 0.05 });
  s.addText('npm run test:coverage', { x: 8.4, y: 4.75, w: 4.4, h: 0.6, fontFace: 'Consolas', fontSize: 14, color: NAVY, bold: true });
  s.addText('Suite roda em ~3s', { x: 8.3, y: 5.7, w: 4.6, h: 0.5, fontFace: 'Calibri', fontSize: 14, italic: true, color: '666666' });

  // SLIDE 10 - Reflexao
  s = pptx.addSlide();
  s.background = { color: NAVY };
  s.addText('Usaria no projeto interdisciplinar?', { x: 0.5, y: 0.6, w: 12.3, h: 0.8,
    fontFace: 'Calibri', fontSize: 28, bold: true, color: 'FFFFFF', align: 'center' });
  s.addText('Sim - e ja esta em producao no Vida Mais APP', { x: 0.5, y: 1.5, w: 12.3, h: 0.7,
    fontFace: 'Calibri', fontSize: 24, italic: true, color: ICE, align: 'center' });

  const motivos = [
    { n: '1', t: 'Stack pede', d: 'O projeto e 100% JS/TS - Jest e a escolha natural.' },
    { n: '2', t: 'Negocio critico', d: 'RBAC e dados academicos - testes sao protecao barata.' },
    { n: '3', t: 'Usuario idoso', d: 'Acessibilidade exige seguranca contra regressoes.' },
  ];
  motivos.forEach((m, i) => {
    const x = 0.5 + i * 4.3;
    s.addShape('roundRect', { x, y: 2.7, w: 4.0, h: 3.5, fill: { color: 'FFFFFF' }, line: { type: 'none' }, rectRadius: 0.15 });
    s.addShape('ellipse', { x: x + 1.5, y: 2.9, w: 1.0, h: 1.0, fill: { color: ACCENT }, line: { type: 'none' } });
    s.addText(m.n, { x: x + 1.5, y: 2.9, w: 1.0, h: 1.0, fontFace: 'Calibri', fontSize: 36, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    s.addText(m.t, { x: x + 0.2, y: 4.05, w: 3.6, h: 0.5, fontFace: 'Calibri', fontSize: 20, bold: true, color: NAVY, align: 'center' });
    s.addText(m.d, { x: x + 0.3, y: 4.6, w: 3.4, h: 1.5, fontFace: 'Calibri', fontSize: 14, color: DARK, align: 'center' });
  });

  s.addText('Para complementar: adicionar Cypress ou Detox para E2E e fechar a piramide de testes.',
    { x: 0.5, y: 6.5, w: 12.3, h: 0.5, fontFace: 'Calibri', fontSize: 16, italic: true, color: ICE, align: 'center' });

  pptx.writeFile({ fileName: path.join(__dirname, 'Apresentacao_Jest.pptx') }).then(name => {
    console.log('OK: ' + name);
    console.log('Pronto.');
  });
}
