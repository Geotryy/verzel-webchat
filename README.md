# 🤖 Verzel Webchat - Desafio Elite Dev IA

> Webchat inteligente com agente SDR automatizado para qualificação de leads e agendamento de reuniões.

[![Deploy](https://img.shields.io/badge/Deploy-Railway-blueviolet)](https://verzel-webchat-production-7a8c.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/Geotryy/verzel-webchat)

---

## 🎯 Sobre o Projeto

Desenvolvido como parte do **Desafio Elite Dev IA da Verzel**, este projeto implementa um webchat completo com agente conversacional inteligente que automatiza todo o processo de qualificação de leads e agendamento de reuniões.

### 🌐 Demo Online

**🔗 [Testar Aplicação](https://verzel-webchat-production-7a8c.up.railway.app)**

---

## ✨ Funcionalidades Implementadas

### 🤖 Agente Conversacional Inteligente
- ✅ Conversação natural e empática com OpenAI GPT-4
- ✅ Apresentação profissional do serviço
- ✅ Perguntas de descoberta progressivas
- ✅ Identificação de interesse explícito
- ✅ Respostas contextuais adaptadas

### 📅 Agendamento Automático
- ✅ Busca de slots disponíveis (próximos 7 dias)
- ✅ Sugestão de 2-3 horários
- ✅ Criação automática no Google Calendar
- ✅ Geração de link do Google Meet

### 📊 Gestão de Leads no Pipefy
- ✅ Registro automático de todos os leads
- ✅ Validação de duplicatas por email
- ✅ Atualização de cards existentes
- ✅ Persistência mesmo sem interesse

### 🎨 Interface Mobile-First
- ✅ Design responsivo e profissional
- ✅ Identidade visual da Verzel (roxo, ciano, verde)
- ✅ Animações fluidas e gradientes vibrantes
- ✅ Acessibilidade via teclado

---

## 🛠️ Stack Tecnológica

**Frontend:** React 19 · TypeScript · Tailwind CSS 4 · tRPC · Shadcn/ui

**Backend:** Node.js · Express · tRPC · Drizzle ORM · MySQL/TiDB

**Integrações:** OpenAI API · Google Calendar API · Pipefy GraphQL API

**Deploy:** Railway

---

## 📦 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/Geotryy/verzel-webchat.git
cd verzel-webchat

# Instale dependências
pnpm install

# Configure .env (veja .env.example)
cp .env.example .env

# Execute migrações
pnpm db:push

# Inicie servidor
pnpm dev
```

Acesse: `http://localhost:3000`

---

## 🔄 Fluxo de Conversação

1. **Saudação** - Apresentação do assistente
2. **Coleta de Dados** - Nome, email, empresa, necessidade, prazo
3. **Confirmação** - Interesse explícito do cliente
4. **Horários** - Sugestão de slots disponíveis
5. **Agendamento** - Criação no Calendar + Pipefy
6. **Encerramento** - Confirmação profissional

---

## 🎯 Critérios de Sucesso Atendidos

✅ Conversa natural com perguntas progressivas  
✅ Confirmação explícita como gatilho  
✅ Agendamento criado na API do Google Calendar  
✅ Todos os leads persistidos no Pipefy  
✅ Recontato atualiza card existente  
✅ Código bem estruturado e documentado  

---

## 🧪 Como Testar

1. Acesse: https://verzel-webchat-production.up.railway.app/
2. Clique no ícone de chat (canto inferior direito)
3. Converse com o assistente
4. Forneça os dados solicitados
5. Confirme interesse e escolha um horário
6. Verifique o evento no Google Calendar e card no Pipefy

---

## 🏗️ Estrutura do Projeto

```
verzel-webchat/
├── client/              # Frontend React
│   ├── src/components/  # Componentes UI
│   └── src/pages/       # Páginas
├── server/              # Backend Node.js
│   ├── integrations/    # OpenAI, Calendar, Pipefy
│   ├── db.ts            # Queries
│   └── routers.ts       # Rotas tRPC
└── drizzle/             # Schema e migrações
```

---

## 📝 Variáveis de Ambiente

```env
DATABASE_URL=mysql://...
OPENAI_API_KEY=sk-proj-...
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
PIPEFY_API_TOKEN=...
PIPEFY_PIPE_ID=...
JWT_SECRET=...
```

Veja `.env.example` para referência completa.

---

## 🚀 Deploy

Projeto deployado no Railway:
- **URL:** https://verzel-webchat-production.up.railway.app/
- **Database:** MySQL
- **Deploy:** Automático via GitHub

---

## 👨‍💻 Autor


- GitHub: [@Geotryy](https://github.com/Geotryy)
- Email: geovannasdias@hotmail.com

---

## 🙏 Agradecimentos

Agradeço à Verzel pela oportunidade de participar deste desafio técnico.

---

<div align="center">

**Desenvolvido com 💜 para o Desafio Elite Dev IA da Verzel**

</div>

