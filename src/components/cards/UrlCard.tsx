import { useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { getFaviconUrl, getHostname } from '../../utils';

interface UrlCardProps {
  config: Record<string, string | number | boolean | string[]>;
}

export function UrlCard({ config }: UrlCardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const url = config.url as string;

  if (!url) {
    return (
      <div className="py-8 text-center text-ink-tertiary text-caption">
        Configure to see content
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={getFaviconUrl(url)}
            alt=""
            className="w-4 h-4 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-caption text-ink-secondary truncate">
            {getHostname(url)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setLoaded(false);
              setRefreshKey((k) => k + 1);
            }}
            className="p-1 text-ink-tertiary hover:text-ink transition-colors"
            title="Refresh"
            aria-label="Refresh embed"
          >
            <RefreshCw size={12} />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-ink-tertiary hover:text-ink transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* iframe */}
      <div className="relative flex-1 border border-line rounded-card overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-canvas px-4 text-center">
            <span className="text-caption text-ink-tertiary">Loading {getHostname(url)}…</span>
            <span className="text-caption text-ink-tertiary">
              Some sites refuse to be embedded and will stay blank.
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption text-brand hover:underline"
            >
              Open in a new tab instead
            </a>
          </div>
        )}
        <iframe
          key={refreshKey}
          src={url}
          className="w-full h-full border-0"
          title="URL Embed"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
          // No `allow-same-origin`: combined with `allow-scripts` it effectively disables
          // the sandbox for same-origin content. Embedding is best-effort / read-only.
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
