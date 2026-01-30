import React from 'react';
import { IconGift, IconSparkles, IconCheck } from './Icons';

interface ProcessingModalProps {
  isOpen: boolean;
  message?: string;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#354F52]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FDFCF8] p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center max-w-sm w-[90%] text-center border border-white/20 relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-[#B07D62]/5 to-transparent animate-spin-slow pointer-events-none"></div>

        <div className="relative mb-6">
          {/* Círculo pulsante */}
          <div className="w-24 h-24 rounded-full bg-[#52796F]/10 flex items-center justify-center animate-pulse">
             <div className="w-16 h-16 rounded-full bg-[#52796F]/20 flex items-center justify-center">
                <IconGift className="w-8 h-8 text-[#52796F] animate-bounce" />
             </div>
          </div>
          <div className="absolute -top-1 -right-1">
             <IconSparkles className="w-6 h-6 text-[#B07D62] animate-spin-slow" />
          </div>
        </div>

        <h3 className="text-2xl font-cursive text-[#354F52] mb-3">
          Só um momentinho...
        </h3>
        
        <p className="text-sm font-medium text-[#52796F] mb-6 leading-relaxed">
          {message || "Estamos anotando seu nome na lista oficial da Emily e do Gustavo."}
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 w-full">
           <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center justify-center gap-2">
             <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
             Não feche a página ainda
           </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;