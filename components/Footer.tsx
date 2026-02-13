
import React, { useState } from 'react';
import { IconMapPin, IconCalendar, IconSparkles, IconPhoto, IconDirection, IconArrowUp } from './Icons';
import { AlertType } from './CustomAlert';

interface FooterProps {
  onShowAlert?: (type: AlertType, title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const Footer: React.FC<FooterProps> = () => {
  const [showMap, setShowMap] = useState(false);

  // Link para abrir o Google Maps externo com destino
  const handleOpenRoute = () => {
    const destination = encodeURIComponent("Sede Campestre Sintracon Rua Angela Perin Dagostin");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 md:mt-40 pt-12 md:pt-24 border-t border-[#84A98C]/10 px-4 relative">
      
      {/* Botão Voltar ao Topo */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <button 
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-[#FDFCF8] shadow-lg border border-[#84A98C]/10 flex items-center justify-center text-[#52796F] hover:scale-110 transition-transform active:scale-90"
        >
          <IconArrowUp className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -top-10 -left-6 md:-top-16 md:-left-16 text-[#B07D62]/5 pointer-events-none">
            <IconSparkles className="w-24 h-24 md:w-40 md:h-40" />
          </div>
          <h2 className="text-3xl md:text-6xl font-cursive text-[#354F52] mb-8 md:mb-12">Onde vamos celebrar</h2>
          
          <div className="space-y-6 md:space-y-10 text-[#52796F]">
            {/* Bloco Local */}
            <div className="flex items-start gap-4 md:gap-6">
              <div className="bg-[#84A98C]/10 p-3.5 md:p-5 rounded-2xl md:rounded-[2rem] text-[#354F52] shadow-sm border border-[#84A98C]/10 flex-shrink-0">
                <IconMapPin className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <div>
                <strong className="text-[#354F52] font-black uppercase text-[7px] md:text-[10px] tracking-widest block mb-1">Local do Chá</strong>
                <p className="text-sm md:text-xl font-medium text-[#354F52]/80 leading-relaxed">
                  Sede Campestre Sintracon<br />
                  <span className="text-sm opacity-80">Rua Ângela Perin D'agostin - Embu, Colombo - PR</span><br />
                  <span className="text-xs text-[#B07D62] font-bold mt-1 inline-block">Espaço de Eventos (Não é a casa nova)</span>
                </p>
              </div>
            </div>
            
            {/* Bloco Horário Principal */}
            <div className="flex items-start gap-4 md:gap-6">
              <div className="bg-[#84A98C]/10 p-3.5 md:p-5 rounded-2xl md:rounded-[2rem] text-[#354F52] shadow-sm border border-[#84A98C]/10 flex-shrink-0">
                <IconCalendar className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <div>
                <strong className="text-[#354F52] font-black uppercase text-[7px] md:text-[10px] tracking-widest block mb-1">Data & Hora</strong>
                <p className="text-sm md:text-xl font-medium text-[#354F52]/80">
                  15 de Fevereiro de 2026<br />
                  <span className="text-[#B07D62] font-bold">Chá de Casa Nova: Às 15:00h</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group order-1 lg:order-2">
          {/* Animação de rotação apenas no desktop (e apenas quando não é mapa, para não bugar o iframe) */}
          <div className={`
             absolute inset-0 bg-[#B07D62]/5 rounded-[2rem] md:rounded-[4rem] 
             transition-transform duration-700 -z-10
             ${!showMap ? 'md:rotate-1 md:group-hover:rotate-0' : 'md:rotate-0'}
          `}></div>
          
          <div className="h-[250px] sm:h-[350px] md:h-[550px] bg-[#354F52] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-xl relative border-[6px] md:border-[12px] border-white/10">
            
            {showMap ? (
               <iframe 
                 width="100%" 
                 height="100%" 
                 frameBorder="0" 
                 scrolling="no" 
                 marginHeight={0} 
                 marginWidth={0} 
                 src="https://maps.google.com/maps?q=Sede+Campestre+Sintracon+Rua+Angela+Perin+Dagostin&t=&z=15&ie=UTF8&iwloc=&output=embed"
                 className="
                    w-full h-full animate-in fade-in duration-700 transition-all ease-out
                    /* ESTILO BASE: Sálvia & Vintage */
                    grayscale-[50%] 
                    sepia-[40%] 
                    hue-rotate-[100deg] 
                    contrast-[0.9] 
                    brightness-[1.05]
                    invert-[5%]
                    /* INTERAÇÃO: Revela cores reais ao passar o mouse */
                    hover:grayscale-0 
                    hover:sepia-0 
                    hover:hue-rotate-0 
                    hover:contrast-100 
                    hover:brightness-100
                    hover:invert-0
                 "
                 title="Mapa do Local"
                 loading="lazy"
               ></iframe>
            ) : (
              <img 
                src="https://dweb6.dohms.com.br/files/1169/sede-campestre/img-sede-campestre-06.png" 
                alt="Sede Campestre Sintracon" 
                className="w-full h-full object-cover transition-transform duration-[3000ms] md:group-hover:scale-105 animate-in fade-in duration-700"
              />
            )}

            {/* Overlay com Botão Centralizado (Apenas no modo FOTO) */}
            {!showMap && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#354F52]/95 via-[#354F52]/20 to-transparent flex flex-col items-center justify-center p-6 md:p-12 transition-all duration-500">
                  <p className="text-white text-center mb-6 md:mb-12 font-cursive text-xl md:text-3xl leading-relaxed max-w-xs drop-shadow-md animate-in slide-in-from-bottom-4 duration-500">
                    "Um lugar lindo para um momento especial."
                  </p>

                  <button 
                    onClick={() => setShowMap(true)}
                    className="px-8 md:px-10 py-4 md:py-4 rounded-full font-black uppercase tracking-widest text-[9px] md:text-[11px] shadow-2xl active:scale-95 transition-all flex items-center gap-3 md:gap-4 bg-white text-[#354F52] hover:bg-[#F8F7F2]"
                  >
                    <IconMapPin className="w-4 h-4 md:w-5 md:h-5" />
                    Ver no Mapa
                  </button>
              </div>
            )}

            {/* Barra de Controle Flutuante (Apenas no modo MAPA) - Reposicionada para baixo */}
            {showMap && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3 pointer-events-auto animate-in slide-in-from-bottom-6 fade-in duration-500 z-10 w-max max-w-[95%]">
                  <button 
                    onClick={() => setShowMap(false)}
                    className="px-5 py-3 rounded-full font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2 bg-[#354F52] text-white hover:bg-[#2A3F41] border border-white/10 whitespace-nowrap backdrop-blur-md"
                  >
                    <IconPhoto className="w-4 h-4" />
                    Voltar
                  </button>

                  <button 
                    onClick={handleOpenRoute}
                    className="px-5 py-3 rounded-full font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2 bg-[#B07D62] text-white hover:bg-[#966b54] border border-white/10 whitespace-nowrap backdrop-blur-md"
                  >
                    <IconDirection className="w-4 h-4" />
                    Traçar Rota
                  </button>
               </div>
            )}

          </div>
        </div>
      </div>

      <div className="mt-20 md:mt-40 text-center pb-10 md:pb-20 border-t border-[#84A98C]/10 pt-12 md:pt-24">
        <p className="font-cursive text-4xl md:text-6xl text-[#B07D62] mb-6 md:mb-8">Com todo nosso carinho,</p>
        <p className="text-[#52796F] font-black uppercase tracking-[0.5em] md:tracking-[0.8em] text-[10px] md:text-[12px] opacity-70">Emily & Gustavo</p>
        <div className="mt-10 md:mt-20 flex justify-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B07D62]/40 animate-pulse"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B07D62]/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B07D62]/10"></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
