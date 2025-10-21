# 📚 Documentação da API - Vida Mais

Base URL: `http://localhost:3000` (desenvolvimento) ou `https://seudominio.com/api` (produção)

## 🔐 Autenticação

Todas as rotas (exceto `/auth/login`) requerem autenticação via JWT.

**Header:**
```
Authorization: Bearer <seu_token_jwt>
```

---

## 🔑 Autenticação

### POST /auth/login
Faz login e retorna um token JWT.

**Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "usuario@email.com",
    "role": "ADMIN" | "PROF" | "ALUNO"
  }
}
```

**Erros:**
- `401`: Email ou senha inválidos
- `401`: Usuário inativo

---

## 👨‍💼 Rotas de Admin

### GET /admin/professores
Lista todos os professores.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Maria Silva",
    "email": "maria@vidamais.com",
    "ativo": true,
    "criadoEm": "2025-01-01T00:00:00.000Z",
    "_count": {
      "turmasProfessor": 2
    }
  }
]
```

### POST /admin/professores
Cria um novo professor.

**Body:**
```json
{
  "nome": "João Santos",
  "email": "joao@vidamais.com",
  "senha": "senha123"
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "nome": "João Santos",
  "email": "joao@vidamais.com",
  "role": "PROF",
  "criadoEm": "2025-01-01T00:00:00.000Z"
}
```

### GET /admin/alunos
Lista todos os alunos.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Ana Costa",
    "email": "ana@vidamais.com",
    "ativo": true,
    "alunoTurmas": [
      {
        "turma": {
          "id": "uuid",
          "nome": "Turma Manhã - 2025"
        }
      }
    ]
  }
]
```

### POST /admin/alunos
Cria um novo aluno.

**Body:**
```json
{
  "nome": "Carlos Oliveira",
  "email": "carlos@vidamais.com",
  "senha": "senha123"
}
```

### POST /admin/alunos/import
Importa múltiplos alunos via CSV.

**Body:**
```json
{
  "csv": "nome,email,senha\nAluno 1,aluno1@email.com,senha1\nAluno 2,aluno2@email.com,senha2"
}
```

**Resposta (200):**
```json
{
  "imported": 2,
  "alunos": [
    { "id": "uuid", "nome": "Aluno 1", "email": "aluno1@email.com" },
    { "id": "uuid", "nome": "Aluno 2", "email": "aluno2@email.com" }
  ]
}
```

### GET /admin/turmas
Lista todas as turmas.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Turma Manhã - 2025",
    "ano": 2025,
    "professor": {
      "id": "uuid",
      "nome": "Maria Silva",
      "email": "maria@vidamais.com"
    },
    "_count": {
      "alunos": 8
    }
  }
]
```

### POST /admin/turmas
Cria uma nova turma.

**Body:**
```json
{
  "nome": "Turma Tarde - 2025",
  "ano": 2025,
  "professorId": "uuid-do-professor"
}
```

### POST /admin/vincular-aluno
Vincula um aluno a uma turma.

**Body:**
```json
{
  "alunoId": "uuid-do-aluno",
  "turmaId": "uuid-da-turma"
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "aluno": {
    "id": "uuid",
    "nome": "Ana Costa",
    "email": "ana@vidamais.com"
  },
  "turma": {
    "id": "uuid",
    "nome": "Turma Manhã - 2025"
  }
}
```

### DELETE /admin/vincular-aluno/:id
Desvincula um aluno de uma turma.

**Resposta (204):** Sem conteúdo

---

## 👨‍🏫 Rotas de Professor

### GET /prof/minhas-turmas
Lista turmas do professor logado.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Turma Manhã - 2025",
    "ano": 2025,
    "_count": {
      "alunos": 8,
      "questionarios": 3
    }
  }
]
```

### GET /prof/questionarios
Lista questionários do professor.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "titulo": "Pesquisa de Satisfação 2025",
    "descricao": "Pesquisa anual...",
    "visibilidade": "TURMA",
    "ativo": true,
    "turma": {
      "id": "uuid",
      "nome": "Turma Manhã - 2025"
    },
    "_count": {
      "perguntas": 5,
      "respostas": 12
    }
  }
]
```

### POST /prof/questionarios
Cria um questionário.

**Body:**
```json
{
  "titulo": "Pesquisa de Satisfação 2025",
  "descricao": "Avalie nossa instituição",
  "visibilidade": "TURMA",
  "turmaId": "uuid-da-turma",
  "periodoInicio": "2025-08-01T00:00:00.000Z",
  "periodoFim": "2025-09-30T23:59:59.000Z"
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "titulo": "Pesquisa de Satisfação 2025",
  "visibilidade": "TURMA",
  "ativo": true,
  "turma": {
    "id": "uuid",
    "nome": "Turma Manhã - 2025"
  }
}
```

### GET /prof/questionarios/:id
Detalhes de um questionário.

**Resposta (200):**
```json
{
  "id": "uuid",
  "titulo": "Pesquisa de Satisfação 2025",
  "descricao": "...",
  "turma": { ... },
  "perguntas": [
    {
      "id": "uuid",
      "ordem": 1,
      "tipo": "ESCALA",
      "enunciado": "Como você avalia...?",
      "obrigatoria": true,
      "opcoesJson": null
    }
  ]
}
```

### PUT /prof/questionarios/:id
Atualiza um questionário.

**Body:** (campos opcionais)
```json
{
  "titulo": "Novo Título",
  "descricao": "Nova descrição",
  "ativo": false
}
```

### DELETE /prof/questionarios/:id
Deleta um questionário.

**Resposta (204):** Sem conteúdo

### POST /prof/perguntas
Adiciona uma pergunta a um questionário.

**Body:**
```json
{
  "questionarioId": "uuid-do-questionario",
  "ordem": 1,
  "tipo": "UNICA",
  "enunciado": "Você se sente acolhido?",
  "obrigatoria": true,
  "opcoes": ["Sempre", "Às vezes", "Raramente", "Nunca"]
}
```

**Tipos válidos:** `TEXTO`, `UNICA`, `MULTIPLA`, `ESCALA`, `BOOLEAN`

**Resposta (201):**
```json
{
  "id": "uuid",
  "questionarioId": "uuid",
  "ordem": 1,
  "tipo": "UNICA",
  "enunciado": "Você se sente acolhido?",
  "obrigatoria": true,
  "opcoes": ["Sempre", "Às vezes", "Raramente", "Nunca"]
}
```

### PUT /prof/perguntas/:id
Atualiza uma pergunta.

**Body:** (campos opcionais)
```json
{
  "enunciado": "Novo enunciado",
  "obrigatoria": false
}
```

### DELETE /prof/perguntas/:id
Deleta uma pergunta.

**Resposta (204):** Sem conteúdo

### GET /prof/relatorios/:questionarioId
Relatório agregado de um questionário.

**Resposta (200):**
```json
{
  "questionario": {
    "id": "uuid",
    "titulo": "Pesquisa de Satisfação 2025",
    "turma": "Turma Manhã - 2025"
  },
  "totalRespondentes": 8,
  "relatorio": [
    {
      "pergunta": {
        "id": "uuid",
        "ordem": 1,
        "enunciado": "Como você avalia...?",
        "tipo": "ESCALA"
      },
      "totalRespostas": 8,
      "agregacao": {
        "media": 4.2,
        "min": 3,
        "max": 5
      }
    },
    {
      "pergunta": {
        "id": "uuid",
        "ordem": 2,
        "enunciado": "Você se sente acolhido?",
        "tipo": "UNICA"
      },
      "totalRespostas": 8,
      "agregacao": {
        "distribuicao": {
          "Sempre": 5,
          "Às vezes": 2,
          "Raramente": 1,
          "Nunca": 0
        }
      }
    }
  ]
}
```

### GET /prof/export/:questionarioId?formato=xlsx
Exporta dados para Excel ou CSV.

**Query params:**
- `formato`: `xlsx` ou `csv` (padrão: `xlsx`)

**Resposta (200):** Arquivo binário para download

---

## 👤 Rotas de Aluno

### GET /aluno/minhas-turmas
Lista turmas do aluno.

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Turma Manhã - 2025",
    "ano": 2025,
    "professor": {
      "id": "uuid",
      "nome": "Maria Silva",
      "email": "maria@vidamais.com"
    }
  }
]
```

### GET /aluno/questionarios-ativos?turmaId=uuid
Lista questionários disponíveis para o aluno.

**Query params:**
- `turmaId` (opcional): Filtrar por turma específica

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "titulo": "Pesquisa de Satisfação 2025",
    "descricao": "Avalie nossa instituição",
    "turma": {
      "id": "uuid",
      "nome": "Turma Manhã - 2025"
    },
    "periodoInicio": "2025-08-01T00:00:00.000Z",
    "periodoFim": "2025-09-30T23:59:59.000Z",
    "_count": {
      "perguntas": 5
    },
    "respondido": false
  }
]
```

### GET /aluno/questionarios/:id
Detalhes de um questionário (para responder).

**Resposta (200):**
```json
{
  "id": "uuid",
  "titulo": "Pesquisa de Satisfação 2025",
  "descricao": "...",
  "turma": {
    "id": "uuid",
    "nome": "Turma Manhã - 2025"
  },
  "perguntas": [
    {
      "id": "uuid",
      "ordem": 1,
      "tipo": "ESCALA",
      "enunciado": "Como você avalia...?",
      "obrigatoria": true,
      "opcoes": null
    },
    {
      "id": "uuid",
      "ordem": 2,
      "tipo": "UNICA",
      "enunciado": "Você se sente acolhido?",
      "obrigatoria": true,
      "opcoes": ["Sempre", "Às vezes", "Raramente", "Nunca"]
    }
  ]
}
```

### POST /aluno/respostas
Envia respostas de um questionário.

**Body:**
```json
{
  "questionarioId": "uuid-do-questionario",
  "turmaId": "uuid-da-turma",
  "respostas": [
    {
      "perguntaId": "uuid-pergunta-1",
      "valorNum": 5
    },
    {
      "perguntaId": "uuid-pergunta-2",
      "valorOpcao": "Sempre"
    },
    {
      "perguntaId": "uuid-pergunta-3",
      "valorBool": true
    },
    {
      "perguntaId": "uuid-pergunta-4",
      "valorTexto": "Gosto muito das atividades oferecidas."
    }
  ]
}
```

**Resposta (201):**
```json
{
  "message": "Respostas enviadas com sucesso",
  "total": 4
}
```

**Erros:**
- `403`: Questionário inativo ou fora do período
- `403`: Aluno não pertence à turma
- `409`: Aluno já respondeu este questionário
- `400`: Pergunta obrigatória não respondida

---

## 🚨 Códigos de Status HTTP

- `200` - OK
- `201` - Criado
- `204` - Sem conteúdo (sucesso em DELETE)
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `409` - Conflito (ex: email já existe)
- `500` - Erro interno do servidor

## 🛠️ Exemplo de Uso com cURL

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vidamais.com","senha":"admin123"}'
```

### Listar Questionários (com token)
```bash
curl http://localhost:3000/prof/questionarios \
  -H "Authorization: Bearer seu_token_aqui"
```

---

Para mais detalhes, consulte o código-fonte em `backend/src/routes/`

