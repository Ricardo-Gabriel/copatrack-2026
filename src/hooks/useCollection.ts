import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import type { Transaction, AppState, TeamMetadata } from '../types';

export function useCollection() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>({
    collection: {},
    history: [],
    teamsMetadata: {}
  });

  // 1. Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Se deslogar, carregar do LocalStorage
        const saved = localStorage.getItem('copatrack-2026-data');
        if (saved) setState(JSON.parse(saved));
      }
    });
    return unsubscribe;
  }, []);

  // 2. Sincronizar com Firestore quando logado
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setState(docSnap.data() as AppState);
      } else {
        const localData = localStorage.getItem('copatrack-2026-data');
        const initialData = localData ? JSON.parse(localData) : state;
        setDoc(docRef, initialData);
      }
    });

    return unsubscribe;
  }, [user]);

  // 3. Persistir localmente e na nuvem
  useEffect(() => {
    localStorage.setItem('copatrack-2026-data', JSON.stringify(state));
    
    if (user) {
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, state, { merge: true });
    }
  }, [state, user]);

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
    user,
    updateSticker,
    executeTrade,
    updateTeamMetadata
  };
}
