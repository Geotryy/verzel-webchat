import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createLead,
  getLeadBySessionId,
  updateLead,
  createConversation,
  getConversationBySessionId,
  updateConversationStatus,
  createMessage,
  getMessagesByConversationId,
} from "./db";
import { processMessage, registerLead, scheduleMeeting } from "./integrations/agent";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    initSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const { sessionId } = input;
        let conversation = await getConversationBySessionId(sessionId);
        
        if (!conversation) {
          conversation = await createConversation({ sessionId, status: "active" });
          await createLead({ sessionId, interestConfirmed: false });
          await createMessage({
            conversationId: conversation.id,
            role: "assistant",
            content: "Olá! Sou o assistente virtual da Verzel. Como posso ajudá-lo hoje?",
          });
        }

        const messages = await getMessagesByConversationId(conversation.id);
        return {
          conversationId: conversation.id,
          messages: messages.map(m => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
        };
      }),

    sendMessage: publicProcedure
      .input(z.object({ sessionId: z.string(), message: z.string() }))
      .mutation(async ({ input }) => {
        const { sessionId, message } = input;
        const conversation = await getConversationBySessionId(sessionId);
        if (!conversation) throw new Error("Conversation not found");

        await createMessage({ conversationId: conversation.id, role: "user", content: message });
        const dbMessages = await getMessagesByConversationId(conversation.id);
        const conversationHistory = dbMessages.map(m => ({ role: m.role as "assistant" | "user", content: m.content }));
        const lead = await getLeadBySessionId(sessionId);
        const leadData = { 
          name: lead?.name || undefined, 
          email: lead?.email || undefined, 
          company: lead?.company || undefined, 
          need: lead?.need || undefined, 
          deadline: lead?.deadline || undefined, 
          interestConfirmed: lead?.interestConfirmed 
        };

        const agentResponse = await processMessage({ sessionId, leadData, conversationHistory }, message);

        if (agentResponse.data && agentResponse.action === "collect_data") {
          await updateLead(sessionId, agentResponse.data);
        }

        if (agentResponse.action === "offer_slots") {
          await updateLead(sessionId, { interestConfirmed: true });
          const updatedLead = await getLeadBySessionId(sessionId);
          if (updatedLead?.email) {
            try {
              const pipefyCardId = await registerLead(updatedLead);
              await updateLead(sessionId, { pipefyCardId });
            } catch (error) { console.error("Error registering in Pipefy:", error); }
          }
        }

        if (agentResponse.action === "schedule_meeting" && agentResponse.data?.slotIndex !== undefined) {
          const updatedLead = await getLeadBySessionId(sessionId);
          const slots = agentResponse.data.slots || [];
          const selectedSlot = slots[agentResponse.data.slotIndex];
          if (updatedLead && selectedSlot) {
            try {
              const meeting = await scheduleMeeting({ ...updatedLead, pipefyCardId: updatedLead.pipefyCardId }, selectedSlot.start, selectedSlot.end);
              await updateLead(sessionId, { meetingLink: meeting.meetingLink, meetingDatetime: new Date(meeting.meetingDatetime) });
              await updateConversationStatus(sessionId, "completed");
            } catch (error) { console.error("Error scheduling meeting:", error); }
          }
        }

        if (agentResponse.action === "end_conversation") {
          await updateConversationStatus(sessionId, "completed");
          const updatedLead = await getLeadBySessionId(sessionId);
          if (updatedLead?.email && !updatedLead.pipefyCardId) {
            try {
              const pipefyCardId = await registerLead(updatedLead);
              await updateLead(sessionId, { pipefyCardId });
            } catch (error) { console.error("Error registering in Pipefy:", error); }
          }
        }

        await createMessage({ conversationId: conversation.id, role: "assistant", content: agentResponse.message });
        return { message: agentResponse.message, action: agentResponse.action, data: agentResponse.data };
      }),

    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await getConversationBySessionId(input.sessionId);
        if (!conversation) return { messages: [] };
        const messages = await getMessagesByConversationId(conversation.id);
        return { messages: messages.map(m => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })) };
      }),
  }),
});

export type AppRouter = typeof appRouter;
