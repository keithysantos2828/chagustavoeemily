
import React, { useState, useEffect, useCallback } from 'react';
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
import AIChat from './components/AIChat';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado da Intro: Verifica se já existe login salvo para decidir o modo
  const [introMode] = useState<'default' | 'returning'>(() => {
    // Verificação segura para SSR/Vite
    if (typeof window !== 'undefined' && localStorage.getItem('housewarming_user_name')) {
      return 'returning';
    }
    return 'default';
  });
  
  const [showIntro, setShowIntro] = useState(true);

  // Bloqueio de Scroll enquanto a intro roda
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showIntro]);

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

  const refreshGifts = async () => {
    if (!SHEET_SCRIPT_URL) return;
    try {
      const response = await fetch(SHEET_SCRIPT_URL);
      const data = await response.json();
      setGifts(data);
      localStorage.setItem('housewarming_gifts', JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao sincronizar com Sheets:", error);
    }
  };

  useEffect(() => {
    const savedGifts = localStorage.getItem('housewarming_gifts');
    if (savedGifts) setGifts(JSON.parse(savedGifts));
    refreshGifts();
    
    const interval = setInterval(refreshGifts, 20000); // Atualiza a cada 20s
    return () => clearInterval(interval);
  }, []);

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
    
    // UI otimista
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

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#3D403D] overflow-x-hidden pb-10">
      
      {/* INTRODUÇÃO CINEMATOGRÁFICA */}
      {showIntro && (
        <IntroAnimation 
          mode={introMode} 
          onComplete={() => setShowIntro(false)} 
        />
      )}

      <CustomAlert {...alertConfig} />
      
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#52796F] z-[999] overflow-hidden">
          <div className="h-full bg-green-300 animate-[loading_1.5s_infinite_linear] w-[40%]"></div>
        </div>
      )}

      {!user ? (
         <div className={showIntro ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}>
            <Onboarding onSubmit={handleOnboarding} />
         </div>
      ) : (
        <div className={`transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
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

          <AIChat 
            gifts={gifts} 
            user={user} 
            onReserve={(gift) => updateGiftStatus(gift.id, 'reserved', user.name)}
            onRelease={(gift) => updateGiftStatus(gift.id, 'available')}
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10">
            <Header user={user} />
            
            <div className="my-10 md:my-16">
              <Countdown targetDate={EVENT_DATE} />
            </div>

            <PresenceList gifts={gifts} currentUser={user} />

            <main className="mt-12 md:mt-24">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12 gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-cursive text-[#52796F]">Lista de Presentes</h2>
                  <p className="text-[#84A98C] font-bold text-[10px] uppercase tracking-widest mt-2">
                    Conectado à planilha oficial • Emily & Gustavo
                  </p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto px-4 md:px-0">
                  {user.isAdmin && (
                    <button 
                      onClick={() => setShowAdmin(!showAdmin)}
                      className="w-full md:w-auto px-6 py-3 bg-[#52796F] text-white rounded-full hover:bg-[#354F52] transition-all shadow-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      {showAdmin ? 'Fechar Painel ADM' : 'Painel da Emily'}
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
                  currentUser={user}
                  onReserve={(gift) => updateGiftStatus(gift.id, 'reserved', user.name)} 
                  onShopeeClick={handleLinkReturn}
                />
              )}
            </main>

            <Footer onShowAlert={showAlert} />
          </div>
        </div>
      )}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default App;
