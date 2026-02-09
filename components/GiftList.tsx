
import React, { useState, useMemo, useEffect } from 'react';
import { Gift, User } from '../types';
import { GoogleGenAI } from "@google/genai";
import { getGeminiKey } from '../services/aiService';
import { 
  IconGift, IconEye, IconEyeOff, IconCheck, IconShoppingCart, IconSparkles,
  IconSortAsc, IconSortDesc, IconFilter, IconArrowUp, IconX
} from './Icons';

interface GiftListProps {
  gifts: Gift[];
  currentUser?: User;
  onReserve: (gift: Gift) => void;
  onShopeeClick: (gift: Gift) => void;
  onCategoryChange?: (category: string) => void;
}

// ==========================================
// 🧠 COMPONENTE: MODAL DE RECOMENDAÇÃO IA
// ==========================================
const RecommendationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  recommendations: { title: string; giftId: string; reason: string; icon: string }[];
  gifts: Gift[];
  onSelect: (gift: Gift) => void;
}> = ({ isOpen, onClose, loading, recommendations, gifts, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#354F52]/80 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#FDFCF8] rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 slide-in-from-bottom-8 overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B07D62]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#B07D62]/10 px-3 py-1 rounded-full mb-2">
                <IconSparkles className="w-4 h-4 text-[#B07D62]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#B07D62]">IA do Casal</span>
              </div>
              <h3 className="text-2xl font-cursive text-[#354F52]">Sugestões pra Você</h3>
            </div>
            <button onClick={onClose} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
              <IconX className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#52796F]/10 flex items-center justify-center mb-4 animate-pulse">
                <IconGift className="w-8 h-8 text-[#52796F] animate-bounce" />
              </div>
              <p className="text-[#354F52] font-bold text-lg animate-pulse">Analisando os melhores presentes...</p>
              <p className="text-[#84A98C] text-sm mt-2">Buscando custo-benefício e itens essenciais.</p>
            </div>
          ) : recommendations.length === 0 ? (
             <div className="py-8 text-center">
                <p className="text-[#354F52]">Não conseguimos gerar sugestões agora. Tente novamente! 😅</p>
             </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => {
                const gift = gifts.find(g => g.id === rec.giftId);
                if (!gift) return null;

                return (
                  <div 
                    key={idx} 
                    onClick={() => { onClose(); onSelect(gift); }}
                    className="group bg-white border border-[#52796F]/10 rounded-2xl p-4 flex gap-4 hover:border-[#B07D62]/40 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* Highlight Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B07D62] to-[#52796F] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-20 h-20 rounded-xl bg-stone-100 shrink-0 overflow-hidden">
                       <img src={gift.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#B07D62] flex items-center gap-1">
                             {rec.icon === '💰' && <span className="text-sm">💰</span>} 
                             {rec.icon === '🏠' && <span className="text-sm">🏠</span>}
                             {rec.icon === '🎁' && <span className="text-sm">🎁</span>}
                             {rec.title}
                          </span>
                          <span className="font-bold text-[#354F52] text-sm">R$ {gift.priceEstimate.toFixed(2)}</span>
                       </div>
                       <h4 className="font-bold text-[#354F52] leading-tight mb-1 truncate">{gift.name}</h4>
                       <p className="text-xs text-[#52796F] leading-relaxed line-clamp-2">{rec.reason}</p>
                    </div>

                    <div className="flex items-center text-[#B07D62] opacity-0 group-hover:opacity-100 transition-opacity -ml-2">
                       <IconArrowUp className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 💀 SKELETON COMPONENT
// ==========================================
const GiftSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col h-full animate-pulse">
    <div className="aspect-square bg-stone-200 relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
    </div>
    <div className="p-5 flex flex-col gap-3 flex-grow">
      <div className="h-3 w-20 bg-stone-200 rounded-full"></div>
      <div className="h-6 w-3/4 bg-stone-200 rounded-lg"></div>
      <div className="mt-auto space-y-2">
         <div className="h-10 w-full bg-stone-200 rounded-xl"></div>
         <div className="h-10 w-full bg-stone-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

// Componente interno para imagem
const GiftImage: React.FC<{ src: string; alt: string; isReserved: boolean; isMine: boolean }> = ({ src, alt, isReserved, isMine }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!src || src.trim() === '') {
      setImageStatus('error');
    } else {
      setImageStatus('loading');
    }
  }, [src]);

  return (
    <div className="relative aspect-square overflow-hidden bg-[#F8F7F2]">
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-[#E6B8A2]/20 animate-pulse flex items-center justify-center z-10">
           <IconGift className="w-8 h-8 text-[#E6B8A2] opacity-50" />
        </div>
      )}

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
          onLoad={() => setImageStatus('loaded')}
          onError={() => setImageStatus('error')}
          className={`w-full h-full object-cover transition-all duration-700 ease-out 
            ${imageStatus === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} 
            ${isReserved ? 'grayscale opacity-50' : ''} 
            ${!isReserved ? 'md:group-hover:scale-110' : ''}
          `} 
        />
      )}
      
      {isReserved && !isMine && (
        <div className="absolute inset-0 bg-[#354F52]/10 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-500 z-20">
          <div className="bg-stone-100/90 text-stone-500 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 border border-stone-200">
            <IconCheck className="w-3 h-3" />
            Já Ganharam
          </div>
        </div>
      )}

      {isReserved && isMine && (
        <div className="absolute inset-0 bg-[#52796F]/10 flex items-center justify-center animate-in fade-in duration-500 z-20">
          <div className="bg-[#FDFCF8] text-[#52796F] px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 border border-[#52796F]/20 transform scale-110">
            <IconGift className="w-4 h-4 text-[#B07D62]" />
            Você escolheu este! ❤️
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

const GiftList: React.FC<GiftListProps> = ({ gifts, currentUser, onReserve, onShopeeClick, onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc'); 
  const [priceRange, setPriceRange] = useState<'under50' | '50to100' | 'over100' | null>(null);

  // IA Recommendations State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  // Haptic Helper
  const vibrate = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (e) {
      // Ignore unsupported operation
    }
  };

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

    if (priceRange) {
      if (priceRange === 'under50') {
        result = result.filter(g => (g.priceEstimate || 0) <= 50);
      } else if (priceRange === '50to100') {
        result = result.filter(g => (g.priceEstimate || 0) > 50 && (g.priceEstimate || 0) <= 100);
      } else if (priceRange === 'over100') {
        result = result.filter(g => (g.priceEstimate || 0) > 100);
      }
    }

    result = [...result].sort((a, b) => {
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (a.status !== 'available' && b.status === 'available') return 1;

      const priceA = a.priceEstimate || 0;
      const priceB = b.priceEstimate || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });
    
    return result;
  }, [gifts, activeTab, showAvailableOnly, searchTerm, priceRange, sortOrder]);

  const handleAIGiftRecommendation = async () => {
    setIsAIOpen(true);
    setAiLoading(true);
    
    try {
       const apiKey = await getGeminiKey();
       if (!apiKey) throw new Error("API Key unavailable");
       
       const client = new GoogleGenAI({ apiKey });
       const availableGifts = gifts.filter(g => g.status === 'available');
       
       const prompt = `
         Analise esta lista de presentes de casa nova disponíveis:
         ${JSON.stringify(availableGifts.map(g => ({ id: g.id, name: g.name, price: g.priceEstimate, cat: g.category })))}

         Escolha exatamente 3 opções distintas baseadas nestes perfis:
         1. "Custo-Benefício" (Barato mas útil/legal). Icon: 💰
         2. "Essencial para Casa" (Cozinha/Banheiro indispensável). Icon: 🏠
         3. "Presentão" (Algo mais caro ou impressionante, mas que vale a pena). Icon: 🎁

         Responda APENAS um JSON puro neste formato, SEM markdown code blocks (sem \`\`\`json):
         [
           { "title": "Custo-Benefício", "icon": "💰", "giftId": "ID_DO_ITEM", "reason": "Uma frase curta e divertida explicando por que escolher este." },
           ...
         ]
       `;

       const response = await client.models.generateContent({
         model: 'gemini-3-flash-preview', 
         contents: [{ role: 'user', parts: [{ text: prompt }] }],
         config: { responseMimeType: 'application/json' }
       });
       
       const rawText = response.text || "";
       // Limpeza Robusta do JSON (remove markdown se vier)
       const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

       if (jsonString) {
          const recs = JSON.parse(jsonString);
          setAiRecommendations(recs);
       } else {
          throw new Error("No response text");
       }

    } catch (e) {
       console.error("AI Error:", e);
       setAiRecommendations([]); 
    } finally {
       setAiLoading(false);
    }
  };

  const handleAISelect = (gift: Gift) => {
    setSearchTerm(gift.name);
    setActiveTab('Todos');
    setPriceRange(null);
    setShowAvailableOnly(false);
  };

  if (gifts.length === 0) {
    return (
      <div className="space-y-6 md:space-y-10">
         <div className="flex gap-2 overflow-hidden pb-2 opacity-50">
             {[1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-stone-200 rounded-full animate-pulse"></div>)}
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
             {[1,2,3,4,5,6,7,8].map(i => <GiftSkeleton key={i} />)}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 relative">
      
      <RecommendationModal 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
        loading={aiLoading} 
        recommendations={aiRecommendations}
        gifts={gifts}
        onSelect={handleAISelect}
      />

      {/* STICKY HEADER FIXED: top-0 z-50 with proper background */}
      <div className="sticky top-0 z-50 pt-2 -mx-4 px-4 bg-[#F8F7F2]/95 backdrop-blur-xl transition-all shadow-sm border-b border-[#52796F]/5">
        <div className="max-w-6xl mx-auto pb-2">
          
          {/* Row 1: Search, Filter Toggle & AI Button */}
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            
            {/* Slot para o Music Player (ml-14) */}
            <div className="relative flex-grow group ml-14 transition-all duration-500">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IconSearch className="w-4 h-4 text-[#52796F]/50 group-focus-within:text-[#B07D62] transition-colors" />
              </div>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar presente..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl shadow-sm border border-[#52796F]/10 text-[13px] md:text-[11px] font-bold uppercase tracking-widest text-[#354F52] placeholder-[#52796F]/40 focus:outline-none focus:ring-2 focus:ring-[#B07D62]/20 transition-all"
              />
            </div>

            {/* AI BUTTON */}
            <button
               onClick={() => { vibrate(); handleAIGiftRecommendation(); }}
               className="hidden md:flex h-11 px-4 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#B07D62] to-[#E6B8A2] text-white shadow-md active:scale-95 transition-all hover:brightness-110 flex-shrink-0 gap-2"
            >
               <IconSparkles className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Me Ajuda</span>
            </button>
            
            <button
               onClick={() => { vibrate(); handleAIGiftRecommendation(); }}
               className="md:hidden h-11 w-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#B07D62] to-[#E6B8A2] text-white shadow-md active:scale-95 transition-all flex-shrink-0"
            >
               <IconSparkles className="w-5 h-5" />
            </button>

            <button
              onClick={() => { vibrate(); setIsFiltersOpen(!isFiltersOpen); }}
              className={`
                relative h-11 w-11 flex items-center justify-center rounded-2xl border transition-all active:scale-95 flex-shrink-0
                ${isFiltersOpen || (priceRange || showAvailableOnly)
                  ? 'bg-[#354F52] text-white border-[#354F52] shadow-md' 
                  : 'bg-white text-[#52796F] border-[#52796F]/10 hover:border-[#B07D62]/30'
                }
              `}
            >
              <IconFilter className="w-5 h-5" />
              {(priceRange || showAvailableOnly) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B07D62] rounded-full border border-white"></span>
              )}
            </button>
          </div>

          {/* Row 2: Categories */}
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
            <div className="flex gap-2 min-w-max">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveTab(cat); setSearchTerm(''); }}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                    activeTab === cat && !searchTerm 
                      ? 'bg-[#B07D62] text-white shadow-md' 
                      : 'bg-white border border-[#52796F]/5 text-[#52796F] hover:bg-[#52796F]/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFiltersOpen ? 'max-h-[300px] opacity-100 mt-2 pb-4' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white rounded-2xl border border-[#52796F]/10 p-4 shadow-sm space-y-4">
              {/* Filter Content... (Same as before) */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#52796F]/60">Visualização</span>
                <button 
                  onClick={() => { vibrate(); setShowAvailableOnly(!showAvailableOnly); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    showAvailableOnly 
                      ? 'bg-[#E6B8A2]/20 text-[#B07D62] border-[#B07D62]/30' 
                      : 'bg-stone-50 text-stone-400 border-stone-100'
                  }`}
                >
                  {showAvailableOnly ? <IconEye className="w-3 h-3" /> : <IconEyeOff className="w-3 h-3" />}
                  {showAvailableOnly ? 'Só Disponíveis' : 'Mostrar Tudo'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#52796F]/60">Ordenar</span>
                <button
                  onClick={() => { vibrate(); setSortOrder(current => current === 'asc' ? 'desc' : 'asc'); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-stone-50 text-[#354F52] border border-stone-100 hover:bg-stone-100"
                >
                  {sortOrder === 'asc' ? <IconSortAsc className="w-3.5 h-3.5" /> : <IconSortDesc className="w-3.5 h-3.5" />}
                  {sortOrder === 'asc' ? 'Menor Preço' : 'Maior Preço'}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#52796F]/60">Orçamento</span>
                   {priceRange && (
                     <button onClick={() => setPriceRange(null)} className="text-[9px] text-rose-400 font-bold uppercase hover:underline">Limpar</button>
                   )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'under50', label: 'Até R$50' },
                    { id: '50to100', label: 'R$50 - R$100' },
                    { id: 'over100', label: '+ R$100' }
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => { vibrate(); setPriceRange(current => current === range.id ? null : range.id as any); }}
                      className={`
                        py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border
                        ${priceRange === range.id 
                          ? 'bg-[#52796F] text-white border-[#52796F]' 
                          : 'bg-stone-50 text-[#52796F] border-stone-100'
                        }
                      `}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsFiltersOpen(false)}
                className="w-full py-3 bg-[#F8F7F2] text-[#354F52] font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#E6B8A2]/20 flex items-center justify-center gap-2"
              >
                <IconArrowUp className="w-3 h-3" />
                Fechar Filtros
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
        {filteredGifts.map((gift) => {
          const isReserved = gift.status === 'reserved';
          const isMine = !!currentUser && gift.reservedBy === currentUser.name;
          const hasLink = !!gift.shopeeUrl;
          
          return (
            <div 
              key={gift.id}
              className={`
                group bg-white rounded-3xl overflow-hidden shadow-sm border 
                relative flex flex-col
                active:scale-[0.98] transition-transform duration-100 md:active:scale-100
                md:hover:shadow-2xl md:hover:-translate-y-2 md:transition-all md:duration-500
                ${isMine 
                   ? 'border-[#52796F] ring-1 ring-[#52796F]/20' // Destaque se for meu
                   : isReserved 
                     ? 'border-transparent opacity-80 bg-stone-50/50' // Mais apagado se for de outro
                     : 'border-[#52796F]/5'
                }
              `}
            >
              <GiftImage 
                 src={gift.imageUrl} 
                 alt={gift.name} 
                 isReserved={isReserved} 
                 isMine={isMine} 
              />
              
              <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-[#354F52] shadow-sm border border-white/50 z-10">
                R$ {gift.priceEstimate?.toFixed(2)}
              </div>

              <div className="p-4 md:p-5 flex flex-col flex-grow bg-white relative z-20">
                <div className="flex-grow mb-4">
                  <p className="text-[9px] md:text-[10px] text-[#B07D62] font-black uppercase tracking-widest mb-1">{gift.category}</p>
                  <h3 className="text-base md:text-lg font-serif font-medium text-[#354F52] leading-tight mb-2">
                    {gift.name}
                  </h3>
                </div>
                
                {!isReserved ? (
                  <div className="space-y-2 md:space-y-2.5">
                    <div className={`
                      flex flex-col gap-2 
                      md:opacity-0 md:group-hover:opacity-100 md:translate-y-4 md:group-hover:translate-y-0 md:transition-all md:duration-500 md:ease-out
                    `}>
                      {hasLink && (
                        <button 
                          onClick={(e) => { vibrate(); e.stopPropagation(); onShopeeClick(gift); }}
                          className="w-full bg-[#B07D62] text-white py-3 md:py-2.5 px-4 rounded-xl text-[11px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#B07D62]/20 active:scale-95 hover:bg-[#966b54] transition-all flex items-center justify-center gap-2"
                        >
                          <IconShoppingCart className="w-4 h-4" />
                          Comprar na Shopee
                        </button>
                      )}

                      <button 
                        onClick={(e) => { vibrate(); e.stopPropagation(); onReserve(gift); }}
                        className={`w-full py-3 md:py-2.5 px-4 rounded-xl text-[11px] md:text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 active:scale-95 ${
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
                          onClick={(e) => { e.stopPropagation(); if (gift.shopeeUrl) window.open(gift.shopeeUrl, '_blank'); }}
                          className="w-full py-2 text-[10px] md:text-[9px] font-bold uppercase tracking-widest text-[#52796F] hover:text-[#354F52] hover:underline opacity-80 hover:opacity-100 transition-all flex items-center justify-center gap-1"
                        >
                          <IconEye className="w-3 h-3" />
                          Apenas ver (sem reservar)
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                   <div className={`mt-4 pt-4 border-t border-dashed text-center ${isMine ? 'border-[#52796F]/30' : 'border-stone-200'}`}>
                     <p className={`text-[11px] font-medium italic flex items-center justify-center gap-2 ${isMine ? 'text-[#52796F]' : 'text-stone-400'}`}>
                       {isMine ? (
                         <>
                           <IconCheck className="w-3 h-3" />
                           Item reservado para você
                         </>
                       ) : (
                         <>
                           <IconCheck className="w-3 h-3" />
                           Já Presenteado
                         </>
                       )}
                     </p>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredGifts.length === 0 && (
        <div className="text-center py-24 flex flex-col items-center animate-in zoom-in-95">
          <div className="relative mb-6">
             <div className="w-24 h-24 bg-[#B07D62]/10 rounded-full flex items-center justify-center">
                <IconSparkles className="w-10 h-10 text-[#B07D62]" />
             </div>
             <div className="absolute top-0 right-0 w-8 h-8 bg-[#52796F] rounded-full flex items-center justify-center border-2 border-white">
                <IconFilter className="w-4 h-4 text-white" />
             </div>
          </div>
          
          <h3 className="text-2xl font-cursive text-[#354F52] mb-2">
             Ops, não encontramos nada!
          </h3>
          
          <p className="text-sm md:text-base text-[#52796F] max-w-md px-4 leading-relaxed">
             Tente mudar os filtros de preço ou buscar por outra categoria.
          </p>

          <button 
            onClick={() => {
               vibrate();
               setSearchTerm('');
               setPriceRange(null);
               setShowAvailableOnly(false);
               setIsFiltersOpen(false);
            }}
            className="mt-6 px-6 py-3 bg-[#354F52] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#2A3F41] transition-all"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default GiftList;
