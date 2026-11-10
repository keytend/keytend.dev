import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Starlight UI strings (src/content/i18n/en.json): the docs sidebar is labeled "Documentation".
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
