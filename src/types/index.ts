export interface Topic {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  color: string;
  creator: string;
  noteCount: number;
  heatScore: number;
  isHot?: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  topicId: string;
  x: number;
  y: number;
  content: string;
  color: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isPoster?: boolean;
  posterText?: string;
  width?: number;
  height?: number;
  textColor?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  manualSize?: 'compact' | 'normal' | 'large';
  image?: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  isAnonymous: boolean;
  likes: number;
}
