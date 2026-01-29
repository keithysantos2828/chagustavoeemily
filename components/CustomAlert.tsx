import React from 'react';
import { IconCheck, IconSparkles, IconGift } from './Icons';

export type AlertType = 'success' | 'confirm' | 'info' | 'warning';

interface CustomAlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#354F52]/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 max-w-md w-full shadow-[0_32px_128px_-32px_rgba(53,79,82,0.4)] border border-white transform animate-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border rotate-3 ${
            type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 
            type === 'confirm' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
            'bg-[#F8F7F2] text-[#52796F] border-[#84A98C]/10'
          }`}>
            {type === 'success' ? <IconCheck className="w-10 h-10" /> : 
             type === 'confirm' ? <IconGift className="w-10 h-10" /> : <IconSparkles className="w-10 h-10" />}
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-[#354F52] mb-4">{title}</h3>
          <p className="text-base text-[#52796F]/80 leading-relaxed mb-12 px-2">{message}</p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={onConfirm}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all active:scale-95 ${
                type === 'confirm' ? 'bg-[#354F52] text-white hover:bg-stone-800' : 'bg-[#52796F] text-white hover:bg-[#354F52]'
              }`}
            >
              {isConfirm ? 'Sim, Confirmar' : 'Entendido!'}
            </button>
            
            {isConfirm && onCancel && (
              <button
                onClick={onCancel}
                className="w-full py-4 text-stone-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-stone-600 transition-colors"
              >
                Agora não
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;