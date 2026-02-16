
import React, { useState, useEffect } from 'react';
import { IconGift, IconCheck, IconDirection, IconSparkles, IconTruck, IconClock, IconHeart } from './Icons';

interface DeliveryGuideProps {
  targetDate: Date;
  isPast?: boolean; // Nova prop para evitar cálculo interno e flicker
}

const DeliveryGuide: React.FC<DeliveryGuideProps> = ({ targetDate, isPast = false }) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Só calculamos se não for passado via prop, para manter compatibilidade
    if (!isPast) {
      const calculateDays = () => {
        const now = new Date();
        const date1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const date2 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        const diffTime = date2.getTime() - date1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        setDaysLeft(diffDays);
      };

      calculateDays();
      const timer = setInterval(calculateDays, 60000); 
      return () => clearInterval(timer);
    }
  }, [targetDate, isPast]);

  // Se a prop isPast vier true, usamos ela imediatamente (Zero Flicker)
  // Caso contrário, usamos o cálculo interno
  const effectiveIsPast = isPast || daysLeft < 0;

  if (effectiveIsPast) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 animate-in slide-in-from-bottom-6 duration-700 -mt-6 relative z-10">
        <div className="relative overflow-hidden rounded-b-[2rem] rounded-t-none p-6 md:p-8 border-t border-dashed border-[#B07D62]/30 bg-[#FDFCF8] text-[#354F52] shadow-xl border-x border-b border-[#B07D62]/20">
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {/* Ícone alterado para GIFT para não brigar com o Coração de cima */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm bg-[#B07D62]/10 text-[#B07D62]">
               <IconGift className="w-7 h-7" />
            </div>

            <div className="text-center md:text-left flex-grow">
              <h3 className="font-cursive text-xl md:text-2xl mb-2 leading-tight text-[#354F52]">
                Ainda dá tempo de participar?
              </h3>
              
              <p className="text-sm leading-relaxed text-[#52796F]">
                Claro que sim! Nossa casa continua aberta para receber seu carinho. 
                <span className="md:block mt-1">Você pode escolher um item da lista e nos enviar quando quiser.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lógica Pré-Evento (Normal)
  const isFinalWeek = daysLeft <= 7;
  const isSuperUrgent = daysLeft <= 3;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className={`
        relative overflow-hidden rounded-[2rem] p-6 md:p-8 border transition-all duration-500
        ${isSuperUrgent
           ? 'bg-gradient-to-br from-[#B07D62] to-[#9c6a50] text-white shadow-xl shadow-[#B07D62]/30 border-[#B07D62]'
           : isFinalWeek 
             ? 'bg-[#B07D62] text-white shadow-xl shadow-[#B07D62]/20 border-[#B07D62]' 
             : 'bg-white/60 text-[#354F52] border-[#52796F]/10'
        }
      `}>
        <div className="absolute top-[-10%] right-[-5%] opacity-10 rotate-12">
          {isSuperUrgent ? <IconTruck className="w-32 h-32" /> : <IconGift className="w-32 h-32" />}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative
            ${isFinalWeek || isSuperUrgent ? 'bg-white text-[#B07D62]' : 'bg-[#52796F] text-white'}
          `}>
             {isSuperUrgent ? (
                <>
                  <IconTruck className="w-8 h-8" />
                  <div className="absolute -bottom-2 -right-2 bg-rose-500 rounded-full p-1 border-2 border-[#B07D62]">
                    <IconClock className="w-3 h-3 text-white animate-pulse" />
                  </div>
                </>
             ) : isFinalWeek ? (
                <IconSparkles className="w-8 h-8 animate-pulse" />
             ) : (
                <IconDirection className="w-8 h-8" />
             )}
          </div>

          <div className="text-center md:text-left flex-grow">
            <h3 className={`font-cursive text-2xl md:text-3xl mb-2 leading-tight ${isFinalWeek || isSuperUrgent ? 'text-white' : 'text-[#354F52]'}`}>
              {isSuperUrgent 
                ? 'Atenção aos Prazos de Entrega!' 
                : isFinalWeek 
                   ? `Reta Final: Faltam ${daysLeft} dias!` 
                   : 'Como entregar o presente?'
              }
            </h3>
            
            <p className={`text-sm md:text-base leading-relaxed ${isFinalWeek || isSuperUrgent ? 'text-white/90' : 'text-[#52796F]'}`}>
              {isSuperUrgent ? (
                <>
                  O caminhão da entrega talvez não chegue a tempo, mas você chega! 🥰<br className="hidden md:block"/>
                  Sugerimos <strong>levar seu presente em mãos</strong> no dia da festa.
                </>
              ) : isFinalWeek ? (
                <>
                  Com o chá tão pertinho, <strong>o frete online pode atrasar</strong>. 🚚⚠️<br className="hidden md:block"/>
                  Recomendamos comprar em loja física ou levar seu presente no dia.
                </>
              ) : (
                <>
                  Faltam {daysLeft} dias. Você ainda pode comprar online e mandar entregar na nossa casa, ou levar no dia da festa.
                </>
              )}
            </p>

            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${
               isFinalWeek || isSuperUrgent
                 ? 'bg-white/10 border-white/20 text-white' 
                 : 'bg-white/80 border-stone-100 text-[#354F52]/80'
            }`}>
              <IconCheck className={`w-4 h-4 ${isFinalWeek || isSuperUrgent ? 'text-white' : 'text-[#52796F]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isSuperUrgent ? 'Compre na Cidade & Leve' : isFinalWeek ? 'Leve no dia 15/02' : 'Entrega Flexível'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryGuide;
