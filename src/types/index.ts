export interface Melon {
  id: string;
  title: string;
  description: string;
  status: 'live' | 'dying' | 'dead' | 'revived';
  isTimeLimited: boolean;
  hasImage: boolean;
  allowRevival: boolean;
  creator: string;
  onlineCount: number;
  lastEdited: string;
  retentionTime: number; // seconds remaining
  heatScore: number;
  historicalHeat: number;
  revivalCount: number;
  deathTime?: string;
}

export interface Cell {
  id: string;
  row: number;
  col: number;
  content: string;
  color?: string;
  isImage?: boolean;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  reactions: Record<string, number>;
  isMerged?: boolean;
  mergeRange?: { startRow: number; startCol: number; endRow: number; endCol: number };
  isPoster?: boolean;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Cell[];
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  isAnonymous: boolean;
  level: number;
  title: string;
  melonCount: number;
  hotMelonCount: number;
  guaziBalance: number;
  likes: number;
}
