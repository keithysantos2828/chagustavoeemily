import React, { useState, useMemo } from 'react';
import { Gift } from '../types';
import { EVENT_DATE } from '../constants';
import { IconSparkles, IconHeart, IconCheck, IconGift, IconShoppingCart, IconEye, IconArrowRight, IconArrowUp } from './Icons';

// Declaração para o TypeScript entender a biblioteca global
declare global {
  interface Window {
    html2canvas: any;
  }
}

interface AdminPanelProps {
  gifts: Gift[];
  onReset: () => void;
  onUpdateGift: (id: string, updates: Partial<Gift>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ gifts, onUpdateGift }) => {
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [showStoryArt, setShowStoryArt] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'reserved' | 'available'>('all');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const confirmedNames: string[] = Array.from(new Set(
    gifts
      .filter((g): g is Gift & { reservedBy: string } => g.status === 'reserved' && !!g.reservedBy)
      .map(g => String(g.reservedBy))
  ));

  const totalGifts = gifts.length;
  const reservedGifts = gifts.filter(g => g.status === 'reserved').length;
  const reservedValue = gifts.filter(g => g.status === 'reserved').reduce((acc, g) => acc + (g.priceEstimate || 0), 0);

  const daysLeft = Math.max(0, Math.ceil((+EVENT_DATE - +new Date()) / (1000 * 60 * 60 * 24)));

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGift) {
      onUpdateGift(editingGift.id, editingGift);
      setEditingGift(null);
    }
  };

  const handleDownloadImage = async () => {
    if (!window.html2canvas) {
      alert("Erro ao carregar biblioteca de imagem. Tente recarregar a página.");
      return;
    }

    const element = document.getElementById('story-art-content');
    if (!element) return;

    setIsGeneratingImage(true);

    try {
      // Pequeno delay para garantir renderização
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await window.html2canvas(element, {
        scale: 2, // Alta resolução
        backgroundColor: '#FDFCF8',
        useCORS: true, 
        logging: false
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `story-casa-nova-${daysLeft}dias.png`;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Não foi possível gerar a imagem automaticamente. Tente tirar um Print Screen!");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filteredGifts = useMemo(() => {
    if (filterMode === 'reserved') return gifts.filter(g => g.status === 'reserved');
    if (filterMode === 'available') return gifts.filter(g => g.status === 'available');
    return gifts;
  }, [gifts, filterMode]);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Humanizado */}
      <div className="mb-6 md:mb-10 text-center md:text-left">
         <div className="inline-flex items-center gap-2 bg-[#B07D62]/10 px-4 py-1.5 rounded-full mb-4 border border-[#B07D62]/20">
            <IconSparkles className="w-4 h-4 text-[#B07D62]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B07D62]">Área da Noiva</span>
         </div>
         <h2 className="text-3xl md:text-5xl font-cursive text-[#354F52] mb-2">Olá, Emily!</h2>
         <p className="text-[#52796F] text-xs md:text-base max-w-lg mx-auto md:mx-0">
           Aqui você controla todos os detalhes do nosso sonho.
         </p>
      </div>

      {/* 
        Cards de Resumo - UX DIFERENCIADA 
        Mobile: Scroll Horizontal (Snap) estilo App Bancário
        Desktop: Grid Dashboard
      */}
      <div className="
        flex overflow-x-auto snap-x snap-mandatory gap-4 mb-8 -mx-4 px-4 pb-4 no-scrollbar
        md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0
      ">
        
        {/* Card 1: Progresso */}
        <div className="
          min-w-[280px] md:min-w-0 snap-center
          col-span-2 md:col-span-1 bg-[#354F52] text-[#F8F7F2] p-6 rounded-[2rem] shadow-xl relative overflow-hidden group
        ">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl md:group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/10 rounded-xl">
                 <IconGift className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">{Math.round((reservedGifts/totalGifts || 0)*100)}%</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lista Concluída</p>
            <p className="text-sm font-medium mt-1">{reservedGifts} de {totalGifts} itens</p>
            
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-[#B07D62]" style={{ width: `${(reservedGifts/totalGifts || 0)*100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Valor Estimado */}
        <div className="
          min-w-[160px] md:min-w-0 snap-center
          col-span-1 bg-white p-6 rounded-[2rem] border border-[#52796F]/10 shadow-sm md:hover:shadow-md transition-all flex flex-col justify-between
        ">
           <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-2">
             <IconCheck className="w-5 h-5" />
           </div>
           <div>
             <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Ganhamos (Est.)</p>
             <p className="text-lg font-bold text-[#354F52] truncate">R$ {reservedValue.toLocaleString()}</p>
           </div>
        </div>

        {/* Card 3: Confirmados */}
        <div className="
          min-w-[160px] md:min-w-0 snap-center
          col-span-1 bg-white p-6 rounded-[2rem] border border-[#52796F]/10 shadow-sm md:hover:shadow-md transition-all flex flex-col justify-between
        ">
           <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-2">
             <IconHeart className="w-5 h-5" />
           </div>
           <div>
             <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Pessoas</p>
             <p className="text-lg font-bold text-[#354F52]">{confirmedNames.length}</p>
           </div>
        </div>

        {/* Card 4: Story (Ação Rápida) */}
        <button 
          onClick={() => setShowStoryArt(true)}
          className="
            min-w-[200px] md:min-w-0 snap-center
            col-span-2 md:col-span-1 bg-[#B07D62] text-white p-6 rounded-[2rem] shadow-xl md:hover:bg-[#966b54] active:scale-95 transition-all flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden
          "
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
           <IconSparkles className="w-8 h-8 animate-pulse" />
           <div>
             <p className="font-bold text-sm">Gerar Story</p>
             <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Divulgar</p>
           </div>
        </button>
      </div>

      {/* Seção de Lista de Itens */}
      <div className="bg-white md:rounded-[2.5rem] rounded-xl p-4 md:p-8 shadow-sm border border-[#52796F]/5">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
          <h3 className="text-xl md:text-2xl font-cursive text-[#354F52]">Gerenciar Itens</h3>
          
          {/* Filtros */}
          <div className="flex p-1 bg-[#F8F7F2] rounded-full w-full md:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'reserved', label: 'Ganhos' },
              { id: 'available', label: 'Faltam' },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterMode(filter.id as any)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterMode === filter.id 
                    ? 'bg-[#354F52] text-white shadow-md' 
                    : 'text-[#52796F] hover:bg-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Cards */}
        <div className="space-y-3">
          {filteredGifts.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <IconGift className="w-12 h-12 mx-auto mb-2 text-stone-300" />
              <p className="text-sm text-stone-400 font-bold">Nenhum item encontrado.</p>
            </div>
          ) : (
            filteredGifts.map(gift => (
              <div 
                key={gift.id} 
                onClick={() => window.innerWidth < 768 && setEditingGift(gift)} // Mobile: Click card to edit
                className="
                  group flex items-center gap-4 p-3 rounded-2xl border border-transparent 
                  bg-stone-50/30 transition-all cursor-pointer md:cursor-default
                  /* Desktop Hover */
                  md:hover:border-[#52796F]/10 md:hover:bg-[#F8F7F2]/50
                  /* Mobile Active */
                  active:bg-stone-100 active:scale-[0.99]
                "
              >
                {/* Imagem */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white p-1 shadow-sm flex-shrink-0">
                  <img src={gift.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-[#354F52] text-sm truncate">{gift.name}</p>
                    {gift.status === 'reserved' && (
                       <span className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">
                         Ganho
                       </span>
                    )}
                  </div>
                  <p className="text-xs text-[#84A98C]">
                    {gift.category} • R$ {gift.priceEstimate.toFixed(2)}
                  </p>
                  {gift.reservedBy && (
                    <p className="text-[10px] text-[#B07D62] font-bold mt-1 flex items-center gap-1">
                      <IconHeart className="w-3 h-3" />
                      {gift.reservedBy}
                    </p>
                  )}
                </div>

                {/* Ações Desktop (Escondidas no mobile para limpar visual) */}
                <div className="hidden md:flex items-center gap-2">
                   {gift.shopeeUrl && (
                     <a 
                       href={gift.shopeeUrl} 
                       target="_blank" 
                       rel="noreferrer"
                       className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-stone-400 hover:text-[#B07D62] border border-stone-100 transition-colors"
                       title="Ver Link"
                     >
                       <IconEye className="w-4 h-4" />
                     </a>
                   )}
                   <button 
                     onClick={(e) => { e.stopPropagation(); setEditingGift(gift); }}
                     className="px-4 py-2 bg-white text-[#354F52] border border-[#354F52]/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#354F52] hover:text-white transition-all shadow-sm"
                   >
                     Editar
                   </button>
                </div>

                {/* Indicador Mobile */}
                <div className="md:hidden text-stone-300">
                  <IconArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 
        Modal de Edição - UX HÍBRIDA 
        Mobile: Fullscreen "Page" (Slide Up)
        Desktop: Center Modal (Zoom In)
      */}
      {editingGift && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center md:p-6 bg-[#354F52]/20 md:bg-[#354F52]/80 backdrop-blur-sm md:backdrop-blur-md animate-in fade-in duration-300">
          <div className="
            bg-white w-full max-w-lg shadow-2xl border-t md:border border-white/20
            /* Mobile Styles */
            h-[90vh] rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto
            /* Desktop Styles */
            md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] md:p-10 md:animate-in md:zoom-in-95
          ">
            
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6 md:hidden"></div>

            <h4 className="text-2xl font-cursive text-[#354F52] mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#B07D62]/10 rounded-full flex items-center justify-center text-[#B07D62]">
                <IconGift className="w-5 h-5" />
              </span>
              Editar Detalhes
            </h4>
            
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={editingGift.name} 
                  onChange={e => setEditingGift({...editingGift, name: e.target.value})} 
                  className="w-full px-4 py-4 md:py-3 bg-stone-50 rounded-xl border-2 border-transparent focus:border-[#B07D62]/20 focus:bg-white outline-none font-medium text-stone-700 transition-all text-base" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editingGift.priceEstimate} 
                      onChange={e => setEditingGift({...editingGift, priceEstimate: parseFloat(e.target.value)})} 
                      className="w-full px-4 py-4 md:py-3 bg-stone-50 rounded-xl border-2 border-transparent focus:border-[#B07D62]/20 focus:bg-white outline-none font-medium text-stone-700 transition-all text-base" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Categoria</label>
                    <input 
                      type="text" 
                      value={editingGift.category} 
                      onChange={e => setEditingGift({...editingGift, category: e.target.value})} 
                      className="w-full px-4 py-4 md:py-3 bg-stone-50 rounded-xl border-2 border-transparent focus:border-[#B07D62]/20 focus:bg-white outline-none font-medium text-stone-700 transition-all text-base" 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Link da Shopee/Loja</label>
                <input 
                  type="text" 
                  value={editingGift.shopeeUrl} 
                  onChange={e => setEditingGift({...editingGift, shopeeUrl: e.target.value})} 
                  className="w-full px-4 py-4 md:py-3 bg-stone-50 rounded-xl border-2 border-transparent focus:border-[#B07D62]/20 focus:bg-white outline-none text-sm text-stone-500 transition-all" 
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4 pb-10 md:pb-0">
                <button type="button" onClick={() => setEditingGift(null)} className="flex-1 py-4 text-stone-400 font-bold uppercase text-[10px] tracking-widest hover:bg-stone-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-[#354F52] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Stories (LIMPO) */}
      {showStoryArt && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-[#232323]/95 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
          
          <div className="relative w-full max-w-[380px] h-full max-h-[85vh] flex flex-col">
             
             {/* O Preview do Story - Proporção 9:16 */}
             <div className="flex-grow overflow-hidden relative rounded-[2rem] shadow-2xl bg-black">
               <div 
                  id="story-art-content" 
                  className="w-full h-full bg-[#FDFCF8] flex flex-col items-center text-center relative overflow-hidden"
               >
                  {/* Elementos Decorativos de Fundo */}
                  <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#52796F]/10 rounded-full blur-[80px]"></div>
                  <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[40%] bg-[#B07D62]/10 rounded-full blur-[80px]"></div>
                  
                  {/* Moldura */}
                  <div className="absolute inset-4 border border-[#B07D62]/20 rounded-[1.5rem] pointer-events-none z-20"></div>

                  <div className="relative z-10 flex flex-col h-full w-full p-8 pt-12 pb-12 justify-center">
                    <div className="mb-6 opacity-80">
                      <IconSparkles className="w-10 h-10 text-[#B07D62] mx-auto animate-pulse" />
                    </div>

                    <h2 className="text-5xl font-cursive text-[#354F52] leading-tight mb-2">Emily &<br/>Gustavo</h2>
                    <p className="text-[#B07D62] font-black uppercase tracking-[0.3em] text-[10px] mb-12">Chá de Casa Nova</p>
                    
                    {/* Contador Principal - Mais destacado */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-xl border border-[#84A98C]/10 rounded-[2.5rem] p-8 w-full relative transform scale-110">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#354F52] text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-md">
                        Contagem Regressiva
                      </div>
                      <p className="text-[6rem] font-bold text-[#354F52] tracking-tighter leading-none mt-2">{daysLeft}</p>
                      <p className="text-xs font-black text-[#84A98C] uppercase tracking-[0.4em] mt-1">Dias</p>
                    </div>
                  </div>
               </div>
             </div>

             {/* Botões de Ação */}
             <div className="mt-6 flex gap-3 w-full">
               <button 
                  onClick={() => setShowStoryArt(false)} 
                  className="flex-1 py-4 bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all border border-white/10"
               >
                 Voltar
               </button>
               <button 
                  onClick={handleDownloadImage}
                  disabled={isGeneratingImage}
                  className="flex-[2] py-4 bg-[#B07D62] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {isGeneratingImage ? (
                   <>Salvando...</>
                 ) : (
                   <>
                     <IconCheck className="w-4 h-4" />
                     Baixar Imagem
                   </>
                 )}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;