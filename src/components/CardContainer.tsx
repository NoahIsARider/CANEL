import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, X } from 'lucide-react';
import { CardRenderer } from './CardRenderer';
import type { CardData } from '../types';
import { CARD_SIZE_CLASSES } from '../types';

interface CardContainerProps {
  card: CardData;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardContainer({ card, onEdit, onDelete }: CardContainerProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${CARD_SIZE_CLASSES[card.size]}
        bg-surface border border-line rounded-card shadow-card
        hover:shadow-card-hover hover:border-brand-border
        transition-all duration-150
        ${isDragging ? 'opacity-50 scale-[1.02] shadow-drag z-50' : ''}
        group relative
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-ink-tertiary hover:text-ink transition-colors"
          >
            <GripVertical size={14} />
          </button>
          <span className="text-card-title truncate">{card.title || 'Untitled'}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 text-ink-tertiary hover:text-ink transition-colors"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-ink-tertiary hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <CardRenderer card={card} />
      </div>
    </div>
  );
}
