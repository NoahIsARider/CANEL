import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { getHostname } from '../../utils';

interface RssCardProps {
  config: Record<string, string | number | boolean | string[]>;
}

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export function RssCard({ config }: RssCardProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const feedUrl = config.feedUrl as string;
  const displayCount = (config.displayCount as number) || 5;

  const fetchFeed = async () => {
    if (!feedUrl) {
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Using rss2json API (free tier). NOTE: the free tier rejects `count`
      // ("To use this parameter `count` you need a valid api key"), so we fetch the
      // default window and slice client-side.
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
      );
      const data = await res.json();

      if (data.status !== 'ok') {
        throw new Error(data.message || 'Failed to fetch feed');
      }

      setItems(Array.isArray(data.items) ? data.items.slice(0, displayCount) : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [feedUrl, displayCount]);

  if (!feedUrl) {
    return (
      <div className="py-8 text-center text-ink-tertiary text-caption">
        Configure to see content
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-center text-ink-tertiary text-caption">Loading feed...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-ink-tertiary text-caption mb-2">{error}</p>
        <button onClick={fetchFeed} className="text-caption text-brand hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="py-8 text-center text-ink-tertiary text-caption">No items found</div>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-2 -mx-2 rounded-card hover:bg-brand-soft transition-colors group"
        >
          <div className="w-1 h-full bg-brand rounded-full flex-shrink-0 mt-1 self-stretch" />
          <div className="flex-1 min-w-0">
            <div className="text-body text-ink group-hover:text-brand transition-colors line-clamp-2">
              {item.title}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-caption text-ink-tertiary truncate">
                {getHostname(item.link)}
              </span>
              {item.pubDate && (
                <>
                  <span className="text-ink-tertiary">·</span>
                  <span className="text-caption text-ink-tertiary">
                    {new Date(item.pubDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
          <ExternalLink size={12} className="text-ink-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </a>
      ))}
    </div>
  );
}
