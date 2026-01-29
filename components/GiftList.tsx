import React, { useState, useMemo, useEffect } from 'react';
import { Gift } from '../types';
import { IconGift, IconEye, IconEyeOff, IconCheck, IconShoppingCart, IconArrowRight, IconSparkles } from './Icons';

interface GiftListProps {
  gifts: Gift[];
  onReserve: (gift: Gift) => void;
  onLinkReturn: (gift: Gift) => void;
  onCategoryChange?: (category: string) => void;
}

// Componente interno para gerenciar o carregamento individual de cada imagem (Com cores Boho)
const GiftImage: React.FC<{ src: string; alt: string; isReserved: boolean }> = ({ src, alt, isReserved }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!src || src.trim() === '') {
      setImageStatus('error');
    } else {
      setImageStatus('loading');
    }
  }, [src]);

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    console.warn(`[GiftImage Error] Falha ao carregar imagem para: "${alt}". URL Tentada: "${src}"`);
    setImageStatus('error');
  };

  return (
    <div className="relative aspect-square overflow-hidden bg-[#F8F7F2]">
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-[#E6B8A2]/20 animate-pulse flex items-center justify-center z-10">
           <IconGift className="w-8 h-8 text-[#E6B8A2] opacity-50" />
        </div>
      )}

      {/* Fallback com cores da paleta original */}
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8F7F2] p-4 text-center animate-in fade-in duration-500">
           <div className="w-12 h-12 rounded-full bg-[#52796F]/10 flex items-center justify-center mb-2">
             <IconGift className="w-6 h-6 text-[#52796F] opacity-60" />
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest text-[#52796F]/60">
             Foto Indisponível
           </span>
        </div>
      )}
      
      {src && imageStatus !== 'error' && (
        <img 
          src={src} 
          alt={alt} 
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageStatus === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } ${isReserved ? 'grayscale' : 'group-hover:scale-110'}`} 
        />
      )}
      
      {isReserved && (
        <div className="absolute inset-0 bg-[#354F52]/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-500 z-20">
          <div className="bg-white text-[#354F52] px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
            <IconCheck className="w-4 h-4" />
            Já Ganharam!
          </div>
        </div>
      )}
    </div>
  );
};

const IconSearch = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const GiftList: React.FC<GiftListProps> = ({ gifts, onReserve, onLinkReturn, onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [pendingGiftId, setPendingGiftId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(gifts.map(g => g.category)));
    return ['Todos', ...cats];
  }, [gifts]);

  const filteredGifts = useMemo(() => {
    let result = gifts;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(term));
    } else {
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

  useEffect(() => {
    if (searchTerm.trim() && activeTab !== 'Todos') {
      setActiveTab('Todos');
    }
  }, [searchTerm]);

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

  const handleBuyOnShopee = (gift: Gift) => {
    if (gift.shopeeUrl) {
      setPendingGiftId(gift.id);
      window.open(gift.shopeeUrl, '_blank');
    }
  };

  const handleJustBrowse = (gift: Gift) => {
    if (gift.shopeeUrl) {
      setPendingGiftId(null);
      window.open(gift.shopeeUrl, '_blank');
    }
  };

  return (
    <div className="space-y-10">
      {/* Filters Area */}
      <div className="sticky top-4 z-30 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          
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

          <div className="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-lg border border-white/40 inline-flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setSearchTerm('');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {filteredGifts.map((gift) => {
          const isReserved = gift.status === 'reserved';
          const hasLink = !!gift.shopeeUrl;
          
          return (
            <div 
              key={gift.id}
              className={`group bg-white rounded-3xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-[#52796F]/5 transition-all duration-500 relative flex flex-col ${
                isReserved 
                  ? 'opacity-80' 
                  : 'hover:shadow-[0_20px_40px_-10px_rgba(82,121,111,0.15)] hover:-translate-y-2'
              }`}
            >
              <GiftImage src={gift.imageUrl} alt={gift.name} isReserved={isReserved} />
              
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-[#354F52] shadow-sm border border-white/50 z-10">
                R$ {gift.priceEstimate?.toFixed(2)}
              </div>

              <div className="p-5 flex flex-col flex-grow bg-white relative z-20">
                <div className="flex-grow mb-4">
                  <p className="text-[10px] text-[#B07D62] font-black uppercase tracking-widest mb-1">{gift.category}</p>
                  <h3 className="text-lg font-serif font-medium text-[#354F52] leading-tight mb-2">
                    {gift.name}
                  </h3>
                </div>
                
                {!isReserved ? (
                  <div className="space-y-2.5">
                    {hasLink && (
                      <button 
                        onClick={() => handleBuyOnShopee(gift)}
                        aria-label={`Comprar ${gift.name} na Shopee`}
                        className="w-full bg-[#B07D62] text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#B07D62]/20 hover:bg-[#966b54] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <IconShoppingCart className="w-4 h-4" />
                        Comprar na Shopee
                      </button>
                    )}

                    <button 
                      onClick={() => onReserve(gift)}
                      aria-label={`Vou presentear ${gift.name} por fora`}
                      className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        hasLink 
                          ? 'bg-transparent text-[#354F52] border-[#354F52]/20 hover:bg-[#354F52]/5'
                          : 'bg-[#354F52] text-white border-transparent hover:bg-[#2A3F41] shadow-lg'
                      }`}
                    >
                      <IconGift className="w-4 h-4" />
                      {hasLink ? 'Presentear por fora' : 'Quero Presentear'}
                    </button>

                    {hasLink && (
                      <button 
                        onClick={() => handleJustBrowse(gift)}
                        className="w-full py-1 text-[9px] font-bold uppercase tracking-widest text-[#52796F] hover:text-[#354F52] hover:underline opacity-80 hover:opacity-100 transition-all flex items-center justify-center gap-1 mt-1"
                      >
                        <IconEye className="w-3 h-3" />
                        Apenas ver na Shopee (sem reservar)
                      </button>
                    )}
                  </div>
                ) : (
                   <div className="mt-4 pt-4 border-t border-dashed border-stone-200 text-center">
                     <p className="text-[11px] text-stone-400 font-medium italic flex items-center justify-center gap-2">
                       <IconCheck className="w-3 h-3" />
                       Escolhido por {gift.reservedBy?.split(' ')[0]}
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
              ? `Não encontramos nada com "${searchTerm}".` 
              : showAvailableOnly 
                ? 'Lista zerada! Vocês são incríveis! ❤️' 
                : 'Carregando lista...'}
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