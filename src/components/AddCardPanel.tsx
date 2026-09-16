import { X } from 'lucide-react';
import type { CardType } from '../types';
import { CARD_TYPE_LABELS } from '../types';
import {
  Globe,
  Rss,
  FileText,
  Clock,
  Cloud,
  CheckSquare,
  Image,
} from 'lucide-react';

interface AddCardPanelProps {
  onSelect: (type: CardType) => void;
  onClose: () => void;
}

const cardIcons: Record<CardType, typeof Globe> = {
  url: Globe,
  rss: Rss,
  note: FileText,
  clock: Clock,
  weather: Cloud,
  todo: CheckSquare,
  webclip: Image,
};

export function AddCardPanel({ onSelect, onClose }: AddCardPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div
        className="bg-surface border border-line rounded-card p-6 w-[560px] shadow-pop animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-context-title">Add Card</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(CARD_TYPE_LABELS) as CardType[]).map((type) => {
            const Icon = cardIcons[type];
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex flex-col items-center gap-2 p-4 border border-line rounded-card hover:border-brand-border hover:shadow-card-hover transition-all group"
              >
                <Icon size={24} className="text-ink-secondary group-hover:text-brand transition-colors" />
                <span className="text-caption text-ink group-hover:text-brand transition-colors">
                  {CARD_TYPE_LABELS[type]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
