import { X, Check, Ban, ArrowRightLeft, Loader2 } from 'lucide-react';
import type { TradeProposal } from '../types';

interface ProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: TradeProposal[];
  onAction: (id: string, action: 'accepted' | 'declined') => Promise<void>;
}

export function ProposalsModal({ isOpen, onClose, proposals, onAction }: ProposalsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <ArrowRightLeft className="text-cup-yellow" /> Propostas de Troca
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {proposals.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic text-sm">
              Nenhuma proposta recebida no momento.
            </div>
          ) : (
            proposals.map(prop => (
              <div key={prop.id} className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cup-yellow/20 text-cup-yellow rounded-full flex items-center justify-center font-bold text-xs">
                    {prop.sender_profile?.username[0].toUpperCase()}
                  </div>
                  <div className="text-sm font-bold">Troca de {prop.sender_profile?.username}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded-xl">
                  <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Ele Oferece</div>
                    <div className="flex flex-wrap gap-1">
                      {prop.stickers_offered.map(id => (
                        <span key={id} className="bg-cup-green/20 text-cup-green text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Ele Pede</div>
                    <div className="flex flex-wrap gap-1">
                      {prop.stickers_requested.map(id => (
                        <span key={id} className="bg-cup-blue/20 text-cup-blue text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onAction(prop.id, 'accepted')}
                    className="flex-1 bg-cup-green text-white py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> ACEITAR
                  </button>
                  <button 
                    onClick={() => onAction(prop.id, 'declined')}
                    className="flex-1 bg-slate-800 text-red-500 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <Ban size={14} /> RECUSAR
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
