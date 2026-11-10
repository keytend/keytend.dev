// Expressive Code options that cannot be serialized (plugin hooks, the theme callback). Expressive
// Code merges this file with the `expressiveCode` options in astro.config.mjs, for Markdown code
// blocks and for the <Code> component alike.
import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import codeRegionNames from './src/plugins/code-region-names.mjs';
import codeSearch from './src/plugins/code-search.mjs';

// GitHub Light draws Java class names, enum constants and fields in the default text colour and
// strings in a near-black navy, so most of a Java block reads as one colour. These rules give them
// their own colours, each at least 6:1 against the light code background (#f6f7f9, theme.css);
// keywords stay red, methods purple and numbers blue.
const LIGHT_TOKENS = [
  {
    // KeyPairHandle pair = …, Kms.connect(…), CurrentKey<String>
    scope: ['storage.type.java', 'storage.type.generic.java', 'storage.type.object.array.java', 'variable.other.object.java', 'entity.name.type', 'support.class'],
    settings: { foreground: '#0a6870' },
  },
  {
    // KeyUsage.SIGN, Curve.P_256, StandardCharsets.UTF_8
    scope: ['variable.other.object.property.java', 'variable.other.enummember', 'variable.other.constant', 'constant.other'],
    settings: { foreground: '#005cc5' },
  },
  {
    scope: ['string', 'string.quoted', 'string.template'],
    settings: { foreground: '#116329' },
  },
];

export default defineEcConfig({
  // codeRegionNames names scrollable code regions and copy buttons; codeSearch sets how code enters
  // the search index (see each file).
  plugins: [codeRegionNames(), codeSearch()],
  customizeTheme: (theme) => {
    if (theme.name === 'github-light') theme.settings.push(...LIGHT_TOKENS);
    // The Java grammar reads a variable named `sealed` in call arguments ("open(sealed, id)") as
    // the `sealed` modifier, which never appears there: draw it as plain text.
    theme.settings.push({ scope: ['meta.method-call.java storage.modifier.java', 'meta.function-call.java storage.modifier.java'], settings: { foreground: theme.fg } });
    return theme;
  },
});
