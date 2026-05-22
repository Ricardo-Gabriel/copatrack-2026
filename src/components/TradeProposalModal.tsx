import { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Loader2, Send } from 'lucide-react';
import type { CollectionState, Profile } from '../types';

interface TradeProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Profile;
  myCollection: CollectionState;
  friendCollection: CollectionState;
  onSendProposal: (offered: string[], requested: string[]) => Promise<void>;
}

export function TradeProposalModal({ 
  isOpen, onClose, friend, myCollection, friendCollection, onSendProposal 
}: TradeProposalModalProps) {
  const [offered, setOffered] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // Filtrar figurinhas que eu tenho repetidas E que o amigo NÃO tem
  const myDuplicates = useMemo(() => {
    return Object.entries(myCollection)
      .filter(([id, qty]) => qty > 1 && (!friendCollection[id] || friendCollection[id] === 0))
      .map(([id]) => id);
  }, [myCollection, friendCollection]);

  // Filtrar figurinhas que o amigo tem REPETIDAS E que eu NÃO tenho
  const friendDuplicates = useMemo(() => {
    return Object.entries(friendCollection)
      .filter(([id, qty]) => qty > 1 && (!myCollection[id] || myCollection[id] === 0))
      .map(([id]) => id);
  }, [friendCollection, myCollection]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (offered.length === 0 || requested.length === 0) {
      alert('Selecione ao menos uma figurinha de cada lado.');
      return;
    }
    if (offered.length !== requested.length) {
      alert(`Troca desbalanceada! Você está oferecendo ${offered.length} e pedindo ${requested.length}. As trocas devem ser de quantidades iguais (ex: 1 por 1).`);
      return;
    }
    setSending(true);
    try {
      await onSendProposal(offered, requested);
      alert('Proposta enviada!');
      onClose();
    } catch (e) {
      alert('Erro ao enviar proposta.');
    } finally {
      setSending(false);
    }
  };

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const isValid = offered.length > 0 && offered.length === requested.length;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 text-white">
            <ArrowRightLeft className="text-cup-blue" /> Propor Troca Justa
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="bg-cup-blue/10 p-3 text-center border-b border-cup-blue/20">
          <p className="text-[10px] font-bold text-cup-blue uppercase tracking-widest">
            Regra: Quantidades iguais e apenas figurinhas repetidas
          </p>
        </div>

        <div className="p-6 overflow-y-auto grid md:grid-cols-2 gap-6">
          {/* O que eu ofereço */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Eu Ofereço ({offered.length})</h3>
              <span className="text-[10px] text-cup-green font-bold">Repetidas que ele não tem</span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {myDuplicates.map(id => (
                <button 
                  key={id}
                  onClick={() => toggleSelection(id, offered, setOffered)}
                  className={`aspect-[3/4] rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    offered.includes(id) ? 'bg-cup-green border-white text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {id}
                </button>
              ))}
              {myDuplicates.length === 0 && (
                <div className="col-span-4 py-8 text-center text-slate-600 text-xs italic">Você não tem repetidas para oferecer.</div>
              )}
            </div>
          </div>

          {/* O que eu peço */}
          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Eu Peço ({requested.length})</h3>
              <span className="text-[10px] text-cup-blue font-bold">Repetidas que eu não tenho</span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {friendDuplicates.map(id => (
                <button 
                  key={id}
                  onClick={() => toggleSelection(id, requested, setRequested)}
                  className={`aspect-[3/4] rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    requested.includes(id) ? 'bg-cup-blue border-white text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {id}
                </button>
              ))}
              {friendDuplicates.length === 0 && (
                <div className="col-span-4 py-8 text-center text-slate-600 text-xs italic">Seu amigo não tem repetidas disponíveis.</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 text-sm text-slate-400">
            {offered.length > 0 || requested.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className={offered.length === requested.length ? "text-cup-green font-bold" : "text-red-400 font-bold"}>
                  {offered.length} OFERECIDAS
                </span>
                <ArrowRightLeft size={12} />
                <span className={offered.length === requested.length ? "text-cup-green font-bold" : "text-red-400 font-bold"}>
                  {requested.length} PEDIDAS
                </span>
              </div>
            ) : 'Selecione quantidades iguais de repetidas.'}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={sending || !isValid}
            className="w-full md:w-auto px-8 py-4 bg-cup-green hover:bg-green-600 disabled:opacity-50 disabled:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
          >
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} ENVIAR PROPOSTA
          </button>
        </div>
      </div>
    </div>
  );
}
