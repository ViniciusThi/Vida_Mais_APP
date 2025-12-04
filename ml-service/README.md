# 🤖 ML Service - Análise Preditiva Forms Tech

Serviço Python de Machine Learning para análise preditiva de dados do sistema Forms Tech.

## 📋 Funcionalidades

### 1. **Predição de Risco de Evasão**
- Identifica alunos com maior risco de abandonar o programa
- Classifica risco em: Alto, Médio, Baixo
- Fatores analisados:
  - Dias sem responder questionários
  - Taxa de participação
  - Média de notas
  - Padrões de engajamento

### 2. **Análise de Desempenho**
- Prediz tendência de desempenho dos alunos
- Identifica padrões de melhora ou queda
- Gera recomendações personalizadas

### 3. **Identificação de Padrões**
- Padrões de engajamento por turma
- Padrões de resposta em questionários
- Análise temporal de atividades

### 4. **Analytics Avançado**
- Visão geral do sistema
- Análise detalhada por turma
- Análise individual de alunos

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```bash
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=vida_mais
PORT=5000
```

### 3. Executar o serviço

```bash
python app.py
```

O serviço estará disponível em `http://localhost:5000`

## 📚 API Endpoints

### Health Check
```
GET /health
```

### Analytics
```
GET /analytics/overview
GET /analytics/turma/<turma_id>
GET /analytics/aluno/<aluno_id>
```

### Predições
```
POST /predict/evasao
Body: { "turmaId": "uuid" }

POST /predict/desempenho
Body: { "alunoId": "uuid" }
```

### Padrões
```
GET /patterns/engagement?turmaId=<uuid>
GET /patterns/responses?questionarioId=<uuid>
```

### Modelos
```
POST /train/models  # Treinar modelos
GET /models/status  # Status dos modelos
```

## 🧠 Algoritmos Utilizados

### Predição de Evasão
- **Algoritmo**: Random Forest Classifier
- **Features**:
  - Dias desde última resposta
  - Taxa de participação
  - Média de notas
  - Dias desde cadastro
  - Engajamento por dia

### Predição de Desempenho
- **Algoritmo**: Gradient Boosting Regressor
- **Features**:
  - Histórico de notas
  - Tendência temporal
  - Padrões de resposta

## 📊 Métricas e KPIs

- Taxa de engajamento
- Distribuição de notas
- Dias ativos
- Questionários respondidos
- Tendências temporais

## 🔧 Tecnologias

- **Flask**: API REST
- **Scikit-learn**: Machine Learning
- **Pandas & NumPy**: Análise de dados
- **PyMySQL**: Conexão com banco de dados
- **Joblib**: Persistência de modelos

## 🐳 Deploy com Docker (Opcional)

```bash
docker build -t vida-mais-ml .
docker run -p 5000:5000 --env-file .env vida-mais-ml
```

## 📈 Roadmap Futuro

- [ ] Deep Learning para análises mais complexas
- [ ] Análise de sentimento em respostas textuais
- [ ] Clustering de alunos por perfil
- [ ] Recomendações automáticas de conteúdo
- [ ] Dashboard de visualização integrado

## 🤝 Contribuindo

Este serviço foi projetado para ser facilmente extensível. Para adicionar novos modelos ou análises, modifique os arquivos em `services/`.

## 📝 Notas

- O serviço usa **heurística** quando não há dados suficientes para ML
- Recomenda-se pelo menos 30 alunos com dados para treinar modelos
- Modelos são salvos em `./models/` e podem ser retreinados

## 🔒 Segurança

- CORS configurado para aceitar requisições do backend Node
- Recomenda-se adicionar autenticação JWT em produção
- Use HTTPS em produção

---

**Desenvolvido com ❤️ para o Projeto Forms Tech**

