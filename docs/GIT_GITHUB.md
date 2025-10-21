# 📦 Guia de Git e GitHub para o Projeto

Guia prático de como usar Git e GitHub para versionar e publicar seu projeto.

## 🎯 O que é Git e GitHub?

- **Git:** Sistema de controle de versão (como um "Ctrl+Z" poderoso)
- **GitHub:** Plataforma online para hospedar código (como Google Drive para código)

## 📋 Pré-requisitos

1. **Git instalado** (https://git-scm.com/download/win)
2. **Conta no GitHub** (https://github.com/signup)

## 🚀 Passo 1: Configurar Git (Apenas uma vez)

Abra o PowerShell e configure seu nome e email:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

## 📁 Passo 2: Inicializar o Repositório

No PowerShell, na pasta do projeto:

```bash
cd Desktop\PI5\Vida_Mais_APP

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Projeto inicial - Sistema Vida Mais"
```

## 🌐 Passo 3: Criar Repositório no GitHub

### Opção A: Via Site (Mais Fácil)

1. Acesse: https://github.com
2. Clique no **+** no canto superior direito
3. Clique em **"New repository"**
4. Preencha:
   - **Repository name:** `Vida_Mais_APP`
   - **Description:** Sistema de pesquisa de satisfação digital
   - **Visibilidade:** 
     - **Public:** Todos podem ver (recomendado para portfolio)
     - **Private:** Apenas você vê
   - **NÃO marque** "Add a README file"
5. Clique em **"Create repository"**

### Opção B: Via GitHub CLI

```bash
# Instalar GitHub CLI primeiro: https://cli.github.com/
gh auth login
gh repo create Vida_Mais_APP --public --source=. --remote=origin
```

## 🔗 Passo 4: Conectar Local ao GitHub

Após criar o repositório no GitHub, você verá instruções. Use:

```bash
git remote add origin https://github.com/SEU_USUARIO/Vida_Mais_APP.git
git branch -M main
git push -u origin main
```

**Importante:** Substitua `SEU_USUARIO` pelo seu username do GitHub!

## 📤 Passo 5: Fazer Upload dos Arquivos

```bash
# Enviar para o GitHub
git push origin main
```

Na primeira vez, pode pedir login:
- **Username:** Seu username do GitHub
- **Password:** Use um **Personal Access Token** (não sua senha!)

### Como criar Personal Access Token:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Marque: `repo` (todos os checkboxes)
4. "Generate token"
5. **COPIE E GUARDE O TOKEN** (não aparecerá novamente!)

## 🔄 Trabalhando no Dia a Dia

### Salvando Mudanças (Commit)

Sempre que fizer mudanças importantes:

```bash
# Ver o que mudou
git status

# Adicionar todos os arquivos modificados
git add .

# Ou adicionar arquivo específico
git add backend/src/server.ts

# Fazer commit com mensagem descritiva
git commit -m "feat: adiciona filtro por data no relatório"

# Enviar para o GitHub
git push origin main
```

### Padrões de Mensagens de Commit

Use prefixos para clareza:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração
- `test:` - Adicionar testes

**Exemplos:**
```bash
git commit -m "feat: adiciona exportação em PDF"
git commit -m "fix: corrige erro ao enviar respostas vazias"
git commit -m "docs: atualiza README com instruções de deploy"
git commit -m "style: formata código do backend com prettier"
```

## 🌿 Trabalhando com Branches

### Para Desenvolvimento

Use branches para desenvolver features sem afetar o código principal:

```bash
# Criar e mudar para nova branch
git checkout -b feature/nova-funcionalidade

# Fazer mudanças e commits
git add .
git commit -m "feat: adiciona funcionalidade X"

# Enviar branch para GitHub
git push origin feature/nova-funcionalidade

# Voltar para main
git checkout main

# Mesclar mudanças (merge)
git merge feature/nova-funcionalidade

# Deletar branch local (opcional)
git branch -d feature/nova-funcionalidade
```

### Fluxo Recomendado

```
main (produção)
  └─ develop (desenvolvimento)
      └─ feature/login
      └─ feature/relatorios
      └─ fix/bug-respostas
```

## 🔙 Desfazer Mudanças

### Desfazer arquivo não commitado

```bash
git checkout -- arquivo.txt
```

### Desfazer último commit (mantém mudanças)

```bash
git reset --soft HEAD~1
```

### Desfazer último commit (descarta mudanças) ⚠️

```bash
git reset --hard HEAD~1
```

### Reverter commit específico

```bash
git revert HASH_DO_COMMIT
```

## 📥 Baixar Mudanças do GitHub

```bash
# Atualizar código local com mudanças do GitHub
git pull origin main
```

## 👥 Trabalhando em Equipe

### Clonar Repositório

Outro membro da equipe pode clonar o projeto:

```bash
git clone https://github.com/SEU_USUARIO/Vida_Mais_APP.git
cd Vida_Mais_APP
```

### Fluxo Colaborativo

1. **Sempre puxe antes de trabalhar:**
   ```bash
   git pull origin main
   ```

2. **Crie uma branch para sua feature:**
   ```bash
   git checkout -b feature/minha-parte
   ```

3. **Faça commits regulares:**
   ```bash
   git add .
   git commit -m "feat: implementa parte X"
   ```

4. **Envie sua branch:**
   ```bash
   git push origin feature/minha-parte
   ```

5. **Abra um Pull Request no GitHub:**
   - Vá no GitHub → Pull Requests → New Pull Request
   - Compare `feature/minha-parte` com `main`
   - Adicione descrição
   - Peça revisão de outro membro

6. **Após aprovação, faça merge**

## 🏷️ Releases (Versões)

### Criar uma Tag de Versão

```bash
# Tag local
git tag -a v1.0.0 -m "Versão 1.0.0 - Lançamento inicial"

# Enviar tag para GitHub
git push origin v1.0.0

# Ou enviar todas as tags
git push origin --tags
```

### Criar Release no GitHub

1. GitHub → Releases → "Create a new release"
2. Escolha a tag (ex: v1.0.0)
3. Adicione título e descrição
4. Anexe binários (APK, etc) se houver
5. "Publish release"

## 📊 Ver Histórico

```bash
# Ver histórico de commits
git log

# Ver histórico resumido
git log --oneline

# Ver histórico com gráfico
git log --oneline --graph --all

# Ver mudanças de um arquivo
git log -p arquivo.txt
```

## 🔍 Comandos Úteis

```bash
# Ver status dos arquivos
git status

# Ver diferenças não commitadas
git diff

# Ver diferenças de arquivo específico
git diff arquivo.txt

# Ver branches
git branch

# Ver branches remotas
git branch -r

# Trocar de branch
git checkout nome-da-branch

# Criar e trocar de branch
git checkout -b nova-branch

# Ver configurações
git config --list

# Ver repositórios remotos
git remote -v
```

## 🚨 Problemas Comuns

### Erro: "fatal: not a git repository"

Você não está na pasta do projeto. Use:
```bash
cd Desktop\PI5\Vida_Mais_APP
```

### Erro: "Updates were rejected"

Alguém fez push antes de você. Solução:
```bash
git pull origin main
git push origin main
```

### Erro: "Your branch is ahead of 'origin/main'"

Você tem commits locais não enviados:
```bash
git push origin main
```

### Conflitos de Merge

Se houver conflitos ao fazer `git pull` ou `git merge`:

1. Abra os arquivos com conflito (marcados com `<<<<<<<`, `=======`, `>>>>>>>`)
2. Edite manualmente escolhendo o código correto
3. Remove os marcadores
4. Adicione e commit:
   ```bash
   git add .
   git commit -m "resolve: conflitos de merge"
   ```

## 📝 .gitignore

Arquivos que **não devem** ir para o GitHub já estão no `.gitignore`:

```
node_modules/
.env
dist/
build/
*.log
```

Se precisar ignorar mais arquivos, edite `.gitignore`.

## 🔐 Segurança

### ⚠️ NUNCA comite:

- Arquivos `.env` (senhas, tokens)
- `node_modules/` (muito pesado)
- Builds (`dist/`, `build/`)
- Chaves privadas (`.pem`, `.key`)
- Bancos de dados locais

### Se commitou por engano:

```bash
# Remover arquivo do Git mas manter no disco
git rm --cached arquivo_sensivel.env

# Adicionar ao .gitignore
echo "arquivo_sensivel.env" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: remove arquivo sensível do git"
git push origin main
```

## 📚 Recursos Adicionais

### Tutoriais
- **Git:** https://git-scm.com/doc
- **GitHub:** https://docs.github.com/pt
- **Curso interativo:** https://learngitbranching.js.org/

### Cheat Sheets
- https://education.github.com/git-cheat-sheet-education.pdf

### Ferramentas Visuais
- **GitHub Desktop:** https://desktop.github.com/
- **GitKraken:** https://www.gitkraken.com/
- **VS Code:** Extensão GitLens

## 📞 Ajuda Rápida

```bash
# Ver ajuda de um comando
git help commit
git commit --help
```

---

## 🎓 Fluxo Completo de Exemplo

```bash
# 1. Clonar projeto (primeira vez)
git clone https://github.com/SEU_USUARIO/Vida_Mais_APP.git
cd Vida_Mais_APP

# 2. Criar branch para nova feature
git checkout -b feature/adiciona-notificacoes

# 3. Fazer mudanças no código
# ... editar arquivos ...

# 4. Verificar mudanças
git status
git diff

# 5. Adicionar mudanças
git add .

# 6. Fazer commit
git commit -m "feat: adiciona sistema de notificações push"

# 7. Enviar para GitHub
git push origin feature/adiciona-notificacoes

# 8. Abrir Pull Request no GitHub
# (via interface web)

# 9. Após aprovação, fazer merge e atualizar local
git checkout main
git pull origin main

# 10. Deletar branch (opcional)
git branch -d feature/adiciona-notificacoes
```

---

✅ **Pronto!** Agora você sabe usar Git e GitHub para versionar seu projeto!

**Dica:** Faça commits pequenos e frequentes. É melhor 10 commits pequenos do que 1 commit gigante!

