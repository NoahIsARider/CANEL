import type { CardData } from '../types';
import { ClockCard } from './cards/ClockCard';
import { WeatherCard } from './cards/WeatherCard';
import { RssCard } from './cards/RssCard';
import { TodoCard } from './cards/TodoCard';
import { NoteCard } from './cards/NoteCard';
import { UrlCard } from './cards/UrlCard';
import { WebClipCard } from './cards/WebClipCard';

interface CardRendererProps {
  card: CardData;
}

export function CardRenderer({ card }: CardRendererProps) {
  switch (card.type) {
    case 'clock':
      return <ClockCard />;
    case 'weather':
      return <WeatherCard config={card.config} />;
    case 'rss':
      return <RssCard config={card.config} />;
    case 'todo':
      return <TodoCard cardId={card.id} config={card.config} />;
    case 'note':
      return <NoteCard cardId={card.id} config={card.config} />;
    case 'url':
      return <UrlCard config={card.config} />;
    case 'webclip':
      return <WebClipCard config={card.config} />;
    default:
      return <div className="text-ink-tertiary text-caption">Unknown card type</div>;
  }
}
