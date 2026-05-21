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
      
      // Capturar as dimensões reais do conteúdo, não apenas do que é visível
      const canvas = await html2canvas(element, {
        scale: 2, // Alta qualidade
        backgroundColor: '#020617',
        useCORS: true,
        allowTaint: true,
        // Garantir que capture a largura total do conteúdo (1400px que definimos no div)
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        x: 0,
        y: 0
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // O jsPDF trabalha com pontos, vamos converter pixels para pontos mantendo a proporção
      // Usamos as dimensões originais (divididas pelo scale do canvas)
      const pdfWidth = canvas.width / 2;
      const pdfHeight = canvas.height / 2;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('copatrack-resumo-total.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Houve um erro ao gerar o PDF completo.');
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

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 custom-scrollbar">
        <div ref={tableRef} className="w-[1400px] p-8 bg-[#020617]">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#059669] rounded-xl flex items-center justify-center">
                <TableIcon className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white italic tracking-tighter">COPATRACK 2026</h1>
                <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest">Relatório Completo de Inventário • {TEAMS_DATA.length} Seleções</p>
              </div>
            </div>
            <div className="text-right">
               <div className="text-2xl font-black text-white">{Object.keys(collection).length} <span className="text-xs text-[#64748b]">/ {TEAMS_DATA.reduce((acc, t) => acc + t.stickers.length, 0)}</span></div>
               <div className="text-[9px] text-[#059669] font-black uppercase tracking-tighter">Figurinhas Obtidas</div>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[9px] text-[#475569] uppercase tracking-widest border-b border-[#1e293b]">
                <th className="py-3 text-left font-black w-24">Seleção</th>
                {Array.from({ length: 20 }).map((_, i) => (
                  <th key={i} className="py-3 text-center font-black w-12">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50">
              {TEAMS_DATA.map(team => {
                const meta = teamsMetadata[team.id] || { 
                  name: team.name, 
                  flag: team.flag, 
                  primaryColor: team.primaryColor || '#1E40AF',
                  secondaryColor: team.secondaryColor || '#FFFFFF'
                };
                
                return (
                  <tr key={team.id} className="hover:bg-[#0f172a]/50 transition-colors">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {meta.flag.startsWith('/src/assets/Flags/') || meta.flag.endsWith('.jpg') ? (
                          <img src={FLAG_IMAGES[meta.flag] || meta.flag} alt={meta.name} className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
                        ) : (
                          <span className="text-sm">{meta.flag}</span>
                        )}
                        <span className="text-[10px] font-black text-slate-400">{team.id}</span>
                      </div>
                    </td>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const sticker = team.stickers[i];
                      if (!sticker) return <td key={i} className="py-1"></td>;
                      
                      const qty = collection[sticker.id] || 0;
                      const isOwned = qty > 0;
                      
                      return (
                        <td key={i} className="py-1 px-0.5 text-center">
                          <div 
                            className={`text-[8px] font-black py-1.5 rounded-[4px] border transition-all`}
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
                            {sticker.number}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="mt-8 pt-8 border-t border-[#1e293b] flex justify-between items-end">
            <div className="text-[10px] text-[#475569] font-bold uppercase">
              Gerado em: {new Date().toLocaleString('pt-BR')}
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#05966933] border border-[#059669] rounded"></div>
                <span className="text-[10px] text-[#64748b] font-bold">OBTIDA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#0f172a] border border-[#1e293b] rounded"></div>
                <span className="text-[10px] text-[#64748b] font-bold">FALTANDO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
