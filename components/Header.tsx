import React, { useMemo } from 'react';
import { User } from '../types';
import { IconSparkles } from './Icons';

interface HeaderProps {
  user: User;
}

// Fixed: Added HeaderProps generic to React.FC so it accepts 'user' prop
const Header: React.FC<HeaderProps> = ({ user }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  return (
    <header className="relative py-16 md:py-24 text-center px-4 overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-b from-[#84A98C]/10 to-transparent rounded-full blur-[100px] -z-10"></div>
      
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 mb-6 opacity-80">
          <IconSparkles className="w-4 h-4 text-[#B07D62]" />
          <span className="text-[#52796F] text-xs font-bold uppercase tracking-[0.2em]">
            {greeting}, {user.name.split(' ')[0]}
          </span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-cursive text-[#354F52] mb-2 leading-tight drop-shadow-sm">
          Emily <span className="text-[#B07D62] text-4xl md:text-7xl align-middle font-serif mx-2">&</span> Gustavo
        </h1>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B07D62]"></span>
          <p className="text-[#B07D62] font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">
            Chá de Casa Nova
          </p>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B07D62]"></span>
        </div>

        <p className="mt-8 max-w-xl mx-auto text-[#52796F] font-serif text-lg md:text-2xl italic leading-relaxed">
          "Construindo nosso sonho, tijolinho por tijolinho, com a ajuda de quem amamos."
        </p>
      </div>
    </header>
  );
};

export default Header;