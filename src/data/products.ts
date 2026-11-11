// Facts about each product, shared by every page. Keep them in step with the
// product repositories (see scripts/sync-docs.mjs and src/data/sync-manifest.json).
// Every statement here comes from the product repositories' README.md,
// SECURITY.md, RELEASE.md and docs/; nothing is invented.
export const products = {
  'kmip-java': {
    slug: 'kmip-java',
    /** Display name (header, titles, cards). `name` is the repository and artifact name. */
    title: 'Keytend KMIP Java SDK',
    name: 'keytend-kmip',
    kind: 'Java SDK for KMIP servers',
    language: 'Java',
    platform: 'JDK 17 and later',
    tagline: 'A Java SDK for connecting to KMIP key management servers, for JDK 17 and later.',
    version: '0.10.0-rc.1',
    versionLabel: '0.10.0-rc.1, pre-release',
    status: 'Signed GitHub pre-release',
    versionNote: '0.10.0-rc.1 is a signed GitHub pre-release of 0.10.0; install it from the release ZIP or build from source.',
    repo: 'https://github.com/keytend/keytend-kmip-java',
    releases: 'https://github.com/keytend/keytend-kmip-java/releases',
    issues: 'https://github.com/keytend/keytend-kmip-java/issues',
    /** GitHub private vulnerability reporting: the only way to report a vulnerability. */
    reportVulnerability: 'https://github.com/keytend/keytend-kmip-java/security/advisories/new',
    security: '/kmip-java/docs/security/',
    releaseNotes: '/kmip-java/docs/release-notes/',
    overview: '/kmip-java/',
    docs: '/kmip-java/docs/',
    start: '/kmip-java/docs/getting-started/',
    license: 'Apache-2.0',
    /** The product page's "at a glance" card (README "Install", "Requirements", "Compatibility"). */
    glance: [
      ['Version', '0.10.0-rc.1, a signed GitHub pre-release'],
      ['Language', 'Java, JDK 17 or later; tested on 17, 21 and 25'],
      ['KMIP', '1.4 to 2.1 by default; 1.1 to 1.3 and the 3.0 draft when configured'],
      ['Get it', 'Release ZIP or build from source; not on Maven Central'],
      ['License', 'Apache-2.0'],
    ],
  },
  'kmip-server': {
    slug: 'kmip-server',
    title: 'Keytend KMIP Server',
    name: 'keytend-kmip-server',
    kind: 'KMIP server for client tests and CI',
    language: 'Rust',
    platform: 'Container image, amd64 and arm64',
    tagline:
      'A KMIP key management server for client tests and CI, written in Rust and shipped as a container image.',
    version: '0.10.0-rc.1',
    versionLabel: '0.10.0-rc.1',
    status: 'Release candidate',
    versionNote: 'Release candidate; signed image archives on GitHub releases, no registry image yet.',
    repo: 'https://github.com/keytend/keytend-kmip-server',
    releases: 'https://github.com/keytend/keytend-kmip-server/releases',
    issues: 'https://github.com/keytend/keytend-kmip-server/issues',
    /** GitHub private vulnerability reporting: the only way to report a vulnerability. */
    reportVulnerability: 'https://github.com/keytend/keytend-kmip-server/security/advisories/new',
    security: '/kmip-server/docs/security/',
    releaseNotes: 'https://github.com/keytend/keytend-kmip-server/releases',
    overview: '/kmip-server/',
    docs: '/kmip-server/docs/',
    start: '/kmip-server/docs/quick-start/',
    license: 'Apache-2.0',
    /** The product page's "at a glance" card (README "Features", "Quick start", RELEASE notes). */
    glance: [
      ['Version', '0.10.0-rc.1, release candidate'],
      ['Language', 'Rust'],
      ['Image', 'UBI 9 micro, amd64 and arm64, runs as non-root'],
      ['Ports', '5696 binary TTLV over TLS; 5697 HTTPS (optional)'],
      ['KMIP', 'Partial 1.0 to 2.1; the 3.0 draft behind a flag'],
      ['Get it', 'Signed image archives on GitHub releases'],
      ['License', 'Apache-2.0'],
    ],
  },
} as const;

export type ProductSlug = keyof typeof products;

/** Shared facts about the project as a whole. */
export const project = {
  github: 'https://github.com/keytend',
  license: 'Apache-2.0',
  licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
  /** The Keytend OpenPGP release key (primary). Both projects sign with subkeys of it. */
  releaseKey: {
    fingerprint: '3A84 912A FBE7 D2B0 4EBA  2A8A 51E6 5DD4 9C6F 987F',
    userId: 'keytend-kmip releases <releases@keytend.dev>',
    algorithm: 'Ed25519',
    expires: '2031-10-31',
    serverSubkey: 'CE9B FF24 3C9F 66C2 A212  9E3A B02F 69EF AEB7 DBB5',
    javaSubkey: 'AAE2 AF4D D7F2 427F 52B8  00D4 94E0 26FE 1BF6 C09E',
  },
} as const;

/** Link to a file in a product repository on GitHub. */
export const repoFile = (slug: ProductSlug, path: string) =>
  `${products[slug].repo}/blob/main/${path}`;
