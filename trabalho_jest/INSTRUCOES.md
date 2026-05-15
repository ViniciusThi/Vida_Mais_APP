# Como gerar o .docx e o .pptx

Você tem dois caminhos. Escolha o que for mais cômodo.

## Caminho A - Rápido (5 min, sem instalar nada)

1. Abra o `Trabalho_Jest.md` neste mesmo Cowork ou no VS Code.
2. Selecione tudo (`Ctrl+A`), copie (`Ctrl+C`).
3. Abra o **Microsoft Word** vazio, cole (`Ctrl+V`). O Word importa os títulos e blocos de código direitinho.
4. Salve como `.docx` e ajuste a capa se quiser (nome, logo da FATEC).
5. Para a apresentação, abra o **PowerPoint**, crie 10 slides em branco e use o `Roteiro_Apresentacao.md` como base - cada bloco "SLIDE X" do roteiro vira um slide.

## Caminho B - Automático (gera os arquivos prontos)

Use o script `gerar_trabalho.js` para criar `Trabalho_Jest.docx` e `Apresentacao_Jest.pptx` de uma vez.

### Passo 1 - Abra o terminal nesta pasta

No Windows, abra o PowerShell e navegue até aqui:

```powershell
cd D:\Obsidian_Tree\Projetos\Vida_Mais_APP\trabalho_jest
```

### Passo 2 - Instale as duas dependências (uma vez só)

```powershell
npm init -y
npm install docx pptxgenjs
```

Isso cria um `node_modules` local e leva ~30 segundos.

### Passo 3 - Rode o gerador

```powershell
node gerar_trabalho.js
```

Você verá:

```
Gerando Trabalho_Jest.docx ...
OK: Trabalho_Jest.docx
Gerando Apresentacao_Jest.pptx ...
OK: Apresentacao_Jest.pptx
Pronto.
```

### Passo 4 - Abra e ajuste

- `Trabalho_Jest.docx` - revise sua capa (nome, RA, data) e o sumário.
- `Apresentacao_Jest.pptx` - confira tema/cores, ajuste o que quiser.

## Conferindo a demo prática (opcional, mas vale)

Antes da apresentação, rode os testes uma vez para tirar um print da saída do Jest:

```powershell
cd ..\backend
npm test
```

Tire print do terminal mostrando os "PASS" verdes e cole no slide 9 (ou no documento, no item "Saída esperada"). Isso vira a evidência de demonstração que o professor pediu.

## Estrutura final entregue

```
trabalho_jest\
  Trabalho_Jest.md          (escrito completo - markdown)
  Trabalho_Jest.docx        (gerado pelo script - entrega oficial)
  Roteiro_Apresentacao.md   (roteiro de fala slide a slide)
  Apresentacao_Jest.pptx    (gerada pelo script)
  gerar_trabalho.js         (gerador)
  INSTRUCOES.md             (este arquivo)
```

## Checklist do que o professor pediu

- [x] Identificação da Ferramenta - secao 1
- [x] Pesquisa e Caracterização - secao 2 (historico, propósito, funcionalidades, facilidades, vantagens, desvantagens)
- [x] Classificação na Estrutura de Testes - secao 3 (níveis, tipos, técnicas)
- [x] Demonstração Prática - secao 4 (com codigo real do projeto)
- [x] Impressões Pessoais - secao 5
- [x] Reflexão (Questão Final) - secao 6
- [x] Entrega escrita (Word) - Trabalho_Jest.docx
- [x] Apresentação (5 a 10 minutos) - Apresentacao_Jest.pptx + Roteiro_Apresentacao.md
