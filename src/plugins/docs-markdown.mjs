// Build-time markup for the imported docs (src/content/docs/), styled in src/styles/docs.css.
//
// Registered as an Astro integration that adds a Sätteri hast plugin to the Markdown processor
// (the same way Starlight adds its own). For every Markdown table it:
//
// - wraps the table in a labeled, focusable scroll container
//   (<div class="kt-table" role="region" tabindex="0" aria-label="<nearest heading> table">), so a
//   table wider than the column scrolls inside itself and keyboard users can scroll it;
// - marks a "matrix" (most columns hold one short value and no cell is running text, like the
//   support matrix) for a compact layout with a sticky first column and cells that do not wrap;
// - turns cells that are exactly yes / no / opt-in into markers (the word stays the text);
// - gives a long matrix the class kt-fit-<rem>, its estimated width rounded up to 4rem: where the
//   docs column is at least that wide (a container query in docs.css), the table does not scroll
//   inside itself and its header row sticks under the page header while the page scrolls;
// - gives every cell of a wide table of running text a label with its column header (a span hidden
//   from assistive tech, which reads the real header), so the table can be shown as one labeled
//   block per row on phones;
// - repeats the header row of a long table every REPEAT_EVERY rows (a copy hidden from assistive
//   tech and search). docs.css shows the copies only where the table scrolls sideways, which takes
//   its real header row out of the page's sticky positioning: the column labels stay in view.
//
// Inline code (not code blocks) keeps identifiers whole, as the marketing pages do
// (src/components/site/wrap.ts): code of up to SHORT_CODE characters never breaks, and longer code
// breaks only after ".", "(", "/", ",", "_" or a space (never after a hyphen, as in "--users", nor inside
// a version number). Each piece between those points is a <span class="kt-nw"> (white-space:
// nowrap), with <wbr> between pieces; a piece too long for a phone column is left to break
// normally. In headings, whose type is larger, and in table cells the limits are lower.
//
// Product names (keytend-kmip, keytend-kmip-server, …), pre-release versions (0.9.0-rc.4),
// AES-n-GCM, "non-root" and license ids (Apache-2.0) in running text are each a
// <span class="kt-nw">, so they never break at their hyphens (in table cells especially), as on the
// marketing pages.
//
// It also labels task-list checkboxes ("- [ ] item") with their item's text, and gives bullet lists
// role="list" (their markers are drawn in CSS with list-style: none, which makes Safari drop the
// list semantics otherwise).
//
// Astro caches rendered Markdown in node_modules/.astro/data-store.json: after changing this file,
// delete that file (or the directory) so the next build renders every page again.

import { fileURLToPath } from 'node:url';

const DOCS_DIR = fileURLToPath(new URL('../content/docs/', import.meta.url));

/** Cell text → marker modifier. */
const MARKS = { yes: 'yes', no: 'no', 'opt-in': 'opt-in' };

/** A column is "short" when every body cell is at most this many characters, without spaces. */
const SHORT = 10;
/** Rows above which a matrix keeps its header row in view (kt-fit-<rem>). */
const TALL_ROWS = 16;
/** A text table whose estimated width (in characters) exceeds this stacks on phones. */
const STACK_CHARS = 44;
/** Width buckets (rem) for kt-fit-<rem>; docs.css has a container query for each. */
const FIT_BUCKETS = [24, 28, 32, 36, 40, 44];
/** A long table repeats its header row after every this many body rows. */
const REPEAT_EVERY = 10;
/** Inline code of at most this many characters never breaks. */
const SHORT_CODE = 28;
/** A piece of longer inline code above this many characters may still break anywhere (a 375px phone column holds about 38). */
const LONG_PIECE = 36;

/**
 * Estimated width of a matrix in rem, on the generous side: cells do not wrap, so each column is as
 * wide as its widest cell (a yes / no / opt-in marker is a pill with an icon) plus padding.
 */
function matrixRem(headers, text, cols, numbered) {
  let rem = 0.5; // borders, and the last column's wider end padding
  for (let i = 0; i < cols; i++) {
    if (numbered && i === 0) { rem += 3.25; continue; }
    const widest = Math.max(
      (headers[i] ?? '').length * 0.45,
      ...text.map((r) => {
        const v = r[i] ?? '';
        return MARKS[v.toLowerCase()] ? 2.25 + v.length * 0.35 : v.length * 0.45;
      }),
    );
    rem += widest + (i === 0 ? 1.5 : 1.25);
  }
  return rem;
}

export default function ktDocsMarkdown() {
  return {
    name: 'kt-docs-markdown',
    hooks: {
      'astro:config:setup': ({ config, logger }) => {
        const processor = config.markdown?.processor;
        if (processor?.name !== 'satteri') {
          logger.warn(`markdown.processor is "${processor?.name}", not satteri: the docs keep the default table markup.`);
          return;
        }
        processor.options.hastPlugins.push(({ fileURL }) =>
          fileURL && fileURLToPath(fileURL).startsWith(DOCS_DIR) ? docsPlugin() : undefined,
        );
      },
    },
  };
}

const isElement = (node, ...tags) => node?.type === 'element' && (!tags.length || tags.includes(node.tagName));
const children = (node) => node?.children ?? [];
const element = (tagName, properties, kids = []) => ({ type: 'element', tagName, properties, children: kids });

function docsPlugin() {
  return {
    name: 'kt-docs-markdown',
    before(root, ctx) {
      const title = ctx.data.astro?.frontmatter?.title;
      const labels = new Map();
      // The headings above the current point, by level: a table under "Operations" > "KMIP 1.4"
      // is labeled "Operations, KMIP 1.4 table".
      const headings = [];
      const walk = (node) => {
        for (const child of children(node)) {
          if (isElement(child, 'h2', 'h3', 'h4', 'h5', 'h6')) {
            const level = Number(child.tagName[1]);
            headings.length = level - 1;
            headings[level - 2] = ctx.textContent(child).trim();
          } else if (isElement(child, 'table')) {
            const context = headings.filter(Boolean).slice(-2).join(', ');
            let label = `${context || title || 'Data'} table`;
            const n = (labels.get(label) || 0) + 1;
            labels.set(label, n);
            if (n > 1) label += ` ${n}`;
            table(child, label, ctx);
          } else if (isElement(child, 'ul') && !String(child.properties?.className ?? '').includes('contains-task-list')) {
            ctx.setProperty(child, 'role', 'list');
            walk(child);
          } else if (isElement(child, 'li') && isElement(children(child)[0], 'input')) {
            const text = ctx.textContent(child).trim().replace(/\s+/g, ' ');
            ctx.setProperty(children(child)[0], 'ariaLabel', text.length > 80 ? `${text.slice(0, 79)}…` : text);
            walk(child);
          } else if (isElement(child)) walk(child);
        }
      };
      walk(root);
      inlineCode(root, ctx);
      keepNamesTogether(root, ctx);
    },
  };
}

// Product names, pre-release versions, AES-n-GCM, "non-root" and license ids in running text, as on
// the marketing pages (src/components/site/wrap.ts): browsers break after a hyphen, which split
// "keytend-kmip-" / "server" in table cells.
const NAME = /\bkeytend-kmip(?:-(?:server|testing|cli|micrometer|opentelemetry|java))?\b/;
const VERSION = /\b\d+(?:\.\d+)+-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*\b/;
const CIPHER = /\bAES-\d+-GCM\b/;
const NON_ROOT = /\bnon-root\b/;
const LICENSE_ID = /\b(?:Apache|EPL|MPL)-\d\.\d\b|\bBSD-\d-Clause\b/;
const TOKEN = new RegExp(`${NAME.source}|${VERSION.source}|${CIPHER.source}|${NON_ROOT.source}|${LICENSE_ID.source}`, 'g');
/** Elements whose text is left alone: code (handled by inlineCode), and anything not prose. */
const KEEP_TEXT = new Set(['code', 'pre', 'kbd', 'samp', 'script', 'style', 'svg', 'math', 'textarea', 'title']);

/** Wraps each TOKEN in a text node in <span class="kt-nw"> (white-space: nowrap). */
function keepNamesTogether(root, ctx) {
  const hits = [];
  const visit = (node) => {
    for (const child of children(node)) {
      if (child.type === 'text') {
        TOKEN.lastIndex = 0;
        if (TOKEN.test(child.value)) hits.push(child);
      } else if (isElement(child) && !KEEP_TEXT.has(child.tagName) && !String(child.properties?.className ?? '').split(/[\s,]+/).includes('kt-nw')) {
        visit(child);
      }
    }
  };
  visit(root);
  for (const text of hits) {
    const nodes = [];
    let last = 0;
    for (const m of text.value.matchAll(TOKEN)) {
      if (m.index > last) nodes.push({ type: 'text', value: text.value.slice(last, m.index) });
      nodes.push(element('span', { className: ['kt-nw'] }, [{ type: 'text', value: m[0] }]));
      last = m.index + m[0].length;
    }
    if (last < text.value.length) nodes.push({ type: 'text', value: text.value.slice(last) });
    ctx.replaceNode(text, nodes);
  }
}

/** Line breaking for inline code: see the header. Code blocks (pre > code) are left alone. */
function inlineCode(root, ctx) {
  const visit = (node, scale) => {
    for (const child of children(node)) {
      if (isElement(child, 'pre')) continue;
      if (isElement(child, 'code')) {
        const kids = children(child);
        if (kids.length !== 1 || kids[0].type !== 'text') continue;
        const value = kids[0].value;
        const [short, long] = [SHORT_CODE * scale, LONG_PIECE * scale];
        // After "/", "(", "_", "," or a space, and after a "." that is not inside a number ("0.9").
        const parts = value.split(/(?<=[/( _])|(?<=,)(?! )|(?<=\.)(?!\d)/).filter(Boolean);
        if (value.length <= short || (parts.length < 2 && value.length <= long)) {
          const cls = child.properties?.className;
          ctx.setProperty(child, 'className', [...(Array.isArray(cls) ? cls : cls ? [cls] : []), 'kt-nw']);
          continue;
        }
        if (parts.length < 2) continue;
        const nodes = [];
        parts.forEach((part, i) => {
          if (i) nodes.push(element('wbr', {}));
          nodes.push(part.length > long ? { type: 'text', value: part } : element('span', { className: ['kt-nw'] }, [{ type: 'text', value: part }]));
        });
        ctx.replaceNode(kids[0], nodes);
      } else if (isElement(child)) {
        // Heading type is larger: a phone line holds about half as many characters. A table cell
        // shares the line with its row.
        visit(child, isElement(child, 'h1', 'h2', 'h3', 'td') ? 0.5 : isElement(child, 'h4', 'h5', 'h6') ? 0.75 : scale);
      }
    }
  };
  visit(root, 1);
}

/** Centers a cell unless the Markdown already aligned its column. */
function center(cell, ctx) {
  if (!/text-align/.test(cell.properties?.style ?? '')) ctx.setProperty(cell, 'style', 'text-align: center');
}

function table(node, label, ctx) {
  const sections = children(node).filter((c) => isElement(c, 'thead', 'tbody'));
  const rows = sections.flatMap((s) => children(s).filter((c) => isElement(c, 'tr')).map((tr) => ({ tr, head: s.tagName === 'thead' })));
  const cellsOf = (tr) => children(tr).filter((c) => isElement(c, 'th', 'td'));
  const headRow = rows.find((r) => r.head);
  const headers = headRow ? cellsOf(headRow.tr).map((c) => ctx.textContent(c).trim()) : [];
  const body = rows.filter((r) => !r.head).map((r) => cellsOf(r.tr));
  const cols = Math.max(headers.length, ...body.map((r) => r.length));
  const text = body.map((r) => r.map((c) => ctx.textContent(c).trim()));

  const short = Array.from({ length: cols }, (_, i) => text.every((r) => (r[i] ?? '').length <= SHORT && !/\s/.test(r[i] ?? '')));
  const shortCount = short.slice(1).filter(Boolean).length;
  // Running text after the name column (two columns after a "No." column) has to wrap: no matrix.
  const names = text.every((r) => /^\d*$/.test(r[0] ?? '')) ? 2 : 1;
  const wraps = text.some((r) => r.some((c, i) => i >= names && c.length > 24 && /\s/.test(c)));
  const matrix = !wraps && cols >= 3 && shortCount >= 2 && shortCount >= (cols - 1) / 2;
  // A narrow numeric first column ("No.") stays pinned together with the name column after it.
  const numbered = matrix && cols >= 4 && headers[0]?.length <= 4 && text.every((r) => /^\d*$/.test(r[0] ?? ''));
  // Rough width in characters: each column as wide as its longest cell (capped, since long text wraps).
  const width = Array.from({ length: cols }, (_, i) =>
    Math.min(32, Math.max((headers[i] ?? '').length, ...text.map((r) => (r[i] ?? '').length))) + 3,
  ).reduce((a, b) => a + b, 0);
  // Only tables with running text stack: one of short values scrolls sideways instead, and so does
  // a list laid out in repeated columns ("# | Operation | # | Operation").
  const prose = text.some((r) => r.some((c) => c.length > 24 && /\s/.test(c)));
  const repeated = new Set(headers).size < headers.length;
  const stack = !matrix && prose && !repeated && cols >= 2 && width > STACK_CHARS;

  body.forEach((cells, r) =>
    cells.forEach((cell, i) => {
      const value = text[r][i];
      const mark = MARKS[value.toLowerCase()];
      if (mark && children(cell).length === 1 && children(cell)[0].type === 'text') {
        ctx.replaceNode(children(cell)[0], element('span', { className: ['kt-cellmark', `kt-cellmark--${mark}`] }, [{ type: 'text', value }]));
      } else if (matrix && value === '' && short[i]) {
        ctx.appendChild(cell, element('span', { className: ['kt-cellmark', 'kt-cellmark--none'], ariaHidden: 'true' }, [{ type: 'text', value: '–' }]));
      }
      if (matrix && short[i] && i > 0) center(cell, ctx);
      if (stack && headers[i] && i > 0) {
        ctx.prependChild(
          cell,
          element('span', { className: ['kt-cell-label'], ariaHidden: 'true', dataPagefindIgnore: '' }, [
            { type: 'text', value: `${headers[i]}: ` },
          ]),
        );
      }
    }),
  );

  if (matrix && headRow) {
    cellsOf(headRow.tr).forEach((cell, i) => {
      if (short[i] && i > 0) center(cell, ctx);
    });
  }

  // A stacked table is display: block on phones; explicit roles keep it a table to assistive tech.
  if (stack) {
    ctx.setProperty(node, 'role', 'table');
    for (const s of sections) ctx.setProperty(s, 'role', 'rowgroup');
    for (const { tr, head } of rows) {
      ctx.setProperty(tr, 'role', 'row');
      for (const c of cellsOf(tr)) ctx.setProperty(c, 'role', head ? 'columnheader' : 'cell');
    }
  }

  // Long tables that do not stack: a copy of the header row every REPEAT_EVERY body rows (not in
  // the last few rows), shown by docs.css where the table scrolls sideways.
  const tall = body.length > TALL_ROWS;
  if (tall && !stack && !repeated && headRow && headers.some(Boolean)) {
    const bodyRows = rows.filter((r) => !r.head);
    for (let r = REPEAT_EVERY; r <= bodyRows.length - 4; r += REPEAT_EVERY) {
      const copy = cellsOf(headRow.tr).map((cell, i) => {
        const style = cell.properties?.style || (matrix && short[i] && i > 0 ? 'text-align: center' : undefined);
        return element('th', style ? { style } : {}, [{ type: 'text', value: headers[i] ?? '' }]);
      });
      ctx.insertBefore(bodyRows[r].tr, element('tr', { className: ['kt-head-repeat'], ariaHidden: 'true', dataPagefindIgnore: '' }, copy));
    }
  }

  const className = ['kt-table'];
  if (matrix) className.push('kt-table--matrix');
  if (numbered) className.push('kt-table--numbered');
  if (stack) className.push('kt-table--stack');
  if (tall) className.push('kt-table--tall');
  if (matrix && tall) {
    const fit = FIT_BUCKETS.find((b) => b >= matrixRem(headers, text, cols, numbered));
    if (fit) className.push(`kt-fit-${fit}`);
  }
  // Half the search weight of prose: cell text makes choppy excerpts.
  ctx.wrapNode(node, element('div', { className, role: 'region', tabIndex: 0, ariaLabel: label, dataPagefindWeight: '0.5' }));
}
