// Sidebar topics: one per product. Owned by the docs import pipeline (scripts/sync-docs.mjs).
//
// The groups follow each repository's own docs index (keytend-kmip-java docs/index.md,
// keytend-kmip-server docs/README.md). `npm run sync-docs` fails if an imported page is missing
// here or an entry points at a page that was not imported, so update this file when a sync
// reports either.

/** Sidebar link to an imported page: [label, slug below /<product>/docs/ ('' for the landing page)]. */
const pages = (product, entries) =>
  entries.map(([label, slug]) => ({ label, slug: slug ? `${product}/docs/${slug}` : `${product}/docs` }));

// Groups start collapsed (Starlight keeps the one holding the current page open), so the mobile
// menu opens with the current page in view rather than below every other group.
const group = (product, label, entries) => ({ label, collapsed: true, items: pages(product, entries) });

const java = (label, entries) => group('kmip-java', label, entries);
const server = (label, entries) => group('kmip-server', label, entries);

export const topics = [
  {
    label: 'Java SDK docs',
    link: '/kmip-java/docs/',
    icon: 'seti:java',
    items: [
      java('Start here', [
        ['Documentation index', ''],
        ['Getting started', 'getting-started'],
        ['Choosing an API', 'choosing-an-api'],
      ]),
      java('Guides', [
        ['Envelope encryption', 'envelope-encryption'],
        ['Local keys', 'local-keys'],
        ['Key lifecycle', 'operating-keys'],
        ['TLS identities', 'tls-identities'],
        ['Runtime configuration', 'production'],
        ['Protocol layer', 'protocol-layer'],
        ['Migration', 'migration'],
      ]),
      java('Integrations and tools', [
        ['keytend-kmip-cli', 'cli'],
        ['Cassandra commit log and hints encryption', 'integration/cassandra-trunk-tde'],
        ['Cassandra TLS with node identities', 'integration/cassandra-trunk-tls'],
        ['Benchmark', 'tools/bench'],
        ['Live probe', 'tools/server-probe'],
        ['Pinned keytend-kmip-server', 'tools/kmip-server'],
      ]),
      java('Reference', [
        ['Compatibility and support', 'compatibility'],
        ['Dependencies', 'dependencies'],
        ['Stored formats', 'stored-formats'],
        ['In-memory server', 'in-memory-server'],
        ['Design notes', 'kms-design'],
        ['Protocol coverage', 'protocol-coverage'],
        ['Security policy', 'security'],
        ['Release notes', 'release-notes'],
      ]),
      java('Evidence', [
        ['Validation', 'validation'],
        ['Interoperability catalog', 'catalog'],
        ['Catalog fixtures', 'integration/catalog'],
        ['Interop suite against keytend-kmip-server', 'integration/keytend-kmip-server'],
        ['Performance', 'performance'],
        ['Research', 'research'],
      ]),
      java('Maintainers', [
        ['Releasing', 'releasing'],
        ['Licensing', 'licensing'],
      ]),
    ],
  },
  {
    label: 'Server docs',
    link: '/kmip-server/docs/',
    icon: 'seti:rust',
    items: [
      server('Start here', [
        ['Documentation index', ''],
        ['Quick start', 'quick-start'],
        ['Manual installation', 'manual-install'],
        ['Project status', 'status'],
        ['Support matrix', 'support-matrix'],
      ]),
      server('Connecting clients', [
        ['Connecting a client', 'clients'],
        ['Python (PyKMIP)', 'clients/python'],
        ['Go (OVH kmip-go)', 'clients/go'],
        ['Java (keytend-kmip)', 'clients/java'],
        ['C (libkmip)', 'clients/c'],
        ['Rust (kmip-protocol)', 'clients/rust'],
        ['HTTPS with JSON or XML', 'clients/https'],
        ['JSON, XML and HTTPS bindings', 'encodings'],
        ['Client errors and retries', 'client-errors'],
        ['Client examples', 'examples/clients'],
        ['HTTPS request examples', 'examples/https'],
      ]),
      server('Configuration and operations', [
        ['Configuration reference', 'configuration'],
        ['Authorization', 'authorization'],
        ['Request-header credentials', 'credentials'],
        ['TLS profiles', 'tls-profiles'],
        ['Deployment', 'deployment'],
        ['Kubernetes', 'kubernetes'],
        ['Helm chart', 'deploy/helm'],
        ['Kubernetes resources', 'deploy/kubernetes'],
        ['Operations runbooks', 'operations'],
        ['Backup and restore', 'backup-restore'],
        ['Master-key rotation', 'master-key-rotation'],
        ['Metrics', 'metrics'],
        ['Container image', 'container-image'],
        ['FIPS mode', 'fips'],
      ]),
      server('Security', [
        ['Security policy', 'security'],
        ['TLS certificates and policy', 'tls-setup'],
        ['Store integrity', 'store-integrity'],
        ['Audit checkpoints', 'audit-checkpoints'],
        ['Release verification', 'release-signing'],
        ['Signing keys', 'signing'],
      ]),
      server('Feature reference', [
        ['Object types', 'objects'],
        ['Algorithms and key formats', 'algorithms'],
        ['Cryptographic operations', 'crypto-operations'],
        ['KMIP certificate objects', 'certificates'],
        ['Getting and transferring keys', 'key-transfer'],
        ['Object lifecycle', 'lifecycle'],
        ['Re-key', 'rekey'],
        ['Attributes', 'attributes'],
        ['Locate', 'locate'],
        ['Messages, batches and Query', 'messages'],
        ['Notify, Put and Set Endpoint Role', 'server-to-client'],
        ['Login and tickets', 'tickets'],
        ['Server defaults and constraints', 'defaults-and-constraints'],
        ['Re-Provision', 're-provision'],
        ['KMIP 3.0 draft', 'kmip-3-0'],
        ['Specification interpretations', 'interpretations'],
      ]),
      server('Integrations', [['Percona database encryption', 'percona']]),
      server('Contributing', [
        ['Testing', 'testing'],
        ['Interoperability adapters', 'interop'],
        ['Release builds', 'release-builds'],
        ['Specification data', 'specs'],
      ]),
    ],
  },
];
