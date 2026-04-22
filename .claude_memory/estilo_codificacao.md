# Estilo de Codificação — Vida Mais APP

## Princípios Gerais

- **Sem comentários desnecessários** — nomes bem escolhidos explicam o código
- **Sem abstrações prematuras** — só abstrair quando há 3+ repetições reais
- **Sem tratamento de erros para casos impossíveis** — confiar nas garantias do framework
- **Sem features extras** — implementar exatamente o que foi pedido, nada mais
- **Sem compatibilidade retroativa desnecessária** — mudar direto, sem shims

## TypeScript

- Tipagem estrita habilitada
- Preferir `interface` para objetos de domínio, `type` para unions/aliases
- Sem `any` — usar `unknown` quando necessário e fazer narrowing
- Enums do Prisma são a fonte da verdade para tipos de domínio

## Backend (Express)

- Rotas separadas por role em arquivos dedicados (`auth`, `admin`, `prof`, `aluno`, `ml`)
- Middleware de autenticação JWT antes das rotas protegidas
- Prisma como único ponto de acesso ao banco — sem queries raw salvo necessidade
- Exportação Excel/CSV centralizada em `excel-export.service.ts`

## Frontend (React / React Native)

- Componentes funcionais com hooks — sem class components
- Zustand para estado global, TanStack Query para estado do servidor
- Sem prop drilling — usar contexto ou store quando necessário
- Formulários: preferir controlled components

## Acessibilidade (Mobile — prioridade máxima)

- Fontes mínimas: **20px**
- Touch targets mínimos: **60×60px**
- Sempre incluir `accessibilityLabel` nos elementos interativos
- TTS via `Expo.Speech` para leitura de conteúdo
- Alto contraste preferido nas cores

## Testes

- Backend: **Jest**
- Web Admin: **Vitest** (ambiente jsdom)
- Mobile: **Jest** com preset jest-expo
- ML Service: **pytest**
- Rodar arquivo específico: `npm run test -- path/to/file.test.ts`

## Commits

- Convenção: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- Mensagens em inglês, descritivas do "porquê" não do "o quê"

## UI / Design

- Interface limpa e sem poluição visual
- Hierarquia tipográfica clara (título > subtítulo > corpo)
- Paleta de cores consistente em todo o app
- Mobile-first para o app dos alunos

---
_Última atualização: 2026-04-17_
