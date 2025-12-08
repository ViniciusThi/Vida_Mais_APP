# 🎯 Forms Tech - Guia de Apresentação

## 📋 Informações Gerais

- **Nome do Sistema**: Forms Tech
- **Tipo**: Sistema de Pesquisas e Questionários com Análise Preditiva
- **Plataformas**: Web + Mobile (Android/iOS)
- **Público-alvo**: Instituições educacionais, empresas de pesquisa

---

## ⏱️ Tempo Sugerido: 15-20 minutos

| Parte | Tempo | Conteúdo |
|-------|-------|----------|
| 1. Introdução | 2 min | Problema e solução |
| 2. Arquitetura | 3 min | Tecnologias e estrutura |
| 3. Demo Web | 5 min | Fluxo Admin e Professor |
| 4. Demo Mobile | 5 min | Fluxo Aluno |
| 5. ML/Analytics | 3 min | Análise preditiva |
| 6. Conclusão | 2 min | Diferenciais e próximos passos |

---

## 🚀 ROTEIRO DA APRESENTAÇÃO

---

### PARTE 1: INTRODUÇÃO (2 minutos)

#### 1.1 Apresente o Problema

> "Instituições educacionais enfrentam dificuldades em coletar feedback estruturado dos alunos e identificar padrões que possam prever problemas como evasão escolar."

#### 1.2 Apresente a Solução

> "O Forms Tech é um sistema completo de pesquisas que permite criar questionários personalizados, coletar respostas via web ou mobile, e usar inteligência artificial para análises preditivas."

#### 1.3 Principais Funcionalidades (liste rápido)

- ✅ Questionários customizáveis (escalas, múltipla escolha, texto)
- ✅ Aplicativo mobile acessível (texto-para-voz, fontes ajustáveis)
- ✅ Relatórios em tempo real com gráficos
- ✅ Exportação para Excel com análises
- ✅ **Machine Learning**: Predição de evasão e padrões de engajamento

---

### PARTE 2: ARQUITETURA TÉCNICA (3 minutos)

#### 2.1 Mostre o Diagrama

```
┌─────────────┐     ┌─────────────┐
│   Mobile    │     │    Web      │
│ React Native│     │   React     │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 ▼
         ┌──────────────┐
         │   Backend    │
         │   Node.js    │
         │   Express    │
         └──────┬───────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│    MySQL     │  │  ML Service  │
│   (Prisma)   │  │   Python     │
└──────────────┘  └──────────────┘
```

#### 2.2 Mencione os Principais Pontos

> "Utilizamos **TypeScript** em todo o projeto para segurança de tipos."

> "O **Prisma ORM** facilita a comunicação com o banco MySQL."

> "O serviço de **Machine Learning em Python** usa Scikit-learn para análises preditivas."

> "Tudo está rodando na **AWS** (EC2 + RDS)."

---

### PARTE 3: DEMONSTRAÇÃO WEB (5 minutos)

#### 🔐 3.1 Login como Admin

**URL**: `http://SEU_IP:5173` (ou localhost:5173 local)

**Credenciais Admin:**
- Email: `admin@formstech.com`
- Senha: `admin123`

#### O que mostrar:

1. **Dashboard Admin** - Visão geral do sistema
   - Mostre os cards com estatísticas
   - "Aqui o administrador vê o total de usuários, turmas e questionários"

2. **Gestão de Professores**
   - Clique em "Professores"
   - Mostre a lista de professores cadastrados
   - "O admin pode criar, editar e desativar professores"

3. **Gestão de Turmas**
   - Clique em "Turmas"
   - Mostre as turmas existentes
   - "Cada turma tem um professor responsável e alunos vinculados"

4. **Insights Preditivos 🤖** (DESTAQUE!)
   - Clique em "Insights Preditivos"
   - Mostre o dashboard de ML
   - "Aqui temos análises de Machine Learning em tempo real"
   - Mostre:
     - Status do serviço ML
     - Visão geral (total de alunos, taxa de resposta)
     - Selecione uma turma para ver análises específicas
     - Predição de risco de evasão

---

#### 👨‍🏫 3.2 Login como Professor

**Credenciais Professor:**
- Email: `professor@formstech.com`
- Senha: `prof123`

#### O que mostrar:

1. **Dashboard Professor**
   - "O professor vê apenas suas turmas e questionários"

2. **Minhas Turmas**
   - Mostre a lista de turmas do professor
   - Clique em uma turma para ver os alunos

3. **Questionários**
   - Mostre os questionários ativos
   - "O professor pode criar questionários customizados"

4. **Relatórios** (IMPORTANTE!)
   - Acesse um relatório de questionário
   - Mostre os gráficos (Chart.js)
   - "Aqui vemos as respostas em gráficos interativos"

5. **Exportação Excel**
   - Clique no botão "Exportar Excel"
   - "O relatório é baixado com múltiplas abas: dados brutos, estatísticas e resumo"

---

### PARTE 4: DEMONSTRAÇÃO MOBILE (5 minutos)

#### 📱 Iniciando o App

Se estiver rodando localmente:
```bash
cd mobile
npx expo start
```

Use o **Expo Go** no celular ou emulador.

---

#### 🔐 4.1 Login como Aluno

**Credenciais Aluno:**
- Email: `aluno@formstech.com`
- Senha: `aluno123`

#### O que mostrar:

1. **Tela de Login**
   - Mostre o design limpo e acessível
   - "Interface pensada para facilidade de uso"

2. **Tela Inicial**
   - Mostre os questionários disponíveis
   - "O aluno vê apenas os questionários das suas turmas"

3. **Respondendo Questionário** (FLUXO PRINCIPAL!)
   - Clique em um questionário
   - Mostre diferentes tipos de perguntas:
     - **Escala (0-10)**: "Temos um slider de 0 a 10 para perguntas de avaliação"
     - **Sim/Não**: Mostre os botões grandes
     - **Múltipla Escolha**: Mostre as opções
     - **Texto**: Mostre o campo de texto

4. **Navegação**
   - Mostre os botões "Anterior" e "Próxima"
   - "O usuário pode navegar livremente entre as perguntas"

5. **Revisão de Respostas** (DESTAQUE!)
   - Na última pergunta, clique em "📋 REVISAR"
   - Mostre a tela de revisão
   - "O aluno pode ver todas as respostas antes de enviar"
   - "Clicando em qualquer pergunta, ele volta direto para editá-la"

6. **Envio**
   - Clique em "✓ ENVIAR RESPOSTAS"
   - Mostre a tela de sucesso
   - "Confirmação clara que as respostas foram salvas"

---

#### ♿ 4.2 Recursos de Acessibilidade

1. **Tamanho de Fonte**
   - Vá em Configurações
   - Mostre o ajuste de tamanho de fonte
   - "Usuários podem aumentar a fonte para melhor leitura"

2. **Texto para Voz** (se implementado)
   - Mostre o botão de áudio
   - "O sistema lê as perguntas em voz alta"

---

### PARTE 5: MACHINE LEARNING (3 minutos)

#### 🤖 5.1 Explique o que foi implementado

> "Criamos um serviço de Machine Learning em Python que analisa os dados dos questionários para gerar insights preditivos."

#### 5.2 Modelos Utilizados

1. **Random Forest Classifier** - Predição de Evasão
   - "Analisa padrões de resposta para identificar alunos com risco de abandonar"
   - Features: taxa de resposta, média de notas, engajamento

2. **Gradient Boosting Regressor** - Predição de Desempenho
   - "Prevê o desempenho futuro baseado no histórico"

#### 5.3 Mostre na Prática

- Volte ao Web Admin como Admin
- Acesse "Insights Preditivos"
- Mostre:
  - Gráfico de risco de evasão
  - Padrões de engajamento
  - Recomendações automáticas

> "O sistema identifica automaticamente alunos que precisam de atenção especial."

---

### PARTE 6: CONCLUSÃO (2 minutos)

#### 6.1 Diferenciais do Projeto

1. **Full-Stack Completo**
   - Web + Mobile + Backend + ML
   - Tudo em produção na AWS

2. **Tecnologias Modernas**
   - TypeScript, React, Node.js, Python
   - Prisma, Scikit-learn, Tailwind

3. **Acessibilidade**
   - Fontes ajustáveis, alto contraste, texto-para-voz

4. **Análise Inteligente**
   - Machine Learning sem APIs pagas
   - Predição de evasão em tempo real

5. **Exportação Profissional**
   - Excel com múltiplas abas e gráficos

#### 6.2 Possíveis Melhorias Futuras

- Notificações push
- Dashboard mais detalhado
- Mais modelos de ML (classificação de sentimento)
- Integração com sistemas escolares (TOTVS, etc.)

#### 6.3 Finalize

> "O Forms Tech demonstra a aplicação prática de um sistema completo, desde a coleta de dados até análises preditivas com Machine Learning, tudo desenvolvido com tecnologias modernas e foco na experiência do usuário."

---

## 📝 CHECKLIST PRÉ-APRESENTAÇÃO

### Antes de começar:

- [ ] Servidor backend rodando (EC2 ou local `npm run dev`)
- [ ] Serviço ML rodando (Python Flask)
- [ ] Web admin acessível no navegador
- [ ] Expo/Mobile configurado (Expo Go ou emulador)
- [ ] Dados de teste no banco (questionários, respostas)
- [ ] Credenciais de login anotadas
- [ ] Conexão com internet estável

### Comandos úteis:

```bash
# Backend local
cd backend
npm run dev

# ML Service local
cd ml-service
source venv/bin/activate  # Linux/Mac
python app.py

# Web Admin
cd web-admin
npm run dev

# Mobile
cd mobile
npx expo start
```

### URLs:

| Serviço | URL Local | URL Produção |
|---------|-----------|--------------|
| Web Admin | http://localhost:5173 | http://SEU_IP:5173 |
| Backend API | http://localhost:3000 | http://SEU_IP:3000 |
| ML Service | http://localhost:5000 | http://SEU_IP:5000 |

---

## 🎤 DICAS DE APRESENTAÇÃO

1. **Mantenha o ritmo** - Não demore muito em cada tela
2. **Foque no fluxo** - Mostre o caminho completo do usuário
3. **Destaque o ML** - É o diferencial técnico do projeto
4. **Prepare para perguntas** sobre:
   - Por que essas tecnologias?
   - Como funciona a predição?
   - Quanto tempo levou para desenvolver?
   - Desafios encontrados?

5. **Se algo falhar** - Tenha screenshots prontos como backup

---

## ❓ PERGUNTAS FREQUENTES

**P: Por que TypeScript?**
> "TypeScript previne erros em tempo de desenvolvimento, melhora a documentação do código e facilita refatorações seguras."

**P: Por que não usar uma API de ML paga (OpenAI)?**
> "O requisito era usar soluções gratuitas. Scikit-learn oferece algoritmos robustos sem custo, e os modelos rodam no próprio servidor."

**P: Quanto tempo de desenvolvimento?**
> "O projeto foi desenvolvido ao longo do semestre, com foco em entregar um MVP funcional com todas as camadas."

**P: Qual o maior desafio?**
> "Integrar todas as camadas (mobile, web, backend, ML) e fazer o deploy na AWS de forma que tudo se comunicasse corretamente."

---

*Boa apresentação! 🚀*

