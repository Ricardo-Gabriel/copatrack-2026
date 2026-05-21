import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import type { Transaction, AppState, TeamMetadata } from '../types';

export function useCollection() {
  const [user, setUser] = useState<User | null>(null);
  
  // Inicialização robusta carregando IMEDIATAMENTE do LocalStorage
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('copatrack-2026-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          collection: parsed.collection || {},
          history: parsed.history || [],
          teamsMetadata: parsed.teamsMetadata || {}
        };
      } catch (e) {
        console.error("Erro ao carregar dados locais:", e);
      }
    }
    return {
      collection: {},
      history: [],
      teamsMetadata: {}
    };
  });

  // 1. Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Quando o estado do usuário muda, se ele deslogar, mantemos o estado atual
      // que já está sendo salvo no LocalStorage pelo Effect #3
    });
    return unsubscribe;
  }, []);

  // 2. Sincronizar com Firestore quando logado (apenas se houver internet e projeto configurado)
  useEffect(() => {
    if (!user || !db) return;

    try {
      const docRef = doc(db, "users", user.uid);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as AppState;
          // Só atualizamos o estado se os dados da nuvem forem diferentes dos locais
          // para evitar loops infinitos ou resets acidentais
          setState(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(cloudData)) {
              return cloudData;
            }
            return prev;
          });
        } else {
          // Se for um novo usuário, inicializar o banco com os dados locais atuais
          setDoc(docRef, state);
        }
      }, (error) => {
        console.warn("Firestore Sync Error (provavelmente não configurado):", error);
      });

      return unsubscribe;
    } catch (e) {
      console.warn("Firebase não inicializado corretamente.");
    }
  }, [user]);

  // 3. PERSISTÊNCIA CRÍTICA: Salvar no LocalStorage TODA VEZ que o estado mudar
  useEffect(() => {
    localStorage.setItem('copatrack-2026-data', JSON.stringify(state));
    
    // Se logado, tentar salvar também no Firestore
    if (user && db) {
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, state, { merge: true }).catch(e => {
        console.warn("Erro ao salvar na nuvem:", e);
      });
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
