import { useCollection } from './hooks/useCollection';
import { TEAMS_DATA } from './data/stickers';
import { StickerCard } from './components/StickerCard';
import { Trophy, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

function App() {
  const { collection, updateSticker } = useCollection();
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const totalStickers = TEAMS_DATA.reduce((acc, team) => acc + team.stickers.length, 0);
    const ownedUnique = Object.keys(collection).length;
    const totalRepeated = Object.values(collection).reduce((acc, qty) => acc + (qty > 1 ? qty - 1 : 0), 0);
    const percentage = ((ownedUnique / totalStickers) * 100).toFixed(1);

    return { totalStickers, ownedUnique, totalRepeated, percentage };
  }, [collection]);

  const filteredTeams = useMemo(() => {
    if (!searchTerm) return TEAMS_DATA;
    return TEAMS_DATA.map(team => ({
      ...team,
      stickers: team.stickers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(team => team.stickers.length > 0);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 w-full pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-cup-green p-2 rounded-lg">
              <Trophy className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter italic">
              COPA<span className="text-cup-yellow">TRACK</span> 2026
            </h1>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar figurinha ou seleção..."
              className="w-full bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cup-green outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Progresso</div>
            <div className="text-2xl font-black text-cup-green">{stats.percentage}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
              <div 
                className="bg-cup-green h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tenho</div>
            <div className="text-2xl font-black text-white">{stats.ownedUnique} <span className="text-xs text-slate-500">/ {stats.totalStickers}</span></div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Faltam</div>
            <div className="text-2xl font-black text-red-500">{stats.totalStickers - stats.ownedUnique}</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Repetidas</div>
            <div className="text-2xl font-black text-cup-yellow">{stats.totalRepeated}</div>
          </div>
        </div>

        {/* Stickers Grid */}
        <div className="space-y-10">
          {filteredTeams.map(team => (
            <section key={team.id} className="space-y-4">
              <div 
                className="flex items-center gap-3 border-l-4 pl-4"
                style={{ borderColor: team.primaryColor || '#1E40AF' }}
              >
                {team.flag.startsWith('/src/assets/Flags/') || team.flag.endsWith('.jpg') ? (
                  <img src={team.flag} alt={team.name} className="w-8 h-6 object-cover rounded shadow-sm" />
                ) : (
                  <span className="text-2xl">{team.flag}</span>
                )}
                <h2 className="text-xl font-bold uppercase tracking-tight">{team.name}</h2>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {team.stickers.length} FIGURINHAS
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
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
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
