// Values of the Pagefind `project` filter (set on every page: docs frontmatter
// and SitePage.astro), with the labels the search dialog shows for them. The SDK's filter value
// keeps its old form, 'keytend-kmip (Java)'; visitors only ever see the chip and badge.
export const searchProjects = [
  { value: '', chip: 'All', badge: '' },
  { value: 'keytend-kmip (Java)', chip: 'Java SDK', badge: 'Java SDK' },
  { value: 'keytend-kmip-server', chip: 'Server', badge: 'Server' },
  { value: 'Keytend', chip: 'Site', badge: 'Site' },
] as const;

/** Queries offered before anything is typed, for the docs you are in (each has results). */
export const searchExamples = {
  'kmip-java': ['rotation', 'envelope encryption', 'LocalKeys', 'failover'],
  'kmip-server': ['rekey', 'TLS profiles', 'Percona', 'Docker'],
  site: ['rotation', 'rekey', 'Percona', 'Docker'],
};
