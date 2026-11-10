// Line breaking for identifiers in marketing-page text (SitePage runs every
// page's HTML through keepTokensTogether).
//
// Browsers break text after a hyphen, and the old `overflow-wrap: anywhere`
// on inline code broke it anywhere, so phones showed "--" / "experimental-v3"
// and "keytend-kmip-" / "server", and prose broke "0.9.0-" / "rc.4". Here:
//   - product names, pre-release version strings, AES-256-GCM and "non-root"
//     in running text never break;
//   - inline code of up to 28 characters never breaks;
//   - longer inline code breaks only after ".", "(", "/" or a space outside
//     those tokens, or after a hyphen that follows one
//     ("keytend-kmip-server-" / "0.9.0-rc.4-" / "signed-release.tar"); a tail
//     of four characters or fewer stays with the piece before it.

const SHORT_CODE = 28;
const PRODUCT = /\bkeytend-kmip(?:-(?:server|testing|cli|micrometer|opentelemetry))?\b/;
// A version with a hyphenated suffix, such as 0.9.0-rc.4 (the hyphen is where
// browsers break it). Plain versions such as 0.9 or 2.1 have no break point.
const VERSION = /\b\d+(?:\.\d+)+-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*\b/;
const CIPHER = /\bAES-\d+-GCM\b/;
const NON_ROOT = /\bnon-root\b/;
const TOKEN = new RegExp(`${PRODUCT.source}|${VERSION.source}|${CIPHER.source}|${NON_ROOT.source}`, 'g');

const textLength = (html: string) => html.replace(/&[^;\s]+;/g, 'x').length;

function code(classes: string, inner: string) {
  if (textLength(inner) <= SHORT_CODE) return `<code class="${`${classes} kt-nw`.trim()}">${inner}</code>`;
  // Character offsets after which the line may break.
  const inToken = new Set<number>();
  const afterToken = new Set<number>();
  for (const m of inner.matchAll(TOKEN)) {
    for (let i = m.index!; i < m.index! + m[0].length; i++) inToken.add(i);
    afterToken.add(m.index! + m[0].length);
  }
  const parts: string[] = [];
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    const breakAfter = ('./( '.includes(c) && !inToken.has(i)) || (c === '-' && afterToken.has(i));
    if (breakAfter) {
      parts.push(inner.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < inner.length) parts.push(inner.slice(start));
  // A short tail such as a file extension stays with the piece before it.
  if (parts.length > 1 && textLength(parts[parts.length - 1]) <= 4) {
    const tail = parts.pop()!;
    parts[parts.length - 1] += tail;
  }
  const cls = classes ? ` class="${classes}"` : '';
  return `<code${cls}>${parts.map((p) => `<span class="kt-nw">${p}</span>`).join('<wbr>')}</code>`;
}

// One tag, with quoted attribute values that may themselves contain "<" or ">"
// (Expressive Code keeps the raw source of each block in data-code="…").
const TAG = /<(?:[^>"']|"[^"]*"|'[^']*')*>/g;

export function keepTokensTogether(html: string): string {
  const out: string[] = [];
  let skip = 0; // inside pre, script, style, svg or title: leave untouched
  let codeOpen: string | null = null; // the opening tag of an inline <code> being collected
  let codeText = '';
  let codeHasChild = false;
  let last = 0;

  const text = (t: string) => {
    if (codeOpen !== null) codeText += t;
    else out.push(skip > 0 ? t : t.replace(TOKEN, '<span class="kt-nw">$&</span>'));
  };

  for (const m of html.matchAll(TAG)) {
    text(html.slice(last, m.index));
    last = m.index! + m[0].length;
    const tag = m[0];
    const name = /^<(\/?)([a-zA-Z][\w-]*)/.exec(tag);
    const closing = name?.[1] === '/';
    const el = name?.[2].toLowerCase();

    if (codeOpen !== null) {
      if (el === 'code' && closing) {
        const cls = /\sclass="([^"]*)"/.exec(codeOpen)?.[1] ?? '';
        const plainOpen = /^<code(?:\s+class="[^"]*")?\s*>$/.test(codeOpen);
        out.push(plainOpen && !codeHasChild ? code(cls, codeText) : codeOpen + codeText + tag);
        codeOpen = null;
      } else {
        codeText += tag;
        codeHasChild = true;
      }
      continue;
    }
    if (el && /^(pre|script|style|svg|title)$/.test(el) && !tag.endsWith('/>')) {
      skip = Math.max(0, skip + (closing ? -1 : 1));
    } else if (el === 'code' && !closing && skip === 0) {
      codeOpen = tag;
      codeText = '';
      codeHasChild = false;
      continue;
    }
    out.push(tag);
  }
  text(html.slice(last));
  if (codeOpen !== null) out.push(codeOpen + codeText);
  return out.join('');
}
