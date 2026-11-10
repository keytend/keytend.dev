#!/usr/bin/env node
// Checks the internal links of the built site.
//
//   npm run build && npm run check-links [-- <dist dir>]
//
// Scans every dist/**/*.html for href/src attributes. An internal URL (root-absolute or relative)
// must resolve to a file in dist/, and a #fragment on a link to an HTML page must name an id (or
// <a name>) on that page. External URLs (with a scheme, or protocol-relative) are ignored.
// Exits 1 and prints every broken link, grouped by target, if anything fails.

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.argv[2] || 'dist');
if (!fs.existsSync(DIST)) {
  console.error(`check-links: ${DIST} does not exist; run \`npm run build\` first`);
  process.exit(2);
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: ' ' };
const decodeEntities = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });

/** Markup with script/style/template bodies and comments removed (their text is not links). */
const stripNonMarkup = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<(script|style|template)\b[^>]*>)[\s\S]*?(<\/\2>)/gi, '$1$3');

const TAG = /<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function* tags(html) {
  for (const m of stripNonMarkup(html).matchAll(TAG)) {
    const attrs = {};
    for (const a of m[2].matchAll(ATTR)) attrs[a[1].toLowerCase()] = decodeEntities(a[2] ?? a[3] ?? a[4] ?? '');
    yield { name: m[1].toLowerCase(), attrs };
  }
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html')).sort();
const idCache = new Map();

function idsOf(file) {
  if (!idCache.has(file)) {
    const ids = new Set();
    for (const t of tags(fs.readFileSync(file, 'utf8'))) {
      if (t.attrs.id) ids.add(t.attrs.id);
      if (t.name === 'a' && t.attrs.name) ids.add(t.attrs.name);
    }
    idCache.set(file, ids);
  }
  return idCache.get(file);
}

/** The dist file a site path resolves to, or null. */
function fileFor(sitePath) {
  let p;
  try {
    p = decodeURIComponent(sitePath);
  } catch {
    p = sitePath;
  }
  const abs = path.join(DIST, p);
  if (!abs.startsWith(DIST)) return null;
  const candidates = p.endsWith('/') ? [path.join(abs, 'index.html')] : [abs, `${abs}.html`, path.join(abs, 'index.html')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

const isExternal = (u) => /^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//');
const broken = new Map(); // "url: reason" → Set(pages)
let checked = 0;

for (const file of htmlFiles) {
  const pageUrl = '/' + path.relative(DIST, file).split(path.sep).join('/').replace(/(^|\/)index\.html$/, '$1');
  const base = new URL(pageUrl, 'https://site.invalid');
  const html = fs.readFileSync(file, 'utf8');
  // A copy button's data-code must be the block's source, untouched by any HTML post-processing
  // (read from the raw HTML: the value holds unescaped "<" and ">", which the tag scanner below
  // does not handle).
  for (const [, code] of html.matchAll(/\bdata-code="([^"]*)"/g)) {
    if (/<span\b|<wbr>/.test(code)) {
      const key = `copy button data-code: contains site markup (the copied text would be broken)`;
      if (!broken.has(key)) broken.set(key, new Set());
      broken.get(key).add(pageUrl);
    }
  }
  for (const t of tags(html)) {
    for (const attr of ['href', 'src']) {
      const raw = t.attrs[attr];
      if (raw === undefined || isExternal(raw.trim()) || raw.trim() === '') continue;
      // Starlight's own skip link target and similar in-page anchors are checked like any other.
      const url = new URL(raw.trim(), base);
      checked++;
      const target = url.pathname === base.pathname ? file : fileFor(url.pathname);
      let reason = null;
      if (!target) reason = 'no such file in dist/';
      else if (url.hash && url.hash !== '#' && target.endsWith('.html')) {
        let id = url.hash.slice(1);
        try {
          id = decodeURIComponent(id);
        } catch {
          /* keep */
        }
        if (!idsOf(target).has(id)) reason = `no id "${id}" on ${url.pathname}`;
      }
      if (reason) {
        const key = `${raw}: ${reason}`;
        if (!broken.has(key)) broken.set(key, new Set());
        broken.get(key).add(pageUrl);
      }
    }
  }
}

if (broken.size) {
  const refs = [...broken.values()].reduce((n, s) => n + s.size, 0);
  console.error(`check-links: ${broken.size} broken internal link target(s), ${refs} reference(s), in ${htmlFiles.length} pages:\n`);
  for (const [key, pages] of [...broken].sort()) {
    console.error(`  ${key}`);
    const list = [...pages].sort();
    for (const p of list.slice(0, 10)) console.error(`      on ${p}`);
    if (list.length > 10) console.error(`      … and ${list.length - 10} more pages`);
  }
  process.exit(1);
}
console.log(`check-links: OK, ${checked} internal links in ${htmlFiles.length} pages resolve.`);
