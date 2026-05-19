import { useState, useEffect } from 'react';
import type { CollectionState } from '../types';

export function useCollection() {
  const [collection, setCollection] = useState<CollectionState>(() => {
    const saved = localStorage.getItem('copatrack-2026-collection');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('copatrack-2026-collection', JSON.stringify(collection));
  }, [collection]);

  const updateSticker = (id: string, delta: number) => {
    setCollection(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [id]: next };
    });
  };

  return { collection, updateSticker };
}
