import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { sanitizeHtml } from '../../sanitize';

interface NoteCardProps {
  cardId: string;
  config: Record<string, string | number | boolean | string[]>;
}

export function NoteCard({ cardId }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Load note from localStorage
  const storageKey = `canel-note-${cardId}`;
  const [content, setContent] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, content);
  }, [content, storageKey]);

  // Markdown -> HTML, then through a whitelist sanitizer. The raw output of marked()
  // passes embedded HTML through verbatim, so it must never reach the DOM unsanitized.
  const html = useMemo(() => {
    const rendered = marked.parse(content || '*No content yet*', { async: false }) as string;
    return sanitizeHtml(rendered);
  }, [content]);

  return (
    <div>
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className="w-full h-[200px] text-body bg-transparent outline-none resize-none font-mono"
          placeholder="Write your note in Markdown..."
          autoFocus
        />
      ) : (
        <div
          className="note-markdown cursor-pointer"
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
