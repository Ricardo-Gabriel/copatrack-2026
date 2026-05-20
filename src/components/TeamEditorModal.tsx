import { useState } from 'react';
import { X, Save, Palette } from 'lucide-react';
import type { Team, TeamMetadata } from '../types';

interface TeamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  metadata: TeamMetadata;
  onSave: (teamId: string, metadata: TeamMetadata) => void;
}

export function TeamEditorModal({ isOpen, onClose, team, metadata, onSave }: TeamEditorModalProps) {
  const [name, setName] = useState(metadata.name);
  const [flag, setFlag] = useState(metadata.flag);
  const [primaryColor, setPrimaryColor] = useState(metadata.primaryColor || '#1E40AF');
  const [secondaryColor, setSecondaryColor] = useState(metadata.secondaryColor || '#FFFFFF');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-black flex items-center gap-2 uppercase italic tracking-tighter">
            <Palette className="text-cup-yellow" /> Editar Seleção
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
              Nome da Seleção
            </label>
            <input 
              type="text"
              className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-cup-yellow outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
              Emoji ou Caminho da Bandeira
            </label>
            <input 
              type="text"
              className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-cup-yellow outline-none"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Cor Primária
              </label>
              <div className="flex gap-2">
                <input 
                  type="color"
                  className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input 
                  type="text"
                  className="flex-1 bg-slate-800 border-none rounded-xl px-3 text-xs focus:ring-2 focus:ring-cup-yellow outline-none font-mono"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Cor Secundária
              </label>
              <div className="flex gap-2">
                <input 
                  type="color"
                  className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
                <input 
                  type="text"
                  className="flex-1 bg-slate-800 border-none rounded-xl px-3 text-xs focus:ring-2 focus:ring-cup-yellow outline-none font-mono"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
              Preview do Card (Obtido)
            </label>
            <div 
              className="p-4 rounded-2xl border-2 flex flex-col items-center gap-2 w-32 mx-auto"
              style={{ 
                backgroundColor: `${primaryColor}33`,
                borderColor: primaryColor 
              }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                00
              </div>
              <div className="text-[10px] font-bold text-slate-300">Exemplo</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800">
          <button 
            onClick={() => {
              onSave(team.id, { name, flag, primaryColor, secondaryColor });
              onClose();
            }}
            className="w-full bg-cup-yellow hover:bg-yellow-500 text-cup-dark font-black py-4 rounded-2xl transition-all shadow-lg shadow-cup-yellow/20 flex items-center justify-center gap-2"
          >
            <Save size={18} /> SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>
    </div>
  );
}
