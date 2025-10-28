# 🔐 Configuração de Variáveis de Ambiente

## 📝 Como Criar o Arquivo .env

Após extrair o projeto, crie um arquivo chamado `.env` na **raiz do projeto** (mesma pasta do `package.json`).

### Passo a Passo:

1. Abra o terminal na pasta do projeto
2. Crie o arquivo:
   ```bash
   touch .env
   ```
3. Abra com seu editor favorito:
   ```bash
   # VS Code
   code .env
   
   # Nano
   nano .env
   
   # Vim
   vim .env
   ```

4. Copie e cole o conteúdo abaixo
5. Preencha com suas credenciais

---

## 📋 Conteúdo do Arquivo .env

```env
# ============================================
# BANCO DE DADOS
# ============================================
# TiDB Cloud (Recomendado)
DATABASE_URL=

# Ou MySQL Local
# DATABASE_URL=mysql://root:senha@localhost:3306/verzel_webchat

# Ou PlanetScale
# DATABASE_URL=mysql://usuario:senha@aws.connect.psdb.cloud/verzel_webchat?sslaccept=strict

# ============================================
# OPENAI
# ============================================
OPENAI_API_KEY=

# ============================================
# GOOGLE CALENDAR
# ============================================
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=

# Opcional: Para usar Google Calendar real (senão usa horários mock)
# GOOGLE_CALENDAR_REFRESH_TOKEN=seu-refresh-token-aqui

# ============================================
# PIPEFY
# ============================================
PIPEFY_API_TOKEN=

# ============================================
# AUTENTICAÇÃO (Gere valores aleatórios seguros)
# ============================================
JWT_SECRET=sua-chave-secreta-super-aleatoria-e-segura-aqui-min-32-chars
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Opcional: Se quiser restringir acesso
OWNER_OPEN_ID=seu-id-aqui
OWNER_NAME=Seu Nome

# ============================================
# CONFIGURAÇÃO DO APP
# ============================================
VITE_APP_ID=verzel-webchat
VITE_APP_TITLE=Verzel Webchat - SDR Agent
VITE_APP_LOGO=https://via.placeholder.com/150/0066cc/ffffff?text=Verzel

# ============================================
# FORGE API (Opcional - APIs internas)
# ============================================
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=sua-chave-forge-aqui

# ============================================
# ANALYTICS (Opcional)
# ============================================
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

---

## 🗄️ Configuração do TiDB Cloud

### 1. Criar Conta e Cluster

1. Acesse [tidbcloud.com](https://tidbcloud.com)
2. Crie uma conta gratuita
3. Clique em "Create Cluster"
4. Escolha "Serverless Tier" (gratuito)
5. Selecione região (us-west-2 ou mais próxima)
6. Aguarde criação (~2 minutos)

### 2. Obter Connection String

1. No painel do cluster, clique em "Connect"
2. Escolha "General" → "MySQL CLI"
3. Copie a connection string
4. Formato:
   ```
   mysql://usuario.root:senha@gateway01.region.prod.aws.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}
   ```

### 3. Criar Banco de Dados

```bash
# Conecte via MySQL client
mysql -u 'usuario.root' -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -D test --ssl-mode=VERIFY_IDENTITY --ssl-ca=/etc/ssl/cert.pem -p

# Crie o banco
CREATE DATABASE verzel_webchat;
USE verzel_webchat;
```

### 4. Atualizar .env

Substitua `test` por `verzel_webchat` na connection string:

```env
DATABASE_URL=
```

---

## 🔑 Gerar JWT_SECRET

O `JWT_SECRET` precisa ser uma string aleatória e segura. Use um destes métodos:

### Opção 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opção 2: OpenSSL
```bash
openssl rand -hex 32
```

### Opção 3: Online
Acesse: [randomkeygen.com](https://randomkeygen.com/) e copie uma chave "Fort Knox"

---

## ✅ Verificar Configuração

Após criar o `.env`:

```bash
# Instalar dependências
pnpm install

# Testar conexão com banco
pnpm db:push

# Se der erro, verifique:
# 1. DATABASE_URL está correto?
# 2. Banco de dados existe?
# 3. Credenciais estão corretas?
# 4. SSL está configurado (para TiDB)?

# Iniciar servidor
pnpm dev
```

---


## 🆘 Problemas Comuns

### Erro: "Cannot connect to database"
- Verifique se o TiDB cluster está ativo
- Confirme que o banco `verzel_webchat` existe
- Teste a connection string com MySQL client

### Erro: "Invalid DATABASE_URL"
- Certifique-se que está no formato correto
- Para TiDB, inclua `?ssl={"rejectUnauthorized":true}`
- Não esqueça de escapar caracteres especiais na senha

### Erro: "Missing environment variable"
- Verifique se o arquivo `.env` está na raiz do projeto
- Confirme que todas as variáveis obrigatórias estão preenchidas
- Reinicie o servidor após editar o `.env`

---

## 📞 Suporte

Se continuar com problemas:

1. Verifique os logs: `pnpm dev` (mostra erros detalhados)
2. Teste conexão com banco separadamente
3. Confirme que todas as chaves de API estão válidas
4. Revise a documentação do TiDB Cloud

---

**Pronto! Agora você pode rodar o projeto localmente com TiDB Cloud! 🚀**

