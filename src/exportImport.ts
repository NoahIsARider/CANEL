// ABOUTME: Pure front-end export / import of contexts as JSON files (no backend, no deps).
// ABOUTME: Import always forks *new* contexts (fresh ids) so existing data is never touched.

import type { ContextItem, CardData } from './types';
import { uid } from './utils';
import { normalizeContext } from './store';

/** Marker written into every export so imports can reject unrelated JSON files. */
export const EXPORT_APP = 'CANEL';
/** Bump when the exported shape changes in a breaking way. */
export const EXPORT_VERSION = 1;

/**
 * Todo lists and note bodies are NOT part of AppState — each card keeps its own
 * `canel-todo-<id>` / `canel-note-<id>` localStorage entry. They are exported here
 * (keyed by card id) or they would be silently lost on import.
 */
export interface CardBlobs {
  todo?: Array<{ id: string; text: string; done: boolean }>;
  note?: string;
}

export interface CanelExportFile {
  app: string;
  version: number;
  exportedAt: string;
  contexts: ContextItem[];
  /** Optional for backwards compatibility; absent when no card has extra content. */
  cardData?: Record<string, CardBlobs>;
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  contexts?: ContextItem[];
  cardData?: Record<string, CardBlobs>;
}

function readCardBlobs(cardId: string): CardBlobs | undefined {
  const blobs: CardBlobs = {};
  try {
    const todo = localStorage.getItem(`canel-todo-${cardId}`);
    if (todo) blobs.todo = JSON.parse(todo);
  } catch {
    // ignore unreadable entry
  }
  try {
    const note = localStorage.getItem(`canel-note-${cardId}`);
    if (note !== null && note !== '') blobs.note = note;
  } catch {
    // ignore unreadable entry
  }
  return Object.keys(blobs).length > 0 ? blobs : undefined;
}

function writeCardBlobs(cardId: string, blobs: CardBlobs): void {
  try {
    if (Array.isArray(blobs.todo)) {
      localStorage.setItem(`canel-todo-${cardId}`, JSON.stringify(blobs.todo));
    }
    if (typeof blobs.note === 'string') {
      localStorage.setItem(`canel-note-${cardId}`, blobs.note);
    }
  } catch {
    // ignore quota errors — the card itself still imports fine
  }
}

/** Snapshot the given contexts (plus their todo/note blobs) into a versioned payload. */
export function buildExportFile(contexts: ContextItem[]): CanelExportFile {
  const cardData: Record<string, CardBlobs> = {};
  for (const ctx of contexts) {
    for (const card of ctx.cards) {
      const blobs = readCardBlobs(card.id);
      if (blobs) cardData[card.id] = blobs;
    }
  }

  const file: CanelExportFile = {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    contexts,
  };
  if (Object.keys(cardData).length > 0) file.cardData = cardData;
  return file;
}

function fileStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'context';
}

/** Trigger a browser download for a payload — native Blob + anchor, no libraries. */
export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Export every context as a single file. */
export function exportAll(contexts: ContextItem[]): string {
  const filename = `canel-all-contexts-${fileStamp()}.json`;
  downloadJson(filename, buildExportFile(contexts));
  return filename;
}

/** Export a single context as a file. */
export function exportOne(context: ContextItem): string {
  const filename = `canel-${slugify(context.name)}-${fileStamp()}.json`;
  downloadJson(filename, buildExportFile([context]));
  return filename;
}

/** Parse + validate an uploaded file. Never touches existing state. */
export function parseImportFile(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'not valid JSON — the file could not be parsed' };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'unrecognized file structure' };
  }

  const file = raw as Partial<CanelExportFile>;
  if (file.app !== EXPORT_APP) {
    return { ok: false, error: 'this is not a CANEL export file' };
  }
  if (typeof file.version !== 'number' || !Number.isFinite(file.version)) {
    return { ok: false, error: 'the file has no valid version field' };
  }
  if (file.version > EXPORT_VERSION) {
    return {
      ok: false,
      error: `version ${file.version} is not supported by this app (max v${EXPORT_VERSION})`,
    };
  }
  if (!Array.isArray(file.contexts) || file.contexts.length === 0) {
    return { ok: false, error: 'the file contains no contexts' };
  }

  const contexts = file.contexts
    .map(normalizeContext)
    .filter((c): c is ContextItem => c !== null);
  if (contexts.length === 0) {
    return { ok: false, error: 'the file contains no readable contexts' };
  }

  const cardData =
    file.cardData && typeof file.cardData === 'object' && !Array.isArray(file.cardData)
      ? (file.cardData as Record<string, CardBlobs>)
      : undefined;

  return { ok: true, contexts, cardData };
}

/**
 * Read an uploaded File and parse it into an ImportResult. Never touches existing state.
 * Shared by every Import entry point (tab bar + settings) so the rules stay identical.
 */
export function readImportFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(parseImportFile(String(reader.result ?? '')));
    reader.onerror = () => resolve({ ok: false, error: 'the file could not be read' });
    reader.readAsText(file);
  });
}

/**
 * Deep-copy imported contexts with brand-new ids (context + every card) so an import
 * can never overwrite or collide with existing data. Card blobs are re-keyed too.
 */
export function forkContexts(
  contexts: ContextItem[],
  cardData?: Record<string, CardBlobs>
): ContextItem[] {
  return contexts.map((context) => {
    const cards: CardData[] = context.cards.map((card) => {
      const forked: CardData = { ...card, id: uid('card') };
      const blobs = cardData?.[card.id];
      if (blobs) writeCardBlobs(forked.id, blobs);
      return forked;
    });
    return { ...context, id: uid('ctx'), cards };
  });
}
