# keytend.dev
Source of the keytend.dev website

## Updating the docs

The documentation under `/kmip-java/docs/` and `/kmip-server/docs/` is imported from the
product repositories, [keytend-kmip-java](https://github.com/keytend/keytend-kmip-java) and
[keytend-kmip-server](https://github.com/keytend/keytend-kmip-server). Do not edit the files in
`src/content/docs/` by hand: fix the page in its repository, or the importer, and sync again.

1. Check out both repositories next to this one (or point `KMIP_JAVA_DIR` and
   `KMIP_SERVER_DIR` at them) at the commit you want to publish, usually `main`.
2. Run the import, then build and check the links:

   ```sh
   npm run sync-docs
   npm run build && npm run check-links
   ```

   `sync-docs` reads each repository's committed `HEAD` (not uncommitted changes), regenerates
   `src/content/docs/kmip-java/docs/` and `src/content/docs/kmip-server/docs/`, and records the
   commits in `src/data/sync-manifest.json`. It imports every Markdown file under `docs/` and
   the READMEs those pages link to, turns GitHub alerts into Starlight asides, and rewrites links:
   imported pages become site URLs, other repository files become GitHub links pinned to the
   synced commit.
3. If `sync-docs` reports a page missing from the sidebar (or a sidebar entry with no page), add
   or remove it in `src/sidebars.mjs`, which mirrors the grouping of each repository's docs index.
4. Commit the result, generated files included, so the site builds without the product
   repositories:

   ```sh
   git add src/content/docs src/data/sync-manifest.json src/sidebars.mjs
   git commit -m "Sync docs from keytend-kmip-java <sha> and keytend-kmip-server <sha>"
   ```
