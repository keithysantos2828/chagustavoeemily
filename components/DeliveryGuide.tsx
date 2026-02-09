
import React, { useState, useEffect } from 'react';
import { IconGift, IconCheck, IconDirection, IconSparkles } from './Icons';

interface DeliveryGuideProps {
  targetDate: Date;
}

const DeliveryGuide: React.FC<DeliveryGuideProps> = ({ targetDate }) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Função para calcular dias exatos restantes (ignorando horas para ser "Dias Cheios")
    const calculateDays = () => {
      const now = new Date();
      // Zera as horas para comparar apenas as datas
      const date1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const date2 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      const diffTime = date2.getTime() - date1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setDaysLeft(diffDays);
    };

    calculateDays();
    // Atualiza a cada minuto para garantir sincronia se a pessoa deixar a aba aberta
    const timer = setInterval(calculateDays, 60000); 
    return () => clearInterval(timer);
  }, [targetDate]);

  // Se já passou ou é hoje
  if (daysLeft < 0) return null;

  // Lógica de Urgência (Reta Final)
  const isFinalWeek = daysLeft <= 7; // Reta final (1 semana)
  const isSuperUrgent = daysLeft <= 3; // Crítico (3 dias)

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className={`
        relative overflow-hidden rounded-[2rem] p-6 md:p-8 border transition-all duration-500
        ${isFinalWeek 
           ? 'bg-[#B07D62] text-white shadow-xl shadow-[#B07D62]/20 border-[#B07D62]' 
           : 'bg-white/60 text-[#354F52] border-[#52796F]/10'
        }
      `}>
        {/* Background Icons Decoration */}
        <div className="absolute top-[-10%] right-[-5%] opacity-10 rotate-12">
          <IconGift className="w-32 h-32" />
        </div>

        {isFinalWeek && (
           <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
             <div className="h-full bg-white/40 animate-[loading_2s_infinite_linear]"></div>
           </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          
          {/* Icon Box */}
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
            ${isFinalWeek 
              ? 'bg-white text-[#B07D62]' 
              : 'bg-[#52796F] text-white'
            }
          `}>
             {isFinalWeek ? <IconSparkles className="w-8 h-8 animate-pulse" /> : <IconDirection className="w-8 h-8" />}
          </div>

          <div className="text-center md:text-left flex-grow">
            <h3 className={`font-cursive text-2xl md:text-3xl mb-2 leading-tight ${isFinalWeek ? 'text-white' : 'text-[#354F52]'}`}>
              {isSuperUrgent ? 'Está chegando a hora!' : isFinalWeek ? 'Reta Final: Faltam 7 dias!' : 'Como entregar o presente?'}
            </h3>
            
            <p className={`text-sm md:text-base leading-relaxed ${isFinalWeek ? 'text-white/90' : 'text-[#52796F]'}`}>
              {isFinalWeek ? (
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
               isFinalWeek 
                 ? 'bg-white/10 border-white/20 text-white' 
                 : 'bg-white/80 border-stone-100 text-[#354F52]/80'
            }`}>
              <IconCheck className={`w-4 h-4 ${isFinalWeek ? 'text-white' : 'text-[#52796F]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isFinalWeek ? 'Leve no dia 15/02' : 'Entrega Flexível'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryGuide;
