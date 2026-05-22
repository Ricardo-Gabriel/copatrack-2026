import { useState } from 'react';
import { X, Search, UserPlus, Check, User, Loader2, ArrowRight, Trash2, Share2, Copy, CheckCircle2, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Profile, Friendship } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friendship[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  onSearch: (query: string) => Promise<Profile[]>;
  onSendRequest: (id: string) => Promise<void>;
  onAcceptRequest: (id: string) => Promise<void>;
  onDeclineRequest: (id: string) => Promise<void>;
  onRemoveFriend: (id: string) => Promise<void>;
  onViewFriendCollection: (friend: Profile) => void;
  isInline?: boolean;
}

export function FriendsModal({ 
  isOpen, onClose, friends, pendingRequests, sentRequests,
  onSearch, onSendRequest, onAcceptRequest, onDeclineRequest, onRemoveFriend, onViewFriendCollection,
  isInline = false
}: FriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen && !isInline) return null;

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

  const handleDeclineRequest = async (id: string) => {
    if (!confirm('Deseja recusar este pedido de amizade?')) return;
    setLoadingId(id);
    try {
      await onDeclineRequest(id);
    } catch (e) {
      alert('Erro ao recusar pedido.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm('Deseja remover este amigo?')) return;
    setLoadingId(friendshipId);
    try {
      await onRemoveFriend(friendshipId);
    } catch (e) {
      alert('Erro ao remover amigo.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFriendshipStatus = (userId: string) => {
    if (friends.some(f => f.friend_profile?.id === userId)) return 'friend';
    if (sentRequests.some(f => f.receiver_id === userId)) return 'sent';
    if (pendingRequests.some(f => f.sender_id === userId)) return 'received';
    return 'none';
  };

  const content = (
    <div className={cn(
      "bg-slate-900 border border-slate-800 w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col",
      isInline ? "" : "max-w-md max-h-[90vh]"
    )}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 text-white">
          <User className="text-cup-green" /> Amigos
        </h2>
        {!isInline && (
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        )}
      </div>

      <div className={cn(
        "flex-1 overflow-y-auto p-6 space-y-8",
        isInline ? "min-h-[400px]" : ""
      )}>
        {/* Convite Rápido */}
        <div className="bg-gradient-to-br from-cup-blue/20 to-cup-green/20 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-cup-green" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Convidar Amigos</h3>
          </div>
          <p className="text-xs text-slate-400">Compartilhe o link do CopaTrack com seus amigos para trocarem figurinhas!</p>
          <button 
            onClick={handleCopyLink}
            className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-white"
          >
            {copied ? (
              <>
                <CheckCircle2 size={14} className="text-cup-green" /> LINK COPIADO!
              </>
            ) : (
              <>
                <Copy size={14} /> COPIAR LINK DO APP
              </>
            )}
          </button>
        </div>

        {/* Busca */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Search size={12} /> Buscar Usuários
          </h3>
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              placeholder="Nome ou e-mail..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-cup-green outline-none text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cup-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>

          {/* Resultados da Busca */}
          {searchResults.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {searchResults.map(user => {
                const status = getFriendshipStatus(user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="text-sm font-bold text-white">{user.username}</div>
                    </div>
                    
                    {status === 'friend' ? (
                      <div className="px-3 py-1 bg-cup-green/10 text-cup-green text-[10px] font-black rounded-full border border-cup-green/20">AMIGO</div>
                    ) : status === 'sent' ? (
                      <div className="px-3 py-1 bg-cup-yellow/10 text-cup-yellow text-[10px] font-black rounded-full border border-cup-yellow/20">PENDENTE</div>
                    ) : status === 'received' ? (
                      <div className="px-3 py-1 bg-cup-blue/10 text-cup-blue text-[10px] font-black rounded-full border border-cup-blue/20">RECEBIDO</div>
                    ) : (
                      <button 
                        onClick={() => handleSendRequest(user.id)}
                        disabled={loadingId === user.id}
                        className="p-2 bg-cup-green text-white hover:bg-green-600 rounded-lg transition-all disabled:opacity-50"
                      >
                        {loadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pedidos Pendentes */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-cup-yellow uppercase tracking-widest flex items-center gap-2">
              <Bell size={12} /> Pedidos Recebidos
            </h3>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between bg-cup-yellow/5 p-3 rounded-xl border border-cup-yellow/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cup-yellow/20 text-cup-yellow rounded-full flex items-center justify-center text-xs font-black">
                      {req.friend_profile?.username[0].toUpperCase()}
                    </div>
                    <div className="text-sm font-bold text-white">{req.friend_profile?.username}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeclineRequest(req.id)}
                      disabled={loadingId === req.id}
                      className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                      title="Recusar"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={() => handleAcceptRequest(req.id)}
                      disabled={loadingId === req.id}
                      className="px-3 py-1.5 bg-cup-green text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all"
                    >
                      {loadingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} ACEITAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Amigos */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meus Amigos ({friends.length})</h3>
          {friends.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm italic">
              Você ainda não adicionou amigos.
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cup-blue/20 text-cup-blue rounded-full flex items-center justify-center font-bold">
                      {friend.friend_profile?.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{friend.friend_profile?.username}</div>
                      <div className="text-[10px] text-slate-500">{friend.friend_profile?.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleRemoveFriend(friend.id)}
                      disabled={loadingId === friend.id}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remover Amigo"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => friend.friend_profile && onViewFriendCollection(friend.friend_profile)}
                      className="p-2 bg-slate-800 hover:bg-cup-blue text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                    >
                      <span className="hidden sm:inline">VER ÁLBUM</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CopaTrack Social &copy; 2026</p>
      </div>
    </div>
  );

  if (isInline) return content;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      {content}
    </div>
  );
}
