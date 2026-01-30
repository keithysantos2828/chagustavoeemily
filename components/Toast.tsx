import React, { useEffect } from 'react';
import { IconCheck, IconSparkles } from './Icons';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md mb-2
      animate-in slide-in-from-bottom-5 fade-in duration-300
      ${toast.type === 'success' ? 'bg-[#52796F]/90 text-white border-[#52796F]' : 
        toast.type === 'error' ? 'bg-rose-500/90 text-white border-rose-600' : 
        'bg-[#354F52]/90 text-white border-[#354F52]'}
    `}>
      <div className="shrink-0">
        {toast.type === 'success' ? <IconSparkles className="w-5 h-5 text-yellow-300" /> : <IconCheck className="w-5 h-5" />}
      </div>
      <p className="text-xs font-bold uppercase tracking-wide">{toast.message}</p>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm px-4 flex flex-col items-center pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};