import type { Sticker } from '../types';
import { Plus, Minus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StickerCardProps {
  sticker: Sticker;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
  colors?: { primary: string; secondary: string };
}

export function StickerCard({ sticker, quantity, onUpdate, colors }: StickerCardProps) {
  const isOwned = quantity > 0;
  const isRepeated = quantity > 1;

  const cardStyle = isOwned && colors ? {
    backgroundColor: `${colors.primary}33`, // 20% opacity (hex 33)
    borderColor: colors.primary,
    boxShadow: `0 10px 15px -3px ${colors.primary}1A` // 10% opacity (hex 1A)
  } : {};

  const badgeStyle = isOwned && colors ? {
    backgroundColor: sticker.isSpecial ? '#FDC82F' : colors.primary,
    color: sticker.isSpecial ? '#0F172A' : '#FFFFFF'
  } : {};

  return (
    <div 
      style={cardStyle}
      className={cn(
        "group relative flex flex-col items-center justify-between p-3 rounded-xl transition-all duration-300 border-2 select-none",
        isOwned 
          ? (!colors && (sticker.isSpecial ? "bg-cup-yellow/20 border-cup-yellow shadow-lg shadow-cup-yellow/10" : "bg-cup-blue/20 border-cup-blue shadow-lg shadow-cup-blue/10"))
          : "bg-slate-800/50 border-slate-700 opacity-60 hover:opacity-100"
      )}
    >
      <div className="text-[10px] font-black text-slate-500 mb-1">
        {sticker.id}
      </div>
      
      <div 
        style={badgeStyle}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-lg mb-2 text-xl font-black",
          isOwned 
            ? (!colors && (sticker.isSpecial ? "bg-cup-yellow text-cup-dark" : "bg-cup-blue text-white"))
            : "bg-slate-700 text-slate-500"
        )}
      >
        {sticker.number}
      </div>

      <div className="text-[10px] text-center font-bold line-clamp-1 text-slate-300">
        {sticker.name}
      </div>

      {/* Hover Info */}
      {!sticker.isSpecial && (
        <div className="absolute inset-0 z-10 bg-slate-900/95 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center text-[9px] pointer-events-none">
          {sticker.currentClub && <p><span className="text-slate-500">Club:</span> {sticker.currentClub}</p>}
          {sticker.birthDate && <p><span className="text-slate-500">Nasc:</span> {new Date(sticker.birthDate).toLocaleDateString('pt-BR')}</p>}
          {sticker.height && <p><span className="text-slate-500">Alt:</span> {sticker.height}m</p>}
          {sticker.weight && <p><span className="text-slate-500">Peso:</span> {sticker.weight}kg</p>}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); onUpdate(sticker.id, -1); }}
          className="p-2 rounded-md bg-slate-700 hover:bg-red-500 active:scale-90 transition-all"
          disabled={!isOwned}
        >
          <Minus size={14} />
        </button>
        
        <span className={cn(
          "text-xs font-bold w-4 text-center select-none",
          isRepeated ? "text-cup-yellow" : "text-white"
        )}>
          {quantity}
        </span>

        <button 
          onClick={(e) => { e.stopPropagation(); onUpdate(sticker.id, 1); }}
          className="p-2 rounded-md bg-slate-700 hover:bg-cup-green active:scale-90 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      {isRepeated && (
        <div className="absolute -top-2 -right-2 bg-cup-yellow text-cup-dark text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md z-30">
          +{quantity - 1}
        </div>
      )}
    </div>
  );
}
