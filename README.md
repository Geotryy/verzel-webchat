# Verzel Webchat - SDR Agent

Webchat inteligente e mobile-first para automação de atendimento de leads, qualificação e agendamento de reuniões.

---

## 📋 Descrição

Este sistema integra:

* **OpenAI (GPT-4)** para conversação natural
* **Google Calendar** para agendamento automático de reuniões
* **Pipefy** para gestão de leads no funil de vendas

O agente SDR conduz conversas empáticas, coleta dados de leads, identifica interesse e agenda reuniões sem intervenção manual.

---

## 🚀 Funcionalidades

### Agente Conversacional

* Saudação profissional
* Perguntas de descoberta (nome, e-mail, empresa, necessidade, prazo)
* Identificação de interesse do lead
* Respostas contextuais e naturais

### Agendamento Inteligente

* Busca slots disponíveis nos próximos 7 dias (9h–18h)
* Sugestão de 2–3 horários
* Criação de evento no Google Calendar com Google Meet
* Envio automático de convites

### Gestão de Leads

* Registro e atualização automática no Pipefy
* Validação de duplicatas por e-mail
* Armazenamento de leads mesmo sem interesse

### Interface Mobile-First

* Layout responsivo
* Animações suaves
* Indicador de digitação
* Scroll automático
* Botão flutuante de chat

---

## 🛠️ Tecnologias

**Frontend:** React · TypeScript · Tailwind CSS · tRPC · shadcn/ui

**Backend:** Node.js · Express · tRPC · Drizzle ORM · MySQL/TiDB

**Integrações:** OpenAI API · Google Calendar API · Pipefy GraphQL API

---

## 📦 Instalação

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPO>
   cd verzel-webchat
   ```
2. Instale dependências:

   ```bash
   pnpm install
   ```
3. Crie e configure o arquivo `.env` (veja seção abaixo)
4. Execute migrações:

   ```bash
   pnpm db:push
   ```
5. Inicie em modo de desenvolvimento:

   ```bash
   pnpm dev
   ```

Acesse `http://localhost:3000`.

---

## 🔐 Variáveis de Ambiente

Preencha no `.env`:

<details>
<summary>Exemplo de `.env`</summary>

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=
GOOGLE_CALENDAR_REFRESH_TOKEN=

# Pipefy
PIPEFY_API_TOKEN=
PIPEFY_PIPE_ID=

# Autenticação JWT
JWT_SECRET=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=

# Configuração do App
VITE_APP_ID=verzel-webchat
VITE_APP_TITLE="Verzel Webchat - SDR Agent"
VITE_APP_LOGO=https://via.placeholder.com/150
```

</details>

---

## 🏗️ Estrutura do Projeto

```
verzel-webchat/
├── client/        # Frontend React
├── server/        # Backend Node.js
├── drizzle/       # Schema e migrações
└── shared/        # Códigos e tipos compartilhados
```

---

## 🔄 Integrações

* **Google Calendar:** Disponibilidade → Freebusy → Criação de evento
* **Pipefy:** Verificação → Criação/atualização de card
* **OpenAI:** Contexto → Extração de dados → Resposta natural

---

## 🧪 Testes

1. Abra o chat em `http://localhost:3000`
2. Responda às perguntas do agente
3. Confirme interesse para receber horários
4. Escolha um horário
5. Verifique:

   * Evento no Google Calendar
   * Card no Pipefy


---

1. Abra o chat em `http://localhost:3000`
2. Responda às perguntas do agente
3. Confirme interesse para receber horários
4. Escolha um horário
5. Verifique:

   * Evento no Google Calendar
   * Card no Pipefy

---

## ☁️ Deploy

O deploy deste projeto foi realizado no Railway.

URL de acesso: [https://verzel-webchat-production.up.railway.app/](https://verzel-webchat-production.up.railway.app/)

⚠️ Atenção:
O webchat pode apresentar mensagens de erro do tipo
“Desculpe, ocorreu um erro. Por favor, tente novamente.”
Isso acontece porque o limite de uso da OpenAI API foi atingido (quota excedida na conta).
Este não é um bug do código — basta inserir uma nova chave válida e com saldo para retomar o funcionamento.

---


## 👥 Suporte

Para dúvidas, abra uma *issue* ou contate a equipe de desenvolvimento.

---

ℹ️ **Nota importante:**
O webchat depende de saldo disponível na API da OpenAI.
Se aparecer mensagens de erro ao tentar conversar, é porque a quota gratuita/paga da API foi atingida.
Basta atualizar a variável **OPENAI_API_KEY** com uma chave ativa para reabilitar.
