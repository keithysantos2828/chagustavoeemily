import React from 'react';
import { Gift } from '../types';
import { IconUser, IconSparkles, IconHeart } from './Icons';

interface PresenceListProps {
  gifts: Gift[];
}

const PresenceList: React.FC<PresenceListProps> = ({ gifts }) => {
  const confirmedNames = Array.from(new Set(
    gifts.filter(g => g.status === 'reserved' && g.reservedBy).map(g => String(g.reservedBy))
  ));

  if (confirmedNames.length === 0) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white rounded-[3rem] p-8 md:p-12 mb-20 shadow-xl shadow-stone-200/50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="text-center md:text-left relative">
          <div className="absolute -top-10 -left-6 opacity-10">
            <IconHeart className="w-20 h-20 text-[#B07D62]" />
          </div>
          <h3 className="text-3xl md:text-4xl font-cursive text-[#354F52] flex items-center justify-center md:justify-start gap-4">
            Quem já está nos ajudando
          </h3>
          <p className="text-[10px] text-[#84A98C] font-black uppercase tracking-[0.4em] mt-3">
            Amigos queridos que já escolheram um presente
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#52796F]/10 px-6 py-3 rounded-full border border-[#52796F]/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[#354F52] text-[11px] font-black uppercase tracking-widest">
            {confirmedNames.length} Pessoas Especiais
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        {confirmedNames.map((name, index) => (
          <div 
            key={index} 
            className="group flex items-center gap-3 bg-white border border-stone-100 pl-3 pr-5 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-[#84A98C]/30 hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="bg-[#F8F7F2] w-10 h-10 rounded-xl flex items-center justify-center text-[#52796F] group-hover:bg-[#52796F] group-hover:text-white transition-colors">
              <IconUser className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#354F52]">{name}</span>
              <span className="text-[8px] font-black text-[#84A98C] uppercase tracking-widest flex items-center gap-1">
                Obrigado! <IconHeart className="w-2 h-2" />
              </span>
            </div>
          </div>
        ))}
        
        <div className="flex items-center gap-3 bg-stone-50 border border-dashed border-stone-200 px-6 py-3 rounded-2xl opacity-50">
          <IconSparkles className="w-4 h-4 text-[#84A98C]" />
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Esperando por você</span>
        </div>
      </div>
    </div>
  );
};

export default PresenceList;