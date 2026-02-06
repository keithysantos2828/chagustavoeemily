import React from 'react';
import { Gift, User } from '../types';
import { IconHeart, IconSparkles, IconCheck, IconUser } from './Icons';

interface PresenceListProps {
  gifts: Gift[];
  currentUser?: User | null;
}

const PresenceList: React.FC<PresenceListProps> = ({ gifts, currentUser }) => {
  // Extrai nomes únicos de quem reservou
  const giverNames: string[] = Array.from(new Set(
    gifts
      .filter(g => g.status === 'reserved' && g.reservedBy)
      .map(g => g.reservedBy as string)
  ));

  const confirmedCount = gifts.filter(g => g.status === 'reserved').length;
  const uniqueGivers = giverNames.length;
  
  // Verifica se eu já estou na lista
  const amIInList = currentUser && giverNames.includes(currentUser.name);

  // Se a lista estiver vazia E o usuário ainda não contribuiu, mostramos apenas o convite
  if (confirmedCount === 0 && !currentUser) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 mb-10 md:mb-20 shadow-xl shadow-stone-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#B07D62]/5 to-transparent rounded-full blur-3xl -z-10"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-10">
        <div className="text-center md:text-left relative">
          <div className="absolute -top-10 -left-6 opacity-10 hidden md:block">
            <IconHeart className="w-20 h-20 text-[#B07D62]" />
          </div>
          <h3 className="text-2xl md:text-4xl font-cursive text-[#354F52] flex items-center justify-center md:justify-start gap-3">
            <IconHeart className="w-6 h-6 md:hidden text-[#B07D62]" />
            Mural de Carinho
          </h3>
          <p className="text-[10px] text-[#84A98C] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mt-2 md:mt-3">
            Quem já está participando com a gente
          </p>
        </div>
        
        <div className="flex gap-3 md:gap-4 w-full md:w-auto justify-center">
          <div className="flex flex-col items-center bg-[#B07D62]/5 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-[#B07D62]/10 flex-1 md:flex-none min-w-[100px]">
            <span className="text-2xl md:text-3xl font-bold text-[#B07D62]">{confirmedCount}</span>
            <span className="text-[8px] md:text-[9px] font-black text-[#B07D62]/60 uppercase tracking-widest text-center">Presentes<br/>Escolhidos</span>
          </div>
          <div className="flex flex-col items-center bg-[#52796F]/5 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-[#52796F]/10 flex-1 md:flex-none min-w-[100px]">
             <div className="flex items-center gap-1">
               <span className="text-2xl md:text-3xl font-bold text-[#52796F]">{uniqueGivers}</span>
             </div>
             <span className="text-[8px] md:text-[9px] font-black text-[#52796F]/60 uppercase tracking-widest text-center">Pessoas<br/>Incríveis</span>
          </div>
        </div>
      </div>
      
      {/* Lista de Nomes (Chips) */}
      <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 items-center">
        {giverNames.map((name, index) => {
          const isMe = currentUser && name === currentUser.name;
          
          return (
            <div 
              key={index} 
              className={`
                group flex items-center gap-2 pl-1 pr-4 py-1.5 rounded-full shadow-sm cursor-default
                transition-all duration-500
                ${isMe 
                  ? 'bg-[#FDFCF8] border-2 border-[#B07D62] scale-105 shadow-md z-10 animate-in zoom-in-50 spin-in-2' 
                  : 'bg-white border border-[#52796F]/10 hover:shadow-md hover:border-[#B07D62]/30'
                }
              `}
            >
              <div className={`
                w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold uppercase shadow-inner
                ${isMe ? 'bg-[#B07D62] text-white' : 'bg-gradient-to-br from-[#52796F] to-[#354F52] text-white'}
              `}>
                {isMe ? <IconCheck className="w-3 h-3 md:w-4 md:h-4" /> : name.charAt(0)}
              </div>
              <span className={`text-[11px] md:text-sm font-medium capitalize ${isMe ? 'text-[#B07D62] font-bold' : 'text-[#354F52]'}`}>
                {name.split(' ')[0]} {isMe && '(Você)'}
              </span>
            </div>
          );
        })}

        {/* --- GAMIFICAÇÃO SUTIL (Versão Elegante/Ghost) --- */}
        {!amIInList && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
             <div className="
               group relative flex items-center gap-3 pl-1 pr-5 py-1.5 
               border border-dashed border-[#B07D62]/40 rounded-full 
               hover:bg-[#B07D62]/5 transition-all cursor-default opacity-70 hover:opacity-100
             ">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#B07D62]/10 flex items-center justify-center">
                   <IconUser className="w-3 h-3 md:w-4 md:h-4 text-[#B07D62]" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest text-[#B07D62] leading-none mb-0.5">Falta você</span>
                   <span className="text-[10px] md:text-xs font-serif italic text-[#354F52]">Guardamos seu lugar &hearts;</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center md:text-left pt-6 border-t border-dashed border-[#52796F]/10">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full">
           <IconSparkles className="w-4 h-4 text-amber-400" />
           <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">
             {amIInList 
               ? "Obrigado por fazer parte desse sonho com a gente! ❤️" 
               : "Sua presença na nossa história é o maior presente."}
           </p>
        </div>
      </div>
    </div>
  );
};

export default PresenceList;