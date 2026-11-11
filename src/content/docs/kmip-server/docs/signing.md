---
title: "Signing keys"
description: "Public material for verifying releases; no private keys are kept here."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/signing/README.md"
head: [{"tag":"title","content":"Signing keys | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Signing keys · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Public material for verifying releases; no private keys are kept here.

| File | Content |
| --- | --- |
| `cosign.pub` | The project's cosign public key; verifies `SHA256SUMS.sigstore.json` of every release |
| `keytend-release-key.asc` | The Keytend OpenPGP release key ([fingerprints](/kmip-server/docs/release-signing/#openpgp-signature)); verifies `SHA256SUMS.asc` and the Java client |
| `pgp_verify.sh` | Defines `pgp_verify SIGNATURE FILE` (source it from bash or zsh): accepts only a good signature under the release key, in a keyring that holds only `keytend-release-key.asc` |
| `offline-signing-config.json` | The Sigstore signing configuration used to sign without a transparency log |

The release key file holds the primary key and two signing subkeys, one for
this project and one for the keytend-kmip Java client. How to verify a
release: [verifying a release](/kmip-server/docs/release-signing/#verifying-a-release).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/signing/README.md"><code>signing/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
