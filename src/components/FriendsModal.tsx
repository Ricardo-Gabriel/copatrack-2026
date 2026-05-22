import { useState } from 'react';
import { X, Search, UserPlus, Check, User, Loader2, ArrowRight } from 'lucide-react';
import type { Profile, Friendship } from '../types';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friendship[];
  pendingRequests: Friendship[];
  onSearch: (query: string) => Promise<Profile[]>;
  onSendRequest: (id: string) => Promise<void>;
  onAcceptRequest: (id: string) => Promise<void>;
  onViewFriendCollection: (friend: Profile) => void;
}

export function FriendsModal({ 
  isOpen, onClose, friends, pendingRequests, 
  onSearch, onSendRequest, onAcceptRequest, onViewFriendCollection 
}: FriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await onSearch(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSendRequest = async (id: string) => {
    setLoadingId(id);
    try {
      await onSendRequest(id);
      setSearchResults(prev => prev.filter(u => u.id !== id));
      alert('Pedido enviado!');
    } catch (e) {
      alert('Erro ao enviar pedido.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    setLoadingId(id);
    try {
      await onAcceptRequest(id);
    } catch (e) {
      alert('Erro ao aceitar pedido.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <User className="text-cup-green" /> Amigos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Busca */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cup-green outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-cup-green animate-spin" size={18} />}
          </form>

          {/* Resultados da Busca */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resultados</h3>
              <div className="space-y-2">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="text-sm font-bold">{user.username}</div>
                    </div>
                    <button 
                      onClick={() => handleSendRequest(user.id)}
                      disabled={loadingId === user.id}
                      className="p-2 bg-cup-green/20 text-cup-green hover:bg-cup-green hover:text-white rounded-lg transition-all disabled:opacity-50"
                    >
                      {loadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pedidos Pendentes */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-cup-yellow uppercase tracking-widest">Pedidos Recebidos</h3>
              <div className="space-y-2">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-cup-yellow/5 p-3 rounded-xl border border-cup-yellow/20">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">{req.friend_profile?.username}</div>
                    </div>
                    <button 
                      onClick={() => handleAcceptRequest(req.id)}
                      disabled={loadingId === req.id}
                      className="px-3 py-1.5 bg-cup-green text-white text-xs font-bold rounded-lg flex items-center gap-2"
                    >
                      {loadingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} ACEITAR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Amigos */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meus Amigos</h3>
            {friends.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm italic">
                Você ainda não adicionou amigos.
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cup-blue/20 text-cup-blue rounded-full flex items-center justify-center font-bold">
                        {friend.friend_profile?.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{friend.friend_profile?.username}</div>
                        <div className="text-[10px] text-slate-500">{friend.friend_profile?.email}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => friend.friend_profile && onViewFriendCollection(friend.friend_profile)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors group"
                      title="Ver Álbum"
                    >
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
