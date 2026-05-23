import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Friendship, TradeProposal, AppState } from '../types';

export function useSocial(userId: string | undefined) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<TradeProposal[]>([]);

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    
    // Buscar amizades aceitas ou pendentes
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        sender:sender_id (id, username, email, avatar_url),
        receiver:receiver_id (id, username, email, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error("Erro ao buscar amigos:", error);
      return;
    }

    const formattedFriends = (data as (Friendship & { sender: Profile; receiver: Profile })[]).map((f) => {
      const isSender = f.sender_id === userId;
      const friendProfile = isSender ? f.receiver : f.sender;
      return { ...f, friend_profile: friendProfile };
    }).filter(f => f.friend_profile !== null);

    setFriends(formattedFriends.filter(f => f.status === 'accepted'));
    setPendingRequests(formattedFriends.filter(f => f.status === 'pending' && f.receiver_id === userId));
    setSentRequests(formattedFriends.filter(f => f.status === 'pending' && f.sender_id === userId));
  }, [userId]);

  const fetchProposals = useCallback(async () => {
    if (!userId) return;

    // Busca as propostas primeiro
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (tradesError) {
      console.error("Erro ao buscar propostas:", tradesError);
      return;
    }

    if (!trades || trades.length === 0) {
      setReceivedProposals([]);
      return;
    }

    // Busca os perfis dos remetentes manualmente para evitar erro de relacionamento
    const senderIds = [...new Set(trades.map(t => t.sender_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, avatar_url')
      .in('id', senderIds);

    if (profilesError) {
      console.error("Erro ao buscar perfis dos remetentes:", profilesError);
      setReceivedProposals(trades);
      return;
    }

    const proposalsWithProfiles = trades.map(t => ({
      ...t,
      sender_profile: profiles.find(p => p.id === t.sender_id)
    }));

    console.log("Propostas carregadas com sucesso:", proposalsWithProfiles);
    setReceivedProposals(proposalsWithProfiles);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFriends();
    fetchProposals();

    // Subscribe to changes
    const friendsChannel = supabase
      .channel('public:friendships')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchFriends();
      })
      .subscribe();

    const tradesChannel = supabase
      .channel('public:trades')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
        fetchProposals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(tradesChannel);
    };
  }, [userId, fetchFriends, fetchProposals]);

  const searchUser = async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', userId)
      .limit(5);

    if (error) return [];
    return data as Profile[];
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('friendships')
      .insert({ sender_id: userId, receiver_id: friendId, status: 'pending' });
    
    if (error) throw error;
    await fetchFriends();
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    
    if (error) throw error;
    await fetchFriends();
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);
    
    if (error) throw error;
    await fetchFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    if (error) {
      console.error("Erro ao remover amigo:", error);
      throw error;
    }
    await fetchFriends();
  };

  const getFriendCollection = async (friendId: string) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('state')
      .eq('id', friendId)
      .single();

    if (error) {
      console.error(`Erro ao carregar coleção do amigo (${friendId}):`, error);
      // Se o erro for "não encontrado", retornamos um estado vazio para não quebrar a UI
      if (error.code === 'PGRST116') {
        return { collection: {}, history: [], teamsMetadata: {} } as AppState;
      }
      return null;
    }
    return data.state as AppState;
  };

  const sendTradeProposal = async (proposal: Omit<TradeProposal, 'id' | 'status' | 'created_at'>) => {
    console.log("Iniciando envio de proposta...", proposal);
    const { data, error } = await supabase
      .from('trades')
      .insert({
        sender_id: proposal.sender_id,
        receiver_id: proposal.receiver_id,
        stickers_offered: Array.isArray(proposal.stickers_offered) ? proposal.stickers_offered : [proposal.stickers_offered],
        stickers_requested: Array.isArray(proposal.stickers_requested) ? proposal.stickers_requested : [proposal.stickers_requested],
        status: 'pending'
      })
      .select();
    
    if (error) {
      console.error("ERRO CRÍTICO SUPABASE (Troca):", error);
      throw error;
    }
    console.log("Resposta do servidor:", data);
    await fetchProposals();
  };

  const handleProposalAction = async (proposalId: string, action: 'accepted' | 'declined' | 'cancelled') => {
    const { error } = await supabase
      .from('trades')
      .update({ status: action })
      .eq('id', proposalId);
    
    if (error) throw error;
    await fetchProposals();
  };

  return {
    friends,
    pendingRequests,
    sentRequests,
    receivedProposals,
    searchUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    getFriendCollection,
    sendTradeProposal,
    handleProposalAction,
    fetchFriends
  };
}
