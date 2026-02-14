
import React, { useState, useEffect } from 'react';
import { IconHeart, IconSparkles, IconCheck, IconCalendarPlus } from './Icons';

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
    // Isso garante que "Amanhã" seja realmente o dia seguinte no calendário, independente da hora
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    const calendarDaysDiff = Math.ceil((targetMidnight.getTime() - todayMidnight.getTime()) / msPerDay);

    if (diff <= 0) {
      const timeSince = Math.abs(diff);
      if (timeSince < msPerDay) {
        return { mode: 'TODAY' as TimeMode, time: { dias: 0, horas: 0, minutos: 0, segundos: 0 }, calendarDaysDiff: 0 };
      } else {
        const d = Math.floor(timeSince / msPerDay);
        return { mode: 'PAST' as TimeMode, time: { dias: d, horas: 0, minutos: 0, segundos: 0 }, calendarDaysDiff: -d };
      }
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
      updateMessages(time, newMode, calendarDaysDiff);
    };

    update();
    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const updateMessages = (time: any, currentMode: TimeMode, calendarDaysDiff: number) => {
    if (currentMode === 'FUTURE') {
      // Lógica Baseada em Calendário (Muito mais natural para humanos)
      if (calendarDaysDiff > 1) {
        setHeroMessage("Faltam apenas...");
        setSubMessage("Para o nosso Chá de Casa Nova");
      } else if (calendarDaysDiff === 1) {
        // Agora só aparece se for realmente o dia anterior no calendário
        setHeroMessage("É Amanhã! 😱❤️");
        setSubMessage("Segura a ansiedade!");
      } else {
        // calendarDaysDiff === 0 mas ainda é FUTURE (horas finais do mesmo dia)
        setHeroMessage("É hoje, está quase! ⏳");
        setSubMessage("Estamos contando os minutos!");
      }
    } else if (currentMode === 'TODAY') {
      setHeroMessage("O Momento Chegou! ✨🎉");
      setSubMessage("Estamos esperando por vocês!");
    } else if (currentMode === 'PAST') {
      setHeroMessage("Nossa nova fase começou! 🏡");
      setSubMessage("Obrigado por ajudarem a construir esse cantinho.");
    }
  };
  
  const addToCalendar = () => {
    const text = encodeURIComponent("Chá de Casa Nova - Emily & Gustavo");
    const dates = "20260215T150000/20260215T190000";
    const details = encodeURIComponent("Venha celebrar com a gente! Rua Ângela Perin D'agostin - Embu, Colombo - PR");
    const location = encodeURIComponent("Sede Campestre Sintracon");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  const renderCounterItem = (value: number, label: string, isUrgent: boolean = false, padZero: boolean = true) => (
    <div className="flex flex-col items-center flex-1 min-w-[70px] max-w-[110px] md:max-w-[130px] animate-in zoom-in-50 duration-500">
      <div className={`
        w-full backdrop-blur-md border rounded-2xl md:rounded-[2rem] py-3 md:py-5 
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center 
        group transition-all duration-300 relative overflow-hidden
        ${mode === 'PAST' 
          ? 'bg-white/90 border-[#B07D62]/20' 
          : isUrgent 
            ? 'bg-[#B07D62] border-[#B07D62] text-white shadow-[#B07D62]/30 shadow-lg scale-105' 
            : 'bg-white/80 border-[#52796F]/10 text-[#354F52] hover:-translate-y-1 hover:shadow-lg'
        }
      `}>
        {isUrgent && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}

        <span className={`
          text-3xl sm:text-4xl md:text-5xl font-bold leading-none mb-1 md:mb-2 tabular-nums tracking-tighter
          ${mode === 'PAST' ? 'text-[#B07D62]' : isUrgent ? 'text-white' : 'text-[#354F52]'}
        `}>
          {padZero ? (value || 0).toString().padStart(2, '0') : (value || 0)}
        </span>
        <span className={`
          text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black transition-opacity
          ${mode === 'PAST' ? 'text-[#354F52]' : isUrgent ? 'text-white/80' : 'text-[#B07D62] opacity-80 group-hover:opacity-100'}
        `}>
          {label}
        </span>
      </div>
    </div>
  );

  if (!timeLeft) return null;

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
          {mode === 'PAST' && <IconHeart className="w-8 h-8 md:w-10 md:h-10 text-[#B07D62]" />}
          {heroMessage}
          {mode === 'PAST' && <IconHeart className="w-8 h-8 md:w-10 md:h-10 text-[#B07D62]" />}
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
          
          {mode === 'PAST' && (
             <div className="flex flex-col items-center gap-2">
                {renderCounterItem(timeLeft.dias, 'Dias de Casa Nova')}
             </div>
          )}

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

      {mode === 'FUTURE' && (
         <button 
           onClick={addToCalendar}
           className="bg-white/50 backdrop-blur-sm px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-[#52796F] border border-[#52796F]/10 hover:bg-white hover:text-[#354F52] hover:shadow-md transition-all flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300"
         >
           <IconCalendarPlus className="w-4 h-4" />
           Salvar na Agenda
         </button>
      )}

      <div className="text-center px-4">
        <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] animate-in slide-in-from-bottom-2 ${
           mode === 'PAST' ? 'text-[#B07D62]' : 'text-[#84A98C]'
        }`}>
          {subMessage}
        </p>
      </div>
    </div>
  );
};

export default Countdown;
