// Moves the site footer (SiteFooter.astro) out of <main>.
//
// Starlight renders its Footer component inside <main>, where a <footer> is
// not the page's contentinfo landmark. The site footer is the page footer, so
// on every HTML page it moves to just after </main>: the same column, but a
// landmark of its own. Docs pagination and the edit link stay in <main>.
import { defineMiddleware } from 'astro:middleware';

const START = /<footer\b[^>]*\bdata-kt-site-footer\b[^>]*>/;

export function moveSiteFooter(html: string): string {
  const start = html.search(START);
  if (start < 0) return html;
  const end = html.indexOf('</footer>', start);
  const mainEnd = html.indexOf('</main>', end);
  if (end < 0 || mainEnd < 0) return html;
  const footer = html.slice(start, end + '</footer>'.length);
  return (
    html.slice(0, start) +
    html.slice(start + footer.length, mainEnd + '</main>'.length) +
    footer +
    html.slice(mainEnd + '</main>'.length)
  );
}

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = await response.text();
  return new Response(moveSiteFooter(html), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});
