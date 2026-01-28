import React, { useState, useMemo, useEffect } from 'react';
import { Gift } from '../types';
import { IconGift, IconEye, IconEyeOff, IconCheck, IconShoppingCart } from './Icons';

interface GiftListProps {
  gifts: Gift[];
  onReserve: (gift: Gift) => void;
  onLinkReturn: (gift: Gift) => void;
  onCategoryChange?: (category: string) => void;
}

// Componente interno para gerenciar o carregamento individual de cada imagem
const GiftImage: React.FC<{ src: string; alt: string; isReserved: boolean }> = ({ src, alt, isReserved }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative aspect-square overflow-hidden bg-[#F8F7F2]">
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
           <IconGift className="w-8 h-8 text-stone-300 opacity-50" />
        </div>
      )}
      
      <img 
        src={src || 'https://placehold.co/400x400?text=Presente'} 
        alt={alt} 
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        } ${isReserved ? 'grayscale' : 'group-hover:scale-110'}`} 
      />
      
      {/* Overlay Reservado - Só aparece se estiver reservado E carregado, ou se estiver reservado (prioridade) */}
      {isReserved && isLoaded && (
        <div className="absolute inset-0 bg-[#354F52]/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white text-[#354F52] px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
            <IconCheck className="w-4 h-4" />
            Já Ganharam!
          </div>
        </div>
      )}
    </div>
  );
};

// Ícone de Lupa local para o Search Bar
const IconSearch = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const GiftList: React.FC<GiftListProps> = ({ gifts, onReserve, onLinkReturn, onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  // Estado para rastrear qual presente o usuário foi "espiar"
  const [pendingGiftId, setPendingGiftId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(gifts.map(g => g.category)));
    return ['Todos', ...cats];
  }, [gifts]);

  const filteredGifts = useMemo(() => {
    let result = gifts;

    // Filtro de Busca (Prioritário sobre categorias)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(term));
    } else {
      // Se não tem busca, usa a categoria
      if (activeTab !== 'Todos') {
        result = result.filter(g => g.category === activeTab);
      }
    }
      
    if (showAvailableOnly) {
      result = result.filter(g => g.status === 'available');
    }
    
    return result;
  }, [gifts, activeTab, showAvailableOnly, searchTerm]);

  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(activeTab);
    }
  }, [activeTab, onCategoryChange]);

  // Se o usuário começar a digitar na busca, resetamos a aba para "Todos" visualmente (opcional, mas bom para UX)
  useEffect(() => {
    if (searchTerm.trim() && activeTab !== 'Todos') {
      setActiveTab('Todos');
    }
  }, [searchTerm]);

  // Detector de retorno à aba para sugerir marcação
  useEffect(() => {
    const handleWindowFocus = () => {
      if (pendingGiftId) {
        const gift = gifts.find(g => g.id === pendingGiftId);
        if (gift && gift.status === 'available') {
          onLinkReturn(gift);
        }
        setPendingGiftId(null);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [pendingGiftId, gifts, onLinkReturn]);

  const handleOpenLink = (gift: Gift) => {
    if (gift.shopeeUrl) {
      setPendingGiftId(gift.id);
      window.open(gift.shopeeUrl, '_blank');
    }
  };

  return (
    <div className="space-y-10">
      {/* Filters Area */}
      <div className="sticky top-4 z-30 flex flex-col gap-4">
        
        {/* Barra de Busca + Tabs Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-64 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconSearch className="w-4 h-4 text-[#52796F]/50 group-focus-within:text-[#B07D62] transition-colors" />
            </div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar presente..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-white/40 text-[11px] font-bold uppercase tracking-widest text-[#354F52] placeholder-[#52796F]/40 focus:outline-none focus:ring-2 focus:ring-[#B07D62]/20 transition-all"
            />
          </div>

          {/* Categories Tabs */}
          <div className="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-lg border border-white/40 inline-flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setSearchTerm(''); // Limpa a busca ao clicar numa categoria
                }}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === cat && !searchTerm 
                    ? 'bg-[#354F52] text-white shadow-md' 
                    : 'text-[#52796F] hover:bg-[#52796F]/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
             <button 
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                showAvailableOnly 
                  ? 'bg-[#B07D62] text-white border-[#B07D62]' 
                  : 'bg-transparent text-[#B07D62] border-[#B07D62]/30 hover:bg-[#B07D62]/10'
              }`}
            >
              {showAvailableOnly ? <IconEye className="w-3 h-3" /> : <IconEyeOff className="w-3 h-3" />}
              {showAvailableOnly ? 'Mostrar tudo' : 'Ver só disponíveis'}
            </button>
        </div>
      </div>

      {/* Modern Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {filteredGifts.map((gift) => {
          const isReserved = gift.status === 'reserved';
          
          return (
            <div 
              key={gift.id}
              className={`group bg-white rounded-3xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-[#52796F]/5 transition-all duration-500 relative flex flex-col ${
                isReserved 
                  ? 'opacity-80' 
                  : 'hover:shadow-[0_20px_40px_-10px_rgba(82,121,111,0.15)] hover:-translate-y-2'
              }`}
            >
              {/* Image Area with Premium Loader */}
              <GiftImage src={gift.imageUrl} alt={gift.name} isReserved={isReserved} />
              
              {/* Price Tag Overlay - Movido para fora do GiftImage para garantir renderização consistente */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-[#354F52] shadow-sm border border-white/50 z-10">
                R$ {gift.priceEstimate?.toFixed(2)}
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-col flex-grow bg-white relative z-20">
                <div className="flex-grow">
                  <p className="text-[10px] text-[#B07D62] font-black uppercase tracking-widest mb-1">{gift.category}</p>
                  <h3 className="text-lg font-serif font-medium text-[#354F52] leading-tight mb-4">
                    {gift.name}
                  </h3>
                </div>
                
                {!isReserved ? (
                  <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
                    <button 
                      onClick={() => onReserve(gift)}
                      aria-label={`Reservar presente ${gift.name}`}
                      className="bg-[#354F52] text-white py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-[#2A3F41] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      Quero Presentear
                      <IconCheck className="w-3 h-3 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                    <button 
                      onClick={() => handleOpenLink(gift)}
                      aria-label={`Ver oferta de ${gift.name} na loja`}
                      className="bg-[#F2E9E4] text-[#B07D62] w-12 rounded-xl flex items-center justify-center hover:bg-[#E6DCD6] active:scale-95 transition-all"
                      title="Espiar Oferta na Loja"
                    >
                      <IconShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                   <div className="mt-4 pt-4 border-t border-dashed border-stone-200 text-center">
                     <p className="text-[11px] text-stone-400 font-medium italic">
                       Escolhido com carinho por {gift.reservedBy?.split(' ')[0]}
                     </p>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredGifts.length === 0 && (
        <div className="text-center py-20 opacity-40 flex flex-col items-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
             <IconGift className="w-8 h-8 text-stone-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            {searchTerm 
              ? `Não encontramos nada com "${searchTerm}". Que tal tentar outro termo?` 
              : showAvailableOnly 
                ? 'Tudo o que precisávamos já foi escolhido! Vocês são incríveis! ❤️' 
                : 'Estamos preparando nossa lista...'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-[#B07D62] font-black uppercase tracking-widest text-[10px] hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftList;