# 📋 Documento de Requisitos do Sistema Vida Mais APP

**Sistema de Pesquisa de Satisfação Digital**  
**Instituição:** Vida Mais  
**Projeto:** Projeto Integrador V - FATEC  
**Data:** Novembro 2025  
**Versão:** 1.0

---

## 📑 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Requisitos Funcionais](#requisitos-funcionais)
3. [Requisitos Não Funcionais](#requisitos-não-funcionais)
4. [Regras de Negócio](#regras-de-negócio)
5. [Restrições](#restrições)

---

## 1. Visão Geral do Sistema

O **Vida Mais APP** é uma plataforma digital multiplataforma desenvolvida para digitalizar o processo de pesquisa anual de satisfação da Instituição Vida Mais, anteriormente realizado manualmente em papel. O sistema é composto por três módulos principais:

- **Backend API (Node.js + Express + PostgreSQL):** API REST para gerenciamento de dados
- **Aplicativo Mobile (React Native + Expo):** Interface acessível para idosos responderem pesquisas
- **Painel Web Administrativo (React + Vite):** Plataforma para criação de questionários e análise de dados

### Objetivo

Fornecer uma solução digital acessível e eficiente para coleta, análise e geração de relatórios de pesquisas de satisfação, com foco especial em acessibilidade para o público idoso.

---

## 2. Requisitos Funcionais

### RF001 - Autenticação e Autorização

**Descrição:** O sistema deve permitir autenticação e controle de acesso baseado em papéis (RBAC).

**Critérios de Aceitação:**
- RF001.1 - O sistema deve permitir login com email e senha
- RF001.2 - O sistema deve gerar tokens JWT com expiração configurável (padrão: 7 dias)
- RF001.3 - O sistema deve suportar três tipos de usuários: Administrador, Professor e Aluno
- RF001.4 - O sistema deve validar credenciais e retornar erro para usuários inativos
- RF001.5 - As senhas devem ser armazenadas com hash bcrypt (salt rounds: 10)

**Prioridade:** Alta  
**Endpoints:** `POST /auth/login`

---

### RF002 - Gerenciamento de Professores (Admin)

**Descrição:** Administradores devem poder gerenciar professores no sistema.

**Critérios de Aceitação:**
- RF002.1 - Criar novo professor com nome, email e senha
- RF002.2 - Listar todos os professores com quantidade de turmas
- RF002.3 - Editar informações de professores (nome, email, senha opcional)
- RF002.4 - Excluir professores do sistema
- RF002.5 - Senha deve ter mínimo de 6 caracteres
- RF002.6 - Email deve ser válido e único no sistema

**Prioridade:** Alta  
**Endpoints:** 
- `POST /admin/professores`
- `GET /admin/professores`
- `PUT /admin/professores/:id`
- `DELETE /admin/professores/:id`

---

### RF003 - Gerenciamento de Alunos (Admin)

**Descrição:** Administradores devem poder gerenciar alunos no sistema.

**Critérios de Aceitação:**
- RF003.1 - Criar novo aluno com nome, email e senha
- RF003.2 - Listar todos os alunos com suas turmas vinculadas
- RF003.3 - Editar informações de alunos (nome, email, senha opcional)
- RF003.4 - Excluir alunos do sistema
- RF003.5 - Importar alunos em massa via arquivo CSV
- RF003.6 - Formato CSV: nome, email, senha (com headers)
- RF003.7 - Sistema deve validar cada linha do CSV antes de importar

**Prioridade:** Alta  
**Endpoints:** 
- `POST /admin/alunos`
- `GET /admin/alunos`
- `PUT /admin/alunos/:id`
- `DELETE /admin/alunos/:id`
- `POST /admin/alunos/import`

---

### RF004 - Gerenciamento de Turmas (Admin)

**Descrição:** Administradores devem poder gerenciar turmas e vincular alunos.

**Critérios de Aceitação:**
- RF004.1 - Criar turma com nome, ano e professor responsável
- RF004.2 - Listar todas as turmas com informações do professor e quantidade de alunos
- RF004.3 - Visualizar detalhes de uma turma específica com lista de alunos
- RF004.4 - Excluir turmas do sistema
- RF004.5 - Vincular alunos a turmas (relacionamento N:N)
- RF004.6 - Desvincular alunos de turmas
- RF004.7 - O ano da turma deve ser maior ou igual a 2020

**Prioridade:** Alta  
**Endpoints:** 
- `POST /admin/turmas`
- `GET /admin/turmas`
- `GET /admin/turmas/:id`
- `DELETE /admin/turmas/:id`
- `POST /admin/vincular-aluno`
- `DELETE /admin/vincular-aluno/:id`

---

### RF005 - Visualização de Turmas (Professor)

**Descrição:** Professores devem poder visualizar suas turmas e alunos.

**Critérios de Aceitação:**
- RF005.1 - Listar turmas do professor com contadores de alunos e questionários
- RF005.2 - Visualizar alunos de cada turma (apenas visualização)
- RF005.3 - Professor só pode acessar suas próprias turmas
- RF005.4 - Listagem de alunos ordenada por nome

**Prioridade:** Alta  
**Endpoints:** 
- `GET /prof/minhas-turmas`
- `GET /prof/turmas/:id/alunos`

---

### RF006 - Gerenciamento de Questionários (Professor/Admin)

**Descrição:** Professores e administradores devem poder criar e gerenciar questionários.

**Critérios de Aceitação:**
- RF006.1 - Criar questionário com título, descrição opcional e visibilidade
- RF006.2 - Definir visibilidade: GLOBAL (todos) ou TURMA (específica)
- RF006.3 - Vincular questionário a uma turma específica (se visibilidade TURMA)
- RF006.4 - Definir período de disponibilidade (data início e fim opcionais)
- RF006.5 - Listar questionários criados pelo usuário
- RF006.6 - Visualizar detalhes de questionário com perguntas
- RF006.7 - Editar questionário (título, descrição, período)
- RF006.8 - Excluir questionário
- RF006.9 - Professor só pode acessar questionários próprios
- RF006.10 - Admin pode acessar todos os questionários

**Prioridade:** Alta  
**Endpoints:** 
- `POST /prof/questionarios`
- `GET /prof/questionarios`
- `GET /prof/questionarios/:id`
- `PUT /prof/questionarios/:id`
- `DELETE /prof/questionarios/:id`

---

### RF007 - Gerenciamento de Perguntas

**Descrição:** Sistema deve permitir criação de perguntas em questionários com diferentes tipos.

**Critérios de Aceitação:**
- RF007.1 - Criar pergunta vinculada a um questionário
- RF007.2 - Suportar 5 tipos de perguntas:
  - **TEXTO:** Resposta livre em texto
  - **MULTIPLA:** Múltipla escolha (checkboxes)
  - **UNICA:** Escolha única (radio buttons)
  - **ESCALA:** Escala numérica (1-5)
  - **BOOLEAN:** Verdadeiro/Falso (Sim/Não)
- RF007.3 - Definir enunciado da pergunta (mínimo 5 caracteres)
- RF007.4 - Definir ordem de exibição da pergunta
- RF007.5 - Marcar pergunta como obrigatória ou opcional
- RF007.6 - Para tipos MULTIPLA e UNICA, definir array de opções
- RF007.7 - Editar perguntas existentes
- RF007.8 - Excluir perguntas
- RF007.9 - Validação de permissão (apenas criador do questionário)

**Prioridade:** Alta  
**Endpoints:** 
- `POST /prof/perguntas`
- `PUT /prof/perguntas/:id`
- `DELETE /prof/perguntas/:id`

---

### RF008 - Visualização de Questionários Ativos (Aluno)

**Descrição:** Alunos devem poder visualizar questionários disponíveis para responder.

**Critérios de Aceitação:**
- RF008.1 - Listar questionários ativos e disponíveis para o aluno
- RF008.2 - Exibir questionários GLOBAIS para todos os alunos
- RF008.3 - Exibir questionários de TURMA apenas para alunos vinculados
- RF008.4 - Filtrar questionários por período (dentro do período ativo)
- RF008.5 - Indicar quais questionários já foram respondidos pelo aluno
- RF008.6 - Mostrar informações: título, descrição, turma, período, quantidade de perguntas
- RF008.7 - Permitir filtro opcional por turma específica

**Prioridade:** Alta  
**Endpoints:** 
- `GET /aluno/questionarios-ativos`
- `GET /aluno/questionarios/:id`

---

### RF009 - Responder Questionários (Aluno)

**Descrição:** Alunos devem poder responder questionários através do aplicativo mobile.

**Critérios de Aceitação:**
- RF009.1 - Visualizar questionário completo com todas as perguntas em ordem
- RF009.2 - Responder perguntas de acordo com o tipo definido
- RF009.3 - Enviar todas as respostas de uma vez (transação única)
- RF009.4 - Validar preenchimento de perguntas obrigatórias
- RF009.5 - Impedir envio duplicado (aluno só pode responder uma vez)
- RF009.6 - Validar período de disponibilidade antes de aceitar resposta
- RF009.7 - Validar vínculo do aluno com a turma do questionário
- RF009.8 - Retornar confirmação de envio com sucesso

**Prioridade:** Alta  
**Endpoints:** 
- `POST /aluno/respostas`

---

### RF010 - Geração de Relatórios

**Descrição:** Professores e administradores devem poder visualizar relatórios de respostas.

**Critérios de Aceitação:**
- RF010.1 - Gerar relatório consolidado de um questionário
- RF010.2 - Exibir estatísticas por tipo de pergunta:
  - **TEXTO:** Lista de respostas com nome do aluno
  - **ESCALA:** Média, mínimo e máximo
  - **BOOLEAN:** Contagem de Sim e Não
  - **MULTIPLA/UNICA:** Distribuição por opção
- RF010.3 - Mostrar total de respondentes únicos
- RF010.4 - Mostrar total de respostas por pergunta
- RF010.5 - Ordenar perguntas pela ordem definida
- RF010.6 - Validar permissão (apenas criador do questionário)

**Prioridade:** Alta  
**Endpoints:** 
- `GET /prof/relatorios/:questionarioId`

---

### RF011 - Exportação de Dados

**Descrição:** Sistema deve permitir exportação de respostas em formatos Excel e CSV.

**Critérios de Aceitação:**
- RF011.1 - Exportar respostas de questionário em formato XLSX (Excel)
- RF011.2 - Exportar respostas de questionário em formato CSV
- RF011.3 - Formato da exportação:
  - Colunas: Aluno, Email, [Perguntas...]
  - Linhas: Uma por aluno com todas as respostas
- RF011.4 - Formatar valores booleanos como "Sim" e "Não"
- RF011.5 - Incluir header com nomes das colunas
- RF011.6 - Gerar arquivo para download direto
- RF011.7 - Nome do arquivo: `questionario-{id}.xlsx` ou `.csv`
- RF011.8 - Validar permissão (apenas criador do questionário)

**Prioridade:** Média  
**Endpoints:** 
- `GET /prof/export/:questionarioId?formato=xlsx`
- `GET /prof/export/:questionarioId?formato=csv`

---

### RF012 - Acessibilidade para Idosos (Mobile)

**Descrição:** Aplicativo mobile deve ter recursos de acessibilidade para idosos.

**Critérios de Aceitação:**
- RF012.1 - Fontes grandes e ajustáveis (≥ 20px)
- RF012.2 - Alto contraste visual (WCAG 2.1 AA)
- RF012.3 - Botões grandes (mínimo 60x60px)
- RF012.4 - Espaçamento generoso entre elementos
- RF012.5 - Leitura em voz (Text-to-Speech) com Expo Speech
- RF012.6 - Navegação simplificada (uma pergunta por vez)
- RF012.7 - Feedback visual claro em ações
- RF012.8 - Mensagens de erro compreensíveis
- RF012.9 - Confirmação visual de envio de respostas
- RF012.10 - Controle de tamanho de fonte persistente

**Prioridade:** Alta  
**Módulo:** Mobile App

---

### RF013 - Visualização de Turmas (Aluno)

**Descrição:** Alunos devem poder visualizar suas turmas vinculadas.

**Critérios de Aceitação:**
- RF013.1 - Listar turmas em que o aluno está matriculado
- RF013.2 - Exibir informações da turma: nome, ano, professor
- RF013.3 - Exibir informações do professor responsável

**Prioridade:** Média  
**Endpoints:** 
- `GET /aluno/minhas-turmas`

---

## 3. Requisitos Não Funcionais

### RNF001 - Desempenho

**Descrição:** O sistema deve ter performance adequada para uso em produção.

**Critérios:**
- RNF001.1 - Tempo de resposta da API: < 500ms para 95% das requisições
- RNF001.2 - Tempo de login: < 2 segundos
- RNF001.3 - Carregamento de listagens: < 1 segundo para até 100 registros
- RNF001.4 - Geração de relatórios: < 3 segundos para até 1000 respostas
- RNF001.5 - Exportação Excel/CSV: < 5 segundos para até 1000 registros
- RNF001.6 - Suporte a 500 usuários simultâneos (configuração atual t2.micro)

**Prioridade:** Alta

---

### RNF002 - Segurança

**Descrição:** O sistema deve implementar medidas de segurança robustas.

**Critérios:**
- RNF002.1 - Autenticação via JWT (JSON Web Token)
- RNF002.2 - Senhas com hash bcrypt (salt rounds: 10)
- RNF002.3 - Validação de entrada com Zod Schema
- RNF002.4 - Proteção contra SQL Injection via Prisma ORM
- RNF002.5 - Proteção contra XSS (Cross-Site Scripting)
- RNF002.6 - CORS configurado para origens específicas
- RNF002.7 - Rate Limiting para proteção contra força bruta
- RNF002.8 - Headers de segurança com Helmet.js
- RNF002.9 - HTTPS obrigatório em produção (Let's Encrypt)
- RNF002.10 - Controle de acesso baseado em papéis (RBAC)
- RNF002.11 - Armazenamento seguro de tokens no mobile (Expo SecureStore)

**Prioridade:** Crítica

---

### RNF003 - Disponibilidade

**Descrição:** O sistema deve estar disponível para uso durante o período de pesquisas.

**Critérios:**
- RNF003.1 - Disponibilidade de 99% durante período de pesquisas (agosto-setembro)
- RNF003.2 - Backup automático do banco de dados PostgreSQL
- RNF003.3 - Gerenciamento de processos com PM2 (auto-restart)
- RNF003.4 - Monitoramento de logs estruturados
- RNF003.5 - Tratamento de erros com middleware centralizado

**Prioridade:** Alta

---

### RNF004 - Escalabilidade

**Descrição:** O sistema deve ser preparado para crescimento futuro.

**Critérios:**
- RNF004.1 - Arquitetura stateless (JWT) para balanceamento de carga
- RNF004.2 - Índices otimizados no banco de dados
- RNF004.3 - Queries otimizadas com Prisma ORM
- RNF004.4 - Possibilidade de adicionar Redis para cache
- RNF004.5 - Suporte a múltiplas instâncias EC2 com Load Balancer
- RNF004.6 - Preparado para CDN para assets estáticos
- RNF004.7 - Database com suporte a replicação (RDS Multi-AZ)

**Prioridade:** Média

---

### RNF005 - Usabilidade

**Descrição:** Interface deve ser intuitiva e acessível, especialmente para idosos.

**Critérios:**
- RNF005.1 - Interface mobile simplificada e intuitiva
- RNF005.2 - Fluxo linear de navegação
- RNF005.3 - Feedback visual imediato em todas as ações
- RNF005.4 - Mensagens de erro claras e em português
- RNF005.5 - Design responsivo (mobile, tablet, desktop)
- RNF005.6 - Padrões de UX modernos no painel web
- RNF005.7 - Confirmações antes de ações destrutivas

**Prioridade:** Alta

---

### RNF006 - Compatibilidade

**Descrição:** Sistema deve funcionar em diferentes plataformas e dispositivos.

**Critérios:**
- RNF006.1 - Aplicativo mobile: iOS 13+ e Android 8+
- RNF006.2 - Painel web: Chrome, Firefox, Safari, Edge (últimas 2 versões)
- RNF006.3 - Responsividade para telas de 320px a 2560px
- RNF006.4 - Backend compatível com Node.js 20 LTS
- RNF006.5 - Banco de dados PostgreSQL 15+

**Prioridade:** Alta

---

### RNF007 - Manutenibilidade

**Descrição:** Código deve ser organizado, documentado e fácil de manter.

**Critérios:**
- RNF007.1 - 100% TypeScript em todos os módulos
- RNF007.2 - Separação clara de responsabilidades (Backend, Web, Mobile)
- RNF007.3 - Arquitetura em camadas (routes, middlewares, services)
- RNF007.4 - Código comentado e autoexplicativo
- RNF007.5 - Documentação técnica completa
- RNF007.6 - Migrations versionadas com Prisma
- RNF007.7 - Padrões de código consistentes

**Prioridade:** Média

---

### RNF008 - Portabilidade

**Descrição:** Sistema deve ser facilmente implantável em diferentes ambientes.

**Critérios:**
- RNF008.1 - Variáveis de ambiente para configurações
- RNF008.2 - Scripts de setup automatizados
- RNF008.3 - Documentação de deploy completa
- RNF008.4 - Migrations automatizadas do banco
- RNF008.5 - Seed de dados para ambiente de desenvolvimento
- RNF008.6 - Build otimizado para produção
- RNF008.7 - Compatível com AWS EC2 (e outras VPS)

**Prioridade:** Média

---

### RNF009 - Confiabilidade

**Descrição:** Sistema deve ter tratamento robusto de erros e dados consistentes.

**Critérios:**
- RNF009.1 - Transações atômicas para operações críticas
- RNF009.2 - Validação de dados em todas as camadas
- RNF009.3 - Tratamento centralizado de erros
- RNF009.4 - Logs estruturados para debugging
- RNF009.5 - Rollback automático em caso de falha
- RNF009.6 - Validação de integridade referencial no banco
- RNF009.7 - Cascade delete configurado corretamente

**Prioridade:** Alta

---

### RNF010 - Acessibilidade (WCAG)

**Descrição:** Sistema deve seguir padrões de acessibilidade web.

**Critérios:**
- RNF010.1 - Contraste mínimo WCAG 2.1 AA (4.5:1 para texto)
- RNF010.2 - Tamanho de fonte ajustável
- RNF010.3 - Navegação por teclado completa (web)
- RNF010.4 - Labels semânticos em formulários
- RNF010.5 - Suporte a leitores de tela (mobile e web)
- RNF010.6 - Feedback tátil em dispositivos móveis
- RNF010.7 - Tempo adequado para leitura de mensagens

**Prioridade:** Alta

---

### RNF011 - Eficiência de Armazenamento

**Descrição:** Dados devem ser armazenados de forma eficiente.

**Critérios:**
- RNF011.1 - Normalização adequada do banco de dados
- RNF011.2 - Índices em campos de busca frequente
- RNF011.3 - Compressão de assets estáticos (web)
- RNF011.4 - Tamanho do bundle mobile < 50MB
- RNF011.5 - Otimização de imagens
- RNF011.6 - Cache local no mobile para reduzir requisições

**Prioridade:** Média

---

## 4. Regras de Negócio

### RN001 - Controle de Acesso por Papel

- **Administrador:** Acesso total ao sistema
  - Gerenciar professores, alunos e turmas
  - Criar questionários globais
  - Visualizar todos os relatórios
  - Vincular alunos a turmas

- **Professor:** Acesso limitado às suas turmas
  - Visualizar suas turmas e alunos
  - Criar questionários para suas turmas
  - Gerenciar perguntas dos seus questionários
  - Visualizar relatórios dos seus questionários
  - Exportar dados dos seus questionários

- **Aluno:** Acesso apenas para responder
  - Visualizar questionários disponíveis
  - Responder questionários de suas turmas
  - Visualizar suas turmas

---

### RN002 - Período de Disponibilidade de Questionários

- Questionários podem ter período de início e fim configuráveis
- Se `periodoInicio` definido: questionário só fica disponível após essa data
- Se `periodoFim` definido: questionário fica indisponível após essa data
- Períodos são opcionais (null = sem restrição)
- Validação de período ocorre no momento de visualizar e responder

---

### RN003 - Visibilidade de Questionários

- **GLOBAL:** Questionário disponível para todos os alunos do sistema
- **TURMA:** Questionário disponível apenas para alunos da turma específica
- Questionários de TURMA exigem `turmaId` obrigatório
- Alunos só veem questionários que têm permissão de acessar

---

### RN004 - Resposta Única por Aluno

- Cada aluno pode responder um questionário apenas uma vez
- Sistema impede envios duplicados
- Validação ocorre antes de salvar respostas
- Retorna erro 409 (Conflict) se já respondeu

---

### RN005 - Perguntas Obrigatórias

- Perguntas podem ser marcadas como obrigatórias (`obrigatoria: true`)
- Sistema valida preenchimento de todas as perguntas obrigatórias
- Envio de respostas é bloqueado se faltar resposta obrigatória
- Retorna erro 400 com mensagem específica da pergunta faltante

---

### RN006 - Exclusão em Cascata

- Exclusão de usuário exclui:
  - Turmas (se professor)
  - Vínculos aluno-turma (se aluno)
  - Respostas (se aluno)
  
- Exclusão de turma exclui:
  - Vínculos aluno-turma
  - Questionários vinculados
  - Respostas da turma

- Exclusão de questionário exclui:
  - Perguntas do questionário
  - Respostas do questionário

- Exclusão de pergunta exclui:
  - Respostas da pergunta

---

### RN007 - Validação de Vínculo Aluno-Turma

- Aluno só pode responder questionários de turmas que está vinculado
- Sistema valida vínculo antes de aceitar respostas
- Para questionários GLOBAIS, aluno precisa estar em pelo menos uma turma
- Retorna erro 403 se aluno não pertence à turma

---

### RN008 - Formato de Opções de Perguntas

- Perguntas tipo MULTIPLA e UNICA exigem array de opções
- Opções são armazenadas como JSON string no banco
- Mínimo de 2 opções obrigatório
- Opções são retornadas parseadas para o cliente

---

### RN009 - Ordem de Perguntas

- Perguntas têm campo `ordem` (integer) para sequenciamento
- Perguntas são sempre listadas em ordem crescente
- Professor/Admin define ordem ao criar pergunta
- Ordem pode ser alterada ao editar pergunta

---

### RN010 - Status de Usuário (Ativo/Inativo)

- Usuários têm campo `ativo` (boolean)
- Usuários inativos não podem fazer login
- Retorna erro 401 para login de usuário inativo
- Admin pode ativar/desativar usuários
- Soft delete: não exclui, apenas marca como inativo

---

### RN011 - Unicidade de Email

- Email deve ser único no sistema
- Validação ocorre ao criar usuário
- Validação ocorre ao editar email de usuário
- Retorna erro se email já existe

---

### RN012 - Agregação de Dados em Relatórios

Por tipo de pergunta:
- **TEXTO:** Lista todas as respostas com nome do aluno
- **ESCALA:** Calcula média, mínimo e máximo dos valores
- **BOOLEAN:** Conta quantidade de "Sim" e "Não"
- **MULTIPLA/UNICA:** Distribui contagem por cada opção

---

## 5. Restrições

### REST001 - Tecnológicas

- **Backend:** Node.js 20 LTS obrigatório
- **Banco de Dados:** PostgreSQL 15+ obrigatório
- **Mobile:** Expo SDK (versão compatível com React Native)
- **TypeScript:** Obrigatório em todos os módulos
- **ORM:** Prisma obrigatório (migrations e type safety)

---

### REST002 - Infraestrutura

- **Hospedagem:** AWS EC2 ou VPS equivalente
- **SSL:** Certificado Let's Encrypt (gratuito)
- **Servidor Web:** Nginx como proxy reverso
- **Gerenciamento:** PM2 para processos Node.js
- **Memória mínima:** 2GB RAM (t2.micro)
- **Armazenamento:** Mínimo 20GB SSD

---

### REST003 - Segurança Mandatória

- HTTPS obrigatório em produção
- Validação de entrada em todas as requisições
- Rate limiting configurado
- CORS restrito a origens específicas
- Senhas devem ter mínimo 6 caracteres
- Tokens JWT com expiração obrigatória

---

### REST004 - Compatibilidade de Dispositivos

- **iOS:** Versão 13 ou superior
- **Android:** Versão 8.0 (API 26) ou superior
- **Navegadores Web:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

---

### REST005 - Formato de Dados

- Datas em formato ISO 8601
- UUIDs v4 para identificadores
- JSON para comunicação API
- UTF-8 obrigatório em todos os textos
- Senhas hash bcrypt com 10 salt rounds

---

### REST006 - Limitações de Capacidade (Configuração Atual)

- Máximo 500 usuários simultâneos
- Máximo 10.000 respostas por dia
- Máximo 100 questionários ativos simultâneos
- Exportação limitada a 10.000 registros por arquivo
- Upload de CSV limitado a 1.000 linhas

*Nota: Limitações podem ser aumentadas com upgrade de infraestrutura*

---

### REST007 - Dependências Externas

- **Backend:**
  - Express 4.x
  - Prisma 5.x
  - JWT (jsonwebtoken)
  - bcrypt
  - ExcelJS
  - fast-csv

- **Mobile:**
  - React Native (via Expo)
  - Expo Speech (TTS)
  - Expo SecureStore
  - React Navigation 6.x
  - TanStack Query 5.x

- **Web:**
  - React 18.x
  - Vite 5.x
  - TailwindCSS 3.x
  - React Router 6.x
  - Chart.js

---

### REST008 - Padrões de Codificação

- Nomenclatura em camelCase para variáveis e funções
- Nomenclatura em PascalCase para componentes React
- Comentários em português (PT-BR)
- ESLint configurado (padrão TypeScript)
- Prettier para formatação (opcional)

---

### REST009 - Versionamento

- Git obrigatório para controle de versão
- GitHub como repositório remoto
- Commits em português
- Semantic versioning para releases
- Branch `main` como branch principal

---

### REST010 - Documentação Obrigatória

- README.md na raiz do projeto
- Documentação de API (endpoints)
- Documentação de deploy
- Guia de instalação
- Documentação de requisitos (este documento)

---

## 📊 Métricas de Qualidade

### Cobertura Funcional
- ✅ 13 Requisitos Funcionais implementados
- ✅ 11 Requisitos Não Funcionais atendidos
- ✅ 12 Regras de Negócio implementadas
- ✅ 10 Restrições atendidas

### Complexidade
- **Total de Endpoints:** 30+
- **Total de Entidades:** 7 tabelas no banco
- **Total de Telas Mobile:** 11
- **Total de Páginas Web:** 11
- **Linhas de Código:** ~12.000+

### Segurança
- ✅ Autenticação JWT
- ✅ Autorização RBAC
- ✅ Proteção contra SQL Injection
- ✅ Proteção contra XSS
- ✅ Rate Limiting
- ✅ HTTPS em produção

---

## 🎯 Priorização de Requisitos

### Críticos (Implementação Obrigatória)
- RF001 - Autenticação e Autorização
- RF002 - Gerenciamento de Professores
- RF003 - Gerenciamento de Alunos
- RF004 - Gerenciamento de Turmas
- RF006 - Gerenciamento de Questionários
- RF007 - Gerenciamento de Perguntas
- RF009 - Responder Questionários
- RF012 - Acessibilidade para Idosos
- RNF002 - Segurança

### Altos (Essenciais para Operação)
- RF005 - Visualização de Turmas (Professor)
- RF008 - Visualização de Questionários (Aluno)
- RF010 - Geração de Relatórios
- RNF001 - Desempenho
- RNF003 - Disponibilidade
- RNF005 - Usabilidade
- RNF006 - Compatibilidade

### Médios (Importantes)
- RF011 - Exportação de Dados
- RF013 - Visualização de Turmas (Aluno)
- RNF004 - Escalabilidade
- RNF007 - Manutenibilidade
- RNF008 - Portabilidade

---

## 📝 Glossário

- **RBAC:** Role-Based Access Control (Controle de Acesso Baseado em Papéis)
- **JWT:** JSON Web Token (Token de Autenticação)
- **ORM:** Object-Relational Mapping (Mapeamento Objeto-Relacional)
- **TTS:** Text-to-Speech (Síntese de Voz)
- **WCAG:** Web Content Accessibility Guidelines (Diretrizes de Acessibilidade)
- **API:** Application Programming Interface (Interface de Programação de Aplicações)
- **REST:** Representational State Transfer (Transferência de Estado Representacional)
- **UUID:** Universally Unique Identifier (Identificador Único Universal)
- **CSV:** Comma-Separated Values (Valores Separados por Vírgula)
- **XLSX:** Excel Open XML Spreadsheet (Planilha Excel)

---

## 📋 Histórico de Revisões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | 13/11/2025 | Vinícius Tibério | Versão inicial do documento de requisitos |

---

## 📞 Contato

Para dúvidas ou sugestões sobre os requisitos:
- **Issues:** https://github.com/ViniciusThi/Vida_Mais_APP/issues
- **Email:** vinicius.tiberio@fatec.sp.gov.br

---

<div align="center">

**Desenvolvido com ❤️ para a Instituição Vida Mais**

*Projeto Integrador V - FATEC 2025*

</div>

