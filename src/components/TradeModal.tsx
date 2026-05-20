import { useState } from 'react';
import { ArrowRightLeft, X, Search, Check } from 'lucide-react';
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
  onTrade: (trade: { stickersOut: string[]; stickersIn: string[]; partnerName: string }) => void;
  collection: CollectionState;
}

export function TradeModal({ isOpen, onClose, onTrade, collection }: TradeModalProps) {
  const [partnerName, setPartnerName] = useState('');
  const [stickersOut, setStickersOut] = useState<string[]>([]);
  const [stickersIn, setStickersIn] = useState<string[]>([]);
  const [searchOut, setSearchOut] = useState('');
  const [searchIn, setSearchIn] = useState('');

  if (!isOpen) return null;

  // Filtrar figurinhas repetidas para "Eu dou"
  const duplicates = TEAMS_DATA.flatMap(t => t.stickers)
    .filter(s => (collection[s.id] || 0) > 1);
  
  // Filtrar figurinhas que faltam para "Eu recebo"
  const missing = TEAMS_DATA.flatMap(t => t.stickers)
    .filter(s => (collection[s.id] || 0) === 0);

  const filteredOut = duplicates.filter(s => 
    s.id.toLowerCase().includes(searchOut.toLowerCase()) || 
    s.name.toLowerCase().includes(searchOut.toLowerCase())
  ).slice(0, 20);

  const filteredIn = missing.filter(s => 
    s.id.toLowerCase().includes(searchIn.toLowerCase()) || 
    s.name.toLowerCase().includes(searchIn.toLowerCase())
  ).slice(0, 20);

  const toggleSelect = (id: string, list: string[], setList: (ids: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-black flex items-center gap-2">
            <ArrowRightLeft className="text-cup-blue" /> REGISTRAR TROCA MÚLTIPLA
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
              <label className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center justify-between">
                Eu Dou ({stickersOut.length} selecionadas)
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="ID ou Nome das repetidas..."
                  className="w-full bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                  value={searchOut}
                  onChange={(e) => setSearchOut(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {filteredOut.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => toggleSelect(s.id, stickersOut, setStickersOut)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl text-[11px] font-bold transition-all flex justify-between items-center",
                      stickersOut.includes(s.id) 
                        ? "bg-red-500/20 border-red-500 text-red-500 border-2" 
                        : "bg-slate-800 text-slate-400 border-2 border-transparent hover:bg-slate-700"
                    )}
                  >
                    <div>
                      <span className="opacity-50 mr-2">{s.id}</span>
                      {s.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[9px]">+{collection[s.id] - 1}</span>
                      {stickersOut.includes(s.id) && <Check size={14} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Eu Recebo */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-cup-green uppercase tracking-widest flex items-center justify-between">
                Eu Recebo ({stickersIn.length} selecionadas)
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="ID ou Nome das que faltam..."
                  className="w-full bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-cup-green outline-none"
                  value={searchIn}
                  onChange={(e) => setSearchIn(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {filteredIn.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => toggleSelect(s.id, stickersIn, setStickersIn)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl text-[11px] font-bold transition-all flex justify-between items-center",
                      stickersIn.includes(s.id) 
                        ? "bg-cup-green/20 border-cup-green text-cup-green border-2" 
                        : "bg-slate-800 text-slate-400 border-2 border-transparent hover:bg-slate-700"
                    )}
                  >
                    <div>
                      <span className="opacity-50 mr-2">{s.id}</span>
                      {s.name}
                    </div>
                    {stickersIn.includes(s.id) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800">
          <button 
            disabled={stickersOut.length === 0 && stickersIn.length === 0}
            onClick={() => {
              onTrade({ stickersOut, stickersIn, partnerName });
              onClose();
              setStickersOut([]);
              setStickersIn([]);
              setPartnerName('');
            }}
            className="w-full bg-cup-blue hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-cup-blue text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-cup-blue/20 flex items-center justify-center gap-2"
          >
            CONFIRMAR TROCA DE {stickersOut.length + stickersIn.length} FIGURINHAS
          </button>
        </div>
      </div>
    </div>
  );
}
