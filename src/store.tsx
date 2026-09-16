import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, ContextItem, CardData, UserData, TriggerRule } from './types';

const STORAGE_KEY = 'canel-state';

/** Bump when the persisted shape changes; older payloads get normalized on load. */
export const SCHEMA_VERSION = 1;

/** localStorage keys owned by individual cards (todo / note), keyed by card id. */
export const cardStorageKeys = (cardId: string) => [`canel-todo-${cardId}`, `canel-note-${cardId}`];

/** Remove every localStorage entry a card owns (called when a card is deleted). */
export function cleanupCardStorage(cardId: string): void {
  try {
    cardStorageKeys(cardId).forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

const defaultState: AppState = {
  version: SCHEMA_VERSION,
  user: null,
  contexts: [],
  activeContextId: null,
  theme: 'system',
  hasSeenTemplate: false,
};

/**
 * Fill in fields that may be missing from older / hand-edited / imported state.
 * Without this, a context lacking `triggerRules` used to white-screen the Dashboard
 * (`for (const rule of ctx.triggerRules)` threw on undefined).
 */
function normalizeContext(raw: unknown): ContextItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<ContextItem>;
  return {
    id: typeof candidate.id === 'string' ? candidate.id : `ctx_${Math.random().toString(36).slice(2)}`,
    name: typeof candidate.name === 'string' ? candidate.name : 'Untitled',
    icon: typeof candidate.icon === 'string' ? candidate.icon : 'layout',
    cards: Array.isArray(candidate.cards)
      ? candidate.cards.filter((c): c is CardData => !!c && typeof c === 'object')
      : [],
    triggerRules: Array.isArray(candidate.triggerRules) ? candidate.triggerRules : [],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState> & { version?: number };
    const contexts = Array.isArray(parsed.contexts)
      ? parsed.contexts.map(normalizeContext).filter((c): c is ContextItem => c !== null)
      : [];
    return {
      ...defaultState,
      ...parsed,
      version: SCHEMA_VERSION,
      contexts,
      activeContextId:
        typeof parsed.activeContextId === 'string' && contexts.some((c) => c.id === parsed.activeContextId)
          ? parsed.activeContextId
          : (contexts[0]?.id ?? null),
    };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

type Action =
  | { type: 'SET_USER'; payload: UserData | null }
  | { type: 'ADD_CONTEXT'; payload: ContextItem }
  | { type: 'UPDATE_CONTEXT'; payload: { id: string; updates: Partial<ContextItem> } }
  | { type: 'DELETE_CONTEXT'; payload: string }
  | { type: 'SET_ACTIVE_CONTEXT'; payload: string | null }
  | { type: 'ADD_CARD'; payload: { contextId: string; card: CardData } }
  | { type: 'UPDATE_CARD'; payload: { contextId: string; cardId: string; updates: Partial<CardData> } }
  | { type: 'DELETE_CARD'; payload: { contextId: string; cardId: string } }
  | { type: 'REORDER_CARDS'; payload: { contextId: string; cards: CardData[] } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_SEEN_TEMPLATE'; payload: boolean }
  | { type: 'ADD_TRIGGER'; payload: { contextId: string; rule: TriggerRule } }
  | { type: 'REMOVE_TRIGGER'; payload: { contextId: string; ruleId: string } }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_CONTEXT':
      return { ...state, contexts: [...state.contexts, action.payload] };
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case 'DELETE_CONTEXT': {
      const contexts = state.contexts.filter((c) => c.id !== action.payload);
      return {
        ...state,
        contexts,
        activeContextId:
          state.activeContextId === action.payload
            ? contexts[0]?.id ?? null
            : state.activeContextId,
      };
    }
    case 'SET_ACTIVE_CONTEXT':
      return { ...state, activeContextId: action.payload };
    case 'ADD_CARD':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.contextId
            ? { ...c, cards: [...c.cards, action.payload.card] }
            : c
        ),
      };
    case 'UPDATE_CARD':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.contextId
            ? {
                ...c,
                cards: c.cards.map((card) =>
                  card.id === action.payload.cardId
                    ? { ...card, ...action.payload.updates }
                    : card
                ),
              }
            : c
        ),
      };
    case 'DELETE_CARD':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.contextId
            ? { ...c, cards: c.cards.filter((card) => card.id !== action.payload.cardId) }
            : c
        ),
      };
    case 'REORDER_CARDS':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.contextId
            ? { ...c, cards: action.payload.cards }
            : c
        ),
      };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SEEN_TEMPLATE':
      return { ...state, hasSeenTemplate: action.payload };
    case 'ADD_TRIGGER':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.contextId
            ? { ...c, triggerRules: [...(c.triggerRules ?? []), action.payload.rule] }
            : c
        ),
      };
    case 'REMOVE_TRIGGER':
      return {
        ...state,
        contexts: state.contexts.map((c) =>
          c.id === action.payload.contextId
            ? { ...c, triggerRules: (c.triggerRules ?? []).filter((r) => r.id !== action.payload.ruleId) }
            : c
        ),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      state.theme === 'dark' ||
      (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.add('theme-transition');
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const t = setTimeout(() => root.classList.remove('theme-transition'), 250);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (state.theme === 'system') {
        root.classList.toggle('dark', mq.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => {
      clearTimeout(t);
      mq.removeEventListener('change', handler);
    };
  }, [state.theme]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useActiveContext(): ContextItem | null {
  const { state } = useStore();
  return state.contexts.find((c) => c.id === state.activeContextId) ?? null;
}
