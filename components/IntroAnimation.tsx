
import React, { useEffect, useState, useRef } from 'react';
import { IconHeart } from './Icons';

interface IntroAnimationProps {
  onComplete: () => void;
  mode?: 'default' | 'returning';
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, mode = 'default' }) => {
  const [stage, setStage] = useState(0);
  
  // O uso de useRef aqui garante que a função mais recente seja chamada
  // sem precisar reiniciar o useEffect quando o pai (App.tsx) renderizar.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let timelines: { ms: number; stage: number }[] = [];

    if (mode === 'returning') {
       // TIMELINE RÁPIDA
       timelines = [
         { ms: 100, stage: 5 },
         { ms: 1500, stage: 6 },
         { ms: 3000, stage: 7 },
       ];
    } else {
       // TIMELINE COMPLETA
       timelines = [
         { ms: 100, stage: 1 },
         { ms: 2000, stage: 2 },
         { ms: 3200, stage: 3 },
         { ms: 3800, stage: 4 },
         { ms: 4600, stage: 5 },
         { ms: 5000, stage: 6 },
         { ms: 6500, stage: 7 },
       ];
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timelines.forEach(({ ms, stage: s }) => {
      timers.push(setTimeout(() => {
        setStage(s);
        if (s === 7) {
            // Chama a função guardada na referência
            onCompleteRef.current();
        }
      }, ms));
    });

    return () => timers.forEach(clearTimeout);
    // REMOVIDO 'onComplete' das dependências para evitar reinício quando o App carrega dados
  }, [mode]); 

  if (stage === 7) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none perspective-[1200px]">
      <style>{`
        /* Animação do traço da chave */
        @keyframes drawKey {
          0% { stroke-dashoffset: 1200; opacity: 0; }
          10% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        
        /* Preenchimento dourado */
        @keyframes fillGold {
          0% { fill-opacity: 0; filter: drop-shadow(0 0 0 rgba(176, 125, 98, 0)); }
          100% { fill-opacity: 1; filter: drop-shadow(0 0 15px rgba(176, 125, 98, 0.6)); }
        }

        /* INSERÇÃO (O Pulo do Gato) */
        @keyframes insertKey {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-30px) scale(1.1); } /* Recua (Anticipação) */
          100% { transform: translateY(0) scale(0.85); } /* Insere (Profundidade) */
        }

        /* Giro da chave */
        @keyframes turnKey {
          0% { transform: rotate(0deg) scale(0.85); }
          30% { transform: rotate(10deg) scale(0.85); } 
          100% { transform: rotate(-90deg) scale(0.9); } 
        }

        /* Brilho de fundo pulsante */
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        /* Fechadura aparecendo */
        @keyframes holeAppear {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Estouro de luz */
        @keyframes lightBurst {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(2); }
          100% { opacity: 0; transform: scale(3); }
        }

        .key-path {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
        }

        .animate-draw {
          animation: drawKey 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fill {
          animation: fillGold 1s ease-out forwards;
        }

        .animate-insert {
          animation: insertKey 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-turn {
          transform-origin: 50% 55%;
          animation: turnKey 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .door-panel {
          transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out 1s;
          will-change: transform;
        }
      `}</style>

      {/* PORTA ESQUERDA */}
      <div 
        className={`
          absolute top-0 left-0 w-1/2 h-full bg-[#354F52] z-20 door-panel flex items-center justify-end
          border-r border-[#B07D62]/20 shadow-[10px_0_50px_rgba(0,0,0,0.5)]
          ${stage >= 6 ? '-translate-x-full rotate-y-[-10deg] opacity-0' : 'translate-x-0'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
      </div>

      {/* PORTA DIREITA */}
      <div 
        className={`
          absolute top-0 right-0 w-1/2 h-full bg-[#354F52] z-20 door-panel flex items-center justify-start
          border-l border-[#B07D62]/20 shadow-[-10px_0_50px_rgba(0,0,0,0.5)]
          ${stage >= 6 ? 'translate-x-full rotate-y-[10deg] opacity-0' : 'translate-x-0'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20"></div>
      </div>

      {/* CONTEÚDO CENTRAL */}
      <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-500 ${stage >= 6 ? 'opacity-0 scale-150' : 'opacity-100'}`}>
        
        {/* Luz de Fundo (Glow) */}
        <div className="absolute w-[300px] h-[300px] bg-[#B07D62]/20 rounded-full blur-[80px] animate-[glowPulse_3s_infinite_ease-in-out]"></div>

        {mode === 'default' ? (
           /* === MODO DEFAULT: CHAVE E FECHADURA === */
           <>
              {/* Sombra da Fechadura */}
              {stage >= 3 && (
                 <div className="absolute w-8 h-24 bg-black/40 rounded-full blur-xl animate-[holeAppear_0.3s_ease-out] mb-12"></div>
              )}

              {/* Estouro de Luz Branca */}
              {stage === 5 && (
                <div className="absolute w-[100px] h-[100px] bg-white rounded-full blur-[50px] animate-[lightBurst_0.6s_ease-out_forwards] z-50"></div>
              )}

              {/* SVG DA CHAVE */}
              <div className={`
                  relative w-48 h-48 md:w-64 md:h-64 
                  ${stage === 3 ? 'animate-insert' : ''} 
                  ${stage >= 4 ? 'scale-90 animate-turn' : ''}
              `}>
                 <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-2xl">
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E6B8A2" />
                        <stop offset="50%" stopColor="#B07D62" />
                        <stop offset="100%" stopColor="#8A5A44" />
                      </linearGradient>
                    </defs>
                    
                    <path
                        className={`key-path ${stage >= 1 ? 'animate-draw' : ''} ${stage >= 2 ? 'animate-fill' : ''}`}
                        d="
                          M 100 40 C 85 40 75 50 75 65 C 75 75 80 82 88 86 L 88 140 L 78 140 L 78 150 L 88 150 L 88 160 L 78 160 L 78 170 L 100 170 L 122 170 L 122 160 L 112 160 L 112 150 L 122 150 L 122 140 L 112 140 L 112 86 C 120 82 125 75 125 65 C 125 50 115 40 100 40 Z
                          M 100 55 C 105 55 108 58 108 63 C 108 68 105 71 100 71 C 95 71 92 68 92 63 C 92 58 95 55 100 55 Z
                        "
                        fill="url(#goldGradient)"
                        stroke="#E6B8A2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fillOpacity="0"
                    />
                    
                    {stage >= 2 && (
                       <g className="animate-pulse">
                          <path d="M 80 50 L 82 45 L 84 50 L 89 52 L 84 54 L 82 59 L 80 54 L 75 52 Z" fill="white" fillOpacity="0.8" />
                          <path d="M 120 160 L 121 157 L 122 160 L 125 161 L 122 162 L 121 165 L 120 162 L 117 161 Z" fill="white" fillOpacity="0.6" />
                       </g>
                    )}
                 </svg>
              </div>

              {/* Texto Padrão */}
              <div 
                className={`
                  absolute bottom-16 md:bottom-20 text-center transition-all duration-1000 transform
                  ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}
              >
                <p className="text-[#E6B8A2] text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-2 drop-shadow-md">
                  Abrindo as portas
                </p>
                <h1 className="text-3xl md:text-5xl font-cursive text-[#F8F7F2] drop-shadow-lg">
                  Do Nosso Sonho
                </h1>
              </div>
           </>
        ) : (
           /* === MODO RETURNING: APENAS TEXTO BOAS-VINDAS === */
           <div 
              className={`text-center transition-all duration-1000 transform animate-in fade-in zoom-in-95 duration-700
                ${stage >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
           >
              <div className="mb-6 flex justify-center">
                 <IconHeart className="w-16 h-16 text-[#B07D62] animate-pulse drop-shadow-lg" />
              </div>
              <p className="text-[#E6B8A2] text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4 drop-shadow-md">
                A casa é sua
              </p>
              <h1 className="text-4xl md:text-6xl font-cursive text-[#F8F7F2] drop-shadow-lg leading-tight">
                Que bom te ver<br/>de volta!
              </h1>
           </div>
        )}

      </div>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-[60]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
      }}></div>

    </div>
  );
};

export default IntroAnimation;
