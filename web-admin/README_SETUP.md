# 🚀 Setup do Web Admin - Vida Mais

## ⚠️ IMPORTANTE: Configurar URL da API

O sistema web precisa se conectar ao backend. Você tem **2 opções**:

---

## ✅ **Opção 1: Usar Backend da AWS** (Recomendado)

### **1. Crie o arquivo `.env` na pasta `web-admin`:**

```bash
cd web-admin
```

Crie o arquivo `.env` com o conteúdo:

```env
VITE_API_URL=http://SEU_IP_AWS:3000
```

**Exemplo:**
```env
VITE_API_URL=http://18.228.123.45:3000
```

**❗ Substitua `SEU_IP_AWS` pelo IP público da sua instância AWS!**

### **2. Para pegar o IP da AWS:**

```bash
# Na AWS
curl ifconfig.me
```

### **3. Instalar e rodar:**

```bash
npm install
npm run dev
```

Acessar: `http://localhost:5173`

---

## ✅ **Opção 2: Rodar Backend Localmente**

### **1. Terminal 1 - Backend:**

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Backend rodando em: `http://localhost:3000`

### **2. Terminal 2 - Frontend:**

Crie o arquivo `.env` na pasta `web-admin`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
cd web-admin
npm install
npm run dev
```

Frontend rodando em: `http://localhost:5173`

---

## 🔍 **Verificar se está funcionando:**

1. **Backend rodando?**
   ```bash
   curl http://SEU_IP:3000/health
   # Deve retornar: {"status":"ok"}
   ```

2. **Frontend conectando?**
   - Abrir `http://localhost:5173`
   - Abrir DevTools (F12)
   - Tentar fazer login
   - Ver se não tem erro `ERR_CONNECTION_REFUSED`

---

## 🐛 **Problemas comuns:**

### **Erro: `ERR_CONNECTION_REFUSED`**
- ✅ Backend não está rodando
- ✅ URL no `.env` está errada
- ✅ Porta 3000 não está aberta na AWS

**Solução:**
```bash
# Na AWS, verificar se backend está rodando:
pm2 status
pm2 logs vida-mais-backend

# Reiniciar se necessário:
pm2 restart vida-mais-backend
```

### **Erro: `CORS`**
- Backend precisa permitir conexões do frontend
- Já está configurado para aceitar qualquer origem

---

## 📝 **Estrutura de arquivos:**

```
web-admin/
├── .env           ← CRIAR ESTE ARQUIVO!
├── .env.example   
├── package.json
└── src/
```

---

## 🎯 **Resumo:**

1. **Criar** arquivo `.env` em `web-admin/`
2. **Adicionar** `VITE_API_URL=http://SEU_IP_AWS:3000`
3. **Rodar** `npm install && npm run dev`
4. **Acessar** `http://localhost:5173`

✅ **Pronto!** Sistema funcionando!

