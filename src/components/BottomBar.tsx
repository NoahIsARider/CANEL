import { Plus, Settings, User } from 'lucide-react';

interface BottomBarProps {
  onAddCard: () => void;
  onSettings: () => void;
}

export function BottomBar({ onAddCard, onSettings }: BottomBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-line bg-surface">
      <button
        onClick={onAddCard}
        className="flex items-center gap-2 px-3 py-1.5 text-body text-ink-secondary hover:text-brand transition-colors"
      >
        <Plus size={14} />
        <span>Add Card</span>
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={onSettings}
          className="p-2 text-ink-tertiary hover:text-ink transition-colors"
        >
          <Settings size={16} />
        </button>
        <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center">
          <User size={14} className="text-ink-secondary" />
        </div>
      </div>
    </div>
  );
}
