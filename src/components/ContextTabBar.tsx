import { useStore } from '../store';
import { Plus } from 'lucide-react';
import type { ContextItem } from '../types';
import { uid } from '../utils';
import { useState } from 'react';

export function ContextTabBar() {
  const { state, dispatch } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (state.contexts.length >= 5) {
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

  return (
    <div className="flex items-center gap-1">
      {state.contexts.map((ctx) => (
        <button
          key={ctx.id}
          onClick={() => dispatch({ type: 'SET_ACTIVE_CONTEXT', payload: ctx.id })}
          className={`relative px-4 py-2 text-card-title transition-colors ${
            state.activeContextId === ctx.id
              ? 'text-brand'
              : 'text-ink-secondary hover:text-ink'
          }`}
        >
          {ctx.name}
          {state.activeContextId === ctx.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand transition-all duration-300" />
          )}
        </button>
      ))}

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
        <button
          onClick={() => setShowCreate(true)}
          disabled={state.contexts.length >= 5}
          className="ml-2 p-2 text-ink-tertiary hover:text-brand transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={state.contexts.length >= 5 ? 'Free plan limit reached' : 'Create context'}
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
}
