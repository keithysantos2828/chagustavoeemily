import React, { useEffect, useState } from 'react';
import { IconCheck, IconSparkles, IconGift } from './Icons';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Ativa a animação de entrada logo após montar
    requestAnimationFrame(() => setHasMounted(true));

    // Configura o tempo para começar a sair (6 segundos)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 6000);

    // Configura o tempo para remover do DOM (6s + 700ms da animação de saída)
    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, 6700);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div 
      className={`
        flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border backdrop-blur-xl mb-3
        transform transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${hasMounted && !isExiting 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-10 scale-95'
        }
        ${toast.type === 'success' ? 'bg-[#52796F]/90 text-white border-[#52796F]/50 shadow-[#52796F]/20' : 
          toast.type === 'error' ? 'bg-rose-500/90 text-white border-rose-500/50 shadow-rose-500/20' : 
          toast.type === 'warning' ? 'bg-amber-500/90 text-white border-amber-500/50 shadow-amber-500/20' : 
          'bg-[#354F52]/90 text-white border-[#354F52]/50 shadow-[#354F52]/20'}
      `}
      role="alert"
    >
      <div className={`
        shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-inner
        ${toast.type === 'success' ? 'bg-white/20' : 'bg-black/10'}
      `}>
        {toast.type === 'success' ? <IconSparkles className="w-5 h-5 text-yellow-200 animate-pulse" /> : 
         toast.type === 'error' ? <span className="font-bold text-lg">!</span> :
         toast.type === 'warning' ? <span className="font-bold text-lg">!</span> :
         <IconGift className="w-4 h-4 text-white/90" />}
      </div>
      
      <p className="text-xs md:text-sm font-bold tracking-wide leading-relaxed pr-2">
        {toast.message}
      </p>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[500] w-full max-w-md px-6 flex flex-col items-center pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};