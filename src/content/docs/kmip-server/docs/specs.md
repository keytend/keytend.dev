---
title: "Specification data"
description: "Machine-readable records that the project's test tools read and check against the pinned KMIP documents. They are test evidence, not user documentation, and nothing in a deployment reads them."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/specs/README.md"
head: [{"tag":"title","content":"Specification data | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Specification data · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Machine-readable records that the project's test tools read and check
against the pinned KMIP documents. They are test evidence, not user
documentation, and nothing in a deployment reads them. The pages that use
them are [project status](/kmip-server/docs/status/) and [testing](/kmip-server/docs/testing/).

| Files | What they record |
| --- | --- |
| `sources.json`, `errata.json`, `profiles.json`, `operations.json`, `registry.json` | The pinned KMIP documents and their errata, profiles, operations, tags and enumerations |
| `requirement-matrix.json`, `requirements-index.json` | The clause-level requirements of the pinned documents and their status |
| `oasis-*.json`, `additional-traces.json` | The OASIS Profiles XML test traces (1.3–3.0) and their replay results |
| `legacy-*.json` | The KMIP 1.1 and 1.2 Test Cases and their replay |
| `tls-profile-inventory.json`, `tls-external-references.json` | The TLS requirements of the KMIP authentication suites ([TLS profiles](/kmip-server/docs/tls-profiles/)) |

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/docs/specs/README.md"><code>docs/specs/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
