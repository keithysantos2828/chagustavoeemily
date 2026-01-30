import React from 'react';
import { Gift } from '../types';
import { IconGift, IconHeart, IconSparkles } from './Icons';

interface PresenceListProps {
  gifts: Gift[];
}

const PresenceList: React.FC<PresenceListProps> = ({ gifts }) => {
  const confirmedCount = gifts.filter(g => g.status === 'reserved').length;
  const uniqueGivers = new Set(gifts.filter(g => g.status === 'reserved' && g.reservedBy).map(g => g.reservedBy)).size;

  if (confirmedCount === 0) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white rounded-[3rem] p-8 md:p-12 mb-20 shadow-xl shadow-stone-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left relative">
          <div className="absolute -top-10 -left-6 opacity-10">
            <IconHeart className="w-20 h-20 text-[#B07D62]" />
          </div>
          <h3 className="text-3xl md:text-4xl font-cursive text-[#354F52] flex items-center justify-center md:justify-start gap-4">
            Mural de Carinho
          </h3>
          <p className="text-[10px] text-[#84A98C] font-black uppercase tracking-[0.4em] mt-3">
            O sonho da casa nova virando realidade
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-center bg-[#B07D62]/5 px-6 py-4 rounded-2xl border border-[#B07D62]/10">
            <span className="text-3xl font-bold text-[#B07D62]">{confirmedCount}</span>
            <span className="text-[9px] font-black text-[#B07D62]/60 uppercase tracking-widest">Presentes Escolhidos</span>
          </div>
          <div className="flex flex-col items-center bg-[#52796F]/5 px-6 py-4 rounded-2xl border border-[#52796F]/10">
             <div className="flex items-center gap-1">
               <span className="text-3xl font-bold text-[#52796F]">{uniqueGivers}</span>
               <IconHeart className="w-4 h-4 text-[#52796F] animate-pulse" />
             </div>
             <span className="text-[9px] font-black text-[#52796F]/60 uppercase tracking-widest">Pessoas Participando</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 bg-stone-50 border border-stone-100 px-4 py-2 rounded-full">
           <IconSparkles className="w-4 h-4 text-amber-400" />
           <p className="text-[10px] text-stone-500 font-medium italic">
             Vocês são incríveis! Obrigado por ajudarem a construir nosso lar.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PresenceList;