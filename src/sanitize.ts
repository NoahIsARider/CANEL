// ABOUTME: Zero-dependency HTML sanitizer for locally rendered Markdown.
// ABOUTME: Whitelist-based; used by NoteCard instead of dangerouslySetInnerHTML on raw output.

const ALLOWED_TAGS = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

const ALLOWED_ATTRS = new Set(['href', 'title', 'target', 'rel', 'colspan', 'rowspan', 'align', 'type', 'checked', 'disabled']);

const UNSAFE_URL = /^\s*(?:javascript|data|vbscript|file):/i;

/**
 * Sanitize untrusted HTML (here: Markdown rendered to HTML) with a strict tag/attribute
 * whitelist. Implemented with the platform parser so we don't pull in DOMPurify.
 *
 * Parsing happens inside a detached <template>, so nothing is fetched or executed.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof document === 'undefined') return ''; // never emit unsanitized markup

  const template = document.createElement('template');
  template.innerHTML = html;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
  const doomed: Node[] = [];

  let node: Node | null = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.COMMENT_NODE) {
      doomed.push(node);
      node = walker.nextNode();
      continue;
    }

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Drop the element entirely (including children): content of unknown tags is
      // untrusted by definition, and unwrapping would keep e.g. <script> bodies visible.
      doomed.push(el);
      node = walker.nextNode();
      continue;
    }

    // <input> is only tolerated as a disabled Markdown task-list checkbox.
    if (tag === 'input' && el.getAttribute('type') !== 'checkbox') {
      doomed.push(el);
      node = walker.nextNode();
      continue;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!ALLOWED_ATTRS.has(name) || name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === 'href' && UNSAFE_URL.test(attr.value)) {
        el.removeAttribute('href');
      }
    }

    if (tag === 'input') {
      el.setAttribute('disabled', '');
      el.removeAttribute('href');
    }

    if (tag === 'a' && el.getAttribute('href')) {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }

    node = walker.nextNode();
  }

  for (const dead of doomed) {
    dead.parentNode?.removeChild(dead);
  }

  return template.innerHTML;
}
