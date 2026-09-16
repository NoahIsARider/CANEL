export type CardSize = 'small' | 'medium' | 'large' | 'wide';

export type CardType = 'url' | 'rss' | 'note' | 'clock' | 'weather' | 'todo' | 'webclip';

export interface CardData {
  id: string;
  type: CardType;
  title: string;
  size: CardSize;
  config: Record<string, string | number | boolean | string[]>;
}

export interface ContextItem {
  id: string;
  name: string;
  icon: string; // lucide icon name
  cards: CardData[];
  triggerRules: TriggerRule[];
}

export interface TriggerRule {
  id: string;
  type: 'manual' | 'time';
  days?: number[]; // 0=Sun, 1=Mon...6=Sat
  time?: string; // HH:MM
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  version?: number;
  user: UserData | null;
  contexts: ContextItem[];
  activeContextId: string | null;
  theme: 'light' | 'dark' | 'system';
  hasSeenTemplate: boolean;
}

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  url: 'URL Embed',
  rss: 'RSS Feed',
  note: 'Note',
  clock: 'Clock',
  weather: 'Weather',
  todo: 'Todo List',
  webclip: 'Web Clip',
};

export const CARD_SIZE_CLASSES: Record<CardSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-2',
  large: 'col-span-1 md:col-span-2 row-span-2',
  wide: 'col-span-1 md:col-span-3 lg:col-span-4',
};

export const SIZE_PRESETS: Record<CardSize, { w: number; h: number }> = {
  small: { w: 1, h: 1 },
  medium: { w: 2, h: 1 },
  large: { w: 2, h: 2 },
  wide: { w: 4, h: 1 },
};
