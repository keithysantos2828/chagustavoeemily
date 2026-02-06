import React, { useState, useEffect } from 'react';
import { IconGift, IconCheck, IconDirection } from './Icons';

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

  // Lógica de Urgência
  const isUrgent = daysLeft <= 9; // Menos de 9 dias
  const isSuperUrgent = daysLeft <= 3; // Menos de 3 dias

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className={`
        relative overflow-hidden rounded-[2rem] p-6 md:p-8 border transition-all duration-500
        ${isUrgent 
           ? 'bg-[#B07D62]/5 border-[#B07D62]/20 shadow-xl shadow-[#B07D62]/5' 
           : 'bg-white/60 border-[#52796F]/10'
        }
      `}>
        {/* Background Icons Decoration */}
        <div className="absolute top-[-10%] right-[-5%] opacity-5 rotate-12">
          <IconGift className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          
          {/* Icon Box */}
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
            ${isUrgent ? 'bg-[#B07D62] text-white rotate-3' : 'bg-[#52796F] text-white'}
          `}>
             <IconDirection className="w-8 h-8" />
          </div>

          <div className="text-center md:text-left flex-grow">
            <h3 className={`font-cursive text-2xl md:text-3xl mb-2 ${isUrgent ? 'text-[#B07D62]' : 'text-[#354F52]'}`}>
              {isSuperUrgent ? 'Está chegando a hora!' : isUrgent ? 'Atenção ao Prazo!' : 'Como entregar o presente?'}
            </h3>
            
            <p className="text-[#52796F] text-sm md:text-base leading-relaxed">
              {isSuperUrgent ? (
                <>
                  Faltam apenas <strong>{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</strong>! <br className="hidden md:block"/>
                  Por favor, <strong>não compre online</strong> agora. Leve seu presente no dia.
                </>
              ) : isUrgent ? (
                <>
                  Faltam <strong>{daysLeft} dias</strong>! O frete pode não chegar a tempo. <br className="hidden md:block"/>
                  Recomendamos comprar em loja física ou levar no dia.
                </>
              ) : (
                <>
                  Faltam {daysLeft} dias. Você ainda pode comprar online e mandar entregar na nossa casa, ou levar no dia da festa.
                </>
              )}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-stone-100 shadow-sm">
              <IconCheck className={`w-4 h-4 ${isUrgent ? 'text-[#B07D62]' : 'text-[#52796F]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#354F52]/80">
                {isUrgent ? 'Leve no dia 15/02' : 'Entrega Flexível'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryGuide;