# 📋 Documento de Requisitos - Vida Mais APP

## 📄 Informações do Documento

| Item | Descrição |
|------|-----------|
| **Projeto** | Vida Mais APP - Sistema de Pesquisa de Satisfação Digital |
| **Versão** | 1.0 |
| **Data** | 2025 |
| **Autor** | Equipe de Desenvolvimento |
| **Status** | Aprovado |

---

## 1. Introdução

### 1.1 Propósito do Documento

Este documento apresenta os requisitos funcionais e não funcionais do sistema **Vida Mais APP**, desenvolvido para digitalizar o processo de pesquisa anual de satisfação da Instituição Vida Mais. O documento serve como base para o desenvolvimento, testes e validação do sistema.

### 1.2 Escopo do Projeto

O **Vida Mais APP** é uma solução completa multiplataforma que substitui o processo manual de pesquisa em papel por um sistema digital integrado, composto por:

- **Aplicativo Mobile** (React Native + Expo) para iOS e Android
- **Painel Web Administrativo** (React + Vite) para gestão
- **API Backend** (Node.js + Express + PostgreSQL) para processamento

### 1.3 Público-Alvo

O sistema atende três perfis de usuários:

1. **Administradores**: Gestores da instituição responsáveis pela administração geral
2. **Professores**: Educadores que criam e gerenciam questionários para suas turmas
3. **Alunos/Idosos**: Usuários finais que respondem às pesquisas de satisfação

### 1.4 Objetivos do Sistema

- Digitalizar completamente o processo de pesquisa de satisfação
- Reduzir o tempo de tabulação e análise de dados
- Melhorar a acessibilidade para idosos com dificuldades visuais
- Fornecer relatórios e análises em tempo real
- Eliminar o uso de papel no processo

---

## 2. Requisitos Funcionais

Os requisitos funcionais descrevem **o que o sistema deve fazer**, ou seja, as funcionalidades específicas que devem ser implementadas.

### 2.1 Autenticação e Autorização

#### RF-001: Login de Usuários
- **Descrição**: O sistema deve permitir que usuários façam login utilizando email e senha.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Validar formato de email
  - Validar senha com mínimo de 6 caracteres
  - Retornar token JWT válido após autenticação bem-sucedida
  - Retornar informações do usuário (id, nome, email, role)
  - Bloquear acesso para usuários inativos
  - Exibir mensagem de erro clara para credenciais inválidas

#### RF-002: Controle de Acesso Baseado em Papéis (RBAC)
- **Descrição**: O sistema deve implementar controle de acesso baseado em três papéis: ADMIN, PROF (Professor) e ALUNO.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Cada usuário possui um papel definido
  - Acesso a funcionalidades baseado no papel do usuário
  - Middleware de autorização valida permissões antes de executar ações
  - Mensagens de erro claras para tentativas de acesso não autorizado

#### RF-003: Gerenciamento de Sessão
- **Descrição**: O sistema deve gerenciar sessões de usuários através de tokens JWT.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Token JWT com validade de 7 dias (configurável)
  - Token armazenado de forma segura no cliente (mobile: SecureStore, web: localStorage)
  - Renovação automática de token quando necessário
  - Logout que invalida a sessão local

---

### 2.2 Gerenciamento de Usuários (Administrador)

#### RF-004: Cadastro de Professores
- **Descrição**: O administrador deve poder cadastrar novos professores no sistema.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Formulário com campos: nome, email, senha
  - Validação de email único
  - Senha com mínimo de 6 caracteres
  - Senha criptografada com bcrypt antes de armazenar
  - Atribuição automática do papel PROF

#### RF-005: Listagem de Professores
- **Descrição**: O administrador deve visualizar lista de todos os professores cadastrados.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Exibir nome, email e status (ativo/inativo)
  - Permitir busca/filtro por nome ou email
  - Paginação para grandes volumes de dados

#### RF-006: Edição de Professores
- **Descrição**: O administrador deve poder editar informações de professores existentes.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Editar nome e email
  - Alterar senha (opcional)
  - Ativar/desativar professor
  - Validação de email único ao editar

#### RF-007: Cadastro de Alunos
- **Descrição**: O administrador deve poder cadastrar novos alunos no sistema.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Formulário com campos: nome, email, senha
  - Validação de email único
  - Senha com mínimo de 6 caracteres
  - Senha criptografada com bcrypt
  - Atribuição automática do papel ALUNO

#### RF-008: Importação em Massa de Alunos
- **Descrição**: O administrador deve poder importar múltiplos alunos via arquivo CSV.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Upload de arquivo CSV com formato: nome, email, senha
  - Validação de formato do arquivo
  - Processamento em lote
  - Relatório de sucessos e erros da importação
  - Tratamento de duplicatas

#### RF-009: Listagem de Alunos
- **Descrição**: O administrador deve visualizar lista de todos os alunos cadastrados.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Exibir nome, email e status (ativo/inativo)
  - Exibir turmas vinculadas
  - Permitir busca/filtro por nome, email ou turma
  - Paginação para grandes volumes

#### RF-010: Edição de Alunos
- **Descrição**: O administrador deve poder editar informações de alunos existentes.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Editar nome e email
  - Alterar senha (opcional)
  - Ativar/desativar aluno
  - Gerenciar vínculos com turmas

---

### 2.3 Gerenciamento de Turmas (Administrador)

#### RF-011: Criação de Turmas
- **Descrição**: O administrador deve poder criar novas turmas no sistema.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Formulário com campos: nome, ano, professor responsável
  - Seleção de professor da lista de professores ativos
  - Validação de campos obrigatórios

#### RF-012: Listagem de Turmas
- **Descrição**: O administrador deve visualizar lista de todas as turmas cadastradas.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Exibir nome, ano, professor responsável, quantidade de alunos
  - Permitir busca/filtro por nome, ano ou professor
  - Paginação

#### RF-013: Edição de Turmas
- **Descrição**: O administrador deve poder editar informações de turmas existentes.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Editar nome, ano e professor responsável
  - Ativar/desativar turma
  - Gerenciar vínculos de alunos

#### RF-014: Vinculação de Alunos a Turmas
- **Descrição**: O administrador deve poder vincular alunos a turmas específicas.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Interface para adicionar/remover alunos de uma turma
  - Um aluno pode estar em múltiplas turmas
  - Validação para evitar duplicatas
  - Feedback visual das alterações

---

### 2.4 Gerenciamento de Questionários (Professor e Administrador)

#### RF-015: Criação de Questionários
- **Descrição**: Professores e administradores devem poder criar questionários.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Formulário com título e descrição
  - Seleção de turma (para professores) ou visibilidade global (para admin)
  - Definição de período de disponibilidade (data início e fim)
  - Ativação/desativação do questionário

#### RF-016: Adição de Perguntas
- **Descrição**: O sistema deve permitir adicionar perguntas aos questionários com 5 tipos diferentes.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - **TEXTO**: Pergunta de texto livre
  - **UNICA**: Escolha única (radio buttons)
  - **MULTIPLA**: Múltipla escolha (checkboxes)
  - **ESCALA**: Escala numérica de 1 a 5
  - **BOOLEAN**: Verdadeiro/Falso (Sim/Não)
  - Definir se pergunta é obrigatória ou opcional
  - Ordenar perguntas (ordem de exibição)
  - Para UNICA e MULTIPLA: definir opções de resposta

#### RF-017: Edição de Questionários
- **Descrição**: Professores e administradores devem poder editar questionários existentes.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Editar título, descrição e período
  - Adicionar, editar e remover perguntas
  - Reordenar perguntas
  - Ativar/desativar questionário
  - Validação: não permitir edição se já houver respostas (ou permitir com aviso)

#### RF-018: Exclusão de Questionários
- **Descrição**: Professores e administradores devem poder excluir questionários.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Confirmação antes de excluir
  - Exclusão em cascata de perguntas relacionadas
  - Opção de soft delete (desativar) em vez de exclusão física

#### RF-019: Listagem de Questionários
- **Descrição**: Professores devem visualizar seus questionários; administradores, todos os questionários.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Exibir título, descrição, turma, status, período
  - Filtrar por status (ativo/inativo)
  - Filtrar por período
  - Busca por título

---

### 2.5 Resposta a Questionários (Aluno)

#### RF-020: Visualização de Questionários Disponíveis
- **Descrição**: Alunos devem visualizar questionários disponíveis para responder.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Listar apenas questionários ativos
  - Mostrar apenas questionários da turma do aluno ou globais
  - Exibir questionários dentro do período de disponibilidade
  - Indicar quais já foram respondidos
  - Exibir título e descrição do questionário

#### RF-021: Resposta a Questionários
- **Descrição**: Alunos devem poder responder questionários através do aplicativo mobile.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Exibir uma pergunta por vez
  - Navegação entre perguntas (Anterior/Próxima)
  - Indicador de progresso (ex: "Pergunta 2 de 5")
  - Validação de perguntas obrigatórias antes de avançar
  - Salvar respostas localmente durante o preenchimento
  - Permitir voltar e alterar respostas antes do envio final

#### RF-022: Envio de Respostas
- **Descrição**: Alunos devem poder enviar respostas de questionários.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Validação de todas as perguntas obrigatórias
  - Envio único (não permitir envio duplicado)
  - Confirmação visual após envio bem-sucedido
  - Tratamento de erros de conexão (retry automático)
  - Mensagem de sucesso clara

#### RF-023: Visualização de Questionários Respondidos
- **Descrição**: Alunos devem visualizar questionários que já foram respondidos.
- **Prioridade**: Baixa
- **Critérios de Aceitação**:
  - Listar questionários com status "respondido"
  - Exibir data de resposta
  - Não permitir edição de respostas já enviadas

---

### 2.6 Relatórios e Análises (Professor e Administrador)

#### RF-024: Visualização de Relatórios
- **Descrição**: Professores e administradores devem visualizar relatórios de respostas dos questionários.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Agregação automática de respostas por pergunta
  - Gráficos de barras para perguntas de múltipla escolha
  - Estatísticas (média, mínimo, máximo) para perguntas de escala
  - Contagem de respostas para perguntas Sim/Não
  - Lista de todas as respostas para perguntas de texto livre
  - Taxa de resposta (quantos alunos responderam)

#### RF-025: Exportação de Dados
- **Descrição**: Professores e administradores devem poder exportar dados dos questionários.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Exportação em formato Excel (.xlsx) com formatação
  - Exportação em formato CSV
  - Incluir todas as respostas e metadados
  - Nome de arquivo descritivo com data

#### RF-026: Dashboard com Estatísticas
- **Descrição**: O sistema deve exibir dashboard com estatísticas gerais.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Total de questionários ativos
  - Total de respostas recebidas
  - Taxa de resposta por questionário
  - Gráficos visuais (Chart.js)
  - Filtros por período

---

### 2.7 Acessibilidade (Aluno/Idoso)

#### RF-027: Interface Acessível para Idosos
- **Descrição**: O aplicativo mobile deve ter interface adaptada para idosos com dificuldades visuais.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Fontes grandes (mínimo 20px para texto, 28px+ para títulos)
  - Alto contraste de cores (WCAG 2.1 AA mínimo)
  - Botões grandes (mínimo 60x60px, ideal 80x80px)
  - Espaçamento generoso entre elementos (mínimo 16px)
  - Navegação simplificada (uma tarefa por tela)

#### RF-028: Leitura em Voz (Text-to-Speech)
- **Descrição**: O aplicativo deve ler perguntas em voz alta para idosos.
- **Prioridade**: Alta
- **Critérios de Aceitação**:
  - Botão de leitura em voz grande e visível
  - Leitura do enunciado completo da pergunta
  - Leitura das opções de resposta (quando aplicável)
  - Velocidade de leitura ajustada (mais lenta)
  - Suporte a português brasileiro

#### RF-029: Feedback Visual e Tátil
- **Descrição**: O aplicativo deve fornecer feedback claro para todas as ações.
- **Prioridade**: Média
- **Critérios de Aceitação**:
  - Mudança visual ao tocar botões
  - Vibração tátil ao tocar (opcional)
  - Confirmações visuais claras
  - Mensagens de erro grandes e compreensíveis
  - Animações suaves e lentas (300-400ms)

---

## 3. Requisitos Não Funcionais

Os requisitos não funcionais descrevem **como o sistema deve se comportar**, ou seja, as características de qualidade que o sistema deve atender.

### 3.1 Desempenho

#### RNF-001: Tempo de Resposta da API
- **Descrição**: A API deve responder às requisições em tempo adequado.
- **Prioridade**: Alta
- **Especificação**:
  - Requisições simples (GET): ≤ 500ms
  - Requisições complexas (relatórios): ≤ 2 segundos
  - Operações de escrita (POST/PUT): ≤ 1 segundo
- **Método de Medição**: Tempo médio de resposta (p95)

#### RNF-002: Capacidade de Usuários Simultâneos
- **Descrição**: O sistema deve suportar múltiplos usuários simultâneos.
- **Prioridade**: Média
- **Especificação**:
  - Suportar pelo menos 500 usuários simultâneos
  - Suportar pelo menos 10.000 respostas por dia
  - Suportar pelo menos 100 questionários ativos simultaneamente
- **Método de Medição**: Testes de carga (load testing)

#### RNF-003: Tempo de Carregamento do Aplicativo Mobile
- **Descrição**: O aplicativo mobile deve carregar rapidamente.
- **Prioridade**: Média
- **Especificação**:
  - Tempo de inicialização (cold start): ≤ 3 segundos
  - Tempo de carregamento de telas: ≤ 1 segundo
  - Transições entre telas: ≤ 300ms
- **Método de Medição**: Profiling de performance

#### RNF-004: Otimização de Banco de Dados
- **Descrição**: O banco de dados deve ser otimizado para consultas rápidas.
- **Prioridade**: Alta
- **Especificação**:
  - Índices em todas as chaves estrangeiras
  - Índices em campos de busca frequente (email, nome)
  - Queries otimizadas com Prisma ORM
  - Paginação em listagens grandes
- **Método de Medição**: Análise de query plans

---

### 3.2 Segurança

#### RNF-005: Autenticação Segura
- **Descrição**: O sistema deve implementar autenticação segura.
- **Prioridade**: Alta
- **Especificação**:
  - Senhas criptografadas com bcrypt (salt rounds: 10)
  - Tokens JWT com expiração configurável (padrão: 7 dias)
  - Secret JWT armazenado em variável de ambiente
  - Validação de token em todas as rotas protegidas
- **Método de Validação**: Auditoria de segurança

#### RNF-006: Proteção contra Ataques Comuns
- **Descrição**: O sistema deve estar protegido contra vulnerabilidades comuns.
- **Prioridade**: Alta
- **Especificação**:
  - Proteção contra SQL Injection (Prisma ORM)
  - Proteção contra XSS (sanitização de inputs)
  - Proteção contra CSRF (tokens)
  - Rate limiting para prevenir força bruta
  - Headers de segurança (Helmet.js)
- **Método de Validação**: Testes de penetração

#### RNF-007: Controle de Acesso
- **Descrição**: O sistema deve implementar controle de acesso rigoroso.
- **Prioridade**: Alta
- **Especificação**:
  - RBAC (Role-Based Access Control) implementado
  - Middleware de autorização em todas as rotas
  - Validação de permissões no backend (nunca confiar apenas no frontend)
  - Logs de ações administrativas
- **Método de Validação**: Testes de autorização

#### RNF-008: Armazenamento Seguro de Dados
- **Descrição**: Dados sensíveis devem ser armazenados de forma segura.
- **Prioridade**: Alta
- **Especificação**:
  - Senhas nunca armazenadas em texto plano
  - Tokens armazenados em SecureStore (mobile) e localStorage (web)
  - Variáveis sensíveis em arquivos .env (nunca commitadas)
  - Conexão com banco de dados via SSL/TLS
- **Método de Validação**: Auditoria de segurança

#### RNF-009: CORS e Políticas de Origem
- **Descrição**: O sistema deve configurar CORS adequadamente.
- **Prioridade**: Média
- **Especificação**:
  - CORS configurado para origens específicas
  - Não permitir requisições de origens não autorizadas
  - Headers de segurança configurados
- **Método de Validação**: Testes de requisições cross-origin

---

### 3.3 Usabilidade

#### RNF-010: Interface Intuitiva
- **Descrição**: A interface deve ser intuitiva e fácil de usar.
- **Prioridade**: Alta
- **Especificação**:
  - Navegação clara e previsível
  - Mensagens de erro compreensíveis (não técnicas)
  - Feedback visual imediato para ações
  - Instruções claras em cada tela
  - Consistência visual em todo o sistema
- **Método de Validação**: Testes de usabilidade com usuários reais

#### RNF-011: Acessibilidade WCAG 2.1
- **Descrição**: O sistema deve atender aos padrões de acessibilidade WCAG 2.1.
- **Prioridade**: Alta
- **Especificação**:
  - Contraste mínimo de 4.5:1 para texto normal (WCAG AA)
  - Contraste mínimo de 3:1 para texto grande (≥24px)
  - Navegação por teclado (web)
  - Suporte a leitores de tela
  - Textos alternativos para imagens
- **Método de Validação**: Ferramentas de auditoria de acessibilidade

#### RNF-012: Responsividade
- **Descrição**: O painel web deve ser responsivo para diferentes tamanhos de tela.
- **Prioridade**: Média
- **Especificação**:
  - Funcionar em desktop (1920x1080+)
  - Funcionar em tablet (768px+)
  - Funcionar em mobile (375px+)
  - Layout adaptativo (TailwindCSS)
- **Método de Validação**: Testes em diferentes dispositivos

---

### 3.4 Confiabilidade

#### RNF-013: Disponibilidade do Sistema
- **Descrição**: O sistema deve estar disponível durante o horário de operação.
- **Prioridade**: Alta
- **Especificação**:
  - Disponibilidade de 99% durante horário comercial (8h-18h)
  - Tempo de inatividade planejada: máximo 4 horas/mês
  - Monitoramento de uptime
- **Método de Medição**: Logs e monitoramento (PM2, AWS CloudWatch)

#### RNF-014: Tratamento de Erros
- **Descrição**: O sistema deve tratar erros de forma adequada.
- **Prioridade**: Alta
- **Especificação**:
  - Tratamento de erros em todas as rotas
  - Mensagens de erro amigáveis ao usuário
  - Logs detalhados para desenvolvedores
  - Não expor informações sensíveis em erros
  - Retry automático em caso de falhas temporárias
- **Método de Validação**: Testes de cenários de erro

#### RNF-015: Integridade de Dados
- **Descrição**: O sistema deve garantir integridade dos dados.
- **Prioridade**: Alta
- **Especificação**:
  - Validação de dados em todas as entradas
  - Constraints no banco de dados
  - Transações atômicas para operações críticas
  - Backup automático do banco de dados
  - Prevenção de duplicatas (unique constraints)
- **Método de Validação**: Testes de integridade

#### RNF-016: Recuperação de Dados
- **Descrição**: O sistema deve ter capacidade de recuperação em caso de falhas.
- **Prioridade**: Média
- **Especificação**:
  - Backup diário do banco de dados
  - Scripts de restauração testados
  - Documentação de procedimentos de recuperação
  - Retenção de backups por 30 dias
- **Método de Validação**: Testes de restauração

---

### 3.5 Manutenibilidade

#### RNF-017: Código Limpo e Documentado
- **Descrição**: O código deve ser limpo, bem estruturado e documentado.
- **Prioridade**: Média
- **Especificação**:
  - TypeScript em 100% do código (type safety)
  - Comentários em funções complexas
  - Estrutura de pastas organizada
  - Nomenclatura clara e consistente
  - Documentação técnica completa
- **Método de Validação**: Code review e análise estática

#### RNF-018: Testabilidade
- **Descrição**: O código deve ser testável.
- **Prioridade**: Baixa
- **Especificação**:
  - Funções puras quando possível
  - Separação de lógica de negócio e apresentação
  - Mocks e stubs para testes
  - Cobertura de testes (meta: 70%+)
- **Método de Validação**: Cobertura de testes automatizados

#### RNF-019: Versionamento
- **Descrição**: O código deve estar versionado adequadamente.
- **Prioridade**: Média
- **Especificação**:
  - Controle de versão com Git
  - Commits descritivos e organizados
  - Branches para features e correções
  - Tags para releases
  - CHANGELOG atualizado
- **Método de Validação**: Auditoria do repositório Git

---

### 3.6 Portabilidade

#### RNF-020: Multiplataforma Mobile
- **Descrição**: O aplicativo mobile deve funcionar em iOS e Android.
- **Prioridade**: Alta
- **Especificação**:
  - Desenvolvido com React Native + Expo
  - Testado em iOS 13+ e Android 8+
  - Interface adaptada para diferentes tamanhos de tela
  - Funcionalidades idênticas em ambas as plataformas
- **Método de Validação**: Testes em dispositivos reais

#### RNF-021: Compatibilidade de Navegadores
- **Descrição**: O painel web deve funcionar em navegadores modernos.
- **Prioridade**: Média
- **Especificação**:
  - Chrome/Edge (últimas 2 versões)
  - Firefox (últimas 2 versões)
  - Safari (últimas 2 versões)
  - Funcionalidades degradadas (não quebradas) em navegadores antigos
- **Método de Validação**: Testes cross-browser

---

### 3.7 Escalabilidade

#### RNF-022: Arquitetura Escalável
- **Descrição**: O sistema deve ser projetado para crescer.
- **Prioridade**: Média
- **Especificação**:
  - API stateless (JWT permite balanceamento de carga)
  - Banco de dados com índices otimizados
  - Separação clara de responsabilidades (Backend, Web, Mobile)
  - Preparado para múltiplas instâncias (load balancer ready)
- **Método de Validação**: Arquitetura revisada

#### RNF-023: Capacidade de Expansão
- **Descrição**: O sistema deve suportar crescimento futuro.
- **Prioridade**: Baixa
- **Especificação**:
  - Suportar aumento de usuários sem refatoração completa
  - Suportar aumento de dados (milhares de questionários)
  - Preparado para cache (Redis) se necessário
  - Preparado para CDN para assets estáticos
- **Método de Validação**: Análise de arquitetura

---

### 3.8 Compatibilidade

#### RNF-024: Integração com Banco de Dados
- **Descrição**: O sistema deve funcionar com PostgreSQL.
- **Prioridade**: Alta
- **Especificação**:
  - Compatível com PostgreSQL 15+
  - Migrações com Prisma
  - Suporte a transações
  - Suporte a índices e constraints
- **Método de Validação**: Testes com PostgreSQL

#### RNF-025: Compatibilidade com Node.js
- **Descrição**: O backend deve funcionar com Node.js LTS.
- **Prioridade**: Alta
- **Especificação**:
  - Compatível com Node.js 20 LTS
  - Dependências atualizadas e compatíveis
  - Não usar APIs deprecadas
- **Método de Validação**: Testes com Node.js 20

---

## 4. Modelo FURPS+

Este documento utiliza o modelo **FURPS+** para categorizar os requisitos não funcionais:

- **F** (Functionality): Requisitos funcionais (Seção 2)
- **U** (Usability): Usabilidade (RNF-010, RNF-011, RNF-012)
- **R** (Reliability): Confiabilidade (RNF-013, RNF-014, RNF-015, RNF-016)
- **P** (Performance): Desempenho (RNF-001, RNF-002, RNF-003, RNF-004)
- **S** (Supportability): Suportabilidade/Manutenibilidade (RNF-017, RNF-018, RNF-019)
- **+** (Design, Implementation, Interface, Physical): Outros requisitos (Segurança, Portabilidade, Escalabilidade, Compatibilidade)

---

## 5. Priorização de Requisitos

### Prioridade Alta (Críticos)
- Todos os requisitos de autenticação e autorização
- Gerenciamento básico de usuários, turmas e questionários
- Resposta a questionários
- Segurança e acessibilidade
- Desempenho básico

### Prioridade Média (Importantes)
- Importação em massa
- Relatórios e exportação
- Dashboard
- Responsividade
- Manutenibilidade

### Prioridade Baixa (Desejáveis)
- Visualização de questionários respondidos
- Testabilidade avançada
- Escalabilidade futura

---

## 6. Rastreabilidade

### 6.1 Requisitos vs. Funcionalidades Implementadas

| Requisito | Status | Observações |
|-----------|--------|-------------|
| RF-001 a RF-003 | ✅ Implementado | Autenticação JWT completa |
| RF-004 a RF-010 | ✅ Implementado | CRUD de usuários completo |
| RF-011 a RF-014 | ✅ Implementado | Gerenciamento de turmas |
| RF-015 a RF-019 | ✅ Implementado | Questionários com 5 tipos de pergunta |
| RF-020 a RF-023 | ✅ Implementado | Resposta mobile acessível |
| RF-024 a RF-026 | ✅ Implementado | Relatórios com gráficos e exportação |
| RF-027 a RF-029 | ✅ Implementado | Acessibilidade WCAG 2.1 |
| RNF-001 a RNF-009 | ✅ Implementado | Segurança e desempenho |
| RNF-010 a RNF-012 | ✅ Implementado | Usabilidade e acessibilidade |
| RNF-013 a RNF-016 | ✅ Implementado | Confiabilidade |
| RNF-017 a RNF-019 | ✅ Implementado | Manutenibilidade |
| RNF-020 a RNF-021 | ✅ Implementado | Portabilidade |
| RNF-022 a RNF-025 | ✅ Implementado | Escalabilidade e compatibilidade |

---

## 7. Glossário

| Termo | Definição |
|-------|-----------|
| **RBAC** | Role-Based Access Control - Controle de acesso baseado em papéis |
| **JWT** | JSON Web Token - Token de autenticação stateless |
| **TTS** | Text-to-Speech - Tecnologia de síntese de voz |
| **WCAG** | Web Content Accessibility Guidelines - Diretrizes de acessibilidade web |
| **API REST** | Application Programming Interface usando arquitetura REST |
| **ORM** | Object-Relational Mapping - Mapeamento objeto-relacional |
| **CSV** | Comma-Separated Values - Formato de arquivo de valores separados por vírgula |
| **XLSX** | Excel Spreadsheet - Formato de arquivo do Microsoft Excel |
| **CORS** | Cross-Origin Resource Sharing - Compartilhamento de recursos entre origens |
| **XSS** | Cross-Site Scripting - Vulnerabilidade de segurança |
| **CSRF** | Cross-Site Request Forgery - Falsificação de requisição entre sites |

---

## 8. Referências

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design Accessibility**: https://m3.material.io/foundations/accessible-design/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **React Native Documentation**: https://reactnative.dev/
- **Prisma Documentation**: https://www.prisma.io/docs

---

## 9. Histórico de Revisões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | 2025 | Equipe | Versão inicial do documento de requisitos |

---

**Documento de Requisitos - Vida Mais APP**  
*Sistema de Pesquisa de Satisfação Digital*

