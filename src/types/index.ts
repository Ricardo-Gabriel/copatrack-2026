export interface Sticker {
  id: string;
  number: string;
  name: string;
  teamId: string;
  category?: string;
  rarity?: string;
  isSpecial?: boolean;
  // Player specific info
  birthDate?: string;
  height?: string | number;
  weight?: string | number;
  currentClub?: string;
}

export interface Team {
  id: string;
  name: string;
  flag: string;
  primaryColor?: string;
  secondaryColor?: string;
  stickers: Sticker[];
}

export interface Trade {
  id: string;
  timestamp: number;
  stickerOutId: string; // Figurinha que eu dou
  stickerInId: string;  // Figurinha que eu recebo
  partnerName?: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  stickerId: string;
  type: 'add' | 'remove' | 'trade-in' | 'trade-out';
  quantity: number;
  details?: string;
}

export interface CollectionState {
  [stickerId: string]: number;
}

export interface TeamMetadata {
  name: string;
  flag: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend_profile?: Profile; // Para facilitar a exibição
}

export interface TradeProposal {
  id: string;
  sender_id: string;
  receiver_id: string;
  stickers_offered: string[];
  stickers_requested: string[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  sender_profile?: Profile;
}

export interface AppState {
  collection: CollectionState;
  history: Transaction[];
  teamsMetadata: Record<string, TeamMetadata>;
}
