import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft: any = {};

    if (difference > 0) {
      timeLeft = {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!Object.keys(timeLeft).length) {
    return (
      <div className="text-center animate-bounce">
        <span className="text-3xl md:text-4xl font-cursive text-[#52796F]">O grande dia chegou! ✨💖</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto px-2">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center flex-1 min-w-0">
          <div className="w-full bg-white/60 backdrop-blur-sm border border-[#52796F]/10 rounded-2xl md:rounded-[2rem] py-3 md:py-6 shadow-sm flex flex-col items-center justify-center group md:hover:bg-white md:hover:shadow-md transition-all duration-300">
            {/* Números maiores no mobile */}
            <span className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#354F52] leading-none mb-1 md:mb-2 tabular-nums tracking-tight">
              {(value as number).toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#B07D62] font-black">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Countdown;