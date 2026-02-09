
import React, { useState, useMemo } from 'react';
import { Gift } from '../types';
import { EVENT_DATE } from '../constants';
import { IconSparkles, IconHeart, IconCheck, IconGift, IconEye, IconArrowRight, IconUser, IconShoppingCart } from './Icons';

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
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await window.html2canvas(element, {
        scale: 2,
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
      alert("Não foi possível gerar a imagem automaticamente.");
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
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B07D62]">Área Administrativa</span>
         </div>
         <h2 className="text-3xl md:text-5xl font-cursive text-[#354F52] mb-2">Olá, Emily!</h2>
         <p className="text-[#52796F] text-xs md:text-base max-w-lg mx-auto md:mx-0">
           Aqui você controla os detalhes do Chá de Casa Nova.
         </p>
      </div>

      {/* Cards de Resumo */}
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
                onClick={() => window.innerWidth < 768 && setEditingGift(gift)}
                className={`
                  group relative flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border 
                  bg-stone-50/30 transition-all cursor-pointer md:cursor-default
                  /* Mobile: Active State */
                  active:bg-stone-100 active:scale-[0.99]
                  /* Desktop: Hover */
                  md:hover:border-[#52796F]/10 md:hover:bg-[#F8F7F2]/50
                  ${gift.status === 'reserved' ? 'border-green-100 bg-green-50/30' : 'border-transparent'}
                `}
              >
                {/* 1. Área Principal: Imagem + Texto (Ocupa o espaço disponível) */}
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white p-1 shadow-sm flex-shrink-0">
                    <img src={gift.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                  </div>

                  <div className="min-w-0 pr-6 md:pr-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-[#354F52] text-sm truncate">{gift.name}</p>
                      {gift.status === 'reserved' && (
                        <span className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0 md:hidden">
                          Ganho
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#84A98C]">
                      {gift.category} • R$ {gift.priceEstimate.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* 2. Área Lateral (Badge de Quem Presenteou + Botões) */}
                {/* No mobile, isso fica embaixo da foto. No desktop, fica à direita. */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                  
                  {/* Badge de "Quem Presenteou" */}
                  {gift.reservedBy && (
                    <div className="md:ml-auto w-full md:w-auto">
                       <div className="bg-[#B07D62]/10 px-3 py-2 rounded-lg border border-[#B07D62]/20 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#B07D62] text-white flex items-center justify-center flex-shrink-0">
                           <IconUser className="w-4 h-4" />
                         </div>
                         <div className="min-w-0 flex-1">
                           <span className="text-[8px] text-[#B07D62] font-black uppercase tracking-widest block leading-tight">Presenteado por</span>
                           <span className="text-sm font-bold text-[#354F52] truncate block">{gift.reservedBy}</span>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação (Desktop Only - Alinhados à Direita) */}
                  <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-4">
                     {gift.shopeeUrl && (
                       <a 
                         href={gift.shopeeUrl} 
                         target="_blank" 
                         rel="noreferrer"
                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-stone-400 hover:text-[#B07D62] hover:shadow-md border border-stone-100 transition-all"
                         title="Ver na Loja"
                       >
                         <IconEye className="w-4 h-4" />
                       </a>
                     )}
                     <button 
                       onClick={(e) => { e.stopPropagation(); setEditingGift(gift); }}
                       className="h-10 px-6 bg-[#354F52] text-white border border-[#354F52]/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2A3F41] active:scale-95 transition-all shadow-md flex items-center gap-2"
                     >
                       Editar
                     </button>
                  </div>
                </div>

                {/* Indicador Mobile (Seta) - Absolute para garantir posição */}
                <div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-stone-300">
                  <IconArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Edição - Layout Melhorado */}
      {editingGift && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center md:p-6 bg-[#354F52]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="
            bg-white w-full max-w-lg shadow-2xl border-t md:border border-white/20
            h-[85vh] md:h-auto md:max-h-[90vh] 
            rounded-t-[2.5rem] md:rounded-[2.5rem] 
            p-6 md:p-10 
            flex flex-col
            animate-in slide-in-from-bottom duration-500 md:zoom-in-95
          ">
            
            {/* Drag Handle Mobile */}
            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6 md:hidden flex-shrink-0"></div>

            <div className="flex-shrink-0 mb-6">
              <h4 className="text-2xl font-cursive text-[#354F52] flex items-center gap-3">
                <span className="w-12 h-12 bg-[#B07D62]/10 rounded-full flex items-center justify-center text-[#B07D62]">
                  <IconGift className="w-6 h-6" />
                </span>
                Editar Detalhes
              </h4>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex-grow overflow-y-auto space-y-5 pr-1 md:pr-0 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#52796F] uppercase tracking-widest ml-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={editingGift.name} 
                  onChange={e => setEditingGift({...editingGift, name: e.target.value})} 
                  className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border border-stone-200 focus:border-[#B07D62] focus:bg-white outline-none font-bold text-stone-700 transition-all text-sm" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#52796F] uppercase tracking-widest ml-1">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editingGift.priceEstimate} 
                      onChange={e => setEditingGift({...editingGift, priceEstimate: parseFloat(e.target.value)})} 
                      className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border border-stone-200 focus:border-[#B07D62] focus:bg-white outline-none font-bold text-stone-700 transition-all text-sm" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#52796F] uppercase tracking-widest ml-1">Categoria</label>
                    <input 
                      type="text" 
                      value={editingGift.category} 
                      onChange={e => setEditingGift({...editingGift, category: e.target.value})} 
                      className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border border-stone-200 focus:border-[#B07D62] focus:bg-white outline-none font-bold text-stone-700 transition-all text-sm" 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#52796F] uppercase tracking-widest ml-1">Link da Shopee/Loja</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <IconShoppingCart className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={editingGift.shopeeUrl} 
                    onChange={e => setEditingGift({...editingGift, shopeeUrl: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3.5 bg-stone-50 rounded-xl border border-stone-200 focus:border-[#B07D62] focus:bg-white outline-none text-sm text-stone-600 transition-all truncate" 
                    placeholder="Cole o link aqui..."
                  />
                </div>
              </div>
            </form>

            <div className="flex-shrink-0 pt-6 mt-4 border-t border-stone-100 flex gap-3">
              <button type="button" onClick={() => setEditingGift(null)} className="flex-1 py-4 text-stone-400 font-bold uppercase text-[10px] tracking-widest hover:bg-stone-50 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleSaveEdit} className="flex-[2] py-4 bg-[#354F52] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all hover:bg-[#2A3F41]">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Stories */}
      {showStoryArt && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-[#232323]/95 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
          
          <div className="relative w-full max-w-[380px] h-full max-h-[85vh] flex flex-col">
             
             {/* O Preview do Story */}
             <div className="flex-grow overflow-hidden relative rounded-[2rem] shadow-2xl bg-black">
               <div 
                  id="story-art-content" 
                  className="w-full h-full bg-[#FDFCF8] flex flex-col items-center text-center relative overflow-hidden"
               >
                  <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#52796F]/10 rounded-full blur-[80px]"></div>
                  <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[40%] bg-[#B07D62]/10 rounded-full blur-[80px]"></div>
                  
                  <div className="absolute inset-4 border border-[#B07D62]/20 rounded-[1.5rem] pointer-events-none z-20"></div>

                  <div className="relative z-10 flex flex-col h-full w-full p-8 pt-12 pb-12 justify-center">
                    <div className="mb-6 opacity-80">
                      <IconSparkles className="w-10 h-10 text-[#B07D62] mx-auto animate-pulse" />
                    </div>

                    <h2 className="text-5xl font-cursive text-[#354F52] leading-tight mb-2">Emily &<br/>Gustavo</h2>
                    <p className="text-[#B07D62] font-black uppercase tracking-[0.3em] text-[10px] mb-12">Chá de Casa Nova</p>
                    
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
                 {isGeneratingImage ? 'Salvando...' : 'Baixar Imagem'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
