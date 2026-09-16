import { useState, useEffect, useRef } from 'react';
import { useStore, useActiveContext, cleanupCardStorage } from './store';
import { ContextTabBar } from './components/ContextTabBar';
import { CardGrid } from './components/CardGrid';
import { BottomBar } from './components/BottomBar';
import { CardConfigModal } from './components/CardConfigModal';
import { AddCardPanel } from './components/AddCardPanel';
import { TemplateMarket } from './components/TemplateMarket';
import { UserMenu } from './components/UserMenu';
import { Toast } from './components/Toast';
import type { CardData, CardType } from './types';
import { uid } from './utils';
import { Settings } from 'lucide-react';

export function Dashboard() {
  const { state, dispatch } = useStore();
  const activeContext = useActiveContext();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [switchKey, setSwitchKey] = useState(0);
  const prevContextRef = useRef<string | null>(state.activeContextId);

  // Trigger time-based rules
  const firedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const checkTriggers = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const ctx of state.contexts) {
        // `triggerRules` may be missing on imported/legacy state — never iterate undefined.
        for (const rule of ctx.triggerRules ?? []) {
          if (rule.type === 'time' && rule.days && rule.time) {
            if (rule.days.includes(currentDay) && rule.time === currentTime) {
              // Dedupe: the interval may fire twice for the same minute.
              const fireKey = `${ctx.id}:${rule.id}:${currentTime}`;
              if (firedRef.current.has(fireKey)) continue;
              firedRef.current.add(fireKey);
              if (state.activeContextId !== ctx.id) {
                if (confirm(`Switch to "${ctx.name}" context?`)) {
                  dispatch({ type: 'SET_ACTIVE_CONTEXT', payload: ctx.id });
                }
              }
            }
          }
        }
      }
    };

    // Align to the wall-clock minute boundary; otherwise a 60s interval started at
    // e.g. 10:00:37 checks at :37 past every minute and can skip a rule entirely.
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      checkTriggers();
      intervalId = window.setInterval(checkTriggers, 60000);
    }, 60000 - (Date.now() % 60000));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [state.contexts, state.activeContextId, dispatch]);

  // Context switch animation
  useEffect(() => {
    if (prevContextRef.current !== state.activeContextId) {
      setSwitchKey((k) => k + 1);
      prevContextRef.current = state.activeContextId;
    }
  }, [state.activeContextId]);

  const handleAddCard = (type: CardType) => {
    if (!activeContext) return;
    const newCard: CardData = {
      id: uid('card'),
      type,
      title: '',
      size: 'medium',
      config: {},
    };
    setEditingCard(newCard);
    setShowAddPanel(false);
  };

  const handleSaveCard = (card: CardData) => {
    if (!activeContext) return;
    const existing = activeContext.cards.find((c) => c.id === card.id);
    if (existing) {
      dispatch({
        type: 'UPDATE_CARD',
        payload: { contextId: activeContext.id, cardId: card.id, updates: card },
      });
    } else {
      dispatch({
        type: 'ADD_CARD',
        payload: { contextId: activeContext.id, card },
      });
    }
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!activeContext) return;
    // Drop the per-card localStorage blobs (todo list / note body) as well, otherwise
    // deleting a card leaves orphaned data behind forever.
    cleanupCardStorage(cardId);
    dispatch({
      type: 'DELETE_CARD',
      payload: { contextId: activeContext.id, cardId },
    });
  };

  // Show template market if no contexts
  if (state.contexts.length === 0 && !state.hasSeenTemplate) {
    return <TemplateMarket />;
  }

  return (
    <div className="h-screen flex flex-col bg-canvas">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-card-title font-semibold text-ink">CANEL</span>
        </div>
        <ContextTabBar />
        <UserMenu />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {activeContext ? (
          <div key={switchKey} className="context-enter">
            <CardGrid
              cards={activeContext.cards}
              contextId={activeContext.id}
              onEditCard={setEditingCard}
              onDeleteCard={handleDeleteCard}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-ink-secondary mb-4">No active context</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="px-4 py-2 bg-brand text-white rounded-card text-card-title hover:bg-brand-hover transition-colors"
              >
                Create Context
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <BottomBar
        onAddCard={() => setShowAddPanel(true)}
        onSettings={() => setShowSettings(true)}
      />

      {/* Modals */}
      {showAddPanel && (
        <AddCardPanel
          onSelect={handleAddCard}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {editingCard && activeContext && (
        <CardConfigModal
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => setEditingCard(null)}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      <Toast />
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div
        className="bg-surface border border-line rounded-card p-6 w-[480px] max-h-[80vh] overflow-auto shadow-pop animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-context-title">Settings</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink transition-colors">
            <Settings size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-card-title mb-2">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch({ type: 'SET_THEME', payload: t })}
                  className={`px-4 py-2 rounded-card border transition-colors ${
                    state.theme === t
                      ? 'bg-brand text-white border-brand'
                      : 'bg-surface border-line hover:border-brand-border'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Context limit */}
          <div>
            <label className="block text-card-title mb-2">Contexts</label>
            <p className="text-caption text-ink-secondary">
              {state.contexts.length} / 5 contexts (Free plan limit)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
