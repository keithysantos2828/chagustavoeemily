
import React, { useState } from 'react';
import { Gift, User } from '../types';
import { IconGift, IconArrowUp, IconArrowRight } from './Icons';

interface CartProps {
  user: User;
  reservedGifts: Gift[];
  onRelease: (id: string) => void;
}

const Cart: React.FC<CartProps> = ({ user, reservedGifts, onRelease }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (reservedGifts.length === 0) return null;

  return (
    <>
      {/* Overlay Escuro para Mobile quando aberto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed z-[100] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        /* Mobile: Bottom Sheet Full Width com suporte a Safe Area */
        bottom-0 inset-x-0 w-full
        /* Desktop: Floating Widget Bottom Right */
        md:bottom-6 md:inset-x-auto md:right-6 md:w-[380px] md:flex md:flex-col md:items-end
        pointer-events-none
      `}>
        <div className={`
          pointer-events-auto bg-[#354F52] text-white overflow-hidden relative
          /* Mobile Styles */
          rounded-t-[2rem] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)]
          /* Compensação para iPhone X home indicator no padding inferior */
          pb-safe-bottom
          /* Desktop Styles */
          md:rounded-[1.5rem] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] md:border md:border-white/10 md:pb-0
          transition-all duration-500
        `}>
          
          {/* Mobile Handle Bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-6 flex justify-center pt-2 md:hidden cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="p-5 md:p-4 flex items-center justify-between cursor-pointer group active:bg-white/5 transition-colors pt-8 md:pt-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 md:w-10 md:h-10 bg-[#B07D62] rounded-2xl md:rounded-xl flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-300">
                  <IconGift className="w-6 h-6 md:w-5 md:h-5" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-4 md:h-4 bg-[#F8F7F2] text-[#B07D62] rounded-full text-[10px] md:text-[9px] font-black flex items-center justify-center shadow-sm border border-[#B07D62] animate-bounce">
                  {reservedGifts.length}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#F8F7F2] tracking-wide">Minha Seleção</span>
                <span className="text-[11px] text-[#84A98C] uppercase tracking-widest font-bold mt-0.5">
                  {isOpen ? 'Toque para minimizar' : 'Ver itens escolhidos'}
                </span>
              </div>
            </div>

            <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 bg-white/20' : ''}`}>
              <IconArrowUp className="w-4 h-4 text-[#F8F7F2]" />
            </div>
          </div>

          <div className={`
            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="p-4 md:p-4 space-y-3 overflow-y-auto max-h-[50vh] custom-scrollbar bg-[#2F4649]">
              {reservedGifts.map(gift => (
                <div key={gift.id} className="bg-[#354F52] rounded-2xl p-3 flex gap-3 items-center border border-white/5 shadow-sm">
                  <div className="w-14 h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
                     <img 
                      src={gift.imageUrl} 
                      alt={gift.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold truncate text-[#F8F7F2]">{gift.name}</p>
                    <p className="text-[11px] text-[#84A98C] uppercase tracking-wider font-bold mt-1">
                      R$ {gift.priceEstimate.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pl-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.open(gift.shopeeUrl, '_blank'); }}
                      className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-[#84A98C]/20 text-[#84A98C] rounded-xl active:bg-[#84A98C] active:text-white md:hover:bg-[#84A98C] md:hover:text-white transition-all active:scale-90"
                      title="Ver na Loja"
                    >
                      <IconArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRelease(gift.id); }}
                      className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-rose-500/10 text-rose-400 rounded-xl active:bg-rose-500 active:text-white md:hover:bg-rose-500 md:hover:text-white transition-all active:scale-90"
                      title="Remover da lista"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 md:p-3 bg-[#263a3c] text-center border-t border-white/5 pb-8 md:pb-3">
              <p className="text-[11px] text-[#84A98C]/60 italic">
                Obrigado por fazer parte da nossa história ♥
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
