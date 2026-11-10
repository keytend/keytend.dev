// How code blocks enter the Pagefind index (the site search). Code stays searchable, since an
// identifier or flag may appear only in a code block, but it counts for half as much as prose
// when Pagefind ranks pages. The frame title is not indexed: it repeats the heading above it.
export default function codeSearch() {
  return {
    name: 'kt-code-search',
    hooks: {
      postprocessRenderedBlock: ({ renderData }) => {
        const figure = renderData.blockAst;
        if (figure?.type !== 'element') return;
        figure.properties.dataPagefindWeight = '0.5';
        for (const child of figure.children ?? []) {
          if (child.type === 'element' && child.tagName === 'figcaption') child.properties.dataPagefindIgnore = '';
        }
      },
    },
  };
}
