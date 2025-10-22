# 🎨 Assets do Vida Mais APP

## 📁 Estrutura de Pastas

```
assets/
├── images/
│   ├── Logo_VidaMais.png      # Logo principal (coloque aqui!)
│   ├── icon.png               # Ícone do app (1024x1024)
│   ├── splash.png             # Tela de splash (1284x2778)
│   ├── adaptive-icon.png      # Ícone Android (1024x1024)
│   └── favicon.png            # Favicon web (48x48)
└── README.md
```

## 🎨 Identidade Visual Vida Mais

### Cores Oficiais

```javascript
// Cores principais
LARANJA_VIDA_MAIS = '#FF7E00'  // Cor primária (energia, vitalidade)
AZUL_VIDA_MAIS = '#075D94'     // Cor secundária (confiança, serenidade)
VERDE_VIDA_MAIS = '#7ABA43'    // Cor de sucesso (saúde, vida)

// Variações para UI
LARANJA_CLARO = '#FFB366'      // Hover states
LARANJA_ESCURO = '#CC6500'     // Pressed states
AZUL_CLARO = '#0A7AC4'         // Backgrounds suaves
AZUL_ESCURO = '#054A75'        // Textos
VERDE_CLARO = '#9DD45F'        // Feedbacks positivos
VERDE_ESCURO = '#5E8E2E'       // Confirmações
```

### Aplicação das Cores

**Laranja (#FF7E00):**
- Botões primários (ações principais)
- Destaques importantes
- Call-to-action
- Elementos interativos principais

**Azul (#075D94):**
- Headers e navegação
- Textos de título
- Elementos de interface principais
- Backgrounds secundários

**Verde (#7ABA43):**
- Feedbacks positivos
- Confirmações de sucesso
- Indicadores de "ativo"
- Botões de confirmação final

---

## 📏 Dimensões dos Assets

### Logo Principal (Logo_VidaMais.png)
- **Tamanho:** Flexível (recomendado: 512x512)
- **Formato:** PNG com transparência
- **Uso:** Tela de login, splash screen, headers

### Ícone do App (icon.png)
- **Tamanho:** 1024x1024 pixels
- **Formato:** PNG sem transparência
- **Uso:** Ícone da app store

### Splash Screen (splash.png)
- **Tamanho:** 1284x2778 pixels (iPhone 14 Pro Max)
- **Formato:** PNG
- **Background:** Gradiente Laranja → Azul Vida Mais

### Adaptive Icon Android (adaptive-icon.png)
- **Tamanho:** 1024x1024 pixels
- **Formato:** PNG
- **Background:** Circular com cores Vida Mais

---

## 🎯 Como Adicionar a Logo

1. **Coloque a `Logo_VidaMais.png` nesta pasta:**
   ```
   mobile/assets/images/Logo_VidaMais.png
   ```

2. **Crie os ícones do app:**
   - Use ferramentas online para gerar ícones
   - Ou use a logo como base

3. **Atualize o app.json:**
   - As referências já estão configuradas
   - Os assets serão carregados automaticamente

---

## 🛠️ Ferramentas Para Gerar Ícones

### App Icon Generators
- **Icon Kitchen**: https://icon.kitchen/
- **App Icon Generator**: https://www.appicon.co/
- **Expo Icon**: https://buildicon.netlify.app/

### Image Optimization
- **TinyPNG**: https://tinypng.com/ (comprimir PNG)
- **Squoosh**: https://squoosh.app/ (otimizar imagens)

---

## 🎨 Paleta Completa para Design

```css
/* Cores Principais */
--vida-mais-laranja: #FF7E00;
--vida-mais-azul: #075D94;
--vida-mais-verde: #7ABA43;

/* Neutros (Alto Contraste) */
--texto-principal: #1F2937;    /* Cinza muito escuro */
--texto-secundario: #4B5563;   /* Cinza médio */
--fundo: #FFFFFF;              /* Branco puro */
--fundo-secundario: #F9FAFB;   /* Cinza muito claro */

/* Estados */
--sucesso: #7ABA43;            /* Verde Vida Mais */
--erro: #DC2626;               /* Vermelho para erros */
--aviso: #F59E0B;              /* Amarelo para avisos */
--info: #075D94;               /* Azul Vida Mais */

/* Sombras para Contraste */
--sombra-leve: rgba(0, 0, 0, 0.1);
--sombra-media: rgba(0, 0, 0, 0.2);
--sombra-forte: rgba(0, 0, 0, 0.3);
```

---

## ♿ Diretrizes de Acessibilidade

### Contraste
- **Texto normal:** Mínimo 4.5:1
- **Texto grande (≥24px):** Mínimo 3:1
- **Elementos interativos:** Mínimo 3:1

### Testes de Contraste
Use ferramentas para verificar:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**Exemplos aprovados:**
- ✅ Texto #1F2937 em fundo #FFFFFF (contraste: 16.1:1)
- ✅ Botão laranja #FF7E00 com texto #FFFFFF (contraste: 3.4:1)
- ✅ Texto azul #075D94 em fundo #FFFFFF (contraste: 7.5:1)

---

**Adicione a logo e os ícones nesta pasta para completar a identidade visual!**

