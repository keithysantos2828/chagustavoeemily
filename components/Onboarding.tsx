import React, { useState } from 'react';
import { IconHome, IconSparkles, IconArrowRight } from './Icons';

interface OnboardingProps {
  onSubmit: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [isOpening, setIsOpening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsOpening(true);
      setTimeout(() => onSubmit(name.trim()), 800);
    }
  };

  return (
    <div className={`fixed inset-0 bg-[#F8F7F2] flex items-center justify-center p-4 z-[200] overflow-hidden transition-all duration-1000 ${isOpening ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#52796F]/10 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#B07D62]/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full max-w-md perspective-1000">
        <div className={`bg-[#FDFCF8] relative rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(53,79,82,0.2)] border border-white/60 p-8 md:p-12 text-center transition-transform duration-700 ${isOpening ? 'rotate-x-10 translate-y-20 opacity-0' : ''}`}>
          
          {/* Stamp */}
          <div className="absolute top-8 right-8 w-16 h-16 border border-[#B07D62]/20 rounded-lg flex items-center justify-center rotate-12 opacity-50">
             <div className="w-12 h-12 rounded-full border border-dashed border-[#B07D62] flex items-center justify-center">
                <IconSparkles className="w-6 h-6 text-[#B07D62]" />
             </div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-[#52796F]/5 rounded-full flex items-center justify-center mb-4">
              <IconHome className="w-8 h-8 text-[#52796F]" />
            </div>
          </div>
          
          <div className="space-y-2 mb-10">
            <h1 className="text-5xl font-cursive text-[#354F52]">Seja bem-vindo(a)</h1>
            <p className="text-[#B07D62] font-black uppercase tracking-[0.3em] text-[10px]">Ao nosso cantinho especial</p>
            <p className="text-xl font-serif italic text-[#52796F] mt-2">Emily & Gustavo</p>
          </div>
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="relative group">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 py-4 bg-transparent border-b-2 border-[#52796F]/20 text-[#354F52] font-serif text-2xl text-center focus:border-[#B07D62] focus:outline-none transition-colors placeholder-transparent"
                required
              />
              <label className="absolute left-0 right-0 top-4 text-[#52796F]/40 text-sm font-medium uppercase tracking-widest pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#B07D62] peer-valid:-top-4 peer-valid:text-[10px] peer-valid:text-[#B07D62]">
                Quem está nos visitando?
              </label>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-5 bg-[#354F52] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#2A3F41] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
            >
              Entrar com carinho
              <IconArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-[#52796F]/10">
            <p className="text-[9px] text-[#84A98C] font-black uppercase tracking-[0.2em]">
              15 . FEV . 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;