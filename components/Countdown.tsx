
import React, { useState, useEffect } from 'react';
import { IconHeart, IconCheck, IconSparkles, IconPhoto } from './Icons';

interface CountdownProps {
  targetDate: Date;
}

type TimeMode = 'FUTURE' | 'TODAY' | 'PAST';

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ dias: number; horas: number; minutos: number; segundos: number } | null>(null);
  const [mode, setMode] = useState<TimeMode>('FUTURE');
  const [heroMessage, setHeroMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  const calculateTime = () => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    
    // Cálculo de dias de calendário (Meia-noite a Meia-noite)
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Diferença em dias inteiros
    const calendarDaysDiff = Math.floor((targetMidnight.getTime() - todayMidnight.getTime()) / msPerDay);

    if (calendarDaysDiff < 0) {
      return { 
        mode: 'PAST' as TimeMode, 
        time: { dias: Math.abs(calendarDaysDiff), horas: 0, minutos: 0, segundos: 0 }, 
        calendarDaysDiff 
      };
    }

    if (calendarDaysDiff === 0) {
       return { 
         mode: 'TODAY' as TimeMode, 
         time: { dias: 0, horas: 0, minutos: 0, segundos: 0 }, 
         calendarDaysDiff 
       };
    }

    // Futuro
    return {
      mode: 'FUTURE' as TimeMode,
      time: {
        dias: Math.floor(diff / msPerDay),
        horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((diff / 1000 / 60) % 60),
        segundos: Math.floor((diff / 1000) % 60),
      },
      calendarDaysDiff
    };
  };

  useEffect(() => {
    const update = () => {
      const { mode: newMode, time, calendarDaysDiff } = calculateTime();
      setTimeLeft(time);
      setMode(newMode);
      updateMessages(newMode, calendarDaysDiff);
    };

    update();
    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const updateMessages = (currentMode: TimeMode, calendarDaysDiff: number) => {
    if (currentMode === 'FUTURE') {
      if (calendarDaysDiff > 1) {
        setHeroMessage("Faltam apenas...");
        setSubMessage("Para o nosso Chá de Casa Nova");
      } else if (calendarDaysDiff === 1) {
        setHeroMessage("Amanhã é o grande dia! ✨");
        setSubMessage("Prepare o coração, estamos quase lá");
      } else {
        setHeroMessage("É hoje! Contando as horas...");
        setSubMessage("Estamos preparando tudo com carinho");
      }
    } else if (currentMode === 'TODAY') {
      setHeroMessage("O Momento Chegou! ✨🎉");
      setSubMessage("Estamos esperando por vocês!");
    } else if (currentMode === 'PAST') {
      setHeroMessage("Missão Cumprida! ❤️");
      setSubMessage("Obrigado por fazer parte da nossa história.");
    }
  };
  
  const renderCounterItem = (value: number, label: string, isUrgent: boolean = false, padZero: boolean = true) => (
    <div className="flex flex-col items-center flex-1 min-w-[70px] max-w-[110px] md:max-w-[130px] animate-in zoom-in-50 duration-500">
      <div className={`
        w-full backdrop-blur-md border rounded-2xl md:rounded-[2rem] py-3 md:py-5 
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center 
        group transition-all duration-300 relative overflow-hidden
        ${isUrgent 
            ? 'bg-[#B07D62] border-[#B07D62] text-white shadow-[#B07D62]/30 shadow-lg scale-105' 
            : 'bg-white/80 border-[#52796F]/10 text-[#354F52] hover:-translate-y-1 hover:shadow-lg'
        }
      `}>
        {isUrgent && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}

        <span className={`
          text-3xl sm:text-4xl md:text-5xl font-bold leading-none mb-1 md:mb-2 tabular-nums tracking-tighter
          ${isUrgent ? 'text-white' : 'text-[#354F52]'}
        `}>
          {padZero ? (value || 0).toString().padStart(2, '0') : (value || 0)}
        </span>
        <span className={`
          text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black transition-opacity
          ${isUrgent ? 'text-white/80' : 'text-[#B07D62] opacity-80 group-hover:opacity-100'}
        `}>
          {label}
        </span>
      </div>
    </div>
  );

  if (!timeLeft) return null;

  // =========================================================
  // NOVO VISUAL PÓS-EVENTO (CARD DE AGRADECIMENTO CLEAN)
  // =========================================================
  if (mode === 'PAST') {
    return (
      <div className="flex flex-col items-center justify-center py-6 md:py-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
         
         <div className="relative bg-[#FDFCF8] p-8 md:p-12 rounded-[2rem] shadow-xl border border-[#B07D62]/20 max-w-lg text-center mx-4">
            
            {/* Elemento Decorativo de Fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#B07D62]/5 rounded-full blur-3xl -z-10"></div>
            
            <div className="mb-6 flex justify-center">
               <div className="w-20 h-20 bg-[#B07D62]/10 rounded-full flex items-center justify-center border border-[#B07D62]/20 shadow-sm">
                  <IconHeart className="w-10 h-10 text-[#B07D62]" />
               </div>
            </div>

            <h2 className="font-cursive text-4xl md:text-5xl text-[#354F52] mb-4 drop-shadow-sm">
               Foi inesquecível!
            </h2>
            
            <p className="text-[#52796F] text-lg leading-relaxed mb-8 font-serif italic">
               "Guardaremos cada sorriso, cada abraço e cada gesto de carinho em nossos corações para sempre."
            </p>

            <div className="flex items-center justify-center gap-4 opacity-60">
               <span className="h-[1px] w-12 bg-[#B07D62]"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B07D62]">15 . FEV . 2026</span>
               <span className="h-[1px] w-12 bg-[#B07D62]"></span>
            </div>
         </div>
      </div>
    );
  }

  // Lógica de Urgência Visual: Se faltar menos de 1 dia no tempo absoluto
  const isUrgentMode = timeLeft.dias === 0 && mode === 'FUTURE';

  return (
    <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 py-6">
      
      <div className="text-center px-4">
        <h2 className={`font-cursive leading-none transition-all duration-500 flex items-center justify-center gap-3 text-center ${
           mode === 'TODAY' 
             ? 'text-4xl md:text-6xl text-[#B07D62] animate-pulse drop-shadow-md' 
             : 'text-3xl md:text-5xl text-[#52796F]'
        }`}>
          {heroMessage}
        </h2>
      </div>

      {mode === 'TODAY' ? (
        <div className="bg-white/60 backdrop-blur-sm px-8 py-6 rounded-[2rem] border border-[#B07D62]/20 shadow-xl animate-bounce-slow max-w-lg text-center mx-4">
           <div className="w-16 h-16 bg-[#B07D62] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
             <IconCheck className="w-8 h-8 text-white" />
           </div>
           <p className="text-lg md:text-xl font-serif italic text-[#354F52]">
             "A casa é nossa, mas a alegria só é completa com vocês!"
           </p>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto px-2 w-full flex-wrap">
          
          {mode === 'FUTURE' && (
            <>
              {timeLeft.dias > 0 && renderCounterItem(timeLeft.dias, timeLeft.dias === 1 ? 'Dia' : 'Dias', false, false)}
              
              {(timeLeft.dias > 0 || timeLeft.horas > 0) && 
                renderCounterItem(timeLeft.horas, timeLeft.dias === 0 ? 'Horas Restantes' : 'Horas', isUrgentMode, timeLeft.dias > 0)}
              
              {(timeLeft.dias > 0 || timeLeft.horas > 0 || timeLeft.minutos > 0) && 
                renderCounterItem(timeLeft.minutos, 'Minutos', isUrgentMode && timeLeft.horas === 0)}
              
              {renderCounterItem(timeLeft.segundos, 'Segundos', isUrgentMode && timeLeft.horas === 0 && timeLeft.minutos === 0)}
            </>
          )}
        </div>
      )}

      <div className="text-center px-4">
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] animate-in slide-in-from-bottom-2 text-[#84A98C]">
          {subMessage}
        </p>
      </div>
    </div>
  );
};

export default Countdown;
