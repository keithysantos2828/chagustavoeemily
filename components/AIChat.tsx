
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { getGeminiKey } from '../services/aiService';
import { Gift, User } from '../types';
import { IconSparkles, IconArrowUp, IconUser, IconGift, IconArrowRight, IconCheck } from './Icons';

interface AIChatProps {
  gifts: Gift[];
  user: User;
  onReserve: (gift: Gift) => void;
  onRelease?: (gift: Gift) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_REPLIES = [
  "Sugira algo barato",
  "O que tem de cozinha?",
  "Endereço e horário?",
  "Ver meus presentes"
];

const AIChat: React.FC<AIChatProps> = ({ gifts, user, onReserve, onRelease }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [client, setClient] = useState<GoogleGenAI | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializa API Key e Cliente
  useEffect(() => {
    getGeminiKey().then(key => {
      if (key) {
        setApiKey(key);
        setClient(new GoogleGenAI({ apiKey: key }));
      }
    });
  }, []);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'model', 
          text: `Oie, **${user.name.split(' ')[0]}**! Tudo bem? \n\nEu sou a **Lia**, amiga virtual da Emily e do Gustavo. Estou aqui pra te ajudar a escolher um presente bacana pro Chá de Casa Nova! 🏡✨\n\nMe diz, o que você pensou em dar?` 
        }
      ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim() || !client || !apiKey) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // 1. Definição das Ferramentas (Tools)
      const tools = [{
        functionDeclarations: [
          {
            name: "getAvailableGifts",
            description: "Retorna a lista de presentes disponíveis. OBRIGATÓRIO usar quando o usuário pergunta 'o que tem', 'sugira algo', 'coisas de cozinha', etc.",
          },
          {
            name: "reserveGift",
            description: "Reserva um presente. Use APENAS se o usuário confirmar explicitamente que quer reservar aquele item específico.",
            parameters: {
              type: "OBJECT",
              properties: {
                giftName: { type: "STRING", description: "Nome exato ou muito próximo do presente que o usuário quer dar." },
              },
              required: ["giftName"]
            }
          },
          {
            name: "cancelReservation",
            description: "Cancela/Devolve um presente que o usuário já reservou anteriormente.",
            parameters: {
              type: "OBJECT",
              properties: {
                giftName: { type: "STRING", description: "Nome do presente a ser devolvido." },
              },
              required: ["giftName"]
            }
          },
          {
             name: "getUserReservations",
             description: "Lista o que este usuário específico já garantiu."
          }
        ]
      }];

      // 2. Contexto Rico do Evento
      const eventContext = `
        **CONTEXTO DO EVENTO:**
        - **Noivos:** Emily e Gustavo.
        - **Evento:** Chá de Casa Nova.
        - **Data:** 15 de Fevereiro de 2026 às 15:00.
        - **Local:** Sede Campestre Sintracon (Rua Ângela Perin D'agostin - Embu, Colombo - PR).
        - **Entrega:** Faltam poucos dias. Sugira levar no dia da festa. Não comprar online com prazo longo.
        
        **USUÁRIO ATUAL:**
        - Nome: ${user.name}
      `;

      const systemInstruction = `
        Você é a **Lia**, uma assistente de casamento virtual super carismática.
        
        ${eventContext}
        
        **SUA PERSONALIDADE:**
        - **Tom:** Caloroso, usa emojis, fala como uma brasileira animada.
        - **Formatacão:** USE MARKDOWN! Use **negrito** para destacar nomes de presentes e preços. Use listas (bullet points) para mostrar opções.
        
        **REGRAS DE OURO:**
        1. **Não liste tudo:** Se o usuário pedir "o que tem?", NUNCA mostre a lista toda. Mostre apenas o TOP 3 ou 5 itens mais legais/baratos e pergunte se quer ver mais.
        2. **Disponibilidade:** Se o usuário pedir algo que não existe ou já foi reservado (verifique via tool), diga "Poxa, esse já levaram!" e sugira algo similar imediatamente.
        3. **Reserva:** Antes de chamar 'reserveGift', confirme se é isso mesmo: "Posso reservar o [Item] pra você então?". Se o usuário disser "sim", "quero", "pode ser", aí sim chame a tool.
        4. **Preço:** Sempre mostre o preço estimado junto com o nome do item. Ex: "- **Batedeira** (R$ 190,00)"
      `;

      // 3. Modelo e Histórico
      const historyContext = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Usando gemini-2.0-flash-exp para garantir compatibilidade com as funcionalidades mais recentes
      // Se sua chave suporta gemini-3/2.5, este modelo deve funcionar perfeitamente.
      const result = await client.models.generateContent({
        model: 'gemini-2.0-flash-exp', 
        config: {
          systemInstruction,
          tools: tools,
        },
        contents: [
          ...historyContext,
          { role: 'user', parts: [{ text: userMsg }] }
        ]
      });

      const response = result.candidates?.[0]?.content;
      const parts = response?.parts || [];

      let finalText = "";
      const functionCalls = parts.filter(p => p.functionCall);
      
      if (functionCalls.length > 0) {
        for (const call of functionCalls) {
          const fnName = call.functionCall.name;
          const fnArgs = call.functionCall.args as any;

          if (fnName === 'getAvailableGifts') {
            // Filtragem inteligente
            const available = gifts.filter(g => g.status === 'available');
            
            // Serializa para a IA processar
            const availableStr = available
              .map(g => `ID:${g.id} | ${g.name} | R$${g.priceEstimate} | Cat:${g.category}`)
              .join('\n');
            
            const result2 = await client.models.generateContent({
              model: 'gemini-2.0-flash-exp',
              config: { systemInstruction },
              contents: [
                ...historyContext,
                { role: 'user', parts: [{ text: userMsg }] },
                response, 
                {
                  role: 'function',
                  parts: [{
                    functionResponse: {
                      name: fnName,
                      response: { result: availableStr || "Lista vazia." }
                    }
                  }]
                }
              ]
            });
            finalText = result2.text || "Confira as opções acima!";
            
          } else if (fnName === 'reserveGift') {
             const searchName = fnArgs.giftName.toLowerCase();
             const giftToReserve = gifts.find(g => 
               g.status === 'available' && g.name.toLowerCase().includes(searchName)
             );

             if (giftToReserve) {
               onReserve(giftToReserve);
               finalText = `Aêê! 🎉 Reservei **${giftToReserve.name}** pra você! \n\nLembre de levar no dia **15/02**. Obrigada pelo carinho com a Emily e o Gustavo! ❤️`;
             } else {
               finalText = `Ihh, fui tentar pegar **${fnArgs.giftName}** mas parece que alguém foi mais rápido ou não entendi o nome direito. 😅 \n\nQuer que eu liste o que sobrou nessa categoria?`;
             }

          } else if (fnName === 'cancelReservation') {
             const searchName = fnArgs.giftName.toLowerCase();
             const giftToRelease = gifts.find(g => 
               g.status === 'reserved' && 
               g.reservedBy === user.name &&
               g.name.toLowerCase().includes(searchName)
             );

             if (giftToRelease && onRelease) {
                onRelease(giftToRelease);
                finalText = `Tranquilo! Liberei **${giftToRelease.name}** da sua lista. Ele voltou pra prateleira virtual. Precisa de mais alguma coisa?`;
             } else {
                finalText = `Ué, não achei esse item reservado no seu nome. Tem certeza que reservou comigo? 🤔`;
             }

          } else if (fnName === 'getUserReservations') {
             const myGifts = gifts.filter(g => g.status === 'reserved' && g.reservedBy === user.name);
             if (myGifts.length > 0) {
                const list = myGifts.map(g => `- **${g.name}**`).join('\n');
                finalText = `Você já garantiu:\n${list}\n\nVai ser um presentão! 🎁`;
             } else {
                finalText = "Por enquanto você não reservou nada. Bora escolher algo? Tem coisas baratinhas e coisas chiques! 😄";
             }
          }
        }
      } else {
        finalText = result.text || "Desculpe, deu um branco aqui. Pode repetir?";
      }

      setMessages(prev => [...prev, { role: 'model', text: finalText }]);

    } catch (error: any) {
      console.error("Erro na IA:", error);
      let errorMsg = "Ops! Minha conexão falhou um pouquinho. Tenta de novo? 😅";
      
      // Tratamento de erro 404 Específico para Modelo não encontrado
      if (error?.message?.includes('404') || error?.toString().includes('404')) {
         errorMsg = "Ops! Parece que minha chave de ativação está pedindo um modelo diferente. Tente recarregar a página ou usar a lista manual por enquanto. 🙏";
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!apiKey) return null;

  return (
    <>
      {/* Botão Flutuante (FAB) - LADO ESQUERDO */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-4 z-[150] bg-gradient-to-tr from-[#354F52] to-[#52796F] text-white p-4 rounded-full shadow-[0_8px_30px_rgba(53,79,82,0.4)] hover:scale-110 transition-transform animate-in zoom-in slide-in-from-bottom-10 duration-700 group border border-white/20"
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#F8F7F2] animate-pulse"></div>
          <IconSparkles className="w-6 h-6" />
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white text-[#354F52] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Falar com a Lia
          </span>
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center pointer-events-none">
          <div 
            className="bg-black/20 backdrop-blur-[2px] absolute inset-0 pointer-events-auto" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="
            pointer-events-auto
            bg-[#FDFCF8] w-full md:w-[400px] h-[85vh] md:h-[650px] 
            rounded-t-[2rem] md:rounded-[2rem] shadow-2xl 
            flex flex-col overflow-hidden
            animate-in slide-in-from-bottom duration-500
            relative
          ">
            {/* Header */}
            <div className="bg-[#354F52] p-4 flex items-center justify-between shrink-0 border-b border-white/10">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 relative">
                    <IconSparkles className="w-5 h-5 text-white" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#354F52] rounded-full"></div>
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm">Lia (Assistente)</h3>
                   <p className="text-[#84A98C] text-[10px] font-black uppercase tracking-widest">Online agora</p>
                 </div>
               </div>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
               >
                 <IconArrowUp className="w-4 h-4 rotate-180" />
               </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#F8F7F2] custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-[#B07D62] text-white rounded-tr-sm shadow-md' 
                      : 'bg-white text-[#354F52] border border-[#52796F]/10 rounded-tl-sm'
                    }
                  `}>
                    <ReactMarkdown
                      components={{
                        // Estilização customizada OBRIGATÓRIA para Tailwind
                        strong: ({node, ...props}) => <span className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-[#B07D62]'}`} {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 my-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-[#52796F]/10 flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-[#B07D62] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#B07D62] rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-[#B07D62] rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies (Chips) */}
            {!isLoading && (
              <div className="px-4 pb-2 bg-[#F8F7F2] flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    className="flex-shrink-0 px-3 py-1.5 bg-white border border-[#52796F]/10 rounded-full text-[10px] font-bold uppercase tracking-wide text-[#52796F] hover:bg-[#52796F]/10 active:scale-95 transition-all shadow-sm whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-[#52796F]/10 shrink-0 pb-6 md:pb-4">
               <div className="flex items-center gap-2 bg-[#F8F7F2] rounded-2xl px-2 py-2 border border-[#52796F]/5 focus-within:border-[#B07D62]/50 focus-within:ring-2 focus-within:ring-[#B07D62]/10 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte para a Lia..."
                    className="flex-grow bg-transparent px-4 py-2 outline-none text-[#354F52] text-sm placeholder-[#52796F]/40"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 bg-[#354F52] text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2A3F41] active:scale-95 transition-all"
                  >
                    <IconArrowRight className="w-4 h-4" />
                  </button>
               </div>
               <p className="text-[9px] text-center text-[#52796F]/40 mt-2 font-medium">
                 A Lia pode errar. Sempre confira sua reserva.
               </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
