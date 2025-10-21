# 🎨 Como Adicionar a Logo Vida Mais

Guia rápido para adicionar a logo oficial da Vida Mais no aplicativo.

---

## 📁 Passo 1: Preparar a Logo

### Você Precisa de:
- **Logo_VidaMais.png** (a logo oficial da instituição)

### Formatos Necessários:
1. **Logo Principal** (para o app):
   - Tamanho: 512x512 pixels ou maior
   - Formato: PNG com fundo transparente
   - Nome: `Logo_VidaMais.png`

2. **Ícone do App** (opcional, pode gerar depois):
   - Tamanho: 1024x1024 pixels
   - Formato: PNG
   - Nome: `icon.png`

---

## 📂 Passo 2: Colocar os Arquivos

### Coloque a logo nesta pasta:
```
mobile/assets/images/Logo_VidaMais.png
```

### Se tiver o ícone do app também:
```
mobile/assets/icon.png
mobile/assets/splash.png
mobile/assets/adaptive-icon.png
```

---

## 🔧 Passo 3: Ativar a Logo no Código

### Edite o arquivo: `mobile/src/screens/LoginScreen.tsx`

**Procure por estas linhas (~54-60):**

```typescript
{/* Quando adicionar a logo, descomente:
<Image 
  source={require('../../assets/images/Logo_VidaMais.png')} 
  style={styles.logoImage}
  resizeMode="contain"
/>
*/}
<Text style={styles.logoEmoji}>❤️</Text>
```

**Substitua por:**

```typescript
<Image 
  source={require('../../assets/images/Logo_VidaMais.png')} 
  style={styles.logoImage}
  resizeMode="contain"
/>
```

(Remove o comentário e o emoji ❤️)

---

## 🎨 Passo 4: Atualizar app.json (Se Tiver Ícones)

Se você tiver criado os ícones, edite `mobile/app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#075D94"
    },
    "ios": {
      "icon": "./assets/icon.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF7E00"
      }
    }
  }
}
```

---

## 🛠️ Ferramentas Para Gerar Ícones

Se você só tem a logo e precisa gerar os ícones:

### Opção 1: App Icon Generator (Grátis)
1. Acesse: https://www.appicon.co/
2. Faça upload da `Logo_VidaMais.png`
3. Baixe todos os tamanhos
4. Coloque na pasta `mobile/assets/`

### Opção 2: Icon Kitchen (Grátis)
1. Acesse: https://icon.kitchen/
2. Upload da logo
3. Escolha cores de fundo (#FF7E00 para Android, transparente para iOS)
4. Download

### Opção 3: Expo Icon (Específico para Expo)
1. Acesse: https://buildicon.netlify.app/
2. Upload da logo
3. Configura cores
4. Download

---

## ✅ Verificar se Funcionou

### 1. Reinicie o Expo:
```powershell
npx expo start --clear
```

### 2. No app mobile:
- A logo deve aparecer na tela de login
- Em vez do ❤️ emoji

### 3. Ícone do app:
- Ao fazer build (`eas build`), o ícone aparecerá na home do celular

---

## 🎨 Cores da Vida Mais Aplicadas

O app já está usando as cores oficiais:

| Cor | Hex | Uso |
|-----|-----|-----|
| **Laranja** | `#FF7E00` | Botões principais, destaques |
| **Azul** | `#075D94` | Headers, títulos, navegação |
| **Verde** | `#7ABA43` | Sucesso, confirmações, progresso |

---

## 📸 Preview

Depois de adicionar a logo, você verá:

```
┌─────────────────────────┐
│                         │
│    [LOGO VIDA MAIS]     │  ← Sua logo aqui
│                         │
│      Vida Mais          │
│  Pesquisa de Satisfação │
│                         │
│  ┌───────────────────┐  │
│  │ Email            │  │
│  │ [____________]   │  │
│  │                  │  │
│  │ Senha            │  │
│  │ [____________]   │  │
│  │                  │  │
│  │   [ ENTRAR ]     │  ← Botão laranja
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 🚀 Depois de Adicionar

1. **Commit as mudanças:**
   ```bash
   git add mobile/assets/
   git commit -m "feat: adiciona logo oficial Vida Mais"
   git push origin main
   ```

2. **Teste no app:**
   - Reinicie o Expo
   - Verifique se a logo aparece

3. **Faça build para produção:**
   ```bash
   cd mobile
   eas build --platform android
   eas build --platform ios
   ```

---

## ⚠️ Se Não Tiver a Logo Agora

Sem problemas! O app funciona perfeitamente com o emoji ❤️.

Quando receber a logo:
1. Coloque em `mobile/assets/images/Logo_VidaMais.png`
2. Descomente o código (passo 3 acima)
3. Reinicie o Expo

---

**O app já está configurado com as cores oficiais da Vida Mais!** 🎨

Só falta adicionar a logo física quando você tiver o arquivo.

