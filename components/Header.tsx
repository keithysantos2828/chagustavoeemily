
import React, { useMemo } from 'react';
import { User } from '../types';
import { IconSparkles, IconHeart, IconCheck } from './Icons';

interface HeaderProps {
  user: User;
  isPast?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, isPast = false }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  return (
    <header className="relative py-12 md:py-20 text-center px-4 overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-b from-[#84A98C]/10 to-transparent rounded-full blur-[100px] -z-10"></div>
      
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 mb-6 opacity-80">
          {isPast ? (
            <div className="flex items-center gap-2 bg-[#B07D62]/10 px-3 py-1 rounded-full border border-[#B07D62]/20">
               <IconCheck className="w-3 h-3 text-[#B07D62]" />
               <span className="text-[#B07D62] text-[9px] font-black uppercase tracking-[0.2em]">Casa Nova</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <IconSparkles className="w-4 h-4 text-[#B07D62]" />
               <span className="text-[#52796F] text-xs font-bold uppercase tracking-[0.2em]">
                 {greeting}, {user.name.split(' ')[0]}
               </span>
            </div>
          )}
        </div>
        
        <h1 className="text-6xl md:text-9xl font-cursive text-[#354F52] mb-2 leading-tight drop-shadow-sm">
          Emily <span className="text-[#B07D62] text-4xl md:text-7xl align-middle font-serif mx-2">&</span> Gustavo
        </h1>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B07D62]"></span>
          <p className="text-[#B07D62] font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">
            {isPast ? 'Nossa casa, agora com um pedacinho de você' : 'Chá de Casa Nova'}
          </p>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B07D62]"></span>
        </div>

        <p className="mt-8 max-w-xl mx-auto text-[#52796F] font-serif text-lg md:text-2xl italic leading-relaxed">
          {isPast 
            ? "\"O chá passou, mas a gratidão por terem feito parte desse início permanece para sempre em cada canto do nosso lar.\""
            : "\"Construindo nosso cantinho, tijolinho por tijolinho, com a ajuda de quem amamos.\""
          }
        </p>
      </div>
    </header>
  );
};

export default Header;
