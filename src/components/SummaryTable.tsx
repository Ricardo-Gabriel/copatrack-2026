import { useRef } from 'react';
import { Download, Table as TableIcon } from 'lucide-react';
import { TEAMS_DATA } from '../data/stickers';
import { FLAG_IMAGES } from '../data/flags';
import type { CollectionState, TeamMetadata } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SummaryTableProps {
  collection: CollectionState;
  teamsMetadata: Record<string, TeamMetadata>;
}

export function SummaryTable({ collection, teamsMetadata }: SummaryTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!tableRef.current) return;
    
    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      backgroundColor: '#020617',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('copatrack-resumo.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
          <TableIcon size={20} /> Resumo do Álbum
        </h2>
        <button 
          onClick={downloadPDF}
          className="bg-cup-green hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
        >
          <Download size={14} /> BAIXAR PDF
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
        <div ref={tableRef} className="min-w-[1200px] p-8 bg-slate-950">
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-cup-green rounded-xl flex items-center justify-center">
              <TableIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white italic">COPATRACK 2026</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Relatório Geral de Inventário</p>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="py-4 text-left font-black w-20">Seleção</th>
                {Array.from({ length: 20 }).map((_, i) => (
                  <th key={i} className="py-4 text-center font-black">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {TEAMS_DATA.map(team => {
                const meta = teamsMetadata[team.id] || { 
                  name: team.name, 
                  flag: team.flag, 
                  primaryColor: team.primaryColor || '#1E40AF',
                  secondaryColor: team.secondaryColor || '#FFFFFF'
                };
                
                return (
                  <tr key={team.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3">
                      <div className="flex flex-col items-center gap-1">
                        {meta.flag.startsWith('/src/assets/Flags/') || meta.flag.endsWith('.jpg') ? (
                          <img src={FLAG_IMAGES[meta.flag] || meta.flag} alt={meta.name} className="w-8 h-6 object-cover rounded shadow-sm" />
                        ) : (
                          <span className="text-lg">{meta.flag}</span>
                        )}
                        <span className="text-[8px] font-black text-slate-500">{team.id}</span>
                      </div>
                    </td>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const sticker = team.stickers[i];
                      if (!sticker) return <td key={i} className="py-2"></td>;
                      
                      const qty = collection[sticker.id] || 0;
                      const isOwned = qty > 0;
                      
                      return (
                        <td key={i} className="py-2 px-1 text-center">
                          <div 
                            className={`
                              text-[8px] font-black py-2 rounded-lg border transition-all
                              ${isOwned 
                                ? 'shadow-sm' 
                                : 'bg-slate-800/20 border-slate-800 text-slate-700'}
                            `}
                            style={isOwned ? {
                              backgroundColor: `${meta.primaryColor}33`,
                              borderColor: meta.primaryColor,
                              color: meta.secondaryColor
                            } : {}}
                          >
                            {sticker.id}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-end">
            <div className="text-[10px] text-slate-600 font-bold uppercase">
              Gerado em: {new Date().toLocaleString('pt-BR')}
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cup-green/20 border border-cup-green rounded"></div>
                <span className="text-[10px] text-slate-500 font-bold">OBTIDA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-800/20 border border-slate-800 rounded"></div>
                <span className="text-[10px] text-slate-500 font-bold">FALTANDO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
