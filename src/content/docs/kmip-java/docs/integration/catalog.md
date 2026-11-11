---
title: "Interoperability catalog fixtures"
description: "Data fixtures for the interoperability catalog: the case manifest and the target inventory. The Keytend project wrote the catalog and its tests."
editUrl: "https://github.com/keytend/keytend-kmip-java/edit/main/integration/catalog/README.md"
head: [{"tag":"title","content":"Interoperability catalog fixtures | Keytend KMIP Java SDK"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Interoperability catalog fixtures · keytend-kmip (Java)"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip (Java)"}}]
---

:::caution[Experimental: not for production use]
keytend-kmip is experimental in every release. Its
catalog is a test record. Passing it does not certify the SDK or any server.
:::

Data fixtures for the interoperability catalog: the case manifest and the target inventory. The
Keytend project wrote the catalog and its tests. The runner records its results separately and
never rewrites the manifest. To run the catalog and read its results, see
[Interoperability catalog](/kmip-java/docs/catalog/).

## Files

| File | What it is |
| --- | --- |
| `catalog.json` | the case manifest: 145 cases |
| `server-inventory.json` | the servers the catalog runs against, and scope overlays |
| `reference.py` | an independent Python KMIP probe, with no SDK encoding or decoding |
| `generate-pki.sh` | a throwaway test PKI for the container and peer tests |

## Integrity

- `catalog.json` defines the cases only (status `DEFINITIONS_ONLY`). The runner never edits it.
- `tools/generate-catalog.py` derives the Java runner's case registry and the manifest's SHA-256
  from it.
- `CatalogContractTest` checks all 145 case IDs and that checksum.

## Scope notes

- The fixtures target KMIP 3.0 CSD02 and JDK 17, 21 and 25. A JDK 11 lane is outside the SDK's
  Java 17 minimum.
- `VER-11` uses a hypothetical KMIP 4.0 to test that a future version is rejected.
- `reference.py` provisions and reads back a known synthetic AES key over mutual TLS. It checks
  the CA and the host name, with no insecure fallback.
- The Krypton fixture under [`../krypton`](https://github.com/keytend/keytend-kmip-java/tree/c5da4f1f409914da3790bbad79b37a6296585520/integration/krypton) runs a restricted profile with one known
  AES-256 key. It does not claim administrative, rotation or general lifecycle support.

## Test data

Only disposable synthetic keys are used. Cleanup deletes only the object IDs a run created, within
8 seconds plus 250 ms for each (at most 60 seconds), and records any that remain.
Testcontainers then removes the fixture. Licensed servers run only within their license terms.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-java/blob/c5da4f1f409914da3790bbad79b37a6296585520/integration/catalog/README.md"><code>integration/catalog/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-java</span> at commit <code>c5da4f1</code>.</p>
