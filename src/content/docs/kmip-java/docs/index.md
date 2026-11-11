---
title: "Keytend KMIP Java SDK documentation"
description: "Guides, reference and test evidence for keytend-kmip, the Keytend KMIP Java SDK: an experimental Java SDK for connecting to KMIP key management servers."
editUrl: "https://github.com/keytend/keytend-kmip-java/edit/main/docs/index.md"
head: [{"tag":"title","content":"Documentation | Keytend KMIP Java SDK"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Keytend KMIP Java SDK documentation · keytend-kmip (Java)"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip (Java)"}}]
---

<p class="kt-doc-status"><span class="kt-pill kt-pill--experimental"><span class="kt-dot" aria-hidden="true"></span>Experimental</span> <span><span class="kt-nw">keytend-kmip</span> is experimental in every release. Do not use it to protect real keys or data.</span></p>

These docs are those of 0.10.0-rc.1, a pre-release of the first release, 0.10.0. For the docs of a
published release, read them at its tag, such as
[`v0.10.0-rc.1`](https://github.com/keytend/keytend-kmip-java/tree/v0.10.0-rc.1/docs).

<nav class="kt-doc-cards not-content" aria-label="Start here">
<ul>
<li><a class="kt-doc-card" href="/kmip-java/docs/getting-started/"><span class="kt-doc-card__eyebrow">Start here</span><span class="kt-doc-card__title">Getting started</span><span class="kt-doc-card__summary">Build the SDK, connect to your KMS and seal a first record, or try it with the in-memory server.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-java/docs/choosing-an-api/"><span class="kt-doc-card__eyebrow">Start here</span><span class="kt-doc-card__title">Choosing an API</span><span class="kt-doc-card__summary">Which entry point to use for each job, from sealing records to raw KMIP calls.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-java/docs/envelope-encryption/"><span class="kt-doc-card__eyebrow">Guide</span><span class="kt-doc-card__title">Envelope encryption</span><span class="kt-doc-card__summary">Seal records, streams and files with a key that stays in the KMS.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-java/docs/operating-keys/"><span class="kt-doc-card__eyebrow">Guide</span><span class="kt-doc-card__title">Key lifecycle</span><span class="kt-doc-card__summary">How to rotate and retire keys, and what to do after a compromise.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-java/docs/compatibility/"><span class="kt-doc-card__eyebrow">Reference</span><span class="kt-doc-card__title">Compatibility and support</span><span class="kt-doc-card__summary">Which Java and KMIP versions are tested, and what the API promises from 0.10.0 on.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-java/docs/validation/"><span class="kt-doc-card__eyebrow">Evidence</span><span class="kt-doc-card__title">Validation</span><span class="kt-doc-card__summary">Checks against PyKMIP, PQCToday, Krypton and <span class="kt-nw">keytend-kmip-server</span>, how to run them, and where each release keeps its results.</span></a></li>
</ul>
</nav>

## Guides

- [Envelope encryption](/kmip-java/docs/envelope-encryption/): seal records, streams and files with a key that
  stays in the KMS.
- [Local keys](/kmip-java/docs/local-keys/): raw keys from the KMS for local file encryption, with caching,
  leases and database key providers.
- [Key lifecycle](/kmip-java/docs/operating-keys/): rotate keys, retire old ones, recover from a compromise and
  replace secrets.
- [TLS identities](/kmip-java/docs/tls-identities/): node certificates and trust taken from the KMS.
- [Runtime configuration](/kmip-java/docs/production/): failover, deadlines and retries, credential reload, client
  certificate renewal, readiness, logging, metrics (Micrometer or OpenTelemetry), traces, listeners,
  per-consumer credentials and qualifying a server.
- [Protocol layer](/kmip-java/docs/protocol-layer/): KMIP requests, batches, codecs and transports.
- [Migration](/kmip-java/docs/migration/): replace protocol-layer calls with the application API.

## Integrations and tools

- [keytend-kmip-cli](/kmip-java/docs/cli/): manage keys on a KMIP server from the command line.
- [Cassandra commit log and hints encryption](/kmip-java/docs/integration/cassandra-trunk-tde/)
  (trial), for Apache Cassandra trunk on `LocalKeys`.
- [Cassandra TLS with node identities from the KMS](/kmip-java/docs/integration/cassandra-trunk-tls/)
  (sample), on `kms.tls()`.
- [Benchmark](/kmip-java/docs/tools/bench/): measure the application API in process or live.
- [Live probe](/kmip-java/docs/tools/server-probe/): check the SDK against keytend-kmip-server.
- [Pinned keytend-kmip-server](/kmip-java/docs/tools/kmip-server/): the server image the live tools
  use.

## Reference

- [Compatibility and support](/kmip-java/docs/compatibility/): what each release promises, API tiers, Java
  and KMIP versions.
- [Dependencies](/kmip-java/docs/dependencies/): the libraries the SDK, the CLI and the tests use, why, and
  their licenses.
- [Stored formats](/kmip-java/docs/stored-formats/): the byte layouts of ciphertexts and sealed data.
- [In-memory test server](/kmip-java/docs/in-memory-server/): how `InMemoryKmipServer` (the test artifact
  `keytend-kmip-testing`) answers KMIP requests, and what it does not support.
- [Design notes](/kmip-java/docs/kms-design/): why the application API behaves as it does.
- [Protocol coverage](/kmip-java/docs/protocol-coverage/): the KMIP operations, objects and attributes the SDK
  encodes.
- [Security policy](/kmip-java/docs/security/): reporting vulnerabilities, handling secrets, verifying
  releases.
- [Release notes](/kmip-java/docs/release-notes/).

## Evidence

- [Validation](/kmip-java/docs/validation/): current results against real KMIP servers, how to read them and
  how to run the tests.
- [Interoperability catalog](/kmip-java/docs/catalog/): the shared test cases and their outcomes.
  Its data files are in [integration/catalog](/kmip-java/docs/integration/catalog/).
- [Interop suite against keytend-kmip-server](/kmip-java/docs/integration/keytend-kmip-server/):
  the generic interop suite on every KMIP version from 1.1 to the 3.0 draft.
- [Performance](/kmip-java/docs/performance/): measured costs of the application paths.
- [Research](/kmip-java/docs/research/): KMIP sources and how the test servers were chosen.

## Maintainers

- [Releasing](/kmip-java/docs/releasing/): the release checks and publication steps.
- [Licensing](/kmip-java/docs/licensing/): the SDK's license, source headers and third-party material.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-java/blob/c6c8eb9febaf9fd7da7fd2328d6879dda23aa968/docs/index.md"><code>docs/index.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-java</span> at commit <code>c6c8eb9</code>.</p>
