import React, { useState, useEffect, useCallback } from 'react';
import { User, Gift } from './types';
import { ADMIN_NAME, EVENT_DATE, SHEET_SCRIPT_URL, INITIAL_GIFTS } from './constants';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Countdown from './components/Countdown';
import GiftList from './components/GiftList';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import PresenceList from './components/PresenceList';
import CustomAlert, { AlertType } from './components/CustomAlert';
import { IconArrowUp } from './components/Icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gifts, setGifts] = useState<Gift[]>(INITIAL_GIFTS);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [confetti, setConfetti] = useState<{id: number, left: number, color: string}[]>([]);

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
      if (Array.isArray(data) && data.length > 0) {
        setGifts(data);
        localStorage.setItem('housewarming_gifts', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  };

  useEffect(() => {
    const savedGifts = localStorage.getItem('housewarming_gifts');
    if (savedGifts) {
      setGifts(JSON.parse(savedGifts));
    }
    refreshGifts();
    const interval = setInterval(refreshGifts, 30000); 

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const triggerConfetti = () => {
    const colors = ['#B07D62', '#52796F', '#84A98C', '#E6B8A2', '#F2E9E4'];
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  const handleOnboarding = (name: string) => {
    const newUser: User = {
      name,
      isAdmin: name.trim().toLowerCase() === ADMIN_NAME.toLowerCase()
    };
    setUser(newUser);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        triggerConfetti();
        showAlert('success', 'Oba! Que alegria!', 'Agradecemos de todo coração! Já imaginamos este presente na nossa nova casa.', () => {});
      }
      setTimeout(refreshGifts, 1000);
    } catch (e) {
      console.error("Erro no servidor:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const adminUpdateGift = async (giftId: string, updates: Partial<Gift>) => {
    setLoading(true);
    try {
      const gift = gifts.find(g => g.id === giftId);
      const finalGift = { ...gift, ...updates } as Gift;
      await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          giftId, action: 'edit',
          name: finalGift.name,
          category: finalGift.category,
          imageUrl: finalGift.imageUrl,
          priceEstimate: finalGift.priceEstimate,
          urls: finalGift.shopeeUrl
        })
      });
      setTimeout(refreshGifts, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) return <Onboarding onSubmit={handleOnboarding} />;

  const userReservedGifts = gifts.filter(g => g.reservedBy === user.name && g.status === 'reserved');

  return (
    <div className={`min-h-screen bg-[#F8F7F2] text-[#354F52] pb-32 relative selection:bg-[#B07D62]/30`}>
      <CustomAlert {...alertConfig} />
      
      {/* Confetti Container */}
      <div className="fixed inset-0 pointer-events-none z-[400] overflow-hidden">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute w-2 h-2 rounded-full opacity-0 animate-confetti"
            style={{
              left: `${c.left}%`,
              top: '-10px',
              backgroundColor: c.color,
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#52796F]/10 z-[300]">
          <div className="h-full bg-[#B07D62] animate-[loading_1s_infinite_ease-in-out] w-full origin-left transform scale-x-0"></div>
        </div>
      )}

      {/* Floating Cart */}
      {!showAdmin && (
        <Cart 
          user={user} 
          reservedGifts={userReservedGifts} 
          onRelease={(id) => {
            showAlert(
              'confirm', 'Mudou de ideia?', 
              'Sem problemas! Vamos liberar este item para que outro convidado possa escolher.',
              () => updateGiftStatus(id, 'available'),
              () => {}
            );
          }} 
        />
      )}

      <div className={`max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-12 transition-opacity duration-1000 opacity-100`}>
        <Header user={user} />
        
        <div className="my-12">
          <Countdown targetDate={EVENT_DATE} />
        </div>

        {!showAdmin && <PresenceList gifts={gifts} />}

        <main className="mt-16 md:mt-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-[#52796F]/10 pb-8">
            <div className="text-center md:text-left w-full md:w-auto">
              <h2 className="text-3xl md:text-5xl font-cursive text-[#354F52]">
                {showAdmin ? 'Gestão da Casa' : 'Galeria de Desejos'}
              </h2>
              <p className="text-[#84A98C] font-bold text-[10px] uppercase tracking-[0.3em] mt-3">
                {showAdmin ? 'Painel Administrativo' : 'Escolha com o coração'}
              </p>
            </div>
            
            {user.isAdmin && (
              <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className={`px-8 py-3 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] border ${
                  showAdmin 
                  ? 'bg-transparent text-[#354F52] border-[#354F52]/20' 
                  : 'bg-[#354F52] text-white border-transparent'
                }`}
              >
                {showAdmin ? 'Ver como Convidado' : 'Acesso Admin'}
              </button>
            )}
          </div>

          {showAdmin ? (
            <AdminPanel gifts={gifts} onUpdateGift={adminUpdateGift} onReset={() => {}} />
          ) : (
            <GiftList 
              gifts={gifts} 
              onCategoryChange={setActiveCategory}
              onReserve={(gift) => {
                 showAlert(
                    'confirm',
                    'Tudo certo com a escolha?',
                    `Que escolha linda! Esse item fará toda a diferença na nossa casa. Podemos confirmar como seu presente?`,
                    () => updateGiftStatus(gift.id, 'reserved', user.name),
                    () => {}
                 );
              }}
              onLinkReturn={(gift) => {
                 showAlert(
                    'confirm',
                    'E aí, gostou do que viu?',
                    `Percebemos que você foi dar uma olhadinha em "${gift.name}".\n\nSe você decidiu comprar por lá (ou em qualquer outro lugar), quer marcar este item como JÁ COMPRADO aqui na lista para não ganharmos repetido?`,
                    () => updateGiftStatus(gift.id, 'reserved', user.name),
                    () => {} 
                 );
              }}
            />
          )}
        </main>

        <Footer />
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-4 md:bottom-10 md:right-10 bg-white text-[#354F52] p-3 rounded-full shadow-xl transition-all duration-500 z-40 border border-stone-100 hover:bg-stone-50 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <IconArrowUp className="w-5 h-5" />
      </button>

      <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          51% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 2.5s ease-out forwards;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in { animation-fill-mode: forwards; }
        .zoom-in-95 { animation-name: zoomIn; }
        .fade-in { animation-name: fadeIn; }
      `}</style>
    </div>
  );
};

export default App;