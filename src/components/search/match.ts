// Which query words did Pagefind really find?
//
// When no indexed word starts with a query word, Pagefind shortens the word
// until something matches: "qzxqzxqzx" ends up matching "-q", and
// "xyznoresults987" matches "X.Y". Those pages are not results. Pagefind
// applies the fallback to the whole query word (every page gets the same
// shortened prefix), so checking the words it marked on the top few pages
// tells us whether a query word was found or replaced by a fallback.
//
// The rule: a marked word counts as a match for query word q (letters and
// digits only, lower case) when one of its parts shares a prefix with q of at
// least
//   - all of q, when q has 4 characters or fewer ("conf" -> "configuration",
//     "tls" -> "TlsTransport", "q" -> "-q"), or
//   - max(4, 60% of q) characters for longer words, which keeps stemming and
//     small typos ("configuring" -> "configuration", "perconaa" -> "Percona")
//     and drops short fallbacks ("kmipxyz" -> "kmip" is 4 of 7).
// A word's parts are the word itself with punctuation removed ("Re-key" ->
// "rekey") and its pieces split at punctuation and camelCase ("usage.toTtlv()"
// -> "usage", "to", "ttlv").

/** Query words as Pagefind sees them: split on spaces, punctuation dropped, lower case. */
export function queryWords(query: string): string[] {
  return query
    .split(/\s+/)
    .map((w) => compact(w))
    .filter((w) => w.length > 0);
}

/** Letters and digits only, lower case. */
export function compact(word: string): string {
  return word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

/** The comparable parts of an indexed word. */
export function wordParts(word: string): string[] {
  const parts = new Set<string>();
  const whole = compact(word);
  if (whole) parts.add(whole);
  for (const piece of word.split(/[^\p{L}\p{N}]+/u)) {
    if (!piece) continue;
    parts.add(piece.toLocaleLowerCase());
    for (const camel of piece.split(/(?<=\p{Ll})(?=\p{Lu})|(?<=\p{L})(?=\p{N})|(?<=\p{N})(?=\p{L})/u)) {
      if (camel) parts.add(camel.toLocaleLowerCase());
    }
  }
  return [...parts];
}

/** Characters of `q` an indexed word must share as a prefix to count as a match. */
export function requiredPrefix(q: string): number {
  return q.length <= 4 ? q.length : Math.max(4, Math.ceil(q.length * 0.6));
}

function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/** Does the indexed word `word` count as a match for query word `q`? */
export function wordMatches(word: string, q: string): boolean {
  const need = requiredPrefix(q);
  return wordParts(word).some((part) => sharedPrefix(part, q) >= need);
}

/**
 * Query words that the given pages really contain. `pages` are Pagefind
 * result data: `content` (plain text) and `locations` (indexes of the words
 * Pagefind marked, counting words split at whitespace, as Pagefind does).
 * The page title counts too.
 */
export function wordsFound(
  words: string[],
  pages: { content: string; locations: number[]; meta?: { title?: string } }[],
): Set<string> {
  const found = new Set<string>();
  for (const page of pages) {
    const tokens = page.content.split(/[^\S﻿]+/);
    const marked = page.locations.map((l) => tokens[l]).filter(Boolean);
    const title = (page.meta?.title ?? '').split(/\s+/);
    for (const q of words) {
      if (found.has(q)) continue;
      if (marked.some((w) => wordMatches(w, q)) || title.some((w) => wordMatches(w, q))) found.add(q);
    }
  }
  return found;
}
