import { products, type ProductSlug } from '../../data/products';

/** Routes rendered by src/pages/ (they draw their own page heading). */
export const sitePages = ['/', '/downloads/', '/news/', '/community/', '/kmip-java/', '/kmip-server/'];

export interface NavLink {
  label: string;
  href: string;
  /** Path prefixes that mark this item as the current section. */
  match?: string[];
}

/** The two projects, as plain header links. Each opens the project's overview; the current
 * project (its overview or anything in its docs) is underlined. */
export const projectLinks = (Object.keys(products) as ProductSlug[]).map((slug) => ({
  slug,
  label: products[slug].title,
  href: products[slug].overview,
  docs: products[slug].docs,
  description: products[slug].kind,
}));

/** 'page' on a project's overview, 'true' anywhere else in that project (its docs). */
export function projectCurrent(pathname: string, slug: ProductSlug) {
  const p = products[slug];
  if (pathname === p.overview) return 'page';
  return pathname.startsWith(p.overview) ? 'true' : undefined;
}

export const navLinks: NavLink[] = [
  { label: 'Downloads', href: '/downloads/' },
  { label: 'News', href: '/news/' },
  { label: 'Community', href: '/community/' },
];

/** True when `pathname` is inside one of `prefixes` (docs win over overviews). */
export function isCurrent(pathname: string, prefixes: string[] = [], exclude: string[] = []) {
  if (exclude.some((p) => pathname.startsWith(p))) return false;
  return prefixes.some((p) => pathname === p || pathname.startsWith(p));
}

export const normalizePath = (pathname: string) => (pathname.endsWith('/') ? pathname : `${pathname}/`);
