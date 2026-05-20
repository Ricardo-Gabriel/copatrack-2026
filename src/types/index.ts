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

export interface AppState {
  collection: CollectionState;
  history: Transaction[];
  teamsMetadata: Record<string, TeamMetadata>;
}
