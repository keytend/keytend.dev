// Accessible names for scrollable code blocks and for copy buttons, on every page that has
// Expressive Code blocks (the docs and the marketing pages' <Code> alike).
//
// Expressive Code's core "Scrollable block tabindex" script gives a code block's <pre> tabindex="0"
// and role="region" while its content is wider than the block, so keyboard users can scroll it,
// but no name: screen readers announce an unnamed region. This plugin adds a script that names
// each such region and drops the name again when Expressive Code drops the role:
//
// - by its frame title (aria-labelledby the title), when no other block on the page has that title
//   and the title is not the generic "Output";
// - otherwise "<title, or Terminal / the language>, <nearest heading above it>" (aria-label), with
//   a number when that is still not unique ("Output, Make a first request 2"). A title that repeats
//   the heading is not said twice ("Build and install 2").
//
// Expressive Code names every copy button "Copy to clipboard" (its title), so a page of commands
// has dozens of identical buttons. Each gets the aria-label "Copy: <the block's name>" ("Copy:
// Start the server"); the title, the visible tooltip and the "Copied" feedback stay as they are.
//
// The plugin holds only strings and runs in the browser; it is registered in ec.config.mjs.

// The script, as a string: a function's toString() would differ between Node and Vite builds of
// this file, and so would the hashed script name the <Code> component and Markdown refer to.
const SCRIPT = String.raw`(function nameCodeRegions() {
  const SKIP = 'nav, header, footer, aside:not(.starlight-aside), starlight-toc, mobile-starlight-toc, .sr-only, [hidden]';
  const LANGUAGES = {
    java: 'Java', kotlin: 'Kotlin', xml: 'XML', json: 'JSON', yaml: 'YAML', toml: 'TOML', ini: 'INI',
    properties: 'Properties', c: 'C', go: 'Go', python: 'Python', rust: 'Rust', sql: 'SQL', text: 'Text',
    sh: 'Shell', bash: 'Shell', shell: 'Shell', zsh: 'Shell', console: 'Shell',
  };
  let names = null;

  const headingBefore = (headings, el) => {
    let found = null;
    for (const h of headings) {
      if (!(h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) break;
      found = h;
    }
    return found?.textContent.replace(/\s+/g, ' ').trim() || '';
  };

  // Names for every block on the page, worked out once so that duplicates can be told apart:
  // { labelledby, text } (a unique title) or { label }.
  const computeNames = () => {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((h) => !h.closest(SKIP));
    const blocks = [...document.querySelectorAll('.expressive-code pre')].map((pre) => {
      const figure = pre.closest('figure');
      const titleEl = figure?.querySelector(':scope > figcaption .title');
      const title = titleEl?.textContent.replace(/\s+/g, ' ').trim() || '';
      const kind = figure?.classList.contains('is-terminal')
        ? 'Terminal'
        : LANGUAGES[pre.dataset.language] || 'Code';
      return { pre, figure, titleEl, title, kind, heading: headingBefore(headings, pre) };
    });
    const titleCount = new Map();
    for (const b of blocks) if (b.title) titleCount.set(b.title, (titleCount.get(b.title) || 0) + 1);
    const used = new Map();
    const result = new Map();
    let ids = 0;
    for (const b of blocks) {
      if (b.title && b.title !== 'Output' && titleCount.get(b.title) === 1) {
        if (!b.titleEl.id) b.titleEl.id = 'kt-code-title-' + ++ids;
        result.set(b.pre, { figure: b.figure, labelledby: b.titleEl.id, text: b.title });
        continue;
      }
      const first = b.title || b.kind;
      let label = [first, b.heading !== first && b.heading].filter(Boolean).join(', ');
      const n = (used.get(label) || 0) + 1;
      used.set(label, n);
      if (n > 1) label += ' ' + n;
      result.set(b.pre, { figure: b.figure, label, text: label });
    }
    return result;
  };

  const update = (pre) => {
    if (pre.getAttribute('role') === 'region') {
      names ??= computeNames();
      const name = names.get(pre);
      if (!name) return;
      if (name.labelledby) pre.setAttribute('aria-labelledby', name.labelledby);
      else pre.setAttribute('aria-label', name.label);
    } else {
      pre.removeAttribute('aria-labelledby');
      pre.removeAttribute('aria-label');
    }
  };

  names ??= computeNames();
  for (const { figure, text } of names.values()) {
    figure?.querySelector(':scope > .copy button')?.setAttribute('aria-label', 'Copy: ' + text);
  }
  document.querySelectorAll('.expressive-code pre[role]').forEach(update);
  new MutationObserver((records) => {
    for (const r of records) if (r.target.matches?.('.expressive-code pre')) update(r.target);
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['role'] });
})()`;

export default function codeRegionNames() {
  return {
    name: 'kt-code-region-names',
    jsModules: [`try{${SCRIPT}}catch(e){console.error('[kt] code region names:',e)}`],
  };
}
