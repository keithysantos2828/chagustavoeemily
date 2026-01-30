import React, { useState, useEffect, useCallback, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { User, Gift } from './types';
import { INITIAL_GIFTS, ADMIN_NAME, EVENT_DATE, SHEET_SCRIPT_URL } from './constants';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Countdown from './components/Countdown';
import GiftList from './components/GiftList';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import PresenceList from './components/PresenceList';
import CustomAlert, { AlertType } from './components/CustomAlert';
import ProcessingModal from './components/ProcessingModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { IconArrowUp, IconCrown } from './components/Icons';

declare global {
  interface Window {
    confetti: any;
  }
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPageVisible, setIsPageVisible] = useState(true);
  
  const prevGiftsRef = useRef<Gift[]>([]);

  // 1. POLLING ADAPTATIVO
  // Detecta se a aba está visível ou não para economizar recursos
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { data: gifts = [], error, mutate: mutateGifts } = useSWR<Gift[]>(
    SHEET_SCRIPT_URL, 
    fetcher, 
    { 
      fallbackData: [],
      // Se visível: 10s (Seguro para Google Script). Se oculto: 60s (Economia).
      refreshInterval: isPageVisible ? 10000 : 60000, 
      revalidateOnFocus: true,
      dedupingInterval: 2000
    }
  );

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

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (gifts.length === 0 || !user) return;

    if (prevGiftsRef.current.length === 0) {
      prevGiftsRef.current = gifts;
      return;
    }

    gifts.forEach(newGift => {
      const oldGift = prevGiftsRef.current.find(g => g.id === newGift.id);
      if (!oldGift) return;

      if (oldGift.status === 'available' && newGift.status === 'reserved') {
        if (newGift.reservedBy !== user.name) {
          addToast('success', `Que amor! Alguém acabou de nos presentear com: ${newGift.name} ❤️`);
        }
      }

      if (oldGift.status === 'reserved' && newGift.status === 'available') {
        addToast('info', `O item ${newGift.name} voltou para a lista.`);
      }
    });

    prevGiftsRef.current = gifts;
  }, [gifts, user]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleOnboarding = (name: string) => {
    localStorage.setItem('housewarming_user_name', name);
    const newUser: User = {
      name,
      isAdmin: name.trim().toLowerCase() === ADMIN_NAME.toLowerCase()
    };
    setUser(newUser);
  };

  const triggerConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B07D62', '#52796F', '#F8F7F2', '#FFD700']
      });
    }
  };

  // 2. TRATAMENTO DE CONCORRÊNCIA (RACE CONDITION)
  const updateGiftStatus = useCallback(async (giftId: string, status: 'available' | 'reserved', reserverName?: string) => {
    setProcessingMessage(status === 'reserved' 
      ? "Estamos embrulhando seu pedido e anotando seu nome..." 
      : "Estamos devolvendo o item para a prateleira..."
    );
    setIsProcessing(true);

    const action = status === 'reserved' ? 'claim' : 'unclaim';
    const originalGifts = [...gifts];
    
    // UI Otimista
    const optimisticGifts = gifts.map(g => g.id === giftId ? { ...g, status, reservedBy: reserverName } : g);
    mutateGifts(optimisticGifts, false); 

    try {
      // Envia para o servidor
      await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ giftId, action, guestName: reserverName })
      });

      // Aguarda a confirmação REAL do servidor
      // Isso pega o estado mais atual da planilha
      const updatedData = await mutateGifts();
      
      // Delay estético
      await new Promise(resolve => setTimeout(resolve, 800));

      // LÓGICA DE VERIFICAÇÃO PÓS-ESCRITA
      if (updatedData) {
        const confirmedItem = updatedData.find(g => g.id === giftId);
        
        // Se eu tentei reservar...
        if (status === 'reserved') {
          // ...e o item agora está no meu nome: Sucesso!
          if (confirmedItem?.status === 'reserved' && confirmedItem?.reservedBy === reserverName) {
             triggerConfetti();
             addToast('success', `Que alegria, ${reserverName}! Muito obrigado por esse presente!`);
          } 
          // ...mas o item está reservado por OUTRA pessoa ou continua disponível (erro): Falha!
          else {
             showAlert(
               'info', 
               'Poxa! Alguém foi mais rápido.', 
               `Parece que outra pessoa confirmou o item "${confirmedItem?.name}" segundos antes de você. A lista foi atualizada.`, 
               () => {}
             );
             // O SWR já atualizou os dados reais, então a UI vai se corrigir sozinha
          }
        } else {
           // Se eu tentei devolver (disponibilizar)
           addToast('info', 'Tudo bem! O item voltou para a lista.');
        }
      }

    } catch (e) {
      console.error("Erro ao salvar:", e);
      addToast('error', 'Ops! Houve um erro de conexão. Tente novamente.');
      mutateGifts(originalGifts, false); // Reverte visualmente
    } finally {
      setIsProcessing(false);
    }
  }, [gifts, mutateGifts]);

  const adminUpdateGift = async (giftId: string, updates: Partial<Gift>) => {
    setProcessingMessage("Atualizando as informações do item...");
    setIsProcessing(true);
    
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
      
      await mutateGifts();
      addToast('success', 'Item atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      addToast('error', 'Erro ao atualizar item.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShopeeInitiate = (gift: Gift) => {
    if (!user) return;
    
    showAlert(
      'confirm',
      'Confirmar Escolha',
      `Ao clicar em confirmar, vamos marcar "${gift.name}" como seu presente na lista e abrir a loja para você.`,
      () => {
        updateGiftStatus(gift.id, 'reserved', user.name);
        window.open(gift.shopeeUrl, '_blank');
      },
      () => {}
    );
  };

  if (!user) return <Onboarding onSubmit={handleOnboarding} />;

  const userReservedGifts = gifts.filter(g => g.reservedBy === user.name && g.status === 'reserved');
  const hasItemsInCart = userReservedGifts.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#3D403D] pb-24 md:pb-10">
      <CustomAlert {...alertConfig} />
      <ProcessingModal isOpen={isProcessing} message={processingMessage} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <button
        onClick={scrollToTop}
        className={`
          fixed z-[80] right-4 md:right-8 bg-[#354F52] text-white p-3 md:p-4 rounded-full shadow-xl 
          transition-all duration-500 hover:bg-[#2A3F41] active:scale-95 border border-white/10
          flex items-center justify-center
          ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
          ${hasItemsInCart ? 'bottom-24 md:bottom-32' : 'bottom-6 md:bottom-8'}
        `}
        aria-label="Voltar ao topo"
      >
        <IconArrowUp className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <Cart 
        user={user} 
        reservedGifts={userReservedGifts} 
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
        <Header user={user} />
        
        <div className="my-10 md:my-16">
          <Countdown targetDate={EVENT_DATE} />
        </div>

        <PresenceList gifts={gifts} currentUser={user} />

        <main className="mt-12 md:mt-24 relative">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-cursive text-[#52796F]">Lista de Presentes</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                 <span className={`relative flex h-2 w-2 transition-opacity duration-500 ${isProcessing ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <p className="text-[#84A98C] font-bold text-[10px] uppercase tracking-widest opacity-60">
                    {isProcessing ? 'Sincronizando...' : 'Atualizada em tempo real'}
                  </p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto px-4 md:px-0">
              {user.isAdmin && (
                <button 
                  onClick={() => setShowAdmin(!showAdmin)}
                  className={`
                    w-full md:w-auto px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl flex items-center justify-center gap-2 relative group overflow-hidden
                    ${showAdmin 
                      ? 'bg-[#52796F] text-white hover:bg-[#354F52]' 
                      : 'bg-white text-[#B07D62] border-2 border-[#B07D62] hover:bg-[#B07D62] hover:text-white'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {showAdmin ? (
                      <>
                        <IconArrowUp className="w-4 h-4" />
                        Fechar Painel
                      </>
                    ) : (
                      <>
                        <IconCrown className="w-4 h-4 animate-pulse" />
                        Painel da Emily
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>

          {showAdmin ? (
            <AdminPanel 
              gifts={gifts} 
              onUpdateGift={adminUpdateGift}
              onReset={() => {}} 
            />
          ) : (
            <GiftList 
              gifts={gifts} 
              currentUser={user} // Passando o usuário para renderizar os Badges corretamente
              onReserve={(gift) => {
                showAlert(
                    'confirm',
                    'Reservar Presente?',
                    'Você confirma que vai presentear com este item (comprando em outra loja física ou online)?',
                    () => updateGiftStatus(gift.id, 'reserved', user.name),
                    () => {}
                );
              }} 
              onShopeeClick={handleShopeeInitiate}
            />
          )}
        </main>

        <Footer onShowAlert={showAlert} />
      </div>
    </div>
  );
};

export default App;