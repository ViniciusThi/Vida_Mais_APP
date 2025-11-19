# 🖼️ Configuração da Logo - Vida Mais Web Admin

## ✅ Status: Logo Configurada!

A logo **`Logo_VidaMais.png`** já está no local correto:

```
web-admin/assets/Logo_VidaMais.png
```

## 🎨 Uso da Logo

### Tela de Login
A logo é exibida automaticamente na tela de login no lugar do ícone "V+".

**Características:**
- ✅ Tamanho responsivo (altura de 96px)
- ✅ Centralizada na tela
- ✅ Fallback para "V+" se não carregar
- ✅ Suporte para PNG, JPG, SVG

### Como Testar

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   cd web-admin
   npm run dev
   ```

2. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

3. **Você verá a logo** no topo da tela de login! 🎉

---

## 🔄 Atualizar a Logo

Se precisar **substituir a logo**:

1. **Substitua o arquivo:**
   ```bash
   web-admin/assets/Logo_VidaMais.png
   ```

2. **Especificações Recomendadas:**
   - Formato: PNG (transparente) ou JPG
   - Largura: 200-400px
   - Altura: Proporcional
   - Fundo: Transparente para melhor aparência

3. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

---

## 📂 Estrutura de Arquivos

```
web-admin/
├── assets/
│   └── Logo_VidaMais.png         ← Logo principal (já existe!)
├── src/
│   ├── assets/                   ← Pasta alternativa (vazia)
│   │   ├── README.md
│   │   └── .gitkeep
│   ├── pages/
│   │   └── LoginPage.tsx         ← Usa a logo
│   └── vite-env.d.ts             ← Tipos para imagens
└── LOGO_SETUP.md                 ← Este arquivo
```

---

## 🚀 Deploy em Produção

### Build da Aplicação
```bash
cd web-admin
npm run build
```

A logo será incluída automaticamente no build de produção.

---

## ❓ Troubleshooting

### Logo não aparece?

1. **Verifique se o arquivo existe:**
   ```bash
   ls web-admin/assets/Logo_VidaMais.png
   ```

2. **Limpe o cache do navegador:**
   - Chrome/Edge: `Ctrl+Shift+Delete`
   - Firefox: `Ctrl+Shift+Delete`

3. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Verifique o console do navegador (F12)** para erros

### Fallback "V+" aparecendo?

Se a logo não carregar, o sistema exibirá automaticamente o ícone "V+" azul como fallback. Isso garante que a interface nunca fique quebrada.

---

## 💡 Dicas

- Use **PNG com transparência** para melhor resultado
- Mantenha a logo **otimizada** (< 200KB)
- Teste em **diferentes resoluções**
- A logo é **responsiva** e se ajusta automaticamente

---

**Sistema Vida Mais - Centro do Idoso** 💙

Desenvolvido com ❤️ usando React + TypeScript + Vite

