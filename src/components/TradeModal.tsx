import { useState } from 'react';
import { ArrowRightLeft, X, Search } from 'lucide-react';
import { TEAMS_DATA } from '../data/stickers';
import type { CollectionState } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrade: (trade: { stickerOutId: string; stickerInId: string; partnerName: string }) => void;
  collection: CollectionState;
}

export function TradeModal({ isOpen, onClose, onTrade, collection }: TradeModalProps) {
  const [partnerName, setPartnerName] = useState('');
  const [stickerOutId, setStickerOutId] = useState('');
  const [stickerInId, setStickerInId] = useState('');
  const [searchOut, setSearchOut] = useState('');
  const [searchIn, setSearchIn] = useState('');

  if (!isOpen) return null;

  // Filtrar figurinhas repetidas para "Eu dou"
  const duplicates = TEAMS_DATA.flatMap(t => t.stickers).filter(s => (collection[s.id] || 0) > 1);
  
  // Filtrar todas para "Eu recebo"
  const allStickers = TEAMS_DATA.flatMap(t => t.stickers);

  const filteredOut = duplicates.filter(s => 
    s.id.toLowerCase().includes(searchOut.toLowerCase()) || 
    s.name.toLowerCase().includes(searchOut.toLowerCase())
  ).slice(0, 10);

  const filteredIn = allStickers.filter(s => 
    s.id.toLowerCase().includes(searchIn.toLowerCase()) || 
    s.name.toLowerCase().includes(searchIn.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-black flex items-center gap-2">
            <ArrowRightLeft className="text-cup-blue" /> NOVA TROCA
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Nome do Parceiro */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Com quem você trocou?
            </label>
            <input 
              type="text"
              placeholder="Nome do amigo (opcional)"
              className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-cup-blue outline-none"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eu Dou */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                Eu Dou (Minhas Repetidas)
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="ID ou Nome..."
                  className="w-full bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                  value={searchOut}
                  onChange={(e) => setSearchOut(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                {filteredOut.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setStickerOutId(s.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg text-[10px] font-bold transition-colors",
                      stickerOutId === s.id ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    {s.id} - {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Eu Recebo */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-cup-green uppercase tracking-widest flex items-center gap-2">
                Eu Recebo
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="ID ou Nome..."
                  className="w-full bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-cup-green outline-none"
                  value={searchIn}
                  onChange={(e) => setSearchIn(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                {filteredIn.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setStickerInId(s.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg text-[10px] font-bold transition-colors",
                      stickerInId === s.id ? "bg-cup-green text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    {s.id} - {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800">
          <button 
            disabled={!stickerOutId && !stickerInId}
            onClick={() => {
              onTrade({ stickerOutId, stickerInId, partnerName });
              onClose();
              setStickerOutId('');
              setStickerInId('');
              setPartnerName('');
            }}
            className="w-full bg-cup-blue hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-cup-blue text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-cup-blue/20"
          >
            CONFIRMAR TROCA
          </button>
        </div>
      </div>
    </div>
  );
}
