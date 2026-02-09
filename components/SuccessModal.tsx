
import React, { useEffect } from 'react';
import { Gift } from '../types';
import { IconGift, IconCheck, IconHeart } from './Icons';

interface SuccessModalProps {
  isOpen: boolean;
  gift: Gift | null;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, gift, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Vibração forte de sucesso (Haptic Feedback)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [isOpen]);

  if (!isOpen || !gift) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop Escuro com Blur */}
      <div 
        className="absolute inset-0 bg-[#354F52]/90 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-[#FDFCF8] rounded-[2.5rem] shadow-2xl p-8 text-center overflow-hidden animate-in zoom-in-90 slide-in-from-bottom-10 duration-500 border-4 border-white/20">
        
        {/* Efeitos de Fundo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-[#52796F]/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[60%] bg-[#B07D62]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Avatar/Icone Animado */}
          <div className="mb-6 relative">
             <div className="w-28 h-28 rounded-full bg-[#52796F] flex items-center justify-center shadow-lg animate-bounce-slow">
                <IconGift className="w-14 h-14 text-white" />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-[#B07D62] p-2 rounded-full border-4 border-[#FDFCF8] animate-in zoom-in duration-300 delay-300">
                <IconHeart className="w-6 h-6 text-white" />
             </div>
          </div>

          <h2 className="text-3xl font-cursive text-[#354F52] mb-2 leading-tight">
            Uhuu! Incrível!
          </h2>
          
          <p className="text-[#52796F] text-base font-medium mb-6 leading-relaxed">
            Você acabou de presentear a Emily e o Gustavo com:
            <br/>
            <strong className="text-[#B07D62] text-lg block mt-1">{gift.name}</strong>
          </p>

          <div className="w-full bg-stone-100 rounded-2xl p-4 mb-8 border border-stone-200">
             <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm shrink-0">
                   <img src={gift.imageUrl} className="w-full h-full object-cover rounded-lg" alt="" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#84A98C]">Status Atualizado</p>
                   <p className="text-sm font-bold text-[#354F52] flex items-center gap-1">
                      <IconCheck className="w-4 h-4 text-[#B07D62]" />
                      Reservado para você
                   </p>
                </div>
             </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-[#B07D62] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all hover:bg-[#966b54]"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
