import { useStore, cleanupCardStorage } from '../store';
import { Plus, MoreHorizontal, Download, LayoutTemplate, Trash2 } from 'lucide-react';
import type { ContextItem } from '../types';
import { uid } from '../utils';
import { useEffect, useRef, useState } from 'react';
import { exportOne } from '../exportImport';
import { showToast } from './Toast';

/** `confirm` turns the dropdown into an inline "are you sure?" step. */
type OpenMenu =
  | { kind: 'create' }
  | { kind: 'context'; id: string; confirm?: boolean }
  | null;

interface ContextTabBarProps {
  /** Opens the template picker so a new context can start from a template. */
  onNewFromTemplate: () => void;
}

export function ContextTabBar({ onNewFromTemplate }: ContextTabBarProps) {
  const { state, dispatch } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [menu, setMenu] = useState<OpenMenu>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Close whichever dropdown is open on an outside click.
  useEffect(() => {
    if (!menu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menu]);

  const atLimit = state.contexts.length >= 5;

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (atLimit) {
      alert('Free plan limit: 5 contexts maximum');
      return;
    }
    const newContext: ContextItem = {
      id: uid('ctx'),
      name: newName.trim(),
      icon: 'layout',
      cards: [],
      triggerRules: [],
    };
    dispatch({ type: 'ADD_CONTEXT', payload: newContext });
    dispatch({ type: 'SET_ACTIVE_CONTEXT', payload: newContext.id });
    setNewName('');
    setShowCreate(false);
  };

  const handleExportOne = (ctx: ContextItem) => {
    exportOne(ctx);
    setMenu(null);
    showToast(`Exported "${ctx.name}". The file contains personal content — review before sharing.`, 'success');
  };

  const handleDeleteOne = (ctx: ContextItem) => {
    // Drop the per-card todo/note blobs first — `DELETE_CONTEXT` only rewrites AppState,
    // so without this the removed context would leave orphaned localStorage entries.
    ctx.cards.forEach((card) => cleanupCardStorage(card.id));
    dispatch({ type: 'DELETE_CONTEXT', payload: ctx.id });
    setMenu(null);
    showToast(`Deleted "${ctx.name}".`, 'success');
  };

  return (
    <div className="flex items-center gap-1" ref={barRef}>
      {state.contexts.map((ctx) => {
        const isActive = state.activeContextId === ctx.id;
        const menuOpen = menu?.kind === 'context' && menu.id === ctx.id;
        return (
          <div key={ctx.id} className="relative flex items-center">
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_CONTEXT', payload: ctx.id })}
              className={`relative px-4 py-2 text-card-title transition-colors ${
                isActive ? 'text-brand' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {ctx.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand transition-all duration-300" />
              )}
            </button>
            <button
              onClick={() => setMenu(menuOpen ? null : { kind: 'context', id: ctx.id })}
              className="p-1 text-ink-tertiary hover:text-ink transition-colors"
              title={`Actions for "${ctx.name}"`}
              aria-label={`Actions for ${ctx.name}`}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-surface border border-line rounded-card shadow-pop animate-pop-in p-1">
                <button
                  onClick={() => handleExportOne(ctx)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-body text-ink hover:bg-canvas rounded-card transition-colors"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>

                {menu.confirm ? (
                  <div className="px-3 py-2">
                    <p className="text-caption text-ink-secondary mb-2">
                      Delete "{ctx.name}" and its cards?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMenu(null)}
                        className="flex-1 px-2 py-1 text-caption border border-line rounded-card hover:bg-canvas transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteOne(ctx)}
                        className="flex-1 px-2 py-1 text-caption border border-red-500/40 text-red-500 rounded-card hover:bg-red-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setMenu({ kind: 'context', id: ctx.id, confirm: true })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-body text-ink hover:bg-canvas rounded-card transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {showCreate ? (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setShowCreate(false);
            }}
            placeholder="Context name"
            className="px-3 py-1.5 text-body border-b border-line focus:border-brand bg-transparent outline-none transition-colors"
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 text-caption bg-brand text-white rounded-card hover:bg-brand-hover transition-colors"
          >
            Create
          </button>
        </div>
      ) : (
        <div className="relative ml-2">
          <button
            onClick={() => setMenu(menu?.kind === 'create' ? null : { kind: 'create' })}
            disabled={atLimit}
            className="p-2 text-ink-tertiary hover:text-brand transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={atLimit ? 'Free plan limit reached' : 'New context'}
            aria-label="New context"
          >
            <Plus size={16} />
          </button>

          {menu?.kind === 'create' && (
            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-surface border border-line rounded-card shadow-pop animate-pop-in p-1">
              <button
                onClick={() => {
                  setMenu(null);
                  setShowCreate(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-body text-ink hover:bg-canvas rounded-card transition-colors"
              >
                <Plus size={14} />
                <span>Blank context</span>
              </button>
              <button
                onClick={() => {
                  setMenu(null);
                  onNewFromTemplate();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-body text-ink hover:bg-canvas rounded-card transition-colors"
              >
                <LayoutTemplate size={14} />
                <span>From template…</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
