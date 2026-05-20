import { useState, useEffect } from 'react';
import type { Transaction, AppState, TeamMetadata } from '../types';

export function useCollection() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('copatrack-2026-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Initialize teamsMetadata if it doesn't exist
      if (!parsed.teamsMetadata) parsed.teamsMetadata = {};
      return parsed;
    }
    
    return {
      collection: {},
      history: [],
      teamsMetadata: {}
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
        ...prev,
        collection: newCollection,
        history: [transaction, ...prev.history].slice(0, 100)
      };
    });
  };

  const updateTeamMetadata = (teamId: string, metadata: TeamMetadata) => {
    setState(prev => ({
      ...prev,
      teamsMetadata: {
        ...prev.teamsMetadata,
        [teamId]: metadata
      }
    }));
  };

  const executeTrade = (trade: { stickersOut: string[]; stickersIn: string[]; partnerName: string }) => {
    setState(prev => {
      const newCollection = { ...prev.collection };
      const newHistory = [...prev.history];
      const timestamp = Date.now();

      trade.stickersOut.forEach(id => {
        const current = newCollection[id] || 0;
        if (current > 0) {
          const next = current - 1;
          if (next === 0) delete newCollection[id];
          else newCollection[id] = next;

          newHistory.unshift({
            id: crypto.randomUUID(),
            timestamp,
            stickerId: id,
            type: 'trade-out',
            quantity: 1,
            details: `Trocada com ${trade.partnerName || 'alguém'}`
          });
        }
      });

      trade.stickersIn.forEach(id => {
        newCollection[id] = (newCollection[id] || 0) + 1;
        newHistory.unshift({
          id: crypto.randomUUID(),
          timestamp,
          stickerId: id,
          type: 'trade-in',
          quantity: 1,
          details: `Recebida de ${trade.partnerName || 'alguém'}`
        });
      });

      return {
        ...prev,
        collection: newCollection,
        history: newHistory.slice(0, 100)
      };
    });
  };

  return { 
    collection: state.collection, 
    history: state.history, 
    teamsMetadata: state.teamsMetadata,
    updateSticker,
    executeTrade,
    updateTeamMetadata
  };
}
