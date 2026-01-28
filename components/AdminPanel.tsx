import React, { useState } from 'react';
import { Gift } from '../types';
import { EVENT_DATE } from '../constants';
import { IconSparkles, IconHeart, IconCheck, IconGift, IconShoppingCart } from './Icons';

interface AdminPanelProps {
  gifts: Gift[];
  onReset: () => void;
  onUpdateGift: (id: string, updates: Partial<Gift>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ gifts, onUpdateGift }) => {
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [showStoryArt, setShowStoryArt] = useState(false);

  const confirmedNames: string[] = Array.from(new Set(
    gifts
      .filter((g): g is Gift & { reservedBy: string } => g.status === 'reserved' && !!g.reservedBy)
      .map(g => String(g.reservedBy))
  ));

  const totalGifts = gifts.length;
  const reservedGifts = gifts.filter(g => g.status === 'reserved').length;
  const totalValue = gifts.reduce((acc, g) => acc + (g.priceEstimate || 0), 0);
  const reservedValue = gifts.filter(g => g.status === 'reserved').reduce((acc, g) => acc + (g.priceEstimate || 0), 0);

  const daysLeft = Math.max(0, Math.ceil((+EVENT_DATE - +new Date()) / (1000 * 60 * 60 * 24)));

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGift) {
      onUpdateGift(editingGift.id, editingGift);
      setEditingGift(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-top duration-700">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: 'Itens Totais', value: totalGifts, icon: <IconGift className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Reservados', value: `${reservedGifts}`, subValue: `${Math.round((reservedGifts/totalGifts || 0)*100)}%`, icon: <IconCheck className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
          { label: 'Valor Sugerido', value: `R$ ${totalValue.toLocaleString()}`, icon: <IconShoppingCart className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
          { label: 'Reservado', value: `R$ ${reservedValue.toLocaleString()}`, icon: <IconHeart className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl md:text-2xl font-bold text-[#354F52] truncate">{stat.value}</p>
              {stat.subValue && <span className="text-[10px] font-bold text-green-500">{stat.subValue}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => setShowStoryArt(true)}
          className="bg-[#B07D62] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-[#966b54] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <IconSparkles className="w-5 h-5" />
          Gerar Arte p/ Stories
        </button>
      </div>

      <div className="bg-white rounded-[3rem] p-6 md:p-12 shadow-xl border border-stone-100 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
          <h3 className="text-2xl font-bold text-[#354F52]">Gerenciamento de Itens</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#84A98C] bg-[#84A98C]/10 px-5 py-2.5 rounded-full inline-block">Planilha Sincronizada</span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 no-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="pb-8 text-[11px] uppercase font-black text-stone-400 tracking-widest">Produto</th>
                <th className="pb-8 text-[11px] uppercase font-black text-stone-400 tracking-widest">Status / Convidado</th>
                <th className="pb-8 text-[11px] uppercase font-black text-stone-400 tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {gifts.map(gift => (
                <tr key={gift.id} className="group hover:bg-stone-50/50 transition-colors">
                  <td className="py-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex-shrink-0">
                      <img src={gift.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-[#354F52] text-base leading-tight mb-1">{gift.name}</p>
                      <p className="text-[11px] font-black text-[#B07D62]">Sugerido: R$ {gift.priceEstimate.toFixed(2)}</p>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${
                      gift.status === 'reserved' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                      {gift.status === 'reserved' ? (gift.reservedBy || 'Reservado') : 'Disponível'}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <button 
                      onClick={() => setEditingGift(gift)} 
                      className="bg-stone-100 text-[#354F52] px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-[#354F52] hover:text-white transition-all active:scale-95"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingGift && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#354F52]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 max-w-2xl w-full shadow-2xl border border-white animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h4 className="text-3xl font-bold text-[#354F52] mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#B07D62]/10 rounded-2xl flex items-center justify-center text-[#B07D62]">
                <IconGift className="w-6 h-6" />
              </div>
              Editar Presente
            </h4>
            <form onSubmit={handleSaveEdit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                <input type="text" value={editingGift.name} onChange={e => setEditingGift({...editingGift, name: e.target.value})} className="w-full p-5 bg-stone-50 rounded-2xl border-2 border-transparent focus:border-[#B07D62]/20 outline-none font-bold text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1">Link da Loja</label>
                <input type="text" value={editingGift.shopeeUrl} onChange={e => setEditingGift({...editingGift, shopeeUrl: e.target.value})} className="w-full p-5 bg-stone-50 rounded-2xl border-2 border-transparent focus:border-[#B07D62]/20 outline-none font-medium text-stone-500" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingGift(null)} className="flex-1 py-5 text-stone-400 font-bold uppercase text-[11px] tracking-widest hover:text-stone-600 transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-5 bg-[#354F52] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStoryArt && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-[#354F52]/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-500 no-scrollbar">
          <div className="max-w-sm w-full">
             {/* Story Art Container */}
             <div className="relative group mx-auto mb-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-[3rem]">
               <div id="story-art" className="relative aspect-[9/16] w-full bg-[#FDFCF8] rounded-[3rem] overflow-hidden p-10 flex flex-col items-center text-center border-[12px] border-white/20">
                  <div className="mt-12 mb-8 text-[#B07D62] opacity-30">
                    <IconHeart className="w-16 h-16" />
                  </div>
                  <h2 className="text-5xl md:text-6xl font-cursive text-[#354F52] mb-2 leading-tight">Emily & Gustavo</h2>
                  <p className="text-[#B07D62] font-black uppercase tracking-[0.4em] text-[11px] mb-14">Chá de Casa Nova</p>
                  
                  <div className="bg-white shadow-2xl border border-[#84A98C]/10 rounded-[2.5rem] p-10 w-full mb-12 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#84A98C] text-white px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Faltam</div>
                    <p className="text-8xl font-bold text-[#354F52] tracking-tighter leading-none">{daysLeft}</p>
                    <p className="text-xs font-black text-[#B07D62] uppercase tracking-[0.3em] mt-3">Dias</p>
                  </div>

                  <div className="w-full flex-grow flex flex-col overflow-hidden">
                    <p className="text-[10px] font-black text-[#84A98C] uppercase tracking-[0.3em] mb-6 border-b border-[#84A98C]/10 pb-4 italic">Confirmados ✨</p>
                    <div className="grid grid-cols-2 gap-3 opacity-95">
                      {confirmedNames.slice(0, 10).map((name, i) => (
                        <div key={i} className="bg-white py-2.5 px-4 rounded-xl border border-[#84A98C]/5 shadow-sm flex items-center gap-2 overflow-hidden">
                          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
                          <span className="text-[11px] font-bold text-[#354F52] truncate">{(name as string).split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-auto pt-10 text-[11px] font-black text-[#B07D62]/40 uppercase tracking-[0.6em]">15 . FEV . 2026</p>
               </div>
             </div>

             <div className="flex gap-4 mb-10">
               <button onClick={() => setShowStoryArt(false)} className="flex-1 py-5 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all border border-white/10">Voltar</button>
               <button onClick={handlePrint} className="flex-2 py-5 bg-[#B07D62] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                 <IconCheck className="w-4 h-4" />
                 Salvar / Print
               </button>
             </div>
          </div>
          
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #story-art, #story-art * { visibility: visible !important; }
              #story-art { 
                position: fixed !important; 
                left: 50% !important; 
                top: 50% !important; 
                transform: translate(-50%, -50%) !important;
                width: 100vw !important; 
                height: 100vh !important;
                margin: 0 !important; 
                padding: 4rem !important;
                border: none !important;
                border-radius: 0 !important;
                z-index: 9999 !important;
                background: #FDFCF8 !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;