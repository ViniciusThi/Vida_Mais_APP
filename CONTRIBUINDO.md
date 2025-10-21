# 🤝 Contribuindo para o Vida Mais

Obrigado por considerar contribuir para o projeto Vida Mais! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🚀 Como Contribuir

### 1. Reportar Bugs

Se você encontrou um bug, por favor crie uma Issue incluindo:

- **Descrição clara** do problema
- **Passos para reproduzir** o bug
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente:** OS, versão do Node, navegador, etc.

### 2. Sugerir Funcionalidades

Para sugerir uma nova funcionalidade:

- **Descreva a funcionalidade** em detalhes
- **Explique por que** ela seria útil
- **Forneça exemplos** de uso
- **Considere alternativas** que você pensou

### 3. Fazer Pull Requests

#### Passo a Passo

1. **Fork** o repositório
2. **Clone** seu fork:
   ```bash
   git clone https://github.com/SEU_USUARIO/Vida_Mais_APP.git
   ```

3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```

4. **Faça suas alterações** seguindo os padrões de código

5. **Commit** suas mudanças:
   ```bash
   git commit -m "feat: adiciona funcionalidade X"
   ```

6. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request** no repositório original

#### Padrão de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, ponto e vírgula, etc
- `refactor:` - Refatoração de código
- `test:` - Adição ou modificação de testes
- `chore:` - Tarefas de build, configuração, etc

**Exemplos:**
```bash
git commit -m "feat: adiciona exportação em PDF"
git commit -m "fix: corrige erro ao enviar respostas"
git commit -m "docs: atualiza guia de instalação"
```

## 💻 Padrões de Código

### Backend (Node.js/TypeScript)

- Use **TypeScript** para type safety
- Siga o estilo do **ESLint** configurado
- Nomeie funções e variáveis de forma descritiva
- Comente código complexo
- Use `async/await` em vez de callbacks
- Trate erros adequadamente

**Exemplo:**
```typescript
// ✅ Bom
async function getQuestionarios(userId: string): Promise<Questionario[]> {
  try {
    return await prisma.questionario.findMany({
      where: { criadoPor: userId }
    });
  } catch (error) {
    logger.error('Erro ao buscar questionários', error);
    throw new Error('Falha ao buscar questionários');
  }
}

// ❌ Evite
function getQ(id) {
  return prisma.questionario.findMany({ where: { criadoPor: id } });
}
```

### Frontend (React/TypeScript)

- Use **componentes funcionais** com hooks
- Separe lógica complexa em **hooks customizados**
- Use **TypeScript interfaces** para props
- Mantenha componentes **pequenos e focados**
- Use **TailwindCSS** para estilização

**Exemplo:**
```typescript
// ✅ Bom
interface QuestionarioCardProps {
  questionario: Questionario;
  onEdit: (id: string) => void;
}

export function QuestionarioCard({ questionario, onEdit }: QuestionarioCardProps) {
  return (
    <div className="card">
      <h3>{questionario.titulo}</h3>
      <button onClick={() => onEdit(questionario.id)}>Editar</button>
    </div>
  );
}

// ❌ Evite
function Card(props) {
  return <div>{props.q.titulo}</div>;
}
```

### Mobile (React Native)

- Use **StyleSheet** para estilos
- Garanta **acessibilidade** (fontes grandes, contraste)
- Teste em **dispositivos reais**
- Considere **offline-first**

## 🧪 Testes

- Adicione testes para novas funcionalidades
- Certifique-se de que todos os testes passam:
  ```bash
  npm test
  ```

## 📝 Documentação

- Atualize a documentação se necessário
- Mantenha o README.md atualizado
- Documente APIs com JSDoc/TSDoc

## 🔍 Checklist para Pull Request

Antes de submeter, verifique:

- [ ] O código segue os padrões do projeto
- [ ] Comentários foram adicionados em código complexo
- [ ] A documentação foi atualizada
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam
- [ ] Não há warnings do linter
- [ ] Commits seguem o padrão Conventional Commits
- [ ] A branch está atualizada com `main`

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Mudanças incompatíveis na API
- **MINOR** (x.1.x): Novas funcionalidades (compatíveis)
- **PATCH** (x.x.1): Correções de bugs

## 📞 Dúvidas?

Se tiver dúvidas sobre como contribuir:

- Abra uma Issue com a tag `question`
- Entre em contato via email
- Consulte a documentação em `docs/`

## 🎉 Agradecimentos

Toda contribuição é valorizada! Obrigado por ajudar a tornar o Vida Mais melhor.

---

**Nota:** Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

