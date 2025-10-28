# 🚀 Guia de Instalação e Deploy - Verzel Webchat

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior ([Download](https://nodejs.org/))
- **pnpm** (gerenciador de pacotes): `npm install -g pnpm`
- **Git** ([Download](https://git-scm.com/))
- **Banco de dados MySQL** ou conta no [PlanetScale](https://planetscale.com/) (gratuito)

## 🔧 Instalação Local

### 1. Extrair o Projeto

```bash
# Extraia o arquivo verzel-webchat.zip
unzip verzel-webchat.zip
cd verzel-webchat
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/verzel_webchat

# OpenAI
OPENAI_API_KEY=

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=
GOOGLE_CALENDAR_REFRESH_TOKEN=seu_refresh_token_aqui

# Pipefy
PIPEFY_API_TOKEN=
PIPEFY_PIPE_ID=

# Autenticação (gerados automaticamente pela plataforma)
JWT_SECRET=sua_chave_secreta_aqui
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# App Config
VITE_APP_ID=verzel-webchat
VITE_APP_TITLE=Verzel Webchat - SDR Agent
VITE_APP_LOGO=https://seu-logo-url.com/logo.png

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

### 4. Configurar Banco de Dados

#### Opção A: MySQL Local

```bash
# Crie o banco de dados
mysql -u root -p
CREATE DATABASE verzel_webchat;
exit;

# Execute as migrações
pnpm db:push
```

#### Opção B: PlanetScale (Recomendado - Gratuito)

1. Crie uma conta em [PlanetScale](https://planetscale.com/)
2. Crie um novo banco de dados
3. Copie a connection string
4. Cole no `.env` como `DATABASE_URL`
5. Execute: `pnpm db:push`

### 5. Executar o Projeto

```bash
# Modo desenvolvimento
pnpm dev
```

Acesse: `http://localhost:3000`


1. Instale Node.js e pnpm:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pnpm
```

2. Clone o projeto:
```bash
git clone seu-repositorio.git
cd verzel-webchat
```

3. Instale dependências:
```bash
pnpm install
```

4. Configure `.env` com suas variáveis

5. Execute migrações:
```bash
pnpm db:push
```

6. Build do projeto:
```bash
pnpm build
```

7. Instale PM2 para manter o app rodando:
```bash
npm install -g pm2
pm2 start npm --name "verzel-webchat" -- start
pm2 save
pm2 startup
```

8. Configure Nginx como reverse proxy:
```bash
apt-get install nginx
```

Crie `/etc/nginx/sites-available/verzel-webchat`:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/verzel-webchat /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

9. Configure SSL com Let's Encrypt:
```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d seu-dominio.com
```

**Custo:** A partir de $5/mês

---

## 🔑 Configuração do Google Calendar (Opcional)

Para usar a integração real do Google Calendar:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)

2. Crie um novo projeto

3. Ative a API do Google Calendar

4. Crie credenciais OAuth 2.0:
   - Tipo: Web application
   - Authorized redirect URIs: `https://seu-dominio.com/api/google/callback`

5. Copie Client ID e Client Secret para o `.env`

6. Para obter o Refresh Token:
   - Use o [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Configure com suas credenciais
   - Autorize a API do Google Calendar
   - Copie o refresh token para o `.env`

**Nota:** Sem o refresh token, o sistema usará horários mock (simulados).

---

## 🧪 Testando o Projeto

1. Acesse a URL do projeto
2. Clique no ícone de chat azul no canto inferior direito
3. Converse com o assistente:
   - Responda as perguntas
   - Confirme interesse
   - Escolha um horário
4. Verifique:
   - Mensagem de confirmação
   - Card criado no Pipefy
   - Evento no Google Calendar (se configurado)

---

## 📊 Monitoramento

### Logs do Servidor

```bash
# Railway/Render
# Veja logs no painel web

# VPS com PM2
pm2 logs verzel-webchat
```

### Banco de Dados

```bash
# Conecte ao banco
mysql -u usuario -p verzel_webchat

# Veja leads
SELECT * FROM leads ORDER BY createdAt DESC LIMIT 10;

# Veja conversas
SELECT * FROM conversations ORDER BY createdAt DESC LIMIT 10;

# Veja mensagens
SELECT * FROM messages ORDER BY createdAt DESC LIMIT 20;
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Database connection failed"
- Verifique se o MySQL está rodando
- Confirme a `DATABASE_URL` no `.env`
- Teste a conexão: `mysql -u usuario -p`

### Erro: "OpenAI API error"
- Verifique se a `OPENAI_API_KEY` está correta
- Confirme se há créditos na conta OpenAI

### Erro: "Pipefy API error"
- Verifique se o `PIPEFY_API_TOKEN` está válido
- Confirme se o `PIPEFY_PIPE_ID` existe

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte o `README.md` do projeto
- Verifique os logs do servidor
- Revise as variáveis de ambiente

---

## 🎉 Pronto!

Seu webchat Verzel está rodando! 🚀


