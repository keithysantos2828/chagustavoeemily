
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Gift } from './types';
import { EVENT_DATE, SHEET_SCRIPT_URL, ADMIN_NAME } from './constants';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Countdown from './components/Countdown';
import GiftList from './components/GiftList';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import PresenceList from './components/PresenceList';
import CustomAlert, { AlertType } from './components/CustomAlert';
import IntroAnimation from './components/IntroAnimation';
import DeliveryGuide from './components/DeliveryGuide';
import { IconDirection, IconMapPin } from './components/Icons';
import MusicPlayer from './components/MusicPlayer';
import { ToastContainer, ToastMessage } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Ref para guardar o estado anterior dos presentes e comparar mudanças
  const prevGiftsRef = useRef<Gift[]>([]);

  // Estado para TESTES: Simular que hoje é o dia do evento
  const [isSimulatingEventDay, setIsSimulatingEventDay] = useState(false);

  // Verifica se é o dia do evento
  const isEventDay = React.useMemo(() => {
    if (isSimulatingEventDay) return true;
    const now = new Date();
    return now.getDate() === EVENT_DATE.getDate() && 
           now.getMonth() === EVENT_DATE.getMonth() && 
           now.getFullYear() === EVENT_DATE.getFullYear();
  }, [isSimulatingEventDay]);
  
  const [introMode] = useState<'default' | 'returning'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('housewarming_user_name')) {
      return 'returning';
    }
    return 'default';
  });
  
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro]);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeAlert();
      },
      onCancel: onCancel ? () => {
        onCancel();
        closeAlert();
      } : undefined
    });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  // Sistema de Toasts
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshGifts = async () => {
    if (!SHEET_SCRIPT_URL) return;
    try {
      const response = await fetch(SHEET_SCRIPT_URL);
      const data = await response.json();
      
      // Lógica de Notificação em Tempo Real
      if (prevGiftsRef.current.length > 0 && user) {
        data.forEach((newGift: Gift) => {
          const oldGift = prevGiftsRef.current.find(g => g.id === newGift.id);
          
          if (oldGift) {
            // Caso 1: Alguém reservou um item (e não fui eu)
            if (oldGift.status === 'available' && newGift.status === 'reserved' && newGift.reservedBy !== user.name) {
              addToast('info', `Olha só! Alguém acabou de garantir: ${newGift.name}`);
            }
            // Caso 2: Um item voltou para a lista
            if (oldGift.status === 'reserved' && newGift.status === 'available') {
              addToast('success', `Oba! ${newGift.name} voltou para a lista!`);
            }
          }
        });
      }

      setGifts(data);
      prevGiftsRef.current = data;
      localStorage.setItem('housewarming_gifts', JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  };

  useEffect(() => {
    const savedGifts = localStorage.getItem('housewarming_gifts');
    if (savedGifts) {
      const parsed = JSON.parse(savedGifts);
      setGifts(parsed);
      prevGiftsRef.current = parsed;
    }
    refreshGifts();
    
    const interval = setInterval(refreshGifts, 10000); // Polling mais rápido (10s) para sensação real-time
    return () => clearInterval(interval);
  }, [user]); // Adicionado user como dependência para não notificar a si mesmo erradamente

  const handleOnboarding = (name: string) => {
    const newUser: User = {
      name,
      isAdmin: name.trim().toLowerCase() === ADMIN_NAME.toLowerCase()
    };
    setUser(newUser);
  };

  const updateGiftStatus = useCallback(async (giftId: string, status: 'available' | 'reserved', reserverName?: string) => {
    setLoading(true);
    const action = status === 'reserved' ? 'claim' : 'unclaim';
    
    setGifts(prev => prev.map(g => g.id === giftId ? { ...g, status, reservedBy: reserverName } : g));

    try {
      await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({ giftId, action, guestName: reserverName })
      });
      
      if (status === 'reserved') {
        showAlert('success', 'Presente Reservado!', 'Obrigado por confirmar! O item foi marcado com seu nome.', () => {});
      }
      refreshGifts();
    } catch (e) {
      console.error("Erro ao salvar:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const adminUpdateGift = async (giftId: string, updates: Partial<Gift>) => {
    setLoading(true);
    try {
      const gift = gifts.find(g => g.id === giftId);
      const finalGift = { ...gift, ...updates };
      await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          giftId, 
          action: 'edit',
          name: finalGift.name,
          category: finalGift.category,
          imageUrl: finalGift.imageUrl,
          priceEstimate: finalGift.priceEstimate,
          urls: finalGift.shopeeUrl
        })
      });
      setTimeout(refreshGifts, 1000); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkReturn = (gift: Gift) => {
    if (!user) return;
    showAlert(
      'confirm',
      'Você comprou este presente?',
      `Se você finalizou a compra de "${gift.name}" na Shopee, confirme abaixo para reservarmos em seu nome.`,
      () => updateGiftStatus(gift.id, 'reserved', user.name),
      () => {}
    );
  };

  const handleTraceRoute = () => {
    showAlert(
      'confirm',
      'Abrir GPS?',
      'Isso vai abrir o mapa no seu celular para te guiar até a festa. Deseja continuar?',
      () => {
        const destination = encodeURIComponent("Sede Campestre Sintracon Rua Angela Perin Dagostin");
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
      },
      () => {}
    );
  };

  return (
    <div className={`min-h-screen text-[#3D403D] pb-10 transition-colors duration-1000 relative ${isEventDay ? 'bg-[#E6E4DD]' : 'bg-[#F8F7F2]'}`}>
      
      {/* TOAST CONTAINER GLOBAL */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* MUSIC PLAYER GLOBAL */}
      {user && <MusicPlayer />}

      {/* BACKGROUND DE MAPA REAL (IFRAME) NO DIA DO EVENTO */}
      {isEventDay && (
        <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 animate-in fade-in">
           <iframe 
             src="https://maps.google.com/maps?q=Sede+Campestre+Sintracon+Rua+Angela+Perin+Dagostin&t=&z=15&ie=UTF8&iwloc=&output=embed"
             className="w-full h-full object-cover opacity-30 grayscale contrast-125"
             style={{ border: 0 }}
             loading="lazy"
           ></iframe>
           <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
        </div>
      )}

      {/* INTRODUÇÃO */}
      {showIntro && (
        <IntroAnimation 
          mode={introMode} 
          onComplete={handleIntroComplete} 
        />
      )}

      <CustomAlert {...alertConfig} />
      
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#52796F] z-[999] overflow-hidden">
          <div className="h-full bg-green-300 animate-[loading_1.5s_infinite_linear] w-[40%]"></div>
        </div>
      )}

      {!user ? (
         <div className={showIntro ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000 relative z-10'}>
            <Onboarding onSubmit={handleOnboarding} />
         </div>
      ) : (
        <div className={`transition-opacity duration-1000 relative z-10 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
          <Cart 
            user={user} 
            reservedGifts={gifts.filter(g => g.reservedBy === user.name && g.status === 'reserved')} 
            onRelease={(id) => {
              showAlert(
                'confirm', 
                'Remover Presente?', 
                'O item voltará para a lista e ficará disponível para outros convidados.',
                () => updateGiftStatus(id, 'available'),
                () => {}
              );
            }} 
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10">
            {/* Header com padding inferior reduzido para conectar com a lista */}
            <div className="mb-4">
               <Header user={user} />
            </div>
            
            {/* ALERT DE DIA DO EVENTO */}
            {isEventDay && (
              <div className="animate-in zoom-in-95 duration-700 mb-8 mt-4">
                <button 
                  onClick={handleTraceRoute}
                  className="w-full bg-gradient-to-r from-[#B07D62] to-[#9c6a50] text-white p-4 rounded-3xl shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all border-4 border-white/50"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                         <IconDirection className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-90">Hoje é o grande dia!</p>
                        <h3 className="text-lg md:text-xl font-bold leading-tight">Traçar Rota p/ Festa</h3>
                      </div>
                   </div>
                   <div className="w-10 h-10 bg-white text-[#B07D62] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconMapPin className="w-5 h-5" />
                   </div>
                </button>
              </div>
            )}
            
            <div className="my-10 md:my-16 space-y-8">
              {!isEventDay && <div className="">
                 <Countdown targetDate={EVENT_DATE} />
              </div>}

              {!isEventDay && <DeliveryGuide targetDate={EVENT_DATE} />}
            </div>

            <PresenceList gifts={gifts} currentUser={user} />

            <main className="mt-8 md:mt-16">
              
              {/* Título Conectado Visualmente à Lista (Bloco Único) */}
              <div className="bg-[#FDFCF8] rounded-t-[2.5rem] pt-10 px-6 md:px-10 pb-6 border border-[#52796F]/5 border-b-0 shadow-sm relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div className={`text-center md:text-left w-full md:w-auto ${isEventDay ? 'bg-[#F8F7F2]/90 p-6 rounded-3xl shadow-lg backdrop-blur-md border border-[#52796F]/10' : ''}`}>
                    <h2 className="text-3xl md:text-5xl font-cursive text-[#354F52]">Lista de Presentes</h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                       </span>
                       <p className="text-[#84A98C] font-bold text-[10px] uppercase tracking-widest">
                         Sincronizado em Tempo Real
                       </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                    {user.isAdmin && (
                      <button 
                        onClick={() => setShowAdmin(!showAdmin)}
                        className="w-full md:w-auto px-6 py-3 bg-[#52796F] text-white rounded-full hover:bg-[#354F52] transition-all shadow-xl font-bold uppercase tracking-widest text-[10px]"
                      >
                        {showAdmin ? 'Fechar Painel' : 'Painel de Controle'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Fundo Branco contínuo para a lista */}
              <div className="bg-[#FDFCF8] px-4 md:px-8 pb-10 rounded-b-[2.5rem] border border-t-0 border-[#52796F]/5 shadow-sm mb-12">
                {showAdmin ? (
                  <AdminPanel 
                    gifts={gifts} 
                    onUpdateGift={adminUpdateGift}
                    onReset={() => {}} 
                  />
                ) : (
                  <GiftList 
                    gifts={gifts} 
                    currentUser={user}
                    onReserve={(gift) => {
                      // NOVA CONFIRMAÇÃO
                      showAlert(
                          'confirm',
                          `Reservar ${gift.name}?`,
                          'Ao confirmar, este item sairá da lista para os outros convidados. Você pode ver detalhes de como entregar depois.',
                          () => updateGiftStatus(gift.id, 'reserved', user.name),
                          () => {}
                      );
                    }} 
                    onShopeeClick={handleLinkReturn}
                  />
                )}
              </div>
            </main>

            <Footer onShowAlert={showAlert} />
          </div>
        </div>
      )}

      {/* --- BOTÃO DE TESTE (SIMULAÇÃO) --- */}
      <div className="fixed bottom-2 left-2 z-[9999] opacity-30 hover:opacity-100 transition-opacity">
         <button 
           onClick={() => setIsSimulatingEventDay(!isSimulatingEventDay)}
           className={`
             px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2 border shadow-lg transition-all
             ${isSimulatingEventDay ? 'bg-red-500 text-white border-red-400' : 'bg-black/80 text-white border-white/20'}
           `}
         >
           {isSimulatingEventDay ? '🔴 Parar Simulação' : '🧪 Testar Dia do Evento'}
         </button>
      </div>
    </div>
  );
};

export default App;
