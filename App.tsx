
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
import OfflineIndicator from './components/OfflineIndicator';
import DeliveryGuide from './components/DeliveryGuide';
import MusicPlayer from './components/MusicPlayer';
import SuccessModal from './components/SuccessModal';
import { IconArrowUp, IconCrown } from './components/Icons';

declare global {
  interface Window {
    confetti: any;
  }
}

// Estrutura da Fila de Ações Offline
interface PendingAction {
  id: string; // ID único da ação (timestamp)
  giftId: string;
  status: 'available' | 'reserved';
  reserverName?: string;
  timestamp: number;
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
  
  // Success Modal State
  const [successGift, setSuccessGift] = useState<Gift | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Offline & Sync States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueue, setPendingQueue] = useState<PendingAction[]>([]);
  
  const prevGiftsRef = useRef<Gift[]>([]);

  // 1. GESTÃO DE REDE E FILA
  useEffect(() => {
    // Carregar fila salva ao iniciar
    const savedQueue = localStorage.getItem('housewarming_offline_queue');
    if (savedQueue) {
      try {
        setPendingQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error("Erro ao ler fila offline", e);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      addToast('info', 'Oba! A internet voltou. Sincronizando...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('error', 'Ops! Conexão perdida. Mas pode continuar usando, salvamos tudo aqui.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Salvar fila no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('housewarming_offline_queue', JSON.stringify(pendingQueue));
  }, [pendingQueue]);

  // Processador de Fila (Quando Online)
  useEffect(() => {
    if (isOnline && pendingQueue.length > 0) {
      const processQueue = async () => {
        const actionToProcess = pendingQueue[0]; // Pega o primeiro da fila (FIFO)
        
        try {
          const action = actionToProcess.status === 'reserved' ? 'claim' : 'unclaim';
          
          await fetch(SHEET_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ 
              giftId: actionToProcess.giftId, 
              action, 
              guestName: actionToProcess.reserverName 
            })
          });

          // Sucesso: Remove da fila
          setPendingQueue(prev => prev.slice(1));
          
          // Se esvaziou a fila
          if (pendingQueue.length === 1) {
             addToast('success', 'Tudo sincronizado com sucesso! ✨');
             mutateGifts(); // Atualiza dados reais
          }

        } catch (error) {
          console.error("Erro ao processar fila:", error);
          // Se der erro de rede real (mesmo estando "online"), espera um pouco antes de tentar de novo
        }
      };

      const timer = setTimeout(processQueue, 2000); // Debounce para não floodar
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingQueue]);


  // 2. POLLING ADAPTATIVO
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
      // Pausa revalidação se estiver offline ou tiver coisas na fila (para não sobrescrever otimismo)
      isPaused: () => !isOnline || pendingQueue.length > 0,
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

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
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

  // 3. ATUALIZAÇÃO ROBUSTA COM SUPORTE OFFLINE
  const updateGiftStatus = useCallback(async (giftId: string, status: 'available' | 'reserved', reserverName?: string) => {
    
    // 1. Feedback Imediato Otimista (Sempre acontece)
    const optimisticGifts = gifts.map(g => g.id === giftId ? { ...g, status, reservedBy: reserverName } : g);
    const targetGift = gifts.find(g => g.id === giftId);
    
    mutateGifts(optimisticGifts, false); 

    // 2. Verifica se está offline
    if (!navigator.onLine) {
       // Adiciona à fila
       const newAction: PendingAction = {
         id: Date.now().toString(),
         giftId,
         status,
         reserverName,
         timestamp: Date.now()
       };
       setPendingQueue(prev => [...prev, newAction]);
       
       // Feedback específico de offline
       if (status === 'reserved') {
          triggerConfetti();
          // Usa o modal de sucesso mesmo offline
          if (targetGift) {
            setSuccessGift({...targetGift, status: 'reserved', reservedBy: reserverName});
            setShowSuccessModal(true);
          }
       } else {
          addToast('info', 'Alteração salva localmente.');
       }
       return; // Para por aqui, não tenta fetch
    }

    // 3. Se estiver Online, segue fluxo normal
    setProcessingMessage(status === 'reserved' 
      ? "Estamos embrulhando seu pedido e anotando seu nome..." 
      : "Estamos devolvendo o item para a prateleira..."
    );
    setIsProcessing(true);

    const action = status === 'reserved' ? 'claim' : 'unclaim';

    try {
      // Envia para o servidor
      await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ giftId, action, guestName: reserverName })
      });

      // Aguarda a confirmação REAL do servidor
      const updatedData = await mutateGifts();
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // LÓGICA DE CONFIRMAÇÃO
      if (updatedData) {
        const confirmedItem = updatedData.find(g => g.id === giftId);
        
        if (status === 'reserved') {
          // Sucesso
          if (confirmedItem?.status === 'reserved' && confirmedItem?.reservedBy === reserverName) {
             triggerConfetti();
             if (confirmedItem) {
               setSuccessGift(confirmedItem);
               setShowSuccessModal(true);
             }
          } 
          // Conflito (alguém pegou antes)
          else {
             showAlert(
               'info', 
               'Poxa! Alguém foi mais rápido.', 
               `Parece que outra pessoa confirmou o item "${confirmedItem?.name}" segundos antes de você. A lista foi atualizada.`, 
               () => {}
             );
          }
        } else {
           addToast('info', 'Tudo bem! O item voltou para a lista.');
        }
      }

    } catch (e) {
      console.error("Erro ao salvar:", e);
      // FALLBACK: Se der erro no fetch (net caiu no meio), joga pra fila
      const newAction: PendingAction = {
         id: Date.now().toString(),
         giftId,
         status,
         reserverName,
         timestamp: Date.now()
       };
       setPendingQueue(prev => [...prev, newAction]);
       addToast('warning', 'A internet oscilou, mas salvamos sua ação na fila de envio.');
      
    } finally {
      setIsProcessing(false);
    }
  }, [gifts, mutateGifts]);

  const adminUpdateGift = async (giftId: string, updates: Partial<Gift>) => {
    if (!isOnline) {
      addToast('error', 'Você precisa estar online para editar itens como administrador.');
      return;
    }
    
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

  // Combina lista real com ações pendentes para mostrar ao usuário o que é dele, mesmo offline
  const effectiveGifts = gifts.map(g => {
    const pendingAction = pendingQueue.slice().reverse().find(a => a.giftId === g.id); // Pega a ultima ação para este item
    if (pendingAction) {
      return { ...g, status: pendingAction.status, reservedBy: pendingAction.reserverName };
    }
    return g;
  });

  const userReservedGifts = effectiveGifts.filter(g => g.reservedBy === user.name && g.status === 'reserved');
  const hasItemsInCart = userReservedGifts.length > 0;

  return (
    <div className="min-h-[100dvh] bg-[#F8F7F2] text-[#3D403D] pb-safe-bottom">
      <CustomAlert {...alertConfig} />
      <ProcessingModal isOpen={isProcessing} message={processingMessage} />
      
      {/* Novo Modal de Sucesso Duolingo Style */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        gift={successGift} 
        onClose={() => setShowSuccessModal(false)} 
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Indicadores */}
      <OfflineIndicator isOnline={isOnline} pendingCount={pendingQueue.length} />
      
      {/* Music Player */}
      <MusicPlayer />

      <button
        onClick={scrollToTop}
        className={`
          fixed z-[80] right-4 md:right-8 bg-[#354F52] text-white p-3 md:p-4 rounded-full shadow-xl 
          transition-all duration-500 hover:bg-[#2A3F41] active:scale-95 border border-white/10
          flex items-center justify-center
          ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
          /* Ajuste para não ficar atrás do cart no mobile */
          ${hasItemsInCart ? 'bottom-28 md:bottom-32' : 'bottom-6 md:bottom-24 mb-safe'}
        `}
        aria-label="Voltar ao topo"
      >
        <IconArrowUp className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Cart (Bottom Sheet Nativo) */}
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
        
        <div className="my-10 md:my-16 space-y-6">
          <Countdown targetDate={EVENT_DATE} />
          <DeliveryGuide targetDate={EVENT_DATE} />
        </div>

        <PresenceList gifts={effectiveGifts} currentUser={user} />

        <main className="mt-12 md:mt-24 relative">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-cursive text-[#52796F]">Lista de Presentes</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                 <span className={`relative flex h-2 w-2 transition-opacity duration-500 ${isProcessing || !isOnline ? 'opacity-100' : 'opacity-0'}`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isOnline ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${!isOnline ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                  </span>
                  <p className="text-[#84A98C] font-bold text-[10px] uppercase tracking-widest opacity-60">
                    {!isOnline ? 'Modo Offline Ativado' : isProcessing ? 'Sincronizando...' : 'Atualizada em tempo real'}
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
              gifts={effectiveGifts} 
              onUpdateGift={adminUpdateGift}
              onReset={() => {}} 
            />
          ) : (
            <GiftList 
              gifts={effectiveGifts} 
              currentUser={user} 
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
              onLinkReturn={(gift) => {
                showAlert(
                  'confirm',
                  'Você comprou este presente?',
                  `Se você finalizou a compra de "${gift.name}" na Shopee, confirme abaixo para reservarmos em seu nome.`,
                  () => updateGiftStatus(gift.id, 'reserved', user.name),
                  () => {}
                );
              }}
            />
          )}
        </main>

        <Footer onShowAlert={showAlert} />
        {/* Espaçamento extra no final para scroll não cortar conteúdo em telas com notch */}
        <div className="h-24 md:h-12 w-full"></div>
      </div>
    </div>
  );
};

export default App;
