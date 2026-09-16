import { ExternalLink } from 'lucide-react';
import { getFaviconUrl, getHostname } from '../../utils';

interface WebClipCardProps {
  config: Record<string, string | number | boolean | string[]>;
}

export function WebClipCard({ config }: WebClipCardProps) {
  const url = config.url as string;
  const title = config.title as string;
  const description = config.description as string;

  if (!url) {
    return (
      <div className="py-8 text-center text-ink-tertiary text-caption">
        Configure to see content
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 -m-4 border border-line rounded-card hover:border-brand-border hover:shadow-card-hover transition-all group"
    >
      <div className="flex items-start gap-3">
        <img
          src={getFaviconUrl(url)}
          alt=""
          className="w-8 h-8 rounded-card flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-card-title text-ink group-hover:text-brand transition-colors line-clamp-2">
            {title || getHostname(url)}
          </div>
          {description && (
            <div className="text-caption text-ink-secondary mt-1 line-clamp-3">
              {description}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-caption text-ink-tertiary truncate">
              {getHostname(url)}
            </span>
            <ExternalLink size={10} className="text-ink-tertiary" />
          </div>
        </div>
      </div>
    </a>
  );
}
