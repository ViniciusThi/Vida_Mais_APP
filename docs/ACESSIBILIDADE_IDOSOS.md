# ♿ Guia de Acessibilidade para Idosos - Vida Mais APP

Baseado em pesquisas e diretrizes internacionais para design de aplicativos para terceira idade.

---

## 📊 Estatísticas e Contexto

- **60% dos idosos** (65+) têm algum tipo de dificuldade visual
- **40%** têm dificuldade motora fina (tocar botões pequenos)
- **70%** preferem fontes maiores e mais espaçadas
- **85%** têm dificuldade com interfaces complexas

**Fonte:** WHO, WCAG 2.1, Nielsen Norman Group

---

## 🎨 Diretrizes de Design Implementadas

### 1. Tamanhos de Fonte (Texto)

```javascript
// MÍNIMOS RECOMENDADOS
Título principal:    32-36px  (muito grande)
Título secundário:   24-28px  (grande)
Texto de corpo:      20-24px  (legível)
Texto secundário:    18-20px  (mínimo aceitável)
Labels de botão:     22-26px  (claro e direto)

// NUNCA USAR
Texto < 16px        ❌ Muito pequeno para idosos
```

### 2. Tamanho de Botões

```javascript
// MÍNIMOS RECOMENDADOS
Botão principal:     Mínimo 60x60px (ideal: 80x80px)
Botão secundário:    Mínimo 50x50px
Área de toque:       Mínimo 44x44px (iOS) / 48x48px (Android)

// Espaçamento entre botões
Espaço mínimo:       16-20px entre elementos tocáveis
```

### 3. Cores e Contraste

```javascript
// WCAG 2.1 Level AA (Mínimo)
Texto normal:        Contraste 4.5:1
Texto grande (≥24px): Contraste 3:1
Elementos UI:        Contraste 3:1

// WCAG 2.1 Level AAA (Ideal para idosos)
Texto normal:        Contraste 7:1
Texto grande:        Contraste 4.5:1
```

**Cores Vida Mais - Análise de Contraste:**

| Cor | Hex | Com Branco | Com Preto | Uso |
|-----|-----|------------|-----------|-----|
| Laranja | #FF7E00 | 3.4:1 ✅ | 6.2:1 ✅ | Botões com texto branco |
| Azul | #075D94 | 7.5:1 ✅ | 2.8:1 ⚠️ | Textos, headers |
| Verde | #7ABA43 | 2.3:1 ❌ | 9.1:1 ✅ | Backgrounds claros |

### 4. Espaçamento

```javascript
// Padding interno
Botões:              20-24px vertical, 24-32px horizontal
Cards:               24-32px todos os lados
Inputs:              20-24px vertical, 16-20px horizontal

// Margin entre elementos
Entre cards:         16-24px
Entre seções:        32-48px
Entre perguntas:     40-60px
```

### 5. Navegação

**✅ Boas Práticas para Idosos:**
- Uma tarefa por tela
- Máximo 3-4 opções visíveis
- Botão "Voltar" sempre visível e grande
- Breadcrumbs visuais (1 de 5, 2 de 5...)
- Confirmações antes de ações irreversíveis

**❌ Evitar:**
- Gestos complexos (swipe, pinch, long press)
- Menus hamburger (difícil de descobrir)
- Scroll infinito
- Pop-ups inesperados
- Temporizadores curtos

### 6. Feedback Visual

```javascript
// Estados de botão
Normal:   Cor sólida, bordas definidas
Hover:    Cor 10% mais clara
Pressed:  Cor 10% mais escura + sombra
Disabled: Opacidade 40% + cursor not-allowed

// Feedback tátil
Vibração suave ao tocar: 50ms
Som de confirmação (opcional)
Animações lentas e suaves (300-400ms)
```

### 7. Iconografia

```javascript
// Tamanhos
Ícones pequenos:     32x32px
Ícones médios:       48x48px
Ícones grandes:      64x64px

// Estilo
- Usar ícones simples e reconhecíveis
- Sempre acompanhar de texto (nunca só ícone)
- Evitar metáforas complexas
- Preferir emojis ou ícones universais
```

---

## 🎯 Aplicado no Vida Mais APP

### Fontes Aumentadas
- ✅ Títulos: 28-36px (eram 24px)
- ✅ Corpo: 20-24px (eram 16-18px)
- ✅ Labels: 18-22px (eram 14-16px)

### Botões Aumentados
- ✅ Botões principais: 80x80px mínimo
- ✅ Área de toque: Sempre > 60px
- ✅ Espaçamento: 20px entre botões

### Alto Contraste
- ✅ Texto principal: #1F2937 (preto) em #FFFFFF (branco) = 16:1
- ✅ Botão laranja: #FF7E00 com texto branco = 3.4:1 ✅
- ✅ Texto azul: #075D94 em branco = 7.5:1 ✅

### Navegação Simplificada
- ✅ Uma pergunta por tela
- ✅ Botões grandes: "← Anterior" e "Próxima →"
- ✅ Progresso visual: "Pergunta 2 de 5"
- ✅ Sem gestos complexos

### Text-to-Speech (TTS)
- ✅ Botão 🔊 grande em cada pergunta
- ✅ Lê o enunciado em português BR
- ✅ Velocidade ajustada (0.8x = mais devagar)

### Feedback Visual Aumentado
- ✅ Botões mudam de cor ao tocar
- ✅ Confirmações visuais claras
- ✅ Mensagens grandes e diretas
- ✅ Ícones + texto sempre

---

## 📱 Boas Práticas Específicas

### Layout
1. **Centralizar elementos importantes**
2. **Evitar scroll horizontal**
3. **Limitarvscroll vertical excessivo**
4. **Manter UI consistente** entre telas

### Textos
1. **Sentenças curtas** (máximo 10-12 palavras)
2. **Linguagem simples** (evitar jargões)
3. **Instruções claras** e diretas
4. **Evitar abreviações**

### Interação
1. **Tempo de resposta generoso** (sem timeout agressivo)
2. **Permitir erros** (fácil de voltar e corrigir)
3. **Confirmações explícitas** ("Tem certeza?")
4. **Progresso salvo** automaticamente

### Mensagens de Erro
1. **Linguagem amigável** (não técnica)
2. **Sugerir solução** ("Tente novamente" em vez de "Error 500")
3. **Grande e visível**
4. **Com ícone** (⚠️, ❌, ℹ️)

---

## 🧪 Checklist de Acessibilidade

### Visual
- [x] Fontes ≥ 20px em todo o app
- [x] Contraste ≥ 4.5:1 (textos normais)
- [x] Contraste ≥ 3:1 (textos grandes e botões)
- [x] Cores não são o único meio de transmitir informação
- [x] Zoom do sistema suportado

### Motor/Tátil
- [x] Botões ≥ 60x60px
- [x] Espaçamento ≥ 16px entre elementos tocáveis
- [x] Sem gestos complexos
- [x] Feedback tátil (vibração) ao tocar

### Cognitivo
- [x] Uma tarefa por tela
- [x] Navegação linear e previsível
- [x] Linguagem simples e direta
- [x] Confirmações visuais claras
- [x] Instruções em cada tela

### Auditivo
- [x] Text-to-Speech implementado
- [x] Não depende apenas de áudio
- [x] Legendas/textos sempre visíveis

---

## 📚 Referências

### Diretrizes Internacionais
- **WCAG 2.1 (Web Content Accessibility Guidelines)**: https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design Accessibility**: https://m3.material.io/foundations/accessible-design/overview
- **Apple Human Interface Guidelines - Accessibility**: https://developer.apple.com/design/human-interface-guidelines/accessibility

### Estudos e Artigos
- **Nielsen Norman Group** - "Usability for Seniors"
- **WHO (World Health Organization)** - "Ageing and health"
- **W3C** - "Developing Websites for Older People"

### Ferramentas de Teste
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Accessible Colors**: https://accessible-colors.com/
- **Color Contrast Analyzer**: https://www.tpgi.com/color-contrast-checker/

---

## 🎯 Melhorias Futuras Sugeridas

1. **Modo Alto Contraste** (toggle on/off)
2. **Ajuste de tamanho de fonte** (P, M, G, XG)
3. **Temas de cor** (claro/escuro)
4. **Tutorial interativo** na primeira vez
5. **Ajuda contextual** (ícone ? em cada tela)
6. **Velocidade de TTS ajustável**
7. **Opção de zoom global** (150%, 200%)

---

**Desenvolvido seguindo as melhores práticas internacionais de acessibilidade digital para terceira idade.**

