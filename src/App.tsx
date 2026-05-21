import { useCollection } from './hooks/useCollection';
import { TEAMS_DATA } from './data/stickers';
import { StickerCard } from './components/StickerCard';
import { TradeModal } from './components/TradeModal';
import { TeamEditorModal } from './components/TeamEditorModal';
import { AuthModal } from './components/AuthModal';
import { SummaryTable } from './components/SummaryTable';
import { FLAG_IMAGES } from './data/flags';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  Trophy, Search, Share2, LayoutGrid, Copy, Ban, 
  History as HistoryIcon, X, ArrowRightLeft, Palette, 
  User as UserIcon, LogOut, Table as TableIcon 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Team } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewMode = 'all' | 'missing' | 'duplicates' | 'history' | 'summary';

function App() {
  const { collection, history, teamsMetadata, user, updateSticker, executeTrade, updateTeamMetadata } = useCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const stats = useMemo(() => {
    const totalStickers = TEAMS_DATA.reduce((acc, team) => acc + team.stickers.length, 0);
    const ownedUnique = Object.keys(collection).length;
    const totalRepeated = Object.values(collection).reduce((acc, qty) => acc + (qty > 1 ? qty - 1 : 0), 0);
    const percentage = ((ownedUnique / totalStickers) * 100).toFixed(1);

    return { totalStickers, ownedUnique, totalRepeated, percentage };
  }, [collection]);

  const handleShare = async () => {
    const text = `Meu progresso no CopaTrack 2026: ${stats.percentage}% completo (${stats.ownedUnique}/${stats.totalStickers})! 🏆⚽`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CopaTrack 2026',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Resumo copiado para a área de transferência!');
    }
  };

  const filteredTeams = useMemo(() => {
    return TEAMS_DATA.map(team => {
      const meta = teamsMetadata[team.id] || { 
        name: team.name, 
        flag: team.flag, 
        primaryColor: team.primaryColor, 
        secondaryColor: team.secondaryColor 
      };

      const filteredStickers = team.stickers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.id.toLowerCase().includes(searchTerm.toLowerCase());
        const qty = collection[s.id] || 0;
        
        if (viewMode === 'missing') return matchesSearch && qty === 0;
        if (viewMode === 'duplicates') return matchesSearch && qty > 1;
        return matchesSearch;
      });

      return { 
        ...team, 
        name: meta.name,
        flag: meta.flag,
        primaryColor: meta.primaryColor,
        secondaryColor: meta.secondaryColor,
        stickers: filteredStickers 
      };
    }).filter(team => team.stickers.length > 0);
  }, [searchTerm, viewMode, collection, teamsMetadata]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 w-full pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="bg-cup-green p-2 rounded-lg">
                <Trophy className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter italic">
                MEU <span className="text-cup-yellow">ALBUM</span> 2026
              </h1>
            </div>
            
            <div className="flex items-center gap-2 md:hidden">
              {user ? (
                <button 
                  onClick={() => signOut(auth)}
                  className="p-2 bg-slate-800 rounded-full text-red-400 hover:text-red-300"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 bg-cup-green rounded-full text-white"
                >
                  <UserIcon size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Buscar figurinha ou seleção..."
                className="w-full bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cup-green outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 bg-slate-800/50 pl-4 pr-2 py-1 rounded-full border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[100px]">{user.email}</span>
                  <button 
                    onClick={() => signOut(auth)}
                    className="p-1.5 hover:bg-red-500/20 rounded-full text-red-500 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-cup-green hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <UserIcon size={14} /> LOGIN / SYNC
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl relative">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Progresso</div>
            <div className="text-2xl font-black text-cup-green">{stats.percentage}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
              <div 
                className="bg-cup-green h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <button 
              onClick={handleShare}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tenho</div>
            <div className="text-2xl font-black text-white">{stats.ownedUnique} <span className="text-xs text-slate-500">/ {stats.totalStickers}</span></div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setViewMode('missing')}>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Faltam</div>
            <div className="text-2xl font-black text-red-500">{stats.totalStickers - stats.ownedUnique}</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl cursor-pointer hover:border-cup-yellow/50 transition-colors" onClick={() => setViewMode('duplicates')}>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Repetidas</div>
            <div className="text-2xl font-black text-cup-yellow">{stats.totalRepeated}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center">
          <button 
            onClick={() => setIsTradeModalOpen(true)}
            className="bg-cup-blue hover:bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm flex items-center gap-2 shadow-lg shadow-cup-blue/20 transition-all active:scale-95"
          >
            <ArrowRightLeft size={18} /> REGISTRAR TROCA
          </button>
        </div>

        {viewMode === 'summary' ? (
          <SummaryTable collection={collection} teamsMetadata={teamsMetadata} />
        ) : viewMode === 'history' ? (
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <HistoryIcon size={20} /> Histórico de Atividades
            </h2>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Nenhuma atividade registrada ainda.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {history.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                          item.type === 'add' || item.type === 'trade-in' ? "bg-cup-green/20 text-cup-green" : 
                          item.type === 'remove' || item.type === 'trade-out' ? "bg-red-500/20 text-red-500" : 
                          "bg-cup-blue/20 text-cup-blue"
                        )}>
                          {item.stickerId}
                        </div>
                        <div>
                          <div className="text-sm font-bold">
                            {item.type === 'add' ? 'Adicionada' : 
                             item.type === 'remove' ? 'Removida' : 
                             item.type === 'trade-in' ? 'Recebida (Troca)' : 'Enviada (Troca)'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(item.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">Qtd: {item.quantity}</div>
                        {item.details && <div className="text-[10px] text-slate-500 max-w-[150px] truncate">{item.details}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="space-y-10">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500">Nenhuma figurinha encontrada para este filtro.</p>
                <button 
                  onClick={() => { setViewMode('all'); setSearchTerm(''); }}
                  className="mt-4 text-cup-green font-bold text-sm hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              filteredTeams.map(team => (
                <section key={team.id} className="space-y-4">
                  <div className="flex items-center justify-between pr-2">
                    <div 
                      className="flex items-center gap-3 border-l-4 pl-4"
                      style={{ borderColor: team.primaryColor || '#1E40AF' }}
                    >
                      {team.flag.startsWith('/src/assets/Flags/') || team.flag.endsWith('.jpg') ? (
                        <img src={FLAG_IMAGES[team.flag] || team.flag} alt={team.name} className="w-8 h-6 object-cover rounded shadow-sm" />
                      ) : (
                        <span className="text-2xl">{team.flag}</span>
                      )}
                      <h2 className="text-xl font-bold uppercase tracking-tight">{team.name}</h2>
                      <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {team.stickers.length} {viewMode === 'all' ? 'FIGURINHAS' : viewMode === 'missing' ? 'FALTANDO' : 'REPETIDAS'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setEditingTeam(team)}
                      className="p-2 text-slate-600 hover:text-cup-yellow transition-colors"
                      title="Editar Seleção"
                    >
                      <Palette size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
                    {team.stickers.map(sticker => (
                      <StickerCard 
                        key={sticker.id}
                        sticker={sticker}
                        quantity={collection[sticker.id] || 0}
                        onUpdate={updateSticker}
                        colors={team.primaryColor && team.secondaryColor ? {
                          primary: team.primaryColor,
                          secondary: team.secondaryColor
                        } : undefined}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <TradeModal 
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onTrade={executeTrade}
        collection={collection}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {editingTeam && (
        <TeamEditorModal 
          isOpen={true}
          onClose={() => setEditingTeam(null)}
          team={editingTeam}
          metadata={teamsMetadata[editingTeam.id] || {
            name: editingTeam.name,
            flag: editingTeam.flag,
            primaryColor: editingTeam.primaryColor,
            secondaryColor: editingTeam.secondaryColor
          }}
          onSave={updateTeamMetadata}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <button 
            onClick={() => setViewMode('all')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              viewMode === 'all' ? "text-cup-green" : "text-slate-500"
            )}
          >
            <LayoutGrid size={20} />
            <span className="text-[10px] font-bold">Álbum</span>
          </button>
          
          <button 
            onClick={() => setViewMode('missing')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              viewMode === 'missing' ? "text-red-500" : "text-slate-500"
            )}
          >
            <Ban size={20} />
            <span className="text-[10px] font-bold">Faltam</span>
          </button>

          <button 
            onClick={() => setViewMode('duplicates')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              viewMode === 'duplicates' ? "text-cup-yellow" : "text-slate-500"
            )}
          >
            <Copy size={20} />
            <span className="text-[10px] font-bold">Repetidas</span>
          </button>

          <button 
            onClick={() => setViewMode('summary')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              viewMode === 'summary' ? "text-cup-green" : "text-slate-500"
            )}
          >
            <TableIcon size={20} />
            <span className="text-[10px] font-bold">Resumo</span>
          </button>

          <button 
            onClick={() => setViewMode('history')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              viewMode === 'history' ? "text-cup-blue" : "text-slate-500"
            )}
          >
            <HistoryIcon size={20} />
            <span className="text-[10px] font-bold">Histórico</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
