#!/usr/bin/env node
// Imports the product documentation from the keytend-kmip-java and keytend-kmip-server
// repositories into src/content/docs/<product>/docs/, and records what was imported in
// src/data/sync-manifest.json.
//
//   npm run sync-docs
//
// Each repository is read from a local clone (default: a sibling of this checkout; override with
// KMIP_JAVA_DIR / KMIP_SERVER_DIR). Files are read from the clone's HEAD commit with `git show`,
// not from its working tree, so the output always matches the commit recorded in the manifest.
//
// What gets imported: every Markdown file under docs/, plus every Markdown file those pages link
// to (transitively), plus the README.md of any linked directory. Everything else a page links to
// becomes a GitHub link pinned to the synced commit.
//
// The output is deterministic: running it twice on the same commits changes nothing (the sync
// date in the manifest only moves when a product's commit changes).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'src/content/docs');
const MANIFEST = path.join(ROOT, 'src/data/sync-manifest.json');
const SIDEBARS = path.join(ROOT, 'src/sidebars.mjs');
const GITHUB_ORG = 'https://github.com/keytend';
const RAW_ORG = 'https://raw.githubusercontent.com/keytend';

/** A clone next to this checkout; from a git worktree, next to the main checkout. */
function siblingClone(name) {
  const direct = path.resolve(ROOT, '..', name);
  if (fs.existsSync(direct)) return direct;
  try {
    const common = execFileSync('git', ['-C', ROOT, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
      encoding: 'utf8',
    }).trim();
    const viaMain = path.resolve(path.dirname(common), '..', name);
    if (fs.existsSync(viaMain)) return viaMain;
  } catch {
    /* not a git checkout */
  }
  return direct;
}

/**
 * Product names in HTML the sync writes, kept on one line. (The Markdown plugin,
 * src/plugins/docs-markdown.mjs, does this for the pages' own text, but not inside raw HTML.)
 */
const keepNames = (html) =>
  html.replace(/\bkeytend-kmip(?:-(?:server|testing|cli|micrometer|opentelemetry|java))?\b/g, '<span class="kt-nw">$&</span>');

/** A one-line "Experimental" status for a landing page (the site banner already says more). */
const statusLine = (text) =>
  `<p class="kt-doc-status"><span class="kt-pill kt-pill--experimental"><span class="kt-dot" aria-hidden="true"></span>Experimental</span> <span>${keepNames(text)}</span></p>\n`;

/**
 * Per-product settings (per-file maps are keyed by repository path):
 *
 * - `project`: the product name search results show (Pagefind title suffix and "Project" filter).
 * - `slugs`: overrides the default path → slug rule.
 * - `titles` / `descriptions`: override the page title (taken from the H1) or the description
 *   (taken from the first paragraph). Links whose label is a retitled page's old title follow it.
 * - `searchTitle(file, title)`: the title search results show (before " · <project>"), if not the title.
 * - Site notes, for where the website must say something the repository text does not (keep these
 *   few, and remove them when the upstream text catches up). The sync fails if one stops matching.
 *   - `siteNotes`: { heading text: Markdown } inserted right after that heading (an aside); the
 *     heading '' puts the note at the top of the page.
 *   - `edits`: [pattern, replacement] applied to the converted page; each must match.
 * - `asideTitles`: [pattern, title] for alerts with no title of their own ("> [!WARNING]" alone
 *   would read "Warning"): the first alert whose text matches the pattern gets the title. Each must
 *   match; an alert left with the generic title is reported.
 * - `cards`: [eyebrow, title, slug, summary] link cards on the landing page, before its first section.
 *   A section right after them that only links to the same pages is dropped.
 */
const PRODUCTS = [
  {
    id: 'kmip-java',
    repo: 'keytend-kmip-java',
    branch: 'main',
    dir: process.env.KMIP_JAVA_DIR || siblingClone('keytend-kmip-java'),
    index: 'docs/index.md',
    project: 'keytend-kmip (Java)',
    name: 'keytend-kmip',
    title: 'Keytend KMIP Java SDK',
    slugs: { 'RELEASE.md': 'release-notes' },
    titles: {
      'docs/index.md': 'Keytend KMIP Java SDK documentation',
      // The site says "not for production" everywhere; the page itself keeps its own warning.
      'docs/production.md': 'Runtime configuration',
    },
    descriptions: {
      'docs/index.md':
        'Guides, reference and test evidence for keytend-kmip, the Keytend KMIP Java SDK: an experimental Java SDK for connecting to KMIP key management servers.',
      // Pages that open with a heading or a list rather than a summary paragraph.
      'SECURITY.md': 'Supported versions, reporting vulnerabilities, handling secrets and verifying keytend-kmip releases.',
      'docs/validation.md':
        'Which KMIP servers the release checks run against, how to read and rerun them, and where each release keeps its results.',
    },
    edits: {
      'docs/index.md': [
        // The landing's opening warning repeats the site-wide banner; keep it as one line.
        [
          /^:::caution\[Experimental: not for production use\]\nkeytend-kmip is experimental in every release\.[^]*?\n:::\n/m,
          statusLine('keytend-kmip is experimental in every release. Do not use it to protect real keys or data.'),
        ],
      ],
    },
    // What each warning says, as its title.
    asideTitles: {
      'docs/catalog.md': [[/^Run it only against a disposable server/, 'Use a disposable test server']],
      'docs/production.md': [
        [/^A mutation that fails in transit has an unknown outcome/, 'Check the state before you retry a failed change'],
      ],
      'docs/envelope-encryption.md': [[/^`openTo` writes plaintext to disk/, 'Decrypted files are plaintext on disk']],
      'docs/getting-started.md': [[/^A key name is not an access-control boundary/, 'A key name is not access control']],
      'docs/operating-keys.md': [[/^Retirement is irreversible/, 'Data under a destroyed key is lost']],
      'docs/local-keys.md': [
        [/^The cache checks a key's authorization/, 'The cache cannot recall a key it handed out'],
        [/^On a server that leases only Active keys, never deactivate/, 'A Deactivated key cannot be made Active again'],
      ],
      'docs/protocol-layer.md': [[/^Every certificate the listener's `SSLContext` trusts/, 'Let the listener trust only the KMIP server']],
      'docs/releasing.md': [[/^A version published on Central can never be changed/, 'Publishing to Central cannot be undone']],
      'integration/cassandra-trunk-tde/README.md': [
        [/^Do not deactivate a key that open files still need/, 'Keep a key Active while open files use it'],
        [/^Do not use `key-replace-compromised` at step 4/, 'At step 4, key-replace-compromised revokes the new key'],
      ],
      'integration/cassandra-trunk-tls/README.md': [[/^A node presents its certificate/, 'A KMS outage can stop TLS on every node']],
    },
    // Eyebrow: what kind of page the card leads to, in the same order on both landing pages.
    cards: [
      ['Start here', 'Getting started', 'getting-started', 'Build the SDK, connect to your KMS and seal a first record, or try it with the in-memory server.'],
      ['Start here', 'Choosing an API', 'choosing-an-api', 'Which entry point to use for each job, from sealing records to raw KMIP calls.'],
      ['Guide', 'Envelope encryption', 'envelope-encryption', 'Seal records, streams and files with a key that stays in the KMS.'],
      ['Guide', 'Key lifecycle', 'operating-keys', 'How to rotate and retire keys, and what to do after a compromise.'],
      ['Reference', 'Compatibility and support', 'compatibility', 'Which Java and KMIP versions are tested, and what the API promises from 0.10.0 on.'],
      ['Evidence', 'Validation', 'validation', 'Checks against PyKMIP, PQCToday, Krypton and keytend-kmip-server, how to run them, and where each release keeps its results.'],
    ],
  },
  {
    id: 'kmip-server',
    repo: 'keytend-kmip-server',
    branch: 'main',
    dir: process.env.KMIP_SERVER_DIR || siblingClone('keytend-kmip-server'),
    index: 'docs/README.md',
    project: 'keytend-kmip-server',
    name: 'keytend-kmip-server',
    title: 'Keytend KMIP Server',
    slugs: { 'deploy/helm/keytend-kmip-server/README.md': 'deploy/helm' },
    titles: { 'docs/README.md': 'Keytend KMIP Server documentation' },
    descriptions: {
      'docs/README.md':
        'Getting started, client examples, configuration, operations and feature reference for keytend-kmip-server, the Keytend KMIP Server: an experimental KMIP server for client tests and CI.',
      'docs/key-transfer.md':
        'Get, wrapped Get and Register, Import and Export, and protection storage in keytend-kmip-server.',
    },
    // Search results for the client pages say "client": "Java (keytend-kmip)" alone reads like the SDK.
    searchTitle: (file, title) =>
      /^docs\/clients\/[^/]+\.md$/.test(file) ? title.replace(/^(\w+) \(/, '$1 client (') : title,
    edits: {
      'docs/README.md': [
        // The opening "To | Start with | Then" table: the cards below replace it. The status line
        // matches keytend-kmip's landing page.
        [
          /^\| To \| Start with \| Then \|\n(?:\|.*\n)+\n/m,
          () =>
            statusLine(
              'keytend-kmip-server is for client tests and CI, and stays experimental at every version, 1.0 included. ' +
                'Do not use it to protect real keys or data.',
            ) + '\n',
        ],
      ],
      'docs/clients/java.md': [
        // The client's docs are on this site too.
        [
          /\(in `docs\/` in the source zip, starting with `operating-keys\.md` and `choosing-an-api\.md`\)/,
          () =>
            '([keytend-kmip docs](/kmip-java/docs/) on this site, starting with\n' +
            '[Key lifecycle](/kmip-java/docs/operating-keys/) and [Choosing an API](/kmip-java/docs/choosing-an-api/))',
        ],
      ],
    },
    // What each note or warning says, as its title.
    asideTitles: {
      'docs/README.md': [[/^Three different keys can be rotated/, 'Three keys can be rotated']],
      'docs/store-integrity.md': [[/^These checks need no setup/, 'No setup needed']],
      'docs/clients/python.md': [[/^PyKMIP checks the server certificate against `ca` but not the host name/, 'PyKMIP does not check the host name']],
      'docs/credentials.md': [[/^`--users` does not make credentials mandatory/, 'Requests without credentials are still served']],
      'docs/deployment.md': [[/^Use Docker Compose 2\.26 or later/, 'Compose versions and Podman']],
      'docs/kubernetes.md': [
        [/^The chart is tested on a single-node kind cluster/, 'Tested only on a single-node kind cluster'],
        [/^This renders and passes a server-side dry run/, 'Not tested with a cloud load balancer'],
      ],
    },
    // Eyebrow: what kind of page the card leads to, in the same order on both landing pages.
    cards: [
      ['Start here', 'Quick start', 'quick-start', 'Run the server locally in a container and make a first request.'],
      ['Start here', 'Connecting a client', 'clients', 'Client examples in Python, Go, Java, C and Rust, requests over HTTPS, and how to handle errors and retries.'],
      ['Start here', 'Project status', 'status', 'What works in KMIP 1.0 to 2.1, client and OASIS test results, and known gaps such as the single replica.'],
      ['Start here', 'Support matrix', 'support-matrix', 'Which operations, object types and attributes each KMIP edition supports.'],
      ['Guide', 'Deployment', 'deployment', 'How to run it with Docker Compose or on Kubernetes, and the operations runbooks.'],
      ['Reference', 'Configuration reference', 'configuration', 'Every `serve` flag and environment variable, the policy file format, endpoints and fixed limits.'],
    ],
  },
];

/** GitHub alert type → [Starlight aside type, title]. */
const ALERTS = {
  NOTE: ['note', 'Note'],
  TIP: ['tip', 'Tip'],
  IMPORTANT: ['note', 'Important'],
  WARNING: ['caution', 'Warning'],
  CAUTION: ['danger', 'Caution'],
};

const warnings = [];
const warn = (msg) => warnings.push(msg);
const notes = [];
const info = (msg) => notes.push(msg);
const failures = [];
const fail = (msg) => failures.push(msg);

// ---------------------------------------------------------------------------------------------
// Git access

function git(dir, args, opts = {}) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    ...opts,
  });
}

function openRepo(product) {
  if (!fs.existsSync(product.dir)) {
    throw new Error(
      `${product.repo}: no clone at ${product.dir} (set ${product.id === 'kmip-java' ? 'KMIP_JAVA_DIR' : 'KMIP_SERVER_DIR'})`,
    );
  }
  const sha = git(product.dir, ['rev-parse', 'HEAD']).trim();
  const commitDate = git(product.dir, ['log', '-1', '--format=%cI', sha]).trim();
  const files = new Set(git(product.dir, ['ls-tree', '-r', '--name-only', '-z', sha]).split('\0').filter(Boolean));
  const dirs = new Set();
  for (const f of files) {
    for (let d = path.posix.dirname(f); d !== '.'; d = path.posix.dirname(d)) dirs.add(d);
  }
  const dirty = git(product.dir, ['status', '--porcelain', '--untracked-files=no']).trim();
  if (dirty) warn(`${product.repo}: working tree has uncommitted changes; importing committed HEAD ${sha.slice(0, 7)} only`);
  const cache = new Map();
  const read = (file) => {
    if (!cache.has(file)) cache.set(file, git(product.dir, ['show', `${sha}:${file}`]).replace(/\r\n?/g, '\n'));
    return cache.get(file);
  };
  return { sha, commitDate, files, dirs, read };
}

// ---------------------------------------------------------------------------------------------
// Markdown scanning. The pages are plain GitHub-flavored Markdown. Rather than re-serializing a
// parsed tree (which would reformat every page), the converter edits the source text in place: it
// masks code (fenced blocks and inline spans) and then finds links in what is left.

const FENCE = /^(`{3,}|~{3,})/;
const MASK = '\u0001';

/** Calls fn(line, index, inFence) for every line; fence delimiter lines count as inFence. */
function eachLine(lines, fn) {
  let fence = null;
  lines.forEach((line, i) => {
    // Fences may sit in a list item (indented) or in a blockquote ("> ```").
    const bare = line.replace(/^[\s>]*/, '');
    const m = FENCE.exec(bare);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && bare.slice(m[1].length).trim() === '') fence = null;
      fn(line, i, true);
    } else if (m && !(m[1][0] === '`' && bare.slice(m[1].length).includes('`'))) {
      fence = m[1];
      fn(line, i, true);
    } else {
      fn(line, i, false);
    }
  });
}

/** A copy of `text` of the same length with code blocks and inline code spans masked out. */
function maskCode(text) {
  const lines = text.split('\n');
  eachLine(lines, (line, i, inFence) => {
    if (inFence) lines[i] = MASK.repeat(line.length);
  });
  const s = lines.join('\n');
  const blank = /\n[ \t>]*\n/g;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const tick = s.indexOf('`', i);
    if (tick === -1) { out += s.slice(i); break; }
    out += s.slice(i, tick);
    let run = 1;
    while (s[tick + run] === '`') run++;
    // The span closes at the next backtick run of the same length within the same paragraph.
    blank.lastIndex = tick;
    const para = blank.exec(s);
    const limit = para ? para.index : s.length;
    let end = -1;
    for (let k = s.indexOf('`', tick + run); k !== -1 && k < limit; ) {
      let r = 1;
      while (s[k + r] === '`') r++;
      if (r === run) { end = k; break; }
      k = s.indexOf('`', k + r);
    }
    if (end === -1) {
      out += s.slice(tick, tick + run);
      i = tick + run;
    } else {
      out += s.slice(tick, end + run).replace(/[^\n]/g, MASK);
      i = end + run;
    }
  }
  return out;
}

// [label](url "title"), with one level of nested brackets in the label and one level of
// parentheses in the url; ![alt](src) for images. The `d` flag gives group offsets.
const MD_LINK = /(!?)\[((?:[^\[\]]|\[[^\[\]]*\])*)\]\(\s*(<[^>\n]*>|[^()\s]+(?:\([^()\s]*\)[^()\s]*)?)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/dg;
const MD_REFDEF = /^ {0,3}\[[^\]\n]+\]:[ \t]*(<[^>\n]*>|\S+)/dgm;
const HTML_ATTR = /<([a-zA-Z][\w-]*)\b[^>]*?\s(href|src)=("[^"]*"|'[^']*')/dg;

/** Every link in a page: { start, end, url, image } where start/end delimit the url in the source. */
function scanLinks(text) {
  const masked = maskCode(text);
  const links = [];
  const add = ([start, end], image) => {
    let url = text.slice(start, end);
    if (url.startsWith('<') && url.endsWith('>')) { start++; end--; url = url.slice(1, -1); }
    links.push({ start, end, url, image });
  };
  for (const m of masked.matchAll(MD_LINK)) add(m.indices[3], m[1] === '!');
  for (const m of masked.matchAll(MD_REFDEF)) add(m.indices[1], false);
  for (const m of masked.matchAll(HTML_ATTR)) {
    const [s, e] = m.indices[3];
    add([s + 1, e - 1], m[2] === 'src');
  }
  return links.sort((a, b) => a.start - b.start);
}

/** Plain text of a Markdown inline fragment, for titles and descriptions. */
function plainText(md) {
  return md
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[((?:[^\[\]]|\[[^\[\]]*\])*)\]\([^)]*\)/g, '$1')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[^\w*])[*_]([^*_]+)[*_](?=[^\w*]|$)/g, '$1$2')
    .replace(/\\([\\`*_{}\[\]()#+\-.!|<>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------------------------
// Page discovery and URL mapping

const linkTargets = (text) => scanLinks(text).map((l) => l.url);

const isExternal = (url) => /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');

/** Resolves a relative link from `from` (a repo path) to a repo path, or null if it leaves the repo. */
function resolveRepoPath(from, target) {
  let p = target;
  try { p = decodeURIComponent(p); } catch { /* keep as written */ }
  const resolved = p.startsWith('/') ? p.slice(1) : path.posix.join(path.posix.dirname(from), p);
  const norm = path.posix.normalize(resolved).replace(/\/$/, '');
  if (norm === '..' || norm.startsWith('../')) return null;
  return norm === '.' ? '' : norm;
}

/** Repo path of the page a link points at, if it points at a Markdown page (or a dir with a README). */
function pageFor(repo, repoPath) {
  if (repo.files.has(repoPath) && /\.md$/i.test(repoPath)) return repoPath;
  if (repo.dirs.has(repoPath) && repo.files.has(`${repoPath}/README.md`)) return `${repoPath}/README.md`;
  return null;
}

function discoverPages(product, repo) {
  const queue = [...repo.files].filter((f) => f.startsWith('docs/') && /\.md$/i.test(f)).sort();
  const pages = new Set();
  while (queue.length) {
    const file = queue.shift();
    if (pages.has(file)) continue;
    pages.add(file);
    for (const target of linkTargets(repo.read(file))) {
      if (isExternal(target) || target.startsWith('#')) continue;
      const rp = resolveRepoPath(file, target.split('#')[0].split('?')[0]);
      const page = rp === null ? null : pageFor(repo, rp);
      if (page && !pages.has(page)) queue.push(page);
    }
  }
  return [...pages].sort();
}

/** Default slug rule: drop a leading docs/, README.md names its directory, lowercase, '.' → '-'. */
function slugFor(product, file) {
  if (file === product.index) return '';
  if (product.slugs[file]) return product.slugs[file];
  let s = file.replace(/^docs\//, '').replace(/\.md$/i, '');
  s = s.replace(/(^|\/)README$/i, '');
  return s
    .split('/')
    .map((seg) => seg.toLowerCase().replace(/\./g, '-').replace(/[^a-z0-9_-]+/g, '-'))
    .join('/');
}

const siteUrl = (product, slug) => `/${product.id}/docs/${slug ? `${slug}/` : ''}`;

// ---------------------------------------------------------------------------------------------
// Page conversion

function convertPage(product, repo, file, slugs, retitled) {
  let text = repo.read(file);

  // License header: the leading HTML comment(s).
  text = text.replace(/^\s*(<!--[\s\S]*?-->\s*)+/, (m) => (/licen[cs]e|copyright/i.test(m) ? '' : m));

  // Leading H1 → title (Starlight renders the title as the page's h1).
  let title = null;
  const h1 = /^# +(.+?)(?: +#+)? *$/m.exec(maskCode(text));
  if (!h1) warn(`${product.repo}/${file}: no H1; using the file name as the title`);
  else {
    if (text.slice(0, h1.index).trim()) warn(`${product.repo}/${file}: content before the H1 is kept`);
    title = plainText(text.slice(h1.index, h1.index + h1[0].length).replace(/^# +/, '').replace(/ +#+ *$/, ''));
    text = text.slice(0, h1.index) + text.slice(h1.index + h1[0].length);
  }
  title = product.titles[file] || title || path.posix.basename(file, '.md');

  // A later H1 (RELEASE.md has one per release) becomes an H2, and the headings under it move
  // down a level, so they are listed in "On this page".
  const later = maskCode(text).search(/^# /m);
  if (later !== -1) {
    const masked = maskCode(text).slice(later);
    text = text.slice(0, later) + text.slice(later).replace(/^(#{1,5}) /gm, (m, h, at) => (masked.startsWith(m, at) ? `#${m}` : m));
  }

  text = dropContentsList(product, file, text);

  // Links: rewrite in place, last first so earlier offsets stay valid.
  for (const link of scanLinks(text).reverse()) {
    const mapped = mapUrl(product, repo, file, slugs, link.url, link.image);
    if (mapped !== link.url) text = text.slice(0, link.start) + mapped + text.slice(link.end);
  }
  // [Old title](page) → [New title](page) for pages retitled in `titles`.
  for (const [url, { from, to }] of retitled) {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`\\[${esc(from)}\\]\\(${esc(url)}(#[^)\\s]*)?\\)`, 'g'), (_m, frag) => `[${to}](${url}${frag || ''})`);
  }

  text = escapeUnknownTags(product, file, text);

  // GitHub alerts → Starlight asides.
  let body = convertAlerts(product, file, text).replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
  body = markOutputBlocks(product, file, body);
  body = applySiteNotes(product, file, body);
  body = noEmDashes(product, file, body);
  body = titleShellBlocks(body, title);
  if (file === product.index && product.cards) {
    // Before the first section, after any opening line.
    const at = Math.max(0, maskCode(body).search(/^## /m));
    const rest = dropCardSection(product, file, body.slice(at));
    body = body.slice(0, at) + landingCards(product, slugs) + '\n' + rest;
  }

  const description = product.descriptions[file] || firstParagraph(body);
  const source = `${GITHUB_ORG}/${product.repo}/blob/${repo.sha}/${file}`;
  // Search results name the product: Pagefind reads these from <head> (title shown in results,
  // and a "Project" filter).
  // "Getting started | Keytend KMIP Java SDK"; the landing page, titled "<project> documentation", is "Documentation | <project>".
  const pageTitle = title.includes(product.title) ? `Documentation | ${product.title}` : `${title} | ${product.title}`;
  const head = [
    { tag: 'title', content: pageTitle },
    { tag: 'meta', attrs: { 'data-pagefind-meta': 'title[content]', content: `${product.searchTitle?.(file, title) ?? title} · ${product.project}` } },
    { tag: 'meta', attrs: { 'data-pagefind-filter': 'project[content]', content: product.project } },
  ];
  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    `editUrl: ${JSON.stringify(`${GITHUB_ORG}/${product.repo}/edit/${product.branch}/${file}`)}`,
    `head: ${JSON.stringify(head)}`,
    '---',
    '',
    '',
  ].join('\n');
  const footer =
    `\n<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="${source}"><code>${file}</code></a> ` +
    `in <span class="kt-nw">keytend/${product.repo}</span> at commit <code>${repo.sha.slice(0, 7)}</code>.</p>\n`;
  return fm + body + footer;
}

/**
 * `> [!NOTE]` … blockquotes → `:::note[Note]` … `:::`. An alert is the blockquote whose first line
 * is the marker; it ends at the first line that is not quoted. An alert that opens with a bold
 * sentence ("**Experimental: not for production use.** …") takes it as its title instead of the
 * generic label. Otherwise the product's `asideTitles` give it one.
 */
function convertAlerts(product, file, text) {
  const titles = (product.asideTitles?.[file] || []).map(([pattern, title]) => ({ pattern, title, used: false }));
  const out = [];
  let alert = null;
  const flush = () => {
    if (!alert) return;
    let [type, label] = ALERTS[alert.kind];
    while (alert.body.length && !alert.body.at(-1).trim()) alert.body.pop();
    while (alert.body.length && !alert.body[0].trim()) alert.body.shift();
    const lead = /^(\*\*|__)([^*_[\]`<>\n]{2,80}?[.?!:])\1(?: +|$)/.exec(alert.body[0] ?? '');
    if (lead) {
      label = lead[2].replace(/[.:]$/, '');
      alert.body[0] = alert.body[0].slice(lead[0].length);
      if (!alert.body[0].trim()) {
        alert.body.shift();
        while (alert.body.length && !alert.body[0].trim()) alert.body.shift();
      }
    } else {
      const text = alert.body.join('\n');
      const t = titles.find((x) => !x.used && x.pattern.test(text));
      if (t) {
        t.used = true;
        label = t.title;
      } else {
        warn(`${product.repo}/${file}: a ${alert.kind} alert keeps the generic title "${label}" (add it to asideTitles): ${text.slice(0, 60)}…`);
      }
    }
    out.push(`${alert.indent}:::${type}[${label}]`, ...alert.body.map((l) => (l ? alert.indent + l : l)), `${alert.indent}:::`);
    alert = null;
  };
  eachLine(text.split('\n'), (line, _i, inFence) => {
    if (alert) {
      if (line.startsWith(`${alert.indent}>`)) {
        alert.body.push(line.slice(alert.indent.length + 1).replace(/^ /, ''));
        return;
      }
      flush();
    }
    const a = inFence ? null : /^(\s*)> *\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\] *$/.exec(line);
    if (a) alert = { indent: a[1], kind: a[2], body: [] };
    else out.push(line);
  });
  flush();
  for (const t of titles) if (!t.used) fail(`${product.repo}/${file}: aside title no longer matches an alert: ${t.pattern}`);
  return out.join('\n');
}

/** A heading's id as Astro makes it (github-slugger's rule). */
const slugify = (s) => s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');

/** The ids of a page's h2–h6 headings, in order (a repeated heading gets -1, -2, …). */
function headingIds(text) {
  const ids = [];
  const seen = new Map();
  eachLine(text.split('\n'), (line, _i, inFence) => {
    const h = !inFence && /^#{2,6} +(.+?)(?: +#+)? *$/.exec(line);
    if (!h) return;
    const base = slugify(plainText(h[1]));
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    ids.push(n ? `${base}-${n}` : base);
  });
  return ids;
}

let contentsListsDropped = 0;

/**
 * Drops in-page contents lists: a bullet list (nested or not) before the first section, or right
 * under a "Contents" heading, whose every item starts with a link to a heading of the same page,
 * links nowhere else, and follows the page's order. Starlight's "On this page" shows the same links.
 */
function dropContentsList(product, file, text) {
  const ids = headingIds(text);
  const lines = text.split('\n');
  const fenced = [];
  eachLine(lines, (_l, i, inFence) => { fenced[i] = inFence; });
  const isHeading = (i) => !fenced[i] && /^#{2,6} /.test(lines[i]);
  let end = lines.findIndex((_l, i) => isHeading(i));
  let contentsHeading = -1;
  if (end !== -1 && /^#{2,6} +(contents|table of contents|on this page) *$/i.test(lines[end])) {
    contentsHeading = end;
    end = lines.findIndex((_l, i) => i > contentsHeading && isHeading(i));
  }
  if (end === -1) end = lines.length;

  const ITEM = /^(\s*)[-*+] +(.*)$/;
  const inList = (k) =>
    !fenced[k] && (ITEM.test(lines[k]) || /^\s+\S/.test(lines[k]) || (!lines[k].trim() && k + 1 < end && /^\s*[-*+] +|^\s+\S/.test(lines[k + 1])));
  const removed = [];
  for (let i = 0; i < end; i++) {
    if (fenced[i] || !/^[-*+] +/.test(lines[i]) || (i > 0 && lines[i - 1].trim())) continue;
    let j = i;
    while (j < end && inList(j)) j++;
    const isContents = (from, to) => {
      const items = [];
      for (let k = from; k < to; k++) {
        if (ITEM.test(lines[k])) items.push(ITEM.exec(lines[k])[2]);
        else if (lines[k].trim()) items[items.length - 1] += ` ${lines[k].trim()}`;
      }
      let last = -1;
      const ok =
        items.length >= 3 &&
        items.every((item) => {
          const links = [...maskCode(item).matchAll(MD_LINK)].map((m) => ({ at: m.index, url: m[3] }));
          if (!links.length || links[0].at !== 0) return false;
          if (!links.every((l) => l.url.startsWith('#') && ids.includes(l.url.slice(1)))) return false;
          const at = ids.indexOf(links[0].url.slice(1));
          if (at <= last) return false;
          last = at;
          return true;
        });
      return ok && items.length;
    };
    // The whole list, or else its last blank-separated run of items (Markdown joins a contents
    // list to a list right above it when only a blank line parts them).
    let tail = j;
    while (tail > i && !(/^[-*+] +/.test(lines[tail - 1]) && !lines[tail - 2]?.trim())) tail--;
    tail = Math.max(i, tail - 1);
    for (const from of tail > i ? [i, tail] : [i]) {
      const n = isContents(from, j);
      if (n) { removed.push([from, j, n]); break; }
    }
    i = j;
  }
  for (const [i, j, n] of removed.reverse()) {
    let to = j;
    while (to < lines.length && !lines[to].trim()) to++;
    // A one-line lead-in that only introduces the list ("This page has three parts:") goes with it.
    let from = i;
    if (i >= 2 && !lines[i - 1].trim() && (i < 3 || !lines[i - 3].trim()) && /^[^-*+#|>:<\s].{0,59}:$/.test(lines[i - 2])) {
      from = i - 2;
      info(`${product.repo}/${file}: dropped the contents list's lead-in "${lines[i - 2]}"`);
    }
    lines.splice(from, to - from);
    info(`${product.repo}/${file}: dropped a ${n}-item contents list (Starlight shows "On this page")`);
    contentsListsDropped++;
  }
  if (removed.length && contentsHeading !== -1) {
    let to = contentsHeading + 1;
    while (to < lines.length && !lines[to].trim()) to++;
    lines.splice(contentsHeading, to - contentsHeading);
  }
  return lines.join('\n');
}

const SHELL = /^(sh|bash|shell|zsh|console)$/;

/**
 * Program output: a ```text block right after a shell block (blank lines between at most) is what
 * the commands print. It gets the title "Output" and the class that hides its copy button, as on
 * the site's other pages. A usage synopsis ("run.sh [--option] …") is not output and is left alone.
 * Output with no columns soft-wraps (Expressive Code's `wrap`, continuation lines indented), so a
 * long response line does not need sideways scrolling on a phone; columnar output (aligned runs of
 * spaces, tabs, table rules) keeps its lines.
 */
function markOutputBlocks(product, file, body) {
  const lines = body.split('\n');
  const blocks = [];
  let open = null;
  lines.forEach((line, i) => {
    const m = /^( *)(`{3,}|~{3,})(.*)$/.exec(line);
    if (open) {
      if (m && m[1] === open.indent && m[2][0] === open.fence[0] && m[2].length >= open.fence.length && !m[3].trim()) {
        blocks.push({ ...open, end: i });
        open = null;
      }
    } else if (m && !(m[2][0] === '`' && m[3].includes('`'))) {
      open = { start: i, indent: m[1], fence: m[2], info: m[3].trim() };
    }
  });
  const marked = [];
  for (let k = 1; k < blocks.length; k++) {
    const [prev, block] = [blocks[k - 1], blocks[k]];
    if (!SHELL.test(prev.info.split(/\s/)[0]) || block.info !== 'text') continue;
    if (lines.slice(prev.end + 1, block.start).some((l) => l.trim())) continue;
    if (lines.slice(block.start + 1, block.end).some((l) => /\[--?\w/.test(l))) continue;
    marked.push(block);
  }
  for (const b of [...marked].reverse()) {
    const columnar = lines.slice(b.start + 1, b.end).some(isColumnar);
    lines[b.start] = `${b.indent}${b.fence}text title="Output"${columnar ? '' : ' wrap hangingIndent=2'}`;
    lines.splice(b.end + 1, 0, '', `${b.indent}</div>`);
    lines.splice(b.start, 0, `${b.indent}<div class="kt-output">`, '');
  }
  if (marked.length) outputBlocks.push(`${product.repo}/${file}: ${marked.length}`);
  return lines.join('\n');
}
const outputBlocks = [];

/**
 * Shell blocks render as terminal frames, whose title bar is empty without a title. The first
 * untitled one under a heading takes the heading's text (the page title above the first heading),
 * as the site's other terminal frames carry a short title ("Build and install", "Start the
 * server"). Later ones under the same heading may do something else (another tool, another
 * request), so they render as plain code frames, with no title bar, instead.
 */
function titleShellBlocks(body, pageTitle) {
  const lines = body.split('\n');
  let heading = pageTitle;
  let titled = false;
  let fence = null;
  lines.forEach((line, i) => {
    const m = /^([ >]*)(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (m && m[2][0] === fence[0] && m[2].length >= fence.length && !m[3].trim()) fence = null;
      return;
    }
    const h = /^#{2,6} +(.+?)(?: +#+)? *$/.exec(line);
    if (h) { heading = plainText(h[1]); titled = false; return; }
    if (!m || (m[2][0] === '`' && m[3].includes('`'))) return;
    fence = m[2];
    const info = m[3].trim();
    if (!SHELL.test(info.split(/\s/)[0]) || /\btitle=/.test(info) || /\bframe=/.test(info)) return;
    const title = heading.replace(/^\d+\. +/, '').replace(/"/g, "'");
    lines[i] = `${m[1]}${m[2]}${info} ${titled ? 'frame="code"' : `title="${title}"`}`;
    titled = true;
  });
  return lines.join('\n');
}

/** A line laid out in columns: two or more spaces or a tab between fields, or a table rule. */
const isColumnar = (line) => /\S(?: {2,}|\t)\S/.test(line) || /^\s*[|+][-=+|]/.test(line) || /[\u2500-\u257f]/.test(line);

/** Applies the product's `siteNotes` and `edits` for this file; a note that no longer applies fails the sync. */
function applySiteNotes(product, file, body) {
  for (const [heading, note] of Object.entries(product.siteNotes?.[file] || {})) {
    if (heading === '') { body = `${note.trim()}\n\n${body}`; continue; }
    const lines = body.split('\n');
    let at = -1;
    eachLine(lines, (line, i, inFence) => {
      const h = !inFence && at === -1 && /^#{2,6} +(.+?)(?: +#+)? *$/.exec(line);
      if (h && plainText(h[1]) === heading) at = i;
    });
    if (at === -1) { fail(`${product.repo}/${file}: site note: no heading "${heading}"`); continue; }
    lines.splice(at + 1, 0, '', note.trim());
    body = lines.join('\n');
  }
  for (const [pattern, replacement] of product.edits?.[file] || []) {
    if (!pattern.test(body)) { fail(`${product.repo}/${file}: site edit no longer matches: ${pattern}`); continue; }
    body = body.replace(pattern, replacement);
  }
  return body;
}

/**
 * The site uses no em dashes (WRITING.md). A table cell that is only "—" (the upstream docs' "none")
 * becomes "n/a"; any other em dash fails the sync, so it gets a site edit or an upstream fix.
 */
function noEmDashes(product, file, body) {
  const lines = body.split('\n');
  eachLine(lines, (line, i, inFence) => {
    if (inFence) return;
    if (/^\s*\|/.test(line)) lines[i] = line.replace(/\|(\s*)—(?=\s*\|)/g, '|$1n/a');
    if (lines[i].includes('—')) fail(`${product.repo}/${file}: em dash on line ${i + 1}: ${lines[i].trim().slice(0, 80)}`);
  });
  return lines.join('\n');
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Drops the landing page's first section when it is only a list of links to pages the cards already
 * link to (keytend-kmip's "Start here").
 */
function dropCardSection(product, file, rest) {
  const m = /^## +(.+)\n\n((?:(?:[-*+] |  ).*\n)+)\n*(?=## |$)/.exec(rest);
  if (!m) return rest;
  const cardUrls = new Set(product.cards.map(([, , slug]) => siteUrl(product, slug)));
  const links = [...maskCode(m[2]).matchAll(MD_LINK)].map((l) => l[3].split('#')[0]);
  if (!links.length || !links.every((u) => cardUrls.has(u))) return rest;
  info(`${product.repo}/${file}: dropped the "${m[1]}" section, which repeats the landing cards`);
  return rest.slice(m[0].length);
}

/** The "Start here" link cards at the top of a product's docs landing page (one HTML block). */
function landingCards(product, slugs) {
  const known = new Set(slugs.values());
  const cards = product.cards.map(([eyebrow, title, slug, summary]) => {
    if (!known.has(slug)) fail(`${product.repo}: landing card "${title}" links to ${slug}, which is not an imported page`);
    return (
      `<li><a class="kt-doc-card" href="${siteUrl(product, slug)}">` +
      `<span class="kt-doc-card__eyebrow">${escapeHtml(eyebrow)}</span>` +
      `<span class="kt-doc-card__title">${escapeHtml(title)}</span>` +
      `<span class="kt-doc-card__summary">${keepNames(escapeHtml(summary)).replace(/`([^`]+)`/g, '<code>$1</code>')}</span></a></li>`
    );
  });
  return `<nav class="kt-doc-cards not-content" aria-label="Start here">\n<ul>\n${cards.join('\n')}\n</ul>\n</nav>\n`;
}

function firstParagraph(body) {
  // Blocks before the first heading; a prose paragraph is one that does not start like a list,
  // quote, table, aside, HTML block or code fence. Short ones ("Part of [x](y).") are skipped.
  const masked = maskCode(body);
  const firstHeading = masked.search(/^#{1,6} /m);
  const head = body.slice(0, firstHeading === -1 ? body.length : firstHeading);
  const NOT_PROSE = /^\s*([-*+>|<:]|```|~~~|\d+[.)]\s|!\[)/;
  for (const block of head.split(/\n\s*\n/)) {
    const lines = block.split('\n');
    const end = lines.findIndex((l) => NOT_PROSE.test(l));
    let text = plainText(lines.slice(0, end === -1 ? lines.length : end).join(' '));
    // "… works like this:" introduces a list; keep only the sentences before it.
    if (text.endsWith(':')) text = text.slice(0, text.lastIndexOf('. ') + 1);
    if (text.length >= 40) return truncate(text, 200);
  }
  return null;
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = cut.lastIndexOf('. ');
  if (sentence > max * 0.5) return cut.slice(0, sentence + 1);
  return cut.replace(/\s+\S*$/, '').replace(/[,;:]$/, '') + '…';
}

/**
 * Maps a link target in `file` to its URL on the site: imported pages → root-absolute site URLs
 * (fragment kept), other repository files → GitHub at the synced commit, external URLs unchanged.
 */
function mapUrl(product, repo, file, slugs, url, isImage) {
  // A link to the other project's repository → that project's docs on this site.
  const other = PRODUCTS.find((p) => p !== product && url?.replace(/\/$/, '') === `${GITHUB_ORG}/${p.repo}`);
  if (other) return siteUrl(other, '');
  if (!url || isExternal(url) || url.startsWith('#')) return url;
  const hashAt = url.indexOf('#');
  const pathPart = (hashAt === -1 ? url : url.slice(0, hashAt)).split('?')[0];
  const fragment = hashAt === -1 ? '' : url.slice(hashAt);
  const rp = resolveRepoPath(file, pathPart);
  if (rp === null) {
    warn(`${product.repo}/${file}: link leaves the repository: ${url}`);
    return url;
  }
  const page = isImage ? null : pageFor(repo, rp);
  if (page && slugs.has(page)) return siteUrl(product, slugs.get(page)) + fragment;
  if (isImage && repo.files.has(rp)) return `${RAW_ORG}/${product.repo}/${repo.sha}/${rp}`;
  if (rp === '' || repo.dirs.has(rp)) return `${GITHUB_ORG}/${product.repo}/tree/${repo.sha}${rp ? `/${rp}` : ''}${fragment}`;
  if (!repo.files.has(rp)) warn(`${product.repo}/${file}: link to a path that is not in the repository: ${url}`);
  return `${GITHUB_ORG}/${product.repo}/blob/${repo.sha}/${rp}${fragment}`;
}

/**
 * Escapes `<name>` placeholders written outside code ("restore <id>"): GitHub drops unknown tags,
 * a Markdown renderer would emit them as elements. Real HTML (details, br, a, …) is kept.
 */
const KNOWN_TAGS = new Set(['a', 'img', 'br', 'details', 'summary', 'sup', 'sub', 'kbd', 'p', 'code', 'em', 'strong', 'b', 'i', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'span', 'small', 'picture', 'source', 'ul', 'ol', 'li', 'pre', 'hr']);
function escapeUnknownTags(product, file, text) {
  const masked = maskCode(text).replace(/<!--[\s\S]*?-->/g, (c) => MASK.repeat(c.length));
  const hits = [...masked.matchAll(/<\/?([a-zA-Z][\w-]*)(?=[\s>/])/g)].filter((m) => !KNOWN_TAGS.has(m[1].toLowerCase()));
  for (const m of hits.reverse()) {
    info(`${product.repo}/${file}: escaped <${m[1]}> outside code`);
    text = text.slice(0, m.index) + '&lt;' + text.slice(m.index + 1);
  }
  return text;
}

// ---------------------------------------------------------------------------------------------
// Sidebar check: every imported page must be in src/sidebars.mjs, and every sidebar slug must exist.

function sidebarSlugs(items, acc = []) {
  for (const item of items) {
    if (typeof item === 'string') acc.push(item);
    else if (item.slug !== undefined) acc.push(item.slug);
    else if (item.items) sidebarSlugs(item.items, acc);
  }
  return acc;
}

async function checkSidebars(generated) {
  const { topics } = await import(`${pathToFileURL(SIDEBARS).href}?t=${Date.now()}`);
  const errors = [];
  for (const product of PRODUCTS) {
    const topic = topics.find((t) => t.link === `/${product.id}/docs/`);
    if (!topic) { errors.push(`src/sidebars.mjs: no topic links to /${product.id}/docs/`); continue; }
    const listed = sidebarSlugs(topic.items).map((s) => s.replace(/^\/|\/$/g, ''));
    const expected = new Set(generated[product.id]);
    const seen = new Set();
    for (const s of listed) {
      if (!expected.has(s)) errors.push(`src/sidebars.mjs: "${s}" is not an imported page (dead entry)`);
      if (seen.has(s)) errors.push(`src/sidebars.mjs: "${s}" is listed twice`);
      seen.add(s);
    }
    for (const s of expected) if (!seen.has(s)) errors.push(`src/sidebars.mjs: imported page "${s}" is missing from the ${topic.label} sidebar`);
  }
  return errors;
}

// ---------------------------------------------------------------------------------------------

async function main() {
  const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  const manifest = {};
  const generated = {};

  for (const product of PRODUCTS) {
    const repo = openRepo(product);
    const pages = discoverPages(product, repo);
    const slugs = new Map(pages.map((p) => [p, slugFor(product, p)]));
    const bySlug = new Map();
    for (const [p, s] of slugs) {
      if (bySlug.has(s)) throw new Error(`${product.repo}: ${p} and ${bySlug.get(s)} both map to slug "${s}"`);
      bySlug.set(s, p);
    }

    for (const f of [...Object.keys(product.siteNotes || {}), ...Object.keys(product.edits || {}), ...Object.keys(product.asideTitles || {})]) {
      if (!slugs.has(f)) fail(`${product.repo}: site note for ${f}, which is not an imported page`);
    }
    // Pages retitled in `titles`: url → { from: the H1, to: the new title }.
    const retitled = new Map();
    for (const [f, to] of Object.entries(product.titles)) {
      const h1 = slugs.has(f) && /^# +(.+?)(?: +#+)? *$/m.exec(maskCode(repo.read(f)));
      if (h1 && plainText(h1[1]) !== to) retitled.set(siteUrl(product, slugs.get(f)), { from: h1[1], to });
    }

    const outDir = path.join(CONTENT_DIR, product.id, 'docs');
    fs.rmSync(outDir, { recursive: true, force: true });
    for (const page of pages) {
      const slug = slugs.get(page);
      const dest = path.join(outDir, slug ? `${slug}.md` : 'index.md');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, convertPage(product, repo, page, slugs, retitled));
    }
    generated[product.id] = pages.map((p) => `${product.id}/docs${slugs.get(p) ? `/${slugs.get(p)}` : ''}`);

    const prev = previous[product.id];
    manifest[product.id] = {
      repo: `${GITHUB_ORG}/${product.repo}`,
      branch: product.branch,
      commit: repo.sha,
      shortCommit: repo.sha.slice(0, 7),
      commitDate: repo.commitDate,
      syncedAt: prev && prev.commit === repo.sha && prev.syncedAt ? prev.syncedAt : new Date().toISOString().slice(0, 10),
      pageCount: pages.length,
      pages: Object.fromEntries(pages.map((p) => [p, siteUrl(product, slugs.get(p))])),
    };
    console.log(`${product.repo} @ ${repo.sha.slice(0, 7)}: ${pages.length} pages → src/content/docs/${product.id}/docs/`);
  }

  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  for (const n of [...new Set(notes)]) console.log(`note: ${n}`);
  console.log(`${contentsListsDropped} contents lists dropped; output blocks marked: ${outputBlocks.join(", ")}`);
  for (const w of [...new Set(warnings)]) console.warn(`warning: ${w}`);
  const errors = [...failures, ...(await checkSidebars(generated))];
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
