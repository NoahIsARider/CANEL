import { useStore } from '../store';
import type { ContextItem, CardData, CardType } from '../types';
import { uid } from '../utils';
import {
  Sun,
  Target,
  BarChart3,
  Plane,
  Plus,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  icon: typeof Sun;
  /** Stable, minified-safe icon name (lucide forwardRef components have no `.name`). */
  iconName: string;
  description: string;
  cardCount: number;
  cards: Array<{ type: CardType; title: string; config: Record<string, string | number | boolean | string[]> }>;
}

const templates: Template[] = [
  {
    id: 'morning',
    name: 'Morning Routine',
    icon: Sun,
    iconName: 'sun',
    description: 'Start your day with time, calendar, news, and todos',
    cardCount: 4,
    cards: [
      { type: 'clock', title: 'Time', config: {} },
      { type: 'rss', title: 'Tech News', config: { feedUrl: 'https://hnrss.org/frontpage', displayCount: 5 } },
      { type: 'todo', title: 'Today', config: {} },
      { type: 'weather', title: 'Weather', config: { city: 'Beijing' } },
    ],
  },
  {
    id: 'deepwork',
    name: 'Deep Work',
    icon: Target,
    iconName: 'target',
    description: 'Focus mode with tasks, timer, and notes',
    cardCount: 3,
    cards: [
      { type: 'todo', title: 'Current Tasks', config: {} },
      { type: 'clock', title: 'Timer', config: {} },
      { type: 'note', title: 'Notes', config: {} },
    ],
  },
  {
    id: 'weekly',
    name: 'Weekly Report',
    icon: BarChart3,
    iconName: 'bar-chart-3',
    description: 'Track your week with stats and notes',
    cardCount: 3,
    cards: [
      { type: 'rss', title: 'Industry News', config: { feedUrl: 'https://feeds.feedburner.com/TechCrunch', displayCount: 5 } },
      { type: 'todo', title: 'This Week', config: {} },
      { type: 'note', title: 'Weekly Notes', config: {} },
    ],
  },
  {
    id: 'travel',
    name: 'Travel Planner',
    icon: Plane,
    iconName: 'plane',
    description: 'Plan your trip with weather, maps, and todos',
    cardCount: 3,
    cards: [
      { type: 'weather', title: 'Destination', config: { city: 'Tokyo' } },
      { type: 'url', title: 'Maps', config: { url: 'https://www.google.com/maps' } },
      { type: 'todo', title: 'Packing List', config: {} },
    ],
  },
];

/** Best-effort icon name for lucide forwardRef components (dev + prod safe). */
function resolveIconName(icon: unknown): string {
  const candidate =
    (icon as { displayName?: string })?.displayName ?? (icon as { name?: string })?.name;
  return typeof candidate === 'string' && candidate ? candidate.toLowerCase() : 'icon';
}

export function TemplateMarket() {  const { dispatch } = useStore();

  const useTemplate = (template: Template) => {
    const cards: CardData[] = template.cards.map((c) => ({
      id: uid('card'),
      type: c.type,
      title: c.title,
      size: 'medium' as const,
      config: c.config,
    }));

    const context: ContextItem = {
      id: uid('ctx'),
      name: template.name,
      // lucide-react icons are forwardRef objects: `.name` is undefined in dev **and**
      // usually minified away in prod builds. Use the explicit string, with a defensive
      // fallback so this can never throw (previously: `template.icon.name.toLowerCase()`).
      icon: template.iconName || resolveIconName(template.icon),
      cards,
      triggerRules: [],
    };

    dispatch({ type: 'ADD_CONTEXT', payload: context });
    dispatch({ type: 'SET_ACTIVE_CONTEXT', payload: context.id });
    dispatch({ type: 'SET_SEEN_TEMPLATE', payload: true });
  };

  const createBlank = () => {
    const context: ContextItem = {
      id: uid('ctx'),
      name: 'New Context',
      icon: 'layout',
      cards: [],
      triggerRules: [],
    };

    dispatch({ type: 'ADD_CONTEXT', payload: context });
    dispatch({ type: 'SET_ACTIVE_CONTEXT', payload: context.id });
    dispatch({ type: 'SET_SEEN_TEMPLATE', payload: true });
  };

  const skipTemplate = () => {
    dispatch({ type: 'SET_SEEN_TEMPLATE', payload: true });
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-page-title mb-2">Choose a template to get started</h1>
          <p className="text-body text-ink-secondary">
            Or create a blank context and build from scratch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-surface border border-line rounded-card p-6 hover:border-brand-border hover:shadow-card-hover transition-all group"
              >
                <Icon size={32} className="text-ink-secondary mb-4" />
                <h3 className="text-card-title mb-2">{template.name}</h3>
                <p className="text-caption text-ink-secondary mb-4">
                  {template.description}
                </p>
                <div className="text-caption text-ink-tertiary mb-4">
                  {template.cardCount} cards
                </div>
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full py-2 text-body bg-brand text-white rounded-card hover:bg-brand-hover transition-colors"
                >
                  Use Template
                </button>
              </div>
            );
          })}

          {/* Blank context */}
          <div className="bg-surface border border-line rounded-card p-6 hover:border-brand-border hover:shadow-card-hover transition-all">
            <Plus size={32} className="text-ink-secondary mb-4" />
            <h3 className="text-card-title mb-2">Blank Context</h3>
            <p className="text-caption text-ink-secondary mb-4">
              Start from scratch with an empty context
            </p>
            <div className="text-caption text-ink-tertiary mb-4">0 cards</div>
            <button
              onClick={createBlank}
              className="w-full py-2 text-body border border-line rounded-card hover:bg-canvas transition-colors"
            >
              Create Blank
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={skipTemplate}
            className="text-caption text-ink-secondary hover:text-brand transition-colors"
          >
            Skip and create from scratch later
          </button>
        </div>
      </div>
    </div>
  );
}
