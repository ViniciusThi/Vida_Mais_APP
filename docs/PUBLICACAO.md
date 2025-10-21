# 📱 Guia de Publicação do App Mobile

Este guia mostra como publicar o app Vida Mais na Google Play Store (Android) e Apple App Store (iOS).

## 📋 Pré-requisitos

### Para Android (Google Play):
- Conta Google Developer ($25 taxa única)
- Link: https://play.google.com/console/signup

### Para iOS (Apple App Store):
- Conta Apple Developer ($99/ano)
- Mac com Xcode instalado
- Link: https://developer.apple.com

## 🚀 Usando Expo Application Services (EAS)

O jeito mais fácil e recomendado é usar o EAS Build da Expo.

### 1. Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 2. Fazer Login
```bash
eas login
```

Se não tem conta Expo, crie em: https://expo.dev/signup

### 3. Configurar o Projeto
```bash
cd mobile
eas build:configure
```

Isso vai criar o arquivo `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  }
}
```

## 📦 Build para Android

### Opção 1: APK (Para testes)
```bash
eas build --platform android --profile preview
```

Isso gera um APK que você pode instalar diretamente no celular.

### Opção 2: AAB (Para Google Play)
```bash
eas build --platform android --profile production
```

Isso gera um arquivo `.aab` (Android App Bundle) necessário para publicar na Play Store.

### Baixar o Build
Após o build finalizar (leva ~10-20 minutos), você verá um link para download.

## 🍎 Build para iOS

**Importante:** Build iOS requer uma conta Apple Developer ($99/ano).

### 1. Configurar Credenciais
```bash
eas build --platform ios --profile production
```

O EAS vai te guiar para configurar:
- Bundle Identifier (ex: `com.vidamais.app`)
- Provisioning Profile
- Distribution Certificate

### 2. Aguardar o Build
O processo leva cerca de 20-30 minutos.

### 3. Baixar o .ipa
Após concluído, baixe o arquivo `.ipa` do link fornecido.

## 📤 Publicar no Google Play Store

### 1. Acessar o Console
1. Vá para: https://play.google.com/console
2. Clique em "Criar aplicativo"
3. Preencha:
   - Nome: **Vida Mais**
   - Idioma: Português (Brasil)
   - Tipo: Aplicativo ou jogo
   - Categoria: Saúde e fitness

### 2. Configurar Página da Loja

**Detalhes do aplicativo:**
- **Descrição curta:**
  ```
  Pesquisa de satisfação digital para a Instituição Vida Mais
  ```

- **Descrição completa:**
  ```
  O app Vida Mais permite que alunos e idosos participem de pesquisas 
  de satisfação de forma digital e acessível. Com interface simples, 
  botões grandes, alto contraste e leitura em voz, o aplicativo foi 
  projetado para facilitar o uso por pessoas da terceira idade.

  Recursos:
  • Interface acessível com textos grandes
  • Leitura em voz das perguntas
  • Questionários personalizáveis
  • Modo offline (responde mesmo sem internet)
  • Seguro e privado
  ```

**Gráficos:**
- Ícone: 512x512 px
- Imagens de destaque: 1024x500 px
- Capturas de tela: Pelo menos 2 (telefone: 16:9 ou 9:16)

### 3. Enviar o AAB
1. Vá em "Produção" → "Criar nova versão"
2. Faça upload do arquivo `.aab` gerado pelo EAS
3. Preencha as notas da versão (changelog)
4. Clique em "Salvar" e depois "Revisar versão"
5. Envie para análise

**Tempo de análise:** 1-7 dias

### 4. Configurações Adicionais

**Classificação de conteúdo:**
- Preencha o questionário (app educacional/saúde)

**Público-alvo:**
- Maiores de 18 anos (ou conforme política da instituição)

**Privacidade:**
- Forneça política de privacidade
- Declare coleta de dados (email, nome, respostas)

## 🍏 Publicar na Apple App Store

### 1. Criar App no App Store Connect
1. Vá para: https://appstoreconnect.apple.com
2. Clique em "Meus Apps" → "+"
3. Selecione "Novo App"
4. Preencha:
   - Plataforma: iOS
   - Nome: Vida Mais
   - Idioma principal: Português (Brasil)
   - Bundle ID: (o que você configurou no EAS)
   - SKU: vidamais001

### 2. Fazer Upload do Build

**Usando EAS Submit:**
```bash
eas submit --platform ios
```

Ou manualmente via Xcode:
1. Baixe o `.ipa` do EAS
2. Abra o Transporter (app da Apple)
3. Faça login com sua Apple ID
4. Arraste o `.ipa` para o Transporter
5. Clique em "Deliver"

### 3. Configurar Informações do App

**Descrição:**
```
Pesquisa de satisfação digital para a Instituição Vida Mais. 
Interface acessível com textos grandes, leitura em voz e 
alto contraste para facilitar o uso por idosos.
```

**Palavras-chave:**
```
pesquisa, satisfação, idosos, acessibilidade, questionário
```

**Capturas de tela:**
- iPhone 6.7": 1290x2796 px (obrigatório)
- iPhone 6.5": 1242x2688 px
- iPad Pro: 2048x2732 px (se suportar)

### 4. Informações de Classificação

- **Categoria primária:** Saúde e fitness
- **Categoria secundária:** Educação
- **Classificação etária:** 4+ ou 12+

### 5. Enviar para Revisão
1. Preencha todas as seções obrigatórias
2. Clique em "Enviar para revisão"
3. Aguarde aprovação (1-3 dias normalmente)

## 🔄 Atualizações Futuras

### Para atualizar o app:

1. **Atualizar o código:**
   ```bash
   cd mobile
   # Edite os arquivos necessários
   ```

2. **Incrementar a versão** em `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1", // Era 1.0.0
       "android": {
         "versionCode": 2 // Era 1
       },
       "ios": {
         "buildNumber": "2" // Era "1"
       }
     }
   }
   ```

3. **Fazer novo build:**
   ```bash
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```

4. **Enviar para as lojas** (processo igual ao inicial)

## 💡 Dicas Importantes

### Tamanho do App
- **Android:** Máximo 150 MB (AAB)
- **iOS:** Máximo 200 MB para download via 4G

Se seu app passar disso, otimize imagens e dependências.

### Testes Antes de Publicar
1. Teste em vários dispositivos
2. Teste com diferentes tamanhos de tela
3. Teste com e sem internet
4. Teste com usuários reais (idosos)

### Política de Privacidade
Você **precisa** de uma política de privacidade. Exemplo simples:

```markdown
# Política de Privacidade - Vida Mais

Última atualização: [DATA]

## Dados Coletados
- Nome e email (para autenticação)
- Respostas dos questionários
- Turma vinculada

## Uso dos Dados
Os dados são usados exclusivamente para análise interna 
da Instituição Vida Mais e não são compartilhados com terceiros.

## Segurança
Utilizamos criptografia e armazenamento seguro.

## Contato
email@vidamais.com
```

Hospede em: `seusite.com/privacidade`

### Screenshots de Qualidade
Use ferramentas para gerar screenshots profissionais:
- **MockUPhone:** https://mockuphone.com
- **Previewed:** https://previewed.app
- **Figma:** https://figma.com (templates gratuitos)

## 🚨 Rejeições Comuns

### Google Play:
- ❌ Falta de política de privacidade
- ❌ Permissões desnecessárias
- ❌ Ícone de baixa qualidade
- ❌ Descrição muito curta

### App Store:
- ❌ Screenshots que não representam o app
- ❌ Funcionalidades não documentadas
- ❌ Bugs ou crashes
- ❌ Informações de contato faltando

## 📊 Após Publicação

### Monitoramento
- **Google Play Console:** Veja downloads, crashes, reviews
- **App Store Connect:** Analytics, downloads, reviews

### Responder Reviews
- Responda avaliações negativas educadamente
- Agradeça avaliações positivas
- Use feedback para melhorar o app

### Updates Regulares
- Publique atualizações a cada 2-3 meses
- Corrija bugs reportados
- Adicione novas funcionalidades

## 🆘 Suporte

### Documentação Oficial:
- **Expo EAS:** https://docs.expo.dev/build/introduction
- **Google Play:** https://developer.android.com/distribute
- **Apple Developer:** https://developer.apple.com/app-store

### Comunidade:
- **Expo Discord:** https://chat.expo.dev
- **Stack Overflow:** Tag `expo` ou `react-native`

---

✅ **Seu app está pronto para o mundo!** 🎉

