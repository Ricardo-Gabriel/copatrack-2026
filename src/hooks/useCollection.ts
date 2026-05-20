import { useState, useEffect } from 'react';
import type { CollectionState, Transaction, AppState } from '../types';

export function useCollection() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('copatrack-2026-data');
    if (saved) return JSON.parse(saved);
    
    // Migration from old format
    const oldCollection = localStorage.getItem('copatrack-2026-collection');
    return {
      collection: oldCollection ? JSON.parse(oldCollection) : {},
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem('copatrack-2026-data', JSON.stringify(state));
  }, [state]);

  const updateSticker = (id: string, delta: number, details?: string) => {
    setState(prev => {
      const current = prev.collection[id] || 0;
      const next = Math.max(0, current + delta);
      
      const newCollection = { ...prev.collection };
      if (next === 0) {
        delete newCollection[id];
      } else {
        newCollection[id] = next;
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        stickerId: id,
        type: delta > 0 ? 'add' : 'remove',
        quantity: Math.abs(delta),
        details
      };

      return {
        collection: newCollection,
        history: [transaction, ...prev.history].slice(0, 100) // Keep last 100 transactions
      };
    });
  };

  const addTrade = (stickerInId: string | null, stickerOutId: string | null, details: string) => {
    setState(prev => {
      const newCollection = { ...prev.collection };
      const newHistory = [...prev.history];

      if (stickerInId) {
        newCollection[stickerInId] = (newCollection[stickerInId] || 0) + 1;
        newHistory.unshift({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          stickerId: stickerInId,
          type: 'trade',
          quantity: 1,
          details: `Entrada via troca: ${details}`
        });
      }

      if (stickerOutId) {
        const current = newCollection[stickerOutId] || 0;
        if (current > 0) {
          const next = current - 1;
          if (next === 0) delete newCollection[stickerOutId];
          else newCollection[stickerOutId] = next;
          
          newHistory.unshift({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            stickerId: stickerOutId,
            type: 'trade',
            quantity: 1,
            details: `Saída via troca: ${details}`
          });
        }
      }

      return {
        collection: newCollection,
        history: newHistory.slice(0, 100)
      };
    });
  };

  return { 
    collection: state.collection, 
    history: state.history, 
    updateSticker,
    addTrade 
  };
}
