import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Transaction, AppState, TeamMetadata } from '../types';

const LOCAL_STORAGE_KEY = 'copatrack-2026-data';

export function useCollection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 1. Estado inicial do LocalStorage
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
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
    return { collection: {}, history: [], teamsMetadata: {} };
  });

  // 2. Monitorar estado de autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Sincronizar com Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('state')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = nada encontrado
        console.error("Erro ao buscar dados do Supabase:", error);
        return;
      }

      if (data?.state) {
        setState(data.state as AppState);
      } else {
        // Se não houver dados no Supabase, subir os locais
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            await supabase.from('user_data').upsert({
              id: user.id,
              state: parsed,
              updated_at: new Date().toISOString()
            });
          } catch (e) {
            console.error("Erro ao subir dados iniciais:", e);
          }
        }
      }
    };

    fetchData();

    // Setup realtime subscription
    const channel = supabase
      .channel(`user_data:${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'user_data',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        if (payload.new && payload.new.state) {
          setState(payload.new.state as AppState);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const persistChange = async (newState: AppState) => {
    setState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    
    if (user) {
      try {
        await supabase.from('user_data').upsert({
          id: user.id,
          state: newState,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Erro ao salvar no Supabase (será sincronizado depois):", e);
      }
    }
  };

  const updateSticker = (id: string, delta: number, details?: string) => {
    const current = state.collection[id] || 0;
    const next = Math.max(0, current + delta);
    
    const newCollection = { ...state.collection };
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

    persistChange({
      ...state,
      collection: newCollection,
      history: [transaction, ...state.history].slice(0, 100)
    });
  };

  const updateTeamMetadata = (teamId: string, metadata: TeamMetadata) => {
    persistChange({
      ...state,
      teamsMetadata: {
        ...state.teamsMetadata,
        [teamId]: metadata
      }
    });
  };

  const executeTrade = (trade: { stickersOut: string[]; stickersIn: string[]; partnerName: string }) => {
    const newCollection = { ...state.collection };
    const newHistory = [...state.history];
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

    persistChange({
      ...state,
      collection: newCollection,
      history: newHistory.slice(0, 100)
    });
  };

  return { 
    collection: state.collection, 
    history: state.history, 
    teamsMetadata: state.teamsMetadata,
    user,
    loading,
    updateSticker,
    executeTrade,
    updateTeamMetadata
  };
}
