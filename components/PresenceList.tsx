import React from 'react';
import { Gift } from '../types';
import { IconGift, IconHeart, IconSparkles, IconUser } from './Icons';

interface PresenceListProps {
  gifts: Gift[];
}

const PresenceList: React.FC<PresenceListProps> = ({ gifts }) => {
  // Extrai nomes únicos de quem reservou
  const giverNames = Array.from(new Set(
    gifts
      .filter(g => g.status === 'reserved' && g.reservedBy)
      .map(g => g.reservedBy!)
  ));

  const confirmedCount = gifts.filter(g => g.status === 'reserved').length;
  const uniqueGivers = giverNames.length;

  if (confirmedCount === 0) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 mb-10 md:mb-20 shadow-xl shadow-stone-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
          <div className="flex flex-col items-center bg-[#B07D62]/5 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-[#B07D62]/10 flex-1 md:flex-none">
            <span className="text-2xl md:text-3xl font-bold text-[#B07D62]">{confirmedCount}</span>
            <span className="text-[8px] md:text-[9px] font-black text-[#B07D62]/60 uppercase tracking-widest text-center">Presentes<br/>Escolhidos</span>
          </div>
          <div className="flex flex-col items-center bg-[#52796F]/5 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-[#52796F]/10 flex-1 md:flex-none">
             <div className="flex items-center gap-1">
               <span className="text-2xl md:text-3xl font-bold text-[#52796F]">{uniqueGivers}</span>
             </div>
             <span className="text-[8px] md:text-[9px] font-black text-[#52796F]/60 uppercase tracking-widest text-center">Pessoas<br/>Incríveis</span>
          </div>
        </div>
      </div>
      
      {/* Lista de Nomes (Chips) */}
      <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
        {giverNames.map((name, index) => (
          <div 
            key={index} 
            className="group flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-[#52796F]/10 rounded-full shadow-sm hover:shadow-md hover:border-[#B07D62]/30 transition-all cursor-default"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#52796F] to-[#354F52] text-white flex items-center justify-center text-[10px] md:text-xs font-bold uppercase shadow-inner">
              {name.charAt(0)}
            </div>
            <span className="text-[11px] md:text-sm font-medium text-[#354F52] capitalize">
              {name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center md:text-left pt-6 border-t border-dashed border-[#52796F]/10">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full">
           <IconSparkles className="w-4 h-4 text-amber-400" />
           <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">
             Vocês são incríveis! Obrigado por tanto carinho.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PresenceList;