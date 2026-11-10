// The search dialog behind the header's search button (see
// ../starlight/Search.astro for the markup). Uses Pagefind's JS API directly.
import { searchProjects } from './projects';
import { queryWords, wordsFound } from './match';

type PagefindSubResult = { title: string; url: string; excerpt: string; locations: number[] };
type PagefindData = {
  url: string;
  content: string;
  excerpt: string;
  locations: number[];
  meta: { title?: string };
  filters: Record<string, string[]>;
  sub_results: PagefindSubResult[];
};
type PagefindResult = { id: string; data: () => Promise<PagefindData> };
type PagefindResponse = {
  results: PagefindResult[];
  filters: Record<string, Record<string, number>>;
  totalFilters: Record<string, Record<string, number>>;
};
type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  filters: () => Promise<unknown>;
  search: (q: string, o?: { filters?: Record<string, string> }) => Promise<PagefindResponse>;
};

const PAGE_SIZE = 10;
/** Of Pagefind's top results, how many are reordered so the current project's pages come first. */
const PREFER_TOP = 8;

/**
 * Pagefind's results with the pages of the project being read (the page's own `project` filter)
 * moved ahead of other projects' pages within the top PREFER_TOP. A preference, not a filter.
 */
async function preferHere(pf: Pagefind, query: string, all: PagefindResponse): Promise<PagefindResponse> {
  const here = document.querySelector<HTMLMetaElement>('meta[data-pagefind-filter="project[content]"]')?.content;
  if (!here || here === 'Keytend') return all;
  const mine = new Set((await pf.search(query, { filters: { project: here } })).results.map((r) => r.id));
  const top = all.results.slice(0, PREFER_TOP);
  const results = [...top.filter((r) => mine.has(r.id)), ...top.filter((r) => !mine.has(r.id)), ...all.results.slice(PREFER_TOP)];
  return { ...all, results };
}

const PROBE = 5; // pages checked for real matches (see match.ts)
const RELATED = 5;
const DEBOUNCE_MS = 150;
const MAX_SUBS = 2;

const badgeFor = new Map<string, string>(searchProjects.map((p) => [p.value, p.badge]));
const chipFor = new Map<string, string>(searchProjects.map((p) => [p.value, p.chip]));

let pagefindPromise: Promise<Pagefind> | undefined;
function loadPagefind(): Promise<Pagefind> {
  pagefindPromise ??= (async () => {
    const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
    const pf: Pagefind = await import(/* @vite-ignore */ `${base}pagefind/pagefind.js`);
    await pf.options({ baseUrl: base, excerptLength: 28 });
    await pf.init();
    // Load the filter index up front, so the first search already has counts.
    await pf.filters();
    return pf;
  })();
  pagefindPromise.catch(() => (pagefindPromise = undefined));
  return pagefindPromise;
}

/** "Re-key and Re-key Key Pair · keytend-kmip-server" -> "Re-key and Re-key Key Pair" */
function pageTitle(data: PagefindData): string {
  const title = data.meta.title ?? data.url;
  const cut = title.lastIndexOf(' · ');
  return cut > 0 ? title.slice(0, cut) : title;
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Pagefind excerpts are escaped text with <mark> tags; keep only those. An excerpt cut right after
 * an ellipsis in the text ("for example … …") gets one.
 */
function setExcerpt(node: HTMLElement, html: string) {
  const safe = html.replace(/<(?!\/?mark>)/g, '&lt;').replace(/…(\s*…)+/g, '…');
  node.innerHTML = safe;
}

function quoted(query: string) {
  return `“${query.trim()}”`;
}

class SiteSearch extends HTMLElement {
  #dialog!: HTMLDialogElement;
  #input!: HTMLInputElement;
  #status!: HTMLElement;
  #intro!: HTMLElement;
  #message!: HTMLElement;
  #list!: HTMLOListElement;
  #more!: HTMLButtonElement;
  #body!: HTMLElement;
  #chips: HTMLButtonElement[] = [];
  #project = '';
  #timer: number | undefined;
  #run = 0;
  #pending: PagefindResult[] = [];
  #returnFocus: HTMLElement | null = null;

  connectedCallback() {
    if (this.#dialog) return;
    const openBtn = this.querySelector<HTMLButtonElement>('button[data-open-modal]')!;
    this.#dialog = this.querySelector('dialog')!;
    this.#input = this.querySelector('input')!;
    this.#status = this.querySelector('[role="status"]')!;
    this.#intro = this.querySelector('[data-intro]')!;
    this.#message = this.querySelector('[data-message]')!;
    this.#list = this.querySelector('[data-results]')!;
    this.#more = this.querySelector('[data-more]')!;
    this.#body = this.querySelector('[data-body]')!;
    this.#chips = Array.from(this.querySelectorAll<HTMLButtonElement>('[data-project]'));

    openBtn.addEventListener('click', () => this.open());
    openBtn.disabled = false;
    this.querySelector('[data-close-modal]')!.addEventListener('click', () => this.close());

    // Ctrl/Cmd+K toggles; "/" opens when not typing somewhere else.
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.#dialog.open ? this.close() : this.open();
      } else if (
        e.key === '/' &&
        !e.metaKey && !e.ctrlKey && !e.altKey &&
        !this.#dialog.open &&
        !isEditable(e.target)
      ) {
        e.preventDefault();
        this.open();
      }
    });

    // A click on the backdrop (the dialog element itself) or on a result closes.
    this.#dialog.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target === this.#dialog || target.closest('a[href]')) this.close();
    });
    this.#dialog.addEventListener('close', () => {
      document.body.toggleAttribute('data-search-modal-open', false);
      const back = this.#returnFocus;
      this.#returnFocus = null;
      if (back?.isConnected) back.focus({ preventScroll: true });
    });
    this.#dialog.addEventListener('keydown', (e) => this.#onKeydown(e));

    this.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#links()[0]?.click();
    });
    this.#input.addEventListener('input', () => this.#schedule());
    for (const chip of this.#chips) {
      chip.addEventListener('click', () => {
        this.#setProject(chip.dataset.project ?? '');
        this.#input.focus();
      });
    }
    for (const example of this.querySelectorAll<HTMLButtonElement>('[data-example]')) {
      example.addEventListener('click', () => {
        this.#input.value = example.dataset.example ?? '';
        this.#input.focus();
        this.#search();
      });
    }
    this.#more.addEventListener('click', () => this.#showMore(true));
  }

  open() {
    if (this.#dialog.open) return;
    const active = document.activeElement;
    this.#returnFocus =
      active instanceof HTMLElement && active !== document.body
        ? active
        : this.querySelector<HTMLElement>('button[data-open-modal]');
    this.#dialog.showModal();
    document.body.toggleAttribute('data-search-modal-open', true);
    this.#input.focus();
    this.#input.select();
    if (!this.hasAttribute('data-dev')) loadPagefind().catch(() => {});
  }

  close() {
    if (this.#dialog.open) this.#dialog.close();
  }

  /** Result links and the "Show more" button, in order: what the arrow keys move through. */
  #links(): HTMLElement[] {
    return Array.from(this.#body.querySelectorAll<HTMLElement>('[data-nav]')).filter(
      (n) => !n.hidden && !n.closest('[hidden]'),
    );
  }

  #onKeydown(e: KeyboardEvent) {
    const links = this.#links();
    const target = e.target as HTMLElement;
    const index = links.indexOf(target);

    // Escape always closes (in a search box, the browser would only clear it).
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (target === this.#input || index >= 0) {
        e.preventDefault();
        const next = e.key === 'ArrowDown' ? index + 1 : index - 1;
        if (next < 0) this.#input.focus();
        else links[Math.min(next, links.length - 1)]?.focus();
        links[Math.min(next, links.length - 1)]?.scrollIntoView({ block: 'nearest' });
      }
      return;
    }

    // Typing while a result has focus goes back to the search box.
    if (index >= 0 && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key.length === 1 || e.key === 'Backspace')) {
      if (e.key === ' ') return; // Space keeps its meaning on buttons
      this.#input.focus();
      return;
    }

    // Keep Tab inside the dialog.
    if (e.key === 'Tab') {
      const focusable = Array.from(
        this.#dialog.querySelectorAll<HTMLElement>('input, button, a[href]'),
      ).filter((n) => !(n as HTMLButtonElement).disabled && n.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }

  #setProject(value: string) {
    this.#project = value;
    for (const chip of this.#chips) {
      chip.setAttribute('aria-pressed', String((chip.dataset.project ?? '') === value));
    }
    this.#search();
  }

  #schedule() {
    window.clearTimeout(this.#timer);
    if (this.hasAttribute('data-dev')) return; // no index in `astro dev`
    if (!this.#input.value.trim()) {
      this.#search();
      return;
    }
    this.#timer = window.setTimeout(() => this.#search(), DEBOUNCE_MS);
  }

  #setCounts(counts: Record<string, number> | undefined) {
    let total = 0;
    for (const chip of this.#chips) {
      const value = chip.dataset.project ?? '';
      if (value) total += counts?.[value] ?? 0;
    }
    for (const chip of this.#chips) {
      const value = chip.dataset.project ?? '';
      const slot = chip.querySelector<HTMLElement>('[data-count]')!;
      const n = counts ? (value ? counts[value] ?? 0 : total) : undefined;
      slot.textContent = n === undefined ? '' : String(n);
      chip.toggleAttribute('data-empty', n === 0);
    }
  }

  #showIntro() {
    this.#intro.hidden = false;
    this.#message.hidden = true;
    this.#list.hidden = true;
    this.#list.replaceChildren();
    this.#more.hidden = true;
    this.#pending = [];
    this.#status.textContent = '';
    this.#setCounts(undefined);
    this.removeAttribute('data-has-query');
  }

  async #search() {
    const run = ++this.#run;
    const query = this.#input.value.trim();
    const words = queryWords(query);
    if (!query || !words.length) {
      this.#showIntro();
      return;
    }
    this.setAttribute('data-has-query', '');
    this.#body.setAttribute('aria-busy', 'true');
    try {
      const pf = await loadPagefind();
      const all = await pf.search(query);
      if (run !== this.#run) return;

      // Which query words were really found? (match.ts)
      const probe = await Promise.all(all.results.slice(0, PROBE).map((r) => r.data()));
      if (run !== this.#run) return;
      const found = wordsFound(words, probe);
      const projectFilter = this.#project ? { filters: { project: this.#project } } : {};

      if (all.results.length && found.size === words.length) {
        const shown = this.#project ? await pf.search(query, projectFilter) : await preferHere(pf, query, all);
        if (run !== this.#run) return;
        this.#setCounts(all.filters.project ?? all.totalFilters.project);
        await this.#render(run, query, shown.results, all.results.length);
        return;
      }

      // Some query words were not found: say so, and offer pages that match the rest.
      this.#setCounts(undefined);
      const rest = words.filter((w) => found.has(w));
      const related = rest.length ? (await pf.search(rest.join(' '), projectFilter)).results : [];
      if (run !== this.#run) return;
      await this.#renderNoMatch(run, query, rest, related.slice(0, RELATED));
    } catch (error) {
      if (run !== this.#run) return;
      console.error('[search]', error);
      this.#intro.hidden = true;
      this.#list.hidden = true;
      this.#more.hidden = true;
      this.#message.hidden = false;
      this.#message.replaceChildren(el('p', 'kt-sd__note', 'Search could not load. Reload the page and try again.'));
      this.#status.textContent = 'Search could not load.';
    } finally {
      if (run === this.#run) this.#body.removeAttribute('aria-busy');
    }
  }

  async #render(run: number, query: string, results: PagefindResult[], totalAll: number) {
    const items = await this.#build(results.slice(0, PAGE_SIZE));
    if (run !== this.#run) return;
    this.#intro.hidden = true;
    this.#pending = results.slice(PAGE_SIZE);
    this.#list.replaceChildren(...items);
    this.#list.hidden = items.length === 0;
    this.#more.hidden = this.#pending.length === 0;
    this.#body.scrollTop = 0;

    const n = results.length;
    if (n) {
      this.#message.hidden = true;
      this.#status.textContent = `${n} ${n === 1 ? 'result' : 'results'}`;
    } else {
      // Only reachable with a project chip selected: other projects have pages.
      const name = chipFor.get(this.#project) ?? this.#project;
      const p = el('p', 'kt-sd__note');
      p.append(`No ${name} pages match ${quoted(query)}. `);
      const all = el('button', 'kt-sd__link', `Show all ${totalAll} results`);
      all.type = 'button';
      all.dataset.nav = '';
      all.addEventListener('click', () => {
        this.#setProject('');
        this.#input.focus();
      });
      p.append(all);
      this.#message.replaceChildren(p);
      this.#message.hidden = false;
      this.#status.textContent = `No results in ${name}`;
    }
  }

  async #renderNoMatch(run: number, query: string, rest: string[], related: PagefindResult[]) {
    const items = await this.#build(related);
    if (run !== this.#run) return;
    this.#intro.hidden = true;
    this.#pending = [];
    this.#more.hidden = true;
    this.#body.scrollTop = 0;

    const scope = this.#project ? ` in ${chipFor.get(this.#project)}` : '';
    const note = el('p', 'kt-sd__note kt-sd__note--strong', `No pages${scope} match ${quoted(query)}.`);
    const hint = el('p', 'kt-sd__note', 'Check the spelling, or search for a shorter word.');
    const parts: HTMLElement[] = [note];
    if (items.length) {
      const words = rest.map((w) => quoted(w)).join(' ');
      parts.push(el('h2', 'kt-sd__group', `Pages that match ${words}`));
    } else {
      parts.push(hint);
    }
    this.#message.replaceChildren(...parts);
    this.#message.hidden = false;
    this.#list.replaceChildren(...items);
    this.#list.hidden = items.length === 0;
    this.#status.textContent = items.length
      ? `No results. ${items.length} related ${items.length === 1 ? 'page' : 'pages'}.`
      : 'No results';
  }

  async #showMore(focusFirst: boolean) {
    const run = this.#run;
    const batch = this.#pending.slice(0, PAGE_SIZE);
    const items = await this.#build(batch);
    if (run !== this.#run) return;
    this.#pending = this.#pending.slice(PAGE_SIZE);
    this.#list.append(...items);
    this.#more.hidden = this.#pending.length === 0;
    if (focusFirst) items[0]?.querySelector<HTMLElement>('a')?.focus();
  }

  async #build(results: PagefindResult[]): Promise<HTMLLIElement[]> {
    const pages = await Promise.all(results.map((r) => r.data()));
    const words = queryWords(this.#input.value);
    return pages.map((data) => {
      const li = el('li', 'kt-sr');
      const main = el('a', 'kt-sr__page');
      main.href = data.url;
      main.dataset.nav = '';
      const head = el('span', 'kt-sr__head');
      head.append(el('span', 'kt-sr__title', pageTitle(data)));
      const project = data.filters.project?.[0] ?? '';
      const badge = badgeFor.get(project) ?? project;
      if (badge) {
        const b = el('span', 'kt-sr__badge', badge);
        b.dataset.project = project;
        head.append(b);
      }
      const excerpt = el('span', 'kt-sr__excerpt');
      setExcerpt(excerpt, data.excerpt);
      main.append(head, excerpt);
      li.append(main);

      // Sections whose title has a query word first, then the most matches (sort is stable).
      const named = (s: PagefindSubResult) => (words.some((w) => s.title.toLowerCase().includes(w)) ? 0 : 1);
      const subs = data.sub_results
        .filter((s) => {
          const hash = s.url.indexOf('#');
          return hash >= 0 && !s.url.endsWith('#_top');
        })
        .sort((a, b) => named(a) - named(b) || b.locations.length - a.locations.length)
        .slice(0, MAX_SUBS);
      if (subs.length) {
        const ul = el('ul', 'kt-sr__subs');
        ul.setAttribute('aria-label', `Sections of ${pageTitle(data)}`);
        for (const sub of subs) {
          const item = el('li', 'kt-sr__sub-item');
          const a = el('a', 'kt-sr__sub');
          a.href = sub.url;
          a.dataset.nav = '';
          a.append(el('span', 'kt-sr__sub-title', sub.title));
          const ex = el('span', 'kt-sr__sub-excerpt');
          setExcerpt(ex, sub.excerpt);
          a.append(ex);
          item.append(a);
          ul.append(item);
        }
        li.append(ul);
      }
      return li;
    });
  }
}

export function defineSiteSearch() {
  if (!customElements.get('kt-site-search')) customElements.define('kt-site-search', SiteSearch);
}
