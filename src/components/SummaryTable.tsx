import { useRef } from 'react';
import { Download, Table as TableIcon } from 'lucide-react';
import { TEAMS_DATA } from '../data/stickers';
import { FLAG_IMAGES } from '../data/flags';
import type { CollectionState, TeamMetadata } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SummaryTableProps {
  collection: CollectionState;
  teamsMetadata: Record<string, TeamMetadata>;
}

export function SummaryTable({ collection, teamsMetadata }: SummaryTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Cabeçalho do PDF
      pdf.setFillColor(2, 6, 23); // Slate 950
      pdf.rect(0, 0, 297, 210, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COPATRACK 2026', 14, 15);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('RELATÓRIO DE INVENTÁRIO COMPLETO', 14, 22);

      const tableData = TEAMS_DATA.map(team => {
        const meta = teamsMetadata[team.id] || { 
          name: team.name, 
          primaryColor: team.primaryColor || '#1E40AF',
          secondaryColor: team.secondaryColor || '#FFFFFF'
        };

        const row = [team.id]; // Primeira coluna é o ID do país
        
        for (let i = 0; i < 20; i++) {
          const sticker = team.stickers[i];
          if (!sticker) {
            row.push('');
          } else {
            // Sempre adiciona o ID, independente de ter a figurinha ou não
            row.push(sticker.id);
          }
        }
        return { data: row, meta, stickers: team.stickers };
      });

      autoTable(pdf, {
        head: [['País', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']],
        body: tableData.map(r => r.data),
        startY: 30,
        styles: {
          fontSize: 6,
          cellPadding: 1,
          valign: 'middle',
          halign: 'center',
          fillColor: [15, 23, 42], // Slate 900
          textColor: [255, 255, 255], // Branco para figurinhas que NÃO temos
          lineColor: [30, 41, 59], // Slate 800
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [2, 6, 23],
          textColor: [100, 116, 139],
          fontSize: 7,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', fontSize: 7, textColor: [255, 255, 255] }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index !== 0) {
            const teamIndex = data.row.index;
            const stickerIndex = data.column.index - 1; // Ajuste por causa da coluna 'País'
            const sticker = tableData[teamIndex].stickers[stickerIndex];
            
            if (sticker) {
              const qty = collection[sticker.id] || 0;
              const meta = tableData[teamIndex].meta;

              if (qty > 0) {
                // Se tem a figurinha, aplicar cores da seleção
                data.cell.styles.fillColor = meta.primaryColor || '#1E40AF';
                data.cell.styles.textColor = meta.secondaryColor || '#FFFFFF';
                data.cell.styles.fontStyle = 'bold';
              } else {
                // Se NÃO tem, manter fundo escuro e texto esmaecido ou branco
                data.cell.styles.fillColor = [15, 23, 42];
                data.cell.styles.textColor = [100, 116, 139]; // Slate 500 para contraste discreto
              }
            }
          }
        },
        theme: 'grid'
      });

      pdf.save('copatrack-resumo.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Houve um erro ao gerar o PDF direto.');
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
