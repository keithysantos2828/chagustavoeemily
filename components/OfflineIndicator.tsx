import React from 'react';
import { IconSparkles, IconCheck } from './Icons';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline, pendingCount }) => {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] flex justify-center pb-4 pointer-events-none">
      <div 
        className={`
          flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-10 duration-500
          ${!isOnline 
            ? 'bg-stone-800/90 text-stone-200 border-stone-700' 
            : 'bg-[#B07D62]/90 text-white border-[#B07D62]/50'
          }
        `}
      >
        {!isOnline ? (
          <>
            <div className="relative">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-widest">Você está offline</span>
               {pendingCount > 0 && (
                 <span className="text-[9px] font-medium opacity-80">
                   {pendingCount} {pendingCount === 1 ? 'ação salva' : 'ações salvas'} no dispositivo
                 </span>
               )}
            </div>
          </>
        ) : (
          <>
             <div className="relative">
                <IconSparkles className="w-4 h-4 animate-spin-slow" />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
               <span className="text-[9px] font-medium opacity-80">Enviando suas escolhas</span>
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;