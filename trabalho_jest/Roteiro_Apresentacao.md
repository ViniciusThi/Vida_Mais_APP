# Roteiro de Apresentação - Jest
## Trabalho de Qualidade e Testes de Software

**Duração alvo:** 7 a 9 minutos
**Total de slides:** 10

---

## SLIDE 1 - Capa (cerca de 30s)

**Tela:** Título "Jest - Framework de Testes Automatizados", seu nome, FATEC, disciplina.

**O que falar:**

> "Boa noite a todos. Meu nome é Vinicius e o trabalho que vou apresentar é sobre o Jest, ferramenta de automação de testes que escolhi. A apresentação vou dividir em seis partes: identificação, caracterização, classificação dentro da estrutura de testes, uma demonstração prática usando o nosso próprio projeto interdisciplinar, minhas impressões pessoais e a reflexão final."

---

## SLIDE 2 - Identificação (cerca de 45s)

**Tela:** Logo Jest, "Framework all-in-one para JavaScript e TypeScript", mantenedor (OpenJS Foundation, originalmente Meta), versão 29.7.0.

**O que falar:**

> "Jest é um framework de testes automatizados para JavaScript e TypeScript. Foi criado pelo Facebook, hoje Meta, em 2014, e desde 2022 é mantido pela OpenJS Foundation, a mesma fundação que cuida do Node.js."
>
> "A grande característica que destaca o Jest é o fato de ser **all-in-one** - em uma única dependência ele entrega tudo o que se precisa para testar: o executor, a biblioteca de asserções, o sistema de mocks e o relatório de cobertura. Isso evita a complexidade de juntar Mocha, Chai e Sinon, por exemplo, que era o padrão antes."

---

## SLIDE 3 - Pesquisa: Funcionalidades (cerca de 1 min)

**Tela:** Lista das principais funcionalidades em ícones (test runner, expect, mocks, snapshots, coverage, watch mode).

**O que falar:**

> "Vou destacar as funcionalidades que mais fazem diferença no dia a dia."
>
> "**Primeiro**, ele tem o test runner que descobre arquivos de teste automaticamente - basta seguir uma convenção tipo `nome.test.ts`."
>
> "**Segundo**, a API `expect` com matchers ricos: `toBe`, `toEqual`, `toHaveBeenCalledWith`. A leitura é quase como inglês."
>
> "**Terceiro**, mocks integrados: dá para mockar uma função, um espião, ou um módulo inteiro com uma linha. Isso é o que permite testar uma rota sem precisar de banco de dados real."
>
> "**Quarto**, o coverage embutido. Eu rodo `npm run test:coverage` e ele mostra quantas linhas, branches e funções foram cobertas pelos testes."
>
> "**Quinto**, o watch mode, que reexecuta apenas o que mudou - ideal para TDD."

---

## SLIDE 4 - Pesquisa: Vantagens e Desvantagens (cerca de 1 min)

**Tela:** Tabela com duas colunas: Vantagens em verde, Desvantagens em vermelho.

**O que falar:**

> "Como vantagens principais: zero-config para casos simples, ótima integração com TypeScript via ts-jest, mocking poderoso, comunidade enorme e documentação muito boa."
>
> "Como desvantagens: não tem GUI nativa - é puro terminal e código, então quem quer ferramenta visual precisa de extensão de IDE. Configurar para React Native ou ES Modules dá um pouco de trabalho. E não foi feito para testes E2E - aí o ecossistema usa Cypress ou Playwright."
>
> "Mas é uma ferramenta voltada para desenvolvedor, não para QA manual."

---

## SLIDE 5 - Classificação na Estrutura de Testes (cerca de 1 min)

**Tela:** Pirâmide de testes destacando "Unitário" (foco principal) e "Integração" (com Supertest); "Sistema/E2E" tachado.

**O que falar:**

> "Sobre os níveis de teste, o Jest é forte principalmente em **unitário**, que é o foco original. Combinado com a biblioteca Supertest, ele também faz **integração** muito bem - testando rotas Express completas, por exemplo."
>
> "Para sistema e aceitação, ele não é o ideal."
>
> "Quanto aos tipos: cobre testes funcionais, de regressão e parte de segurança - principalmente regras de autorização. Não cobre não-funcionais, como performance e carga - nesses casos uso JMeter ou k6."
>
> "E sobre técnicas, é flexível: faz **caixa-preta** quando testo uma rota só pelo input/output, e **caixa-branca** quando exercito cada ramo de um if/else dentro de uma função."

---

## SLIDE 6 - Demonstração: Configuração no nosso projeto (cerca de 45s)

**Tela:** Print do `jest.config.js` do backend.

**O que falar:**

> "A demonstração foi feita no próprio projeto interdisciplinar, o Vida Mais APP, um sistema de questionários acessíveis para idosos que estamos desenvolvendo na FATEC."
>
> "Esta é a configuração do Jest no backend. Pontos importantes: ambiente Node, convenção de arquivos `.test.ts` dentro de pastas `__tests__`, transformação via `ts-jest` para TypeScript, e a pasta de cobertura."
>
> "O que quero destacar é que essa configuração toda cabe em 30 linhas - é uma das ferramentas com a configuração mais enxuta que já usei."

---

## SLIDE 7 - Demonstração: Teste Unitário (cerca de 1min 15s)

**Tela:** Trecho de código do `auth.middleware.test.ts`.

**O que falar:**

> "Aqui está um teste unitário real do projeto. Ele testa o middleware que valida o JWT em cada requisição."
>
> "**Linha do `describe`**: agrupa todos os testes do `authenticate`. **Linha do `it`**: cada teste tem uma frase em português que descreve o caso. Isso vira documentação viva: alguém novo no projeto lê e já entende o que a função deve fazer."
>
> "Aqui eu uso `jest.fn()` para criar uma função espiã que substitui o `next()` do Express. Depois eu chamo o middleware e verifico, com `expect`, que o `next()` foi chamado e que `req.user` foi preenchido com os dados do token."
>
> "É um teste de **caixa-branca** porque eu sei que a função tem três caminhos possíveis - sem header, com header inválido, com token expirado - e eu testo cada um deles separadamente."

---

## SLIDE 8 - Demonstração: Teste de Integração (cerca de 1min 15s)

**Tela:** Trecho de código do `ml.routes.test.ts`.

**O que falar:**

> "Este é um teste de integração. Ele dispara uma requisição HTTP real, via Supertest, contra a aplicação Express - mas com o banco e o ML Service mockados."
>
> "Veja o `jest.mock('axios')` aqui em cima: com essa única linha, todo HTTP client é interceptado. Posso simular sucesso, erro 500, timeout - sem nunca subir o serviço de Machine Learning de verdade. Isso é poderoso."
>
> "O teste verifica três cenários do RBAC do nosso sistema: ADMIN deve receber 200, ALUNO deve receber 403 porque não tem permissão, e sem token deve receber 401. Cobrimos com cinco linhas o que seria um trabalho enorme manualmente."
>
> "Esse aqui é **caixa-preta**: eu não me importo com o que acontece dentro da rota - olho só status HTTP e body retornado."

---

## SLIDE 9 - Saída do Terminal e Comandos (cerca de 45s)

**Tela:** Print da saída do `npm test` (com os PASS verdes do Jest).

**O que falar:**

> "Esta é a saída do `npm test`. O Jest exibe cada describe e cada it, com check verde para passou e X vermelho para falhou. No final, um sumário: 13 testes, 2 suites, em menos de 3 segundos."
>
> "Os comandos do dia a dia são quatro:"
>
> - "`npm test` - roda tudo."
> - "`npm test -- arquivo.test.ts` - roda um arquivo só."
> - "`npm run test:watch` - modo desenvolvimento."
> - "`npm run test:coverage` - gera o relatório HTML de cobertura."

---

## SLIDE 10 - Reflexão e Conclusão (cerca de 45s)

**Tela:** "Usaríamos no projeto?" "Sim - e já está em produção." Lista de 3 motivos principais.

**O que falar:**

> "Para fechar, a pergunta da reflexão: usaria Jest no meu projeto interdisciplinar?"
>
> "**Sim, e na prática já está sendo usado**. Três motivos centrais:"
>
> "**Primeiro**, a stack inteira é JavaScript e TypeScript - Jest é a escolha natural sem misturar ferramentas de linguagens diferentes."
>
> "**Segundo**, o sistema tem regras de negócio críticas, principalmente o controle de acesso por papéis. Um bug aqui afeta dados acadêmicos, então testar é barato perto do custo de errar."
>
> "**Terceiro**, o usuário-alvo é idoso. Não dá para depender de teste manual em produção - regressões precisam ser pegas antes de chegar no usuário."
>
> "Para complementar, eu adicionaria uma ferramenta de E2E como Cypress ou Detox no futuro, fechando a pirâmide de testes. Mas o Jest é a base."
>
> "Era isso. Obrigado, alguma pergunta?"

---

## Dicas para a apresentação

- **Antes de apresentar:** rode `npm test` no backend uma vez e tire um print da saída para usar no slide 9 caso o terminal ao vivo dê problema.
- **Slides de código:** não leia linha por linha. Aponte os 2 ou 3 trechos principais e explique.
- **Tempo:** se sentir que está estourando, corte o slide 4 (Vantagens/Desvantagens) - é o mais facil de cortar sem perder o fio.
- **Pausas:** respire entre as seções (slides 1-2, 3-4, 5, 6-9, 10). Cinco "blocos" naturais.
- **Encerramento:** agradeça e abra para perguntas, não saia direto.

## Possíveis perguntas do professor

- **"Qual a diferença entre Jest e Vitest?"** Vitest é mais novo, feito pela equipe do Vite, mais rápido e nativo a ES Modules. Sintaxe quase idêntica. Nosso web-admin usa Vitest justamente por causa do Vite.
- **"O que é mock e o que é spy?"** Mock substitui completamente uma função/módulo por uma implementação fake. Spy "espiona" uma função real, registrando como ela foi chamada, sem necessariamente substituí-la.
- **"E se o código tiver setTimeout? Como testar?"** Jest tem timers fake: `jest.useFakeTimers()` e `jest.advanceTimersByTime(1000)`.
- **"Por que mockar o axios em vez de subir o serviço de verdade?"** Velocidade e isolamento. O teste roda em milissegundos e não depende de rede ou de outro processo - cada cenário (200, 500, timeout) é simulado em uma linha.
