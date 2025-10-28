import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  createdAt: Date;
}

interface TimeSlot {
  start: string;
  end: string;
  formatted: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("chat_session_id");
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("chat_session_id", newId);
    return newId;
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initSession = trpc.chat.initSession.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initSession.mutate(
        { sessionId },
        {
          onSuccess: (data) => {
            setMessages(data.messages as Message[]);
          },
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Add user message optimistically
    const tempMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setIsTyping(true);

    sendMessage.mutate(
      { sessionId, message: userMessage },
      {
        onSuccess: (data) => {
          setIsTyping(false);
          
          // Add assistant response
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: data.message,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Handle slots offer
          if (data.action === "offer_slots" && data.data?.slots) {
            setAvailableSlots(data.data.slots);
            
            // Add slots message
            const slotsMessage: Message = {
              id: Date.now() + 2,
              role: "assistant",
              content: "Aqui estão os horários disponíveis. Por favor, escolha um:",
              createdAt: new Date(),
            };
            setMessages((prev) => [...prev, slotsMessage]);
          }

          // Handle meeting scheduled
          if (data.action === "schedule_meeting") {
            setAvailableSlots([]);
          }
        },
        onError: () => {
          setIsTyping(false);
          const errorMessage: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  const handleSlotSelection = (index: number) => {
    const slot = availableSlots[index];
    if (!slot) return;

    const userMessage = `Gostaria de agendar para ${slot.formatted}`;
    setInputValue("");
    
    const tempMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setIsTyping(true);

    sendMessage.mutate(
      { sessionId, message: `SLOT_${index}` },
      {
        onSuccess: (data) => {
          setIsTyping(false);
          setAvailableSlots([]);
          
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: data.message,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        },
        onError: () => {
          setIsTyping(false);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 sm:max-w-[400px] max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:rounded-none max-sm:h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Assistente Verzel</h3>
                <p className="text-xs text-blue-100">Online agora</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Available Slots */}
            {availableSlots.length > 0 && (
              <div className="flex flex-col gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotSelection(index)}
                    className="w-full p-3 bg-white border-2 border-purple-200 hover:border-blue-500 hover:bg-purple-50 rounded-xl text-sm font-medium text-gray-800 transition-all duration-200"
                  >
                    {slot.formatted}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sendMessage.isPending}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 p-0 flex items-center justify-center"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

