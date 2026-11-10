// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import { topics } from './src/sidebars.mjs';
import ktDocsMarkdown from './src/plugins/docs-markdown.mjs';

// A static site served from the root of https://keytend.dev (Cloudflare Pages:
// build command `npm run build`, output directory `dist`).
export default defineConfig({
  site: 'https://keytend.dev',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Keytend',
      description:
        'KMIP tools for development and testing: the Keytend KMIP Java SDK and the Keytend KMIP Server. Experimental, not for production.',
      logo: { src: './src/assets/logo.svg', alt: 'Keytend' },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/keytend' },
      ],
      customCss: [
        '@fontsource-variable/ibm-plex-sans/wght.css',
        '@fontsource/ibm-plex-mono/400.css',
        '@fontsource/ibm-plex-mono/500.css',
        './src/styles/theme.css',
        './src/styles/docs.css',
      ],
      components: {
        Header: './src/components/starlight/Header.astro',
        Banner: './src/components/starlight/Banner.astro',
        Footer: './src/components/starlight/Footer.astro',
        Hero: './src/components/starlight/Hero.astro',
        MobileMenuFooter: './src/components/starlight/MobileMenuFooter.astro',
        Search: './src/components/starlight/Search.astro',
        PageTitle: './src/components/starlight/PageTitle.astro',
      },
      plugins: [starlightSidebarTopics(topics, { exclude: ['/', '/downloads/', '/news/', '/community/', '/kmip-java/', '/kmip-server/'] })],
      // Dark: Starlight's default. Light: GitHub Light, whose shell, Java and
      // XML tokens separate clearly (Starlight's light default is nearly all
      // blue in shell blocks), with its own colors for Java types, constants
      // and strings (ec.config.mjs). Frames and backgrounds keep the site palette;
      // the code and title-bar fills are the --kt-code-* tokens (theme.css),
      // a neutral charcoal in dark. The plugins and the theme tweak, which
      // cannot be serialized here, are in ec.config.mjs.
      expressiveCode: {
        themes: ['starlight-dark', 'github-light'],
        useStarlightUiThemeColors: true,
        styleOverrides: {
          codeBackground: 'var(--kt-code-bg)',
          frames: {
            editorTabBarBackground: 'var(--kt-code-bar)',
            terminalTitlebarBackground: 'var(--kt-code-bar)',
          },
        },
      },
      lastUpdated: false,
      pagination: true,
    }),
    // Markdown: markup for the imported docs' tables (scroll region, matrix markers, phone layout)
    // and task-list checkboxes (src/plugins/docs-markdown.mjs).
    ktDocsMarkdown(),
  ],
});
