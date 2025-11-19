# Questionário Padrão de Satisfação - Vida Mais

## Visão Geral

O sistema possui **templates de questionários pré-configurados** com 38 questões fixas que avaliam a satisfação dos associados com o programa Vida Mais. O admin pode criar novos questionários a partir desses templates, personalizando o título e ano, mas mantendo as mesmas perguntas.

## Características

- ✅ **Templates pré-configurados** com 38 questões
- ✅ **Criação rápida** - escolha template, defina título e ano
- ✅ **Questionário anual** (um por ano)
- ✅ **Lançamento controlado** (admin decide quando ativar)
- ✅ **Respostas anônimas** (nos relatórios)
- ✅ **Rastreamento de respondentes** (admin pode ver quem já respondeu)
- ✅ **Duplicação facilitada** (copiar questionário para novo ano)

## Como Funciona

### 1. Ver Templates Disponíveis

```bash
GET /prof/templates
Authorization: Bearer {token_admin_ou_prof}
```

**Resposta:**
```json
{
  "templates": [
    {
      "id": "pesquisa-satisfacao",
      "nome": "Pesquisa de Satisfação dos Usuários",
      "descricao": "Questionário anual com 38 perguntas sobre satisfação e bem-estar dos associados",
      "totalPerguntas": 39,
      "perguntas": [...38 perguntas...]
    }
  ]
}
```

### 2. Criar Questionário a partir de Template

```bash
POST /prof/questionarios/criar-de-template
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "templateId": "pesquisa-satisfacao",
  "titulo": "Pesquisa de Satisfação 2025",
  "descricao": "Avaliação anual dos serviços - 2025",
  "ano": 2025
}
```

**Resposta:**
```json
{
  "message": "Questionário criado com sucesso a partir do template",
  "questionario": {
    "id": "uuid",
    "titulo": "Pesquisa de Satisfação 2025",
    "padrao": true,
    "ano": 2025,
    "ativo": false,
    "perguntas": [...39 perguntas...]
  }
}
```

### 3. Lançar o Questionário (Ativar)

Quando o admin estiver pronto para que os associados respondam:

```bash
POST /prof/questionarios-padrao/{id}/lancar
Authorization: Bearer {token_admin}
```

**Resposta:**
```json
{
  "message": "Questionário padrão lançado com sucesso",
  "questionario": {
    "id": "uuid",
    "titulo": "Pesquisa de Satisfação 2025",
    "ativo": true,
    "periodoInicio": "2025-01-15T10:00:00.000Z"
  }
}
```

### 4. Listar Questionários Padrão Criados

```bash
GET /prof/questionarios-padrao
Authorization: Bearer {token_admin_ou_prof}
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "titulo": "Pesquisa de Satisfação dos Usuários - 2025",
    "padrao": true,
    "ano": 2025,
    "ativo": true,
    "_count": {
      "perguntas": 38,
      "respostas": 150
    }
  }
]
```

### 5. Ver Detalhes do Questionário

```bash
GET /prof/questionarios-padrao/{id}
Authorization: Bearer {token_admin_ou_prof}
```

### 6. Encerrar o Questionário

Quando o período de respostas terminar:

```bash
POST /prof/questionarios-padrao/{id}/encerrar
Authorization: Bearer {token_admin}
```

### 7. Duplicar para Novo Ano

Para criar o questionário do próximo ano baseado no anterior:

```bash
POST /prof/questionarios-padrao/{id}/duplicar
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "novoAno": 2026
}
```

## Estrutura das 38 Questões

### Perguntas Abertas (1-5)
1. Há quanto tempo você frequenta o Vida Mais?
2. O que mudou na sua vida? (condicional - se está há mais de 1 ano)
3. Hoje você se sente melhor do que há um ano atrás?
4. O que mudou em sua vida depois que começou a frequentar o Vida Mais?
5. Como tem sido sua experiência no Vida Mais?

### Perguntas de Bem-Estar (6-19) - Sim/Não/Não sei dizer
- Você se sente mais bem-humorado?
- Você se sente mais alegre?
- Você tem mais equilíbrio corporal?
- Você dorme melhor?
- Você fez novas amizades?
- Você melhorou sua qualidade de vida?
- Você melhorou relacionamento familiar?
- Você deixou de tomar remédios?
- Você diminuiu quantidade de remédios?
- Você tem melhor saúde física?
- Você tem melhor saúde mental?
- Como se imagina nos próximos anos? (Bem/Mal/Não sei)
- Pretende sair do Vida Mais?
- Indicaria o Vida Mais para alguém?

### Avaliação da Equipe (20-34) - Nota 0 a 10
- Márcia (recepcionista)
- Thais (aux. enfermagem)
- Thamiris (aux. enfermagem)
- Tainara (enfermeira)
- Ana Paula (nutricionista)
- Jéssica (fisioterapeuta)
- Dra. Lilian (geriatra)
- Laís (psicóloga)
- Gabriela (terapeuta ocupacional)
- Viviane (assistente social)
- Letícia (fonoaudióloga)
- Carol (dentista)
- Paulo (prof. educação física)
- Pedro (coordenador geral)
- Rodrigo (aux. serviços gerais)

### Avaliação de Serviços (35-39)
35. Nota sobre voluntários (0-10)
36. Comentário sobre voluntários (texto)
37. Faz aulas de hidroginástica? (Sim/Não)
38. Falta em dias nublados/chuvosos/frios? (Sim/Não)
39. Avaliação da limpeza da piscina (0-10)

## Para os Associados

### Ver Questionários Disponíveis

```bash
GET /aluno/questionarios
Authorization: Bearer {token_associado}
```

Os associados verão apenas questionários **ativos** que eles ainda **não responderam**.

### Responder ao Questionário

```bash
POST /aluno/questionarios/{id}/responder
Authorization: Bearer {token_associado}
Content-Type: application/json

{
  "respostas": [
    { "perguntaId": "uuid1", "valorTexto": "Frequento há 2 anos" },
    { "perguntaId": "uuid2", "valorOpcao": "Sim" },
    { "perguntaId": "uuid3", "valorNum": 9 }
  ]
}
```

## Relatórios e Anonimato

### Ver Relatório Agregado

```bash
GET /prof/relatorios/{questionarioId}
Authorization: Bearer {token_admin_ou_prof}
```

**As respostas de texto são anônimas** (mostram apenas ID sequencial, não o nome do associado).

### Ver Quem Já Respondeu

```bash
GET /prof/relatorios/{questionarioId}/respondentes
Authorization: Bearer {token_admin_ou_prof}
```

**Resposta:**
```json
{
  "total": 45,
  "respondentes": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@email.com",
      "dataResposta": "2025-01-20T14:30:00.000Z"
    }
  ]
}
```

## Permissões

| Ação | ADMIN | PROF | ALUNO |
|------|-------|------|-------|
| Criar questionário padrão | ✅ | ❌ | ❌ |
| Lançar questionário | ✅ | ❌ | ❌ |
| Encerrar questionário | ✅ | ❌ | ❌ |
| Duplicar questionário | ✅ | ❌ | ❌ |
| Ver questionários padrão | ✅ | ✅ | ❌ |
| Ver relatórios | ✅ | ✅ | ❌ |
| Responder questionário | ❌ | ❌ | ✅ |

## Fluxo Anual Recomendado

1. **Janeiro:** Admin acessa templates disponíveis
2. **Criação:** Admin cria questionário usando template, define título/ano
3. **Quando pronto:** Admin lança o questionário
4. **Durante o ano:** Associados respondem
5. **Quando encerrar:** Admin encerra o questionário
6. **Análise:** Admin e professores analisam relatórios
7. **Próximo ano:** Admin duplica ou cria novo do template

## Exemplo de Uso Completo

```bash
# 1. Ver templates disponíveis
curl http://localhost:3000/prof/templates \
  -H "Authorization: Bearer {token_admin}"

# 2. Criar questionário a partir do template
curl -X POST http://localhost:3000/prof/questionarios/criar-de-template \
  -H "Authorization: Bearer {token_admin}" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "pesquisa-satisfacao",
    "titulo": "Pesquisa de Satisfação 2025",
    "descricao": "Avaliação anual dos serviços",
    "ano": 2025
  }'

# 3. Admin lança o questionário
curl -X POST http://localhost:3000/prof/questionarios-padrao/{id}/lancar \
  -H "Authorization: Bearer {token_admin}"

# 4. Associados respondem via app mobile

# 5. Admin vê relatório
curl http://localhost:3000/prof/relatorios/{id} \
  -H "Authorization: Bearer {token_admin}"

# 6. Admin vê quem respondeu
curl http://localhost:3000/prof/relatorios/{id}/respondentes \
  -H "Authorization: Bearer {token_admin}"

# 7. Admin encerra
curl -X POST http://localhost:3000/prof/questionarios-padrao/{id}/encerrar \
  -H "Authorization: Bearer {token_admin}"

# 8. No próximo ano, pode duplicar ou criar novo do template
curl -X POST http://localhost:3000/prof/questionarios-padrao/{id}/duplicar \
  -H "Authorization: Bearer {token_admin}" \
  -H "Content-Type: application/json" \
  -d '{"novoAno": 2026}'
```

