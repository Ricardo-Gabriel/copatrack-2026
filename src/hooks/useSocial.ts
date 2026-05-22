import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Friendship, TradeProposal, AppState } from '../types';

export function useSocial(userId: string | undefined) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<TradeProposal[]>([]);

  useEffect(() => {
    if (!userId) return;

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
  }, [userId]);

  const fetchFriends = async () => {
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

    const formattedFriends = data.map((f: any) => {
      const isSender = f.sender_id === userId;
      const friendProfile = isSender ? f.receiver : f.sender;
      return { ...f, friend_profile: friendProfile };
    }).filter(f => f.friend_profile !== null);

    setFriends(formattedFriends.filter(f => f.status === 'accepted'));
    setPendingRequests(formattedFriends.filter(f => f.status === 'pending' && f.receiver_id === userId));
    setSentRequests(formattedFriends.filter(f => f.status === 'pending' && f.sender_id === userId));
  };

  const fetchProposals = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        sender:sender_id (id, username, email, avatar_url)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error("Erro ao buscar propostas:", error);
      return;
    }

    setReceivedProposals(data.map((t: any) => ({ ...t, sender_profile: t.sender })));
  };

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
    const { error } = await supabase
      .from('trades')
      .insert(proposal);
    
    if (error) throw error;
    await fetchProposals();
  };

  const handleProposalAction = async (proposalId: string, action: 'accepted' | 'declined' | 'cancelled') => {
    const { error } = await supabase
      .from('trades')
      .update({ status: action })
      .eq('id', proposalId);
    
    if (error) throw error;
    await fetchProposals();

    // Se aceitou, a lógica de troca real precisa ser executada (removendo de um e adicionando no outro)
    // No mundo ideal isso seria um RPC, mas vamos simular por enquanto ou avisar o usuário
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
