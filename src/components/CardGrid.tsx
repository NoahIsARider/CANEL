import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CardContainer } from './CardContainer';
import { useStore } from '../store';
import type { CardData } from '../types';

interface CardGridProps {
  cards: CardData[];
  contextId: string;
  onEditCard: (card: CardData) => void;
  onDeleteCard: (cardId: string) => void;
}

export function CardGrid({ cards, contextId, onEditCard, onDeleteCard }: CardGridProps) {
  const { dispatch } = useStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    const newCards = arrayMove(cards, oldIndex, newIndex);

    dispatch({
      type: 'REORDER_CARDS',
      payload: { contextId, cards: newCards },
    });
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-line rounded-card animate-pulse-dash">
        <div className="text-center">
          <p className="text-ink-secondary mb-2">No cards yet</p>
          <p className="text-caption text-ink-tertiary">Add your first card to get started</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 card-stagger">
          {cards.map((card) => (
            <CardContainer
              key={card.id}
              card={card}
              onEdit={() => onEditCard(card)}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
