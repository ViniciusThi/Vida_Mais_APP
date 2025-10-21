# 📱 Guia de Teste do App Mobile - Todos os Perfis

Agora o app mobile funciona para **Admin, Professor e Aluno**!

---

## 🎯 Como Testar Cada Perfil

### 👤 **ALUNO** - Responder Questionários

**Credenciais:**
```
📧 aluno1@vidamais.com
🔑 aluno123
```

**O que você vê:**
- 📋 Lista de questionários disponíveis
- ✅ Questionários já respondidos
- ➡️ Botão "Responder" em cada questionário

**O que pode fazer:**
- ✅ Ver questionários pendentes
- ✅ Responder questionários (uma pergunta por vez)
- ✅ Usar leitura em voz (botão 🔊)
- ✅ Ver histórico de respostas

---

### 👨‍🏫 **PROFESSOR** - Gerenciar Questionários

**Credenciais:**
```
📧 prof1@vidamais.com
🔑 prof123
```

**O que você vê:**
- 📋 Meus Questionários
- ➕ Criar Questionário
- 🎓 Minhas Turmas

**O que pode fazer:**
- ✅ Ver lista de questionários criados
- ✅ Criar novos questionários para suas turmas
- ✅ Adicionar perguntas (5 tipos):
  - Texto livre
  - Escolha única
  - Múltipla escolha
  - Escala (1-5)
  - Sim/Não
- ✅ Ver relatórios com gráficos
- ✅ Ver estatísticas (média, distribuição, etc)

---

### 👨‍💼 **ADMIN** - Gerenciar Tudo

**Credenciais:**
```
📧 admin@vidamais.com
🔑 admin123
```

**O que você vê:**
- 👨‍🏫 Professores
- 👥 Alunos  
- 🎓 Turmas
- 📋 Questionários

**O que pode fazer:**
- ✅ Criar e ver professores
- ✅ Criar e ver alunos
- ✅ Criar turmas e vincular professores
- ✅ Criar questionários globais
- ✅ Tudo que o Professor pode fazer

---

## 🎮 Fluxo de Teste Completo

### 1️⃣ **Como Admin**

```
1. Login: admin@vidamais.com / admin123
2. Toque em "👨‍🏫 Professores"
3. Veja a lista de professores
4. Toque em "➕ Novo Professor" para criar um novo
5. Volte e vá em "👥 Alunos"
6. Veja a lista de alunos
7. Vá em "🎓 Turmas"
8. Veja as turmas com seus professores e alunos
9. Saia e faça login como Professor
```

---

### 2️⃣ **Como Professor**

```
1. Login: prof1@vidamais.com / prof123
2. Toque em "➕ Criar Questionário"
3. Preencha:
   - Título: "Teste Mobile"
   - Descrição: "Questionário criado no celular"
   - Visibilidade: "Turma Específica"
   - Turma: Selecione uma das suas turmas
4. Toque em "➕" para adicionar pergunta
5. Preencha:
   - Enunciado: "Como você avalia este teste?"
   - Tipo: "Escala (1-5)"
6. Toque em "Adicionar Pergunta"
7. Adicione mais 2-3 perguntas
8. Toque em "✓ Criar Questionário"
9. Vá em "📋 Meus Questionários"
10. Toque em "📊 Ver Relatório" de um questionário
11. Veja as estatísticas!
12. Saia e faça login como Aluno
```

---

### 3️⃣ **Como Aluno**

```
1. Login: aluno1@vidamais.com / aluno123
2. Veja o questionário que o professor criou
3. Toque em "Responder →"
4. Responda cada pergunta
5. Toque no 🔊 para ouvir a pergunta em voz
6. Toque em "Próxima →" entre perguntas
7. Na última, toque em "Enviar"
8. Veja a tela de sucesso! ✅
9. Volte e veja que o questionário aparece em "✅ Já Respondidos"
```

---

### 4️⃣ **Volte como Professor**

```
1. Login: prof1@vidamais.com / prof123
2. Vá em "📋 Meus Questionários"
3. Toque em "📊 Ver Relatório"
4. Veja que a resposta do aluno1 apareceu!
5. Veja os gráficos e estatísticas
```

---

## 📊 O Que Cada Perfil Vê

### Dashboard do Admin:
```
┌────────────────────────────────┐
│ Olá, Administrador Geral! 👋   │
│ Administrador Geral            │
│ [Sair]                         │
└────────────────────────────────┘

Menu Administrativo:

┌─────────────────────────────────┐
│ 👨‍🏫  Professores                │
│     Gerenciar professores       │
│                              › │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 👥  Alunos                      │
│     Gerenciar alunos            │
│                              › │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🎓  Turmas                      │
│     Gerenciar turmas            │
│                              › │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📋  Questionários               │
│     Criar questionários globais │
│                              › │
└─────────────────────────────────┘
```

### Dashboard do Professor:
```
┌────────────────────────────────┐
│ Olá, Maria Silva! 👋           │
│ Professor                      │
│ [Sair]                         │
└────────────────────────────────┘

Menu do Professor:

┌─────────────────────────────────┐
│ 📋  Meus Questionários          │
│     Ver e criar questionários   │
│                              › │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ➕  Criar Questionário          │
│     Novo questionário           │
│                              › │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🎓  Minhas Turmas               │
│     Ver suas turmas             │
│                              › │
└─────────────────────────────────┘
```

### Dashboard do Aluno:
```
┌────────────────────────────────┐
│ Olá, Ana Costa! 👋             │
│ Aluno                          │
│ [Sair]                         │
└────────────────────────────────┘

Turma: Turma Manhã - 2025

📋 Questionários Pendentes:

┌─────────────────────────────────┐
│ Pesquisa de Satisfação 2025    │
│ Avalie nossa instituição       │
│                                │
│ 4 perguntas     Responder →    │
└─────────────────────────────────┘

✅ Já Respondidos:

┌─────────────────────────────────┐
│ Teste Mobile                   │
│ Obrigado pela participação!    │
└─────────────────────────────────┘
```

---

## 🔄 Testar Logoff e Login

Para testar outro perfil:

1. Toque em **"Sair"** no topo
2. Será redirecionado para tela de login
3. Faça login com outra credencial
4. Veja que o menu muda conforme o perfil!

---

## ✨ Recursos Implementados

### Para Todos:
- ✅ Login seguro
- ✅ Logout
- ✅ Pull to refresh (arraste para baixo)
- ✅ Interface responsiva
- ✅ Fontes grandes e acessíveis

### Para Admin:
- ✅ CRUD de professores
- ✅ CRUD de alunos
- ✅ CRUD de turmas (com seleção de professor)
- ✅ Ver totais e estatísticas

### Para Professor:
- ✅ Criar questionários com múltiplas perguntas
- ✅ 5 tipos de perguntas
- ✅ Ver relatórios com gráficos
- ✅ Estatísticas (média, distribuição, etc)

### Para Aluno:
- ✅ Ver questionários pendentes
- ✅ Responder com interface acessível
- ✅ Leitura em voz (TTS)
- ✅ Uma pergunta por vez
- ✅ Histórico de respostas

---

## 📋 Checklist de Teste

- [ ] Testei login como Admin
- [ ] Criei um professor pelo app
- [ ] Criei um aluno pelo app
- [ ] Criei uma turma pelo app
- [ ] Testei login como Professor
- [ ] Criei um questionário pelo app
- [ ] Adicionei perguntas de todos os tipos
- [ ] Vi o relatório de um questionário
- [ ] Testei login como Aluno
- [ ] Respondi um questionário
- [ ] Usei a leitura em voz
- [ ] Vi que a resposta apareceu no relatório

---

## 🆘 Solução de Problemas

### Erro ao carregar dados
- Verifique se o backend está rodando na AWS
- Teste: `http://54.233.110.183/api/health` no navegador

### "Unauthorized" ou "Forbidden"
- Faça logout e login novamente
- O token JWT pode ter expirado

### Tela em branco após login
- Puxe para baixo (pull to refresh)
- Verifique a conexão de internet

---

## 🚀 Próximos Passos

Após testar tudo:

1. ✅ Personalize as cores em cada tela
2. ✅ Adicione validações extras
3. ✅ Teste com usuários reais
4. ✅ Colete feedback
5. ✅ Faça ajustes conforme necessário
6. ✅ Publique nas lojas (veja `docs/PUBLICACAO.md`)

---

✅ **Sistema completo e funcional para todos os perfis no mobile!** 🎉

