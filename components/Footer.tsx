import React from 'react';
import { IconMapPin, IconCalendar, IconSparkles } from './Icons';
import { AlertType } from './CustomAlert';

interface FooterProps {
  onShowAlert?: (type: AlertType, title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const Footer: React.FC<FooterProps> = ({ onShowAlert }) => {
  
  const handleBBQConfirm = () => {
    if (onShowAlert) {
      onShowAlert(
        'confirm',
        'Confirmar Churrasco?',
        'Ao confirmar, abriremos o WhatsApp para você enviar uma mensagem avisando a Emily e o Gustavo que você chegará às 13h! 🍖',
        () => {
          // Link genérico para WhatsApp - o usuário pode selecionar o contato
          const text = encodeURIComponent("Oie! Confirmando minha presença no Churrasco às 13h! 🍖😋");
          window.open(`https://wa.me/?text=${text}`, '_blank');
        },
        () => {}
      );
    }
  };

  return (
    <footer className="mt-20 md:mt-40 pt-12 md:pt-24 border-t border-[#84A98C]/10 px-4">
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

            {/* Bloco Churrasco Opcional - Destaque */}
            <div className="mt-8 bg-[#B07D62]/10 border border-[#B07D62]/20 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-[#B07D62]/10 rounded-bl-[2rem] flex items-center justify-center text-xl">🍖</div>
               
               <h3 className="text-[#B07D62] font-black uppercase tracking-widest text-xs mb-2">Churrasco Opcional</h3>
               <p className="text-[#354F52] font-serif text-lg md:text-xl italic mb-4">
                 Vai rolar um churrasquinho colaborativo antes do chá, às <strong className="font-sans not-italic text-[#B07D62]">13:00h</strong>! Se quiser participar, confirme abaixo para nos organizarmos.
               </p>
               
               <button 
                 onClick={handleBBQConfirm}
                 className="w-full py-4 bg-[#B07D62] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#966b54] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 Confirmar Presença no Churrasco
               </button>
            </div>
          </div>
        </div>

        <div className="relative group order-1 lg:order-2">
          {/* Animação de rotação apenas no desktop */}
          <div className="absolute inset-0 bg-[#B07D62]/5 rounded-[2rem] md:rounded-[4rem] md:rotate-1 md:group-hover:rotate-0 transition-transform duration-700 -z-10"></div>
          
          <div className="h-[250px] sm:h-[350px] md:h-[550px] bg-[#354F52] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-xl relative border-[6px] md:border-[12px] border-white/10">
            <img 
              src="https://dweb6.dohms.com.br/files/1169/sede-campestre/img-sede-campestre-06.png" 
              alt="Sede Campestre Sintracon" 
              className="w-full h-full object-cover transition-transform duration-[3000ms] md:group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#354F52]/95 via-[#354F52]/20 to-transparent p-6 md:p-12">
              <p className="text-white text-center mb-6 md:mb-12 font-cursive text-xl md:text-3xl leading-relaxed max-w-xs drop-shadow-md">
                "Um lugar lindo para um momento especial."
              </p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Sede+Campestre+Sintracon+Colombo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-[#354F52] px-8 md:px-14 py-4 md:py-6 rounded-full font-black uppercase tracking-widest text-[9px] md:text-[11px] shadow-2xl hover:bg-[#F8F7F2] active:scale-95 transition-all flex items-center gap-3 md:gap-4"
              >
                <IconMapPin className="w-4 h-4 md:w-5 md:h-5" />
                Como Chegar
              </a>
            </div>
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