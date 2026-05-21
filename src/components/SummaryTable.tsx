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
    
    try {
      const element = tableRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        backgroundColor: '#020617',
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        x: 0,
        y: 0
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = canvas.width / 2;
      const pdfHeight = canvas.height / 2;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('copatrack-resumo-compacto.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Houve um erro ao gerar o PDF.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
          <TableIcon size={20} /> Resumo do Álbum
        </h2>
        <button 
          onClick={downloadPDF}
          className="bg-cup-green hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
        >
          <Download size={14} /> BAIXAR PDF COMPLETO
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
        <div ref={tableRef} className="w-full p-4 md:p-8 bg-[#020617] overflow-hidden">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center">
                <TableIcon className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-white italic tracking-tighter leading-none">COPATRACK 2026</h1>
                <p className="text-[8px] text-[#64748b] font-bold uppercase tracking-widest mt-1">Relatório Compacto de Inventário</p>
              </div>
            </div>
            <div className="text-right">
               <div className="text-xl font-black text-white leading-none">{Object.keys(collection).length} <span className="text-[10px] text-[#64748b]">/ {TEAMS_DATA.reduce((acc, t) => acc + t.stickers.length, 0)}</span></div>
               <div className="text-[8px] text-[#059669] font-black uppercase tracking-tighter">Obtidas</div>
            </div>
          </div>

          <table className="w-full table-fixed">
            <thead>
              <tr className="text-[7px] text-[#475569] uppercase tracking-widest border-b border-[#1e293b]">
                <th className="py-2 text-left font-black w-[40px] md:w-16">País</th>
                {Array.from({ length: 20 }).map((_, i) => (
                  <th key={i} className="py-2 text-center font-black">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/30">
              {TEAMS_DATA.map(team => {
                const meta = teamsMetadata[team.id] || { 
                  name: team.name, 
                  flag: team.flag, 
                  primaryColor: team.primaryColor || '#1E40AF',
                  secondaryColor: team.secondaryColor || '#FFFFFF'
                };
                
                return (
                  <tr key={team.id} className="hover:bg-[#0f172a]/50 transition-colors">
                    <td className="py-1.5">
                      <div className="flex items-center gap-1">
                        {meta.flag.startsWith('/src/assets/Flags/') || meta.flag.endsWith('.jpg') ? (
                          <img src={FLAG_IMAGES[meta.flag] || meta.flag} alt={meta.name} className="w-4 h-3 object-cover rounded-[1px]" />
                        ) : (
                          <span className="text-xs">{meta.flag}</span>
                        )}
                        <span className="text-[7px] font-black text-slate-500">{team.id}</span>
                      </div>
                    </td>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const sticker = team.stickers[i];
                      if (!sticker) return <td key={i} className="py-1"></td>;
                      
                      const qty = collection[sticker.id] || 0;
                      const isOwned = qty > 0;
                      
                      return (
                        <td key={i} className="py-1 px-[1px] text-center">
                          <div 
                            className={`text-[6px] md:text-[7px] font-black py-1 rounded-[2px] border transition-all truncate`}
                            style={isOwned ? {
                              backgroundColor: `${meta.primaryColor}40`,
                              borderColor: meta.primaryColor,
                              color: meta.secondaryColor
                            } : {
                              backgroundColor: '#0f172a',
                              borderColor: '#1e293b',
                              color: '#1e293b'
                            }}
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
          
          <div className="mt-6 pt-4 border-t border-[#1e293b] flex justify-between items-center">
            <div className="text-[7px] text-[#475569] font-bold uppercase">
              Gerado: {new Date().toLocaleDateString('pt-BR')}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#05966933] border border-[#059669] rounded-[1px]"></div>
                <span className="text-[7px] text-[#64748b] font-bold">SIM</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#0f172a] border border-[#1e293b] rounded-[1px]"></div>
                <span className="text-[7px] text-[#64748b] font-bold">NÃO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
