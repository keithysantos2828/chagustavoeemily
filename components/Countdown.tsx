import React, { useState, useEffect } from 'react';
import { IconHeart, IconSparkles } from './Icons';

interface CountdownProps {
  targetDate: Date;
}

type TimeMode = 'FUTURE' | 'TODAY' | 'PAST';

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<any>({});
  const [mode, setMode] = useState<TimeMode>('FUTURE');
  const [heroMessage, setHeroMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  const calculateTime = () => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    
    // Define o modo baseado na diferença
    // Consideramos "Hoje" um período de 24h após a data exata
    const oneDay = 1000 * 60 * 60 * 24;
    
    let currentMode: TimeMode = 'FUTURE';
    let calculatedDiff = diff;

    if (diff <= 0) {
      const timeSince = Math.abs(diff);
      if (timeSince < oneDay) {
        currentMode = 'TODAY';
        calculatedDiff = 0; // Para travar o contador visualmente se quiser, ou mostrar 0
      } else {
        currentMode = 'PAST';
        calculatedDiff = timeSince; // Passamos a usar o tempo decorrido
      }
    } else {
      currentMode = 'FUTURE';
    }

    setMode(currentMode);

    // Cálculos de Tempo
    const time = {
      dias: Math.floor(calculatedDiff / (1000 * 60 * 60 * 24)),
      horas: Math.floor((calculatedDiff / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((calculatedDiff / 1000 / 60) % 60),
      segundos: Math.floor((calculatedDiff / 1000) % 60),
    };

    return time;
  };

  useEffect(() => {
    // Check inicial e Loop
    const update = () => {
      const time = calculateTime();
      setTimeLeft(time);
      updateMessages(time, mode);
    };

    update(); // Run once immediately
    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [targetDate, mode]);

  const updateMessages = (time: any, currentMode: TimeMode) => {
    if (currentMode === 'FUTURE') {
      if (time.dias > 1) {
        setHeroMessage("Faltam apenas...");
        // Texto ajustado para ser menos "casamento"
        setSubMessage("Para o nosso Chá de Casa Nova");
      } else if (time.dias === 1) {
        setHeroMessage("É Amanhã! 😱❤️");
        setSubMessage("Segura a ansiedade!");
      } else {
        // Menos de 1 dia, mas ainda positivo (horas finais)
        setHeroMessage("É Amanhã! 😱❤️");
        setSubMessage("Estamos na contagem regressiva final!");
      }
    } else if (currentMode === 'TODAY') {
      setHeroMessage("É Hoje! ✨🎉");
      setSubMessage("O grande dia chegou, obrigado por fazerem parte disso!");
    } else if (currentMode === 'PAST') {
      setHeroMessage("Nossa nova fase começou! 🏡");
      setSubMessage("Obrigado por ajudarem a construir esse cantinho.");
    }
  };

  // Se for passado, mostramos o contador de "Dias de Casa Nova"
  // Se for futuro, mostramos contagem regressiva
  // Se for hoje, mostramos mensagem de celebração
  
  const renderCounterItem = (value: number, label: string) => (
    <div className="flex flex-col items-center flex-1 min-w-[80px] max-w-[120px] md:max-w-[140px]">
      <div className={`w-full backdrop-blur-md border rounded-2xl md:rounded-[2rem] py-4 md:py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center group transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
        mode === 'PAST' 
          ? 'bg-white/90 border-[#B07D62]/20' 
          : 'bg-white/80 border-[#52796F]/10'
      }`}>
        <span className={`text-4xl sm:text-5xl md:text-6xl font-bold leading-none mb-1 md:mb-2 tabular-nums tracking-tighter ${
          mode === 'PAST' ? 'text-[#B07D62]' : 'text-[#354F52]'
        }`}>
          {(value || 0).toString().padStart(2, '0')}
        </span>
        <span className={`text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] font-black opacity-80 group-hover:opacity-100 transition-opacity ${
          mode === 'PAST' ? 'text-[#354F52]' : 'text-[#B07D62]'
        }`}>
          {label}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-1000 py-6">
      
      {/* Mensagem Dinâmica (Título) */}
      <div className="text-center px-4">
        <h2 className={`font-cursive leading-none transition-all duration-500 flex items-center justify-center gap-3 ${
           mode === 'TODAY' 
             ? 'text-5xl md:text-7xl text-[#B07D62] animate-pulse drop-shadow-md' 
             : 'text-3xl md:text-5xl text-[#52796F]'
        }`}>
          {mode === 'PAST' && <IconHeart className="w-8 h-8 md:w-10 md:h-10 text-[#B07D62]" />}
          {heroMessage}
          {mode === 'PAST' && <IconHeart className="w-8 h-8 md:w-10 md:h-10 text-[#B07D62]" />}
        </h2>
      </div>

      {mode === 'TODAY' ? (
        <div className="bg-white/60 backdrop-blur-sm px-8 py-6 rounded-[2rem] border border-[#B07D62]/20 shadow-xl animate-bounce-slow">
           <p className="text-xl md:text-2xl font-serif italic text-[#354F52] text-center">
             "Sejam bem-vindos ao nosso começo!"
           </p>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2 w-full flex-wrap">
          {/* Lógica Inteligente de Exibição */}
          
          {/* Se for passado, mostra DIAS como destaque principal "Dias de casados/casa nova" */}
          {mode === 'PAST' && (
             <div className="flex flex-col items-center gap-2">
                {renderCounterItem(timeLeft.dias, 'Dias de Casa Nova')}
             </div>
          )}

          {/* Se for futuro, lógica padrão de esconder zeros à esquerda */}
          {mode === 'FUTURE' && (
            <>
              {timeLeft.dias > 0 && renderCounterItem(timeLeft.dias, 'Dias')}
              {(timeLeft.dias > 0 || timeLeft.horas > 0) && renderCounterItem(timeLeft.horas, 'Horas')}
              {(timeLeft.dias > 0 || timeLeft.horas > 0 || timeLeft.minutos > 0) && renderCounterItem(timeLeft.minutos, 'Minutos')}
              {renderCounterItem(timeLeft.segundos, 'Segundos')}
            </>
          )}
        </div>
      )}

      {/* Submensagem agora abaixo dos números */}
      <div className="text-center px-4">
        <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] animate-in slide-in-from-bottom-2 ${
           mode === 'PAST' ? 'text-[#B07D62]' : 'text-[#84A98C]'
        }`}>
          {subMessage}
        </p>
      </div>

      {mode === 'PAST' && (
        <div className="inline-flex items-center gap-2 bg-[#B07D62]/10 px-6 py-2 rounded-full border border-[#B07D62]/20">
          <IconSparkles className="w-4 h-4 text-[#B07D62]" />
          <span className="text-[10px] font-bold text-[#B07D62] uppercase tracking-widest">
            Lista de presentes encerrada
          </span>
        </div>
      )}
    </div>
  );
};

export default Countdown;