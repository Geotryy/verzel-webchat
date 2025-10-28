import { invokeLLM, type Message } from "../_core/llm";
import { getAvailableSlots, createMeeting } from "./googleCalendar";
import { createCard, updateCard, findCardByEmail } from "./pipefy";

interface AgentContext {
  sessionId: string;
  leadData: {
    name?: string;
    email?: string;
    company?: string;
    need?: string;
    deadline?: string;
    interestConfirmed?: boolean;
  };
  conversationHistory: Message[];
}

interface AgentResponse {
  message: string;
  action?: "collect_data" | "offer_slots" | "schedule_meeting" | "end_conversation";
  data?: any;
}

const SYSTEM_PROMPT = `Você é um agente SDR (Sales Development Representative) profissional e empático da Verzel, uma empresa de tecnologia líder em soluções inovadoras.

SEU OBJETIVO:
1. Apresentar-se de forma cordial: "Olá! Sou o assistente virtual da Verzel. Como posso ajudá-lo hoje?"
2. Explicar brevemente o serviço/produto da Verzel quando apropriado
3. Conduzir uma conversa natural para coletar informações do cliente
4. Identificar o interesse real do cliente antes de oferecer agendamento

FLUXO DE DESCOBERTA (faça uma pergunta de cada vez):
1. Nome completo do cliente
2. E-mail de contato
3. Nome da empresa
4. Qual é a principal necessidade ou dor que precisa resolver?
5. Qual o prazo desejado para implementação?

IMPORTANTE:
- Seja sempre profissional, empático e natural
- Faça APENAS UMA pergunta por vez para manter a conversa fluida
- Não seja robótico ou repetitivo
- Adapte-se ao tom e estilo do cliente
- Confirme as informações quando necessário
- Não seja insistente se o cliente não demonstrar interesse

CRITÉRIO DE GATILHO PARA AGENDAMENTO:
O cliente deve confirmar EXPLICITAMENTE o interesse em adquirir o produto/serviço.
Exemplos de confirmação explícita:
- "Sim, tenho interesse"
- "Gostaria de seguir com uma conversa"
- "Quero conhecer melhor o produto"
- "Sim, vamos agendar"

QUANDO O CLIENTE CONFIRMAR INTERESSE:
Responda de forma natural e adicione [INTERESSE_CONFIRMADO] no final da mensagem.
Exemplo: "Que ótimo! Vou verificar os horários disponíveis para nossa reunião. [INTERESSE_CONFIRMADO]"

QUANDO O CLIENTE ESCOLHER UM HORÁRIO:
Se o cliente indicar qual horário prefere (primeiro, segundo, terceiro, ou mencionar o horário específico), responda com [AGENDAR_REUNIAO] seguido do índice (0, 1 ou 2).
Exemplo: "Perfeito! Vou agendar para esse horário. [AGENDAR_REUNIAO] 0"

SE O CLIENTE NÃO TIVER INTERESSE:
Agradeça cordialmente e encerre a conversa de forma profissional, adicionando [SEM_INTERESSE] no final.
Exemplo: "Entendo perfeitamente. Agradeço seu tempo e estamos à disposição quando precisar. [SEM_INTERESSE]"

SCRIPT SUGERIDO DE APRESENTAÇÃO:
"Olá! Sou o assistente virtual da Verzel, empresa especializada em soluções tecnológicas que ajudam empresas a crescer e inovar. Podemos conversar sobre como podemos ajudar sua empresa?"

PERGUNTAS DE DESCOBERTA (uma de cada vez):
1. "Para começar, qual é o seu nome completo?"
2. "Ótimo, [Nome]! Qual é o melhor e-mail para contato?"
3. "Perfeito! Você representa qual empresa?"
4. "Entendi. Qual é a principal necessidade ou desafio que vocês estão enfrentando atualmente?"
5. "Compreendo. Vocês têm algum prazo em mente para implementar uma solução?"

APÓS COLETAR TODAS AS INFORMAÇÕES:
"Obrigado pelas informações, [Nome]! Com base no que conversamos, acredito que podemos ajudar [Empresa] com [Necessidade]. Você gostaria de agendar uma reunião com nosso time para discutirmos uma solução personalizada?"

TOM E ESTILO:
- Profissional mas acessível
- Empático e atencioso
- Objetivo mas não apressado
- Use o nome do cliente quando apropriado
- Demonstre interesse genuíno nas necessidades dele`;

export async function processMessage(context: AgentContext, userMessage: string): Promise<AgentResponse> {
  // Monta histórico da conversa para o LLM
  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...context.conversationHistory,
    { role: "user", content: userMessage },
  ];

  // LOG: Início do processamento
  console.log("\n[PROCESS] NOVA INTERAÇÃO");
  console.log("[PROCESS] User message:", userMessage);
  console.log("[PROCESS] Conversation history:", JSON.stringify(context.conversationHistory, null, 2));

  // Chama o LLM (OpenAI)
  let response;
  try {
    response = await invokeLLM({ messages });
    console.log("[OPENAI] LLM response:", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("[OPENAI ERROR] invokeLLM failed:", err);
    throw err;
  }

  // Interpreta a resposta do LLM
  const rawContent = response.choices[0].message.content;
  const assistantMessage = typeof rawContent === "string" ? rawContent : "";
  console.log("[PROCESS] Assistant message:", assistantMessage);

  // Identifica intenções-chave do bot
  if (assistantMessage.includes("[INTERESSE_CONFIRMADO]")) {
    const cleanMessage = assistantMessage.replace(/\[INTERESSE_CONFIRMADO\]/g, "").trim();

    // Busca horários disponíveis
    let slots;
    try {
      slots = await getAvailableSlots(7);
      console.log("[GOOGLE CALENDAR] Horários disponíveis:", slots);
    } catch (err) {
      console.error("[GOOGLE ERROR] getAvailableSlots failed:", err);
      throw err;
    }
    return {
      message: cleanMessage,
      action: "offer_slots",
      data: { slots },
    };
  }

  if (assistantMessage.includes("[AGENDAR_REUNIAO]")) {
    const match = assistantMessage.match(/\[AGENDAR_REUNIAO\]\s*(\d+)/);
    const slotIndex = match ? parseInt(match[1]) : 0;

    const cleanMessage = assistantMessage.replace(/\[AGENDAR_REUNIAO\]\s*\d+/g, "").trim();

    console.log("[PROCESS] Agendar reunião. Slot index:", slotIndex);

    return {
      message: cleanMessage,
      action: "schedule_meeting",
      data: { slotIndex },
    };
  }

  if (assistantMessage.includes("[SEM_INTERESSE]")) {
    const cleanMessage = assistantMessage.replace(/\[SEM_INTERESSE\]/g, "").trim();
    console.log("[PROCESS] Lead sem interesse. Encerrando conversa.");
    return {
      message: cleanMessage,
      action: "end_conversation",
    };
  }

  // Tenta extrair dados do usuário, se possível
  const extractedData = extractLeadData(userMessage, context.leadData);
  if (extractedData) {
    console.log("[PROCESS] Dados extraídos do usuário:", extractedData);
  }

  return {
    message: assistantMessage,
    action: "collect_data",
    data: extractedData,
  };
}

function extractLeadData(message: string, currentData: any): any {
  const updates: any = {};

  // Extrai email se ainda não foi preenchido
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch && !currentData.email) {
    updates.email = emailMatch[0];
  }

  // Tenta extrair nome (heurística simples)
  if (!currentData.name && message.split(" ").length >= 2 && message.split(" ").length <= 4) {
    const words = message.trim().split(" ");
    if (words.every(w => w[0] === w[0].toUpperCase())) {
      updates.name = message.trim();
    }
  }

  return Object.keys(updates).length > 0 ? updates : null;
}

export async function registerLead(leadData: any): Promise<string> {
  try {
    if (leadData.email) {
      const existingCard = await findCardByEmail(leadData.email);
      console.log("[PIPEFY] Buscou card por email:", leadData.email, "Resultado:", existingCard);
      if (existingCard) {
        await updateCard(existingCard.id, {
          company: leadData.company,
          need: leadData.need,
          deadline: leadData.deadline,
          interestConfirmed: leadData.interestConfirmed || false,
        });
        console.log("[PIPEFY] Atualizou card existente:", existingCard.id);
        return existingCard.id;
      }
    }

    // Cria novo card no Pipefy
    const cardId = await createCard({
      name: leadData.name || "Lead sem nome",
      email: leadData.email || "sem-email@example.com",
      company: leadData.company,
      need: leadData.need,
      deadline: leadData.deadline,
      interestConfirmed: leadData.interestConfirmed || false,
    });
    console.log("[PIPEFY] Criou novo card:", cardId);

    return cardId;
  } catch (error) {
    console.error("[PIPEFY ERROR] Erro ao registrar lead:", error);
    throw error;
  }
}

export async function scheduleMeeting(
  leadData: any,
  slotStart: string,
  slotEnd: string
): Promise<{ meetingLink: string; meetingDatetime: string }> {
  try {
    const meeting = await createMeeting({
      summary: `Reunião com ${leadData.name || "Lead"}`,
      description: `Reunião agendada via webchat.\n\nEmpresa: ${leadData.company || "N/A"}\nNecessidade: ${leadData.need || "N/A"}`,
      startTime: slotStart,
      endTime: slotEnd,
      attendeeEmail: leadData.email,
      attendeeName: leadData.name || "Lead",
    });

    // Atualiza card no Pipefy com informações da reunião
    if (leadData.pipefyCardId) {
      await updateCard(leadData.pipefyCardId, {
        meetingLink: meeting.meetingLink,
        meetingDatetime: meeting.meetingDatetime,
        interestConfirmed: true,
      });
      console.log("[PIPEFY] Atualizou card com info da reunião:", leadData.pipefyCardId);
    }

    console.log("[GOOGLE] Reunião criada:", meeting);

    return meeting;
  } catch (error) {
    console.error("[GOOGLE ERROR] Erro ao agendar reunião:", error);
    throw error;
  }
}
