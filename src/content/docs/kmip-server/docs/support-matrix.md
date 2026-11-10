---
title: "Support matrix"
description: "What the server implements in each KMIP edition. Every handler is partial: each operation is implemented for the objects, algorithms and parameters described on its reference page."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/support-matrix.md"
head: [{"tag":"title","content":"Support matrix | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Support matrix · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [getting started](/kmip-server/docs/#getting-started).

What the server implements in each KMIP edition. Every handler is partial:
each operation is implemented for the objects, algorithms and parameters described
on its reference page. Every operation and object type an edition defines has
a row, so what the server lacks shows as "no". The 3.0 column is a draft
([KMIP 3.0](/kmip-server/docs/kmip-3-0/)).

The tables are generated from the server itself, by Query Operations, Query
Objects and newly created keys in every edition
([regenerating them](/kmip-server/docs/testing/#support-matrix)).

<!-- generated:start -->
## Operations

- `yes`: the server has a handler and lists the operation in Query.
- `no`: the edition defines the operation and the server does not implement it.
- `opt-in`: implemented, and listed only when configured.
- Empty: the edition does not define it.
- `No.`: the operation number the [policy file](/kmip-server/docs/configuration/#operation-numbers) uses (the specification writes it in hex).

### KMIP 1.0–1.4

| No. | Operation | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| ---: | --- | :---: | :---: | :---: | :---: | :---: |
| 1 | [Create](/kmip-server/docs/objects/#common-rules) | yes | yes | yes | yes | yes |
| 2 | [Create Key Pair](/kmip-server/docs/algorithms/) | yes | yes | yes | yes | yes |
| 3 | [Register](/kmip-server/docs/objects/#common-rules) | yes | yes | yes | yes | yes |
| 4 | [Re-key](/kmip-server/docs/rekey/) | yes | yes | yes | yes | yes |
| 5 | [Derive Key](/kmip-server/docs/crypto-operations/#derive-key) | yes | yes | yes | yes | yes |
| 6 | [Certify](/kmip-server/docs/certificates/#certify-and-re-certify) | yes | yes | yes | yes | yes |
| 7 | [Re-certify](/kmip-server/docs/certificates/#certify-and-re-certify) | yes | yes | yes | yes | yes |
| 8 | [Locate](/kmip-server/docs/locate/) | yes | yes | yes | yes | yes |
| 9 | [Check](/kmip-server/docs/lifecycle/#check) | yes | yes | yes | yes | yes |
| 10 | [Get](/kmip-server/docs/key-transfer/#get) | yes | yes | yes | yes | yes |
| 11 | [Get Attributes](/kmip-server/docs/attributes/#reading-attributes) | yes | yes | yes | yes | yes |
| 12 | [Get Attribute List](/kmip-server/docs/attributes/#reading-attributes) | yes | yes | yes | yes | yes |
| 13 | [Add Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes | yes | yes |
| 14 | [Modify Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes | yes | yes |
| 15 | [Delete Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes | yes | yes |
| 16 | [Obtain Lease](/kmip-server/docs/lifecycle/#leases) | yes | yes | yes | yes | yes |
| 17 | [Get Usage Allocation](/kmip-server/docs/lifecycle/#usage-limits) | yes | yes | yes | yes | yes |
| 18 | [Activate](/kmip-server/docs/lifecycle/#activate) | yes | yes | yes | yes | yes |
| 19 | [Revoke](/kmip-server/docs/lifecycle/#revoke) | yes | yes | yes | yes | yes |
| 20 | [Destroy](/kmip-server/docs/lifecycle/#destroy) | yes | yes | yes | yes | yes |
| 21 | [Archive](/kmip-server/docs/lifecycle/#archive-and-recover) | yes | yes | yes | yes | yes |
| 22 | [Recover](/kmip-server/docs/lifecycle/#archive-and-recover) | yes | yes | yes | yes | yes |
| 23 | [Validate](/kmip-server/docs/certificates/#validate) | yes | yes | yes | yes | yes |
| 24 | [Query](/kmip-server/docs/messages/#query) | yes | yes | yes | yes | yes |
| 25 | [Cancel](/kmip-server/docs/messages/#asynchronous-requests) | yes | yes | yes | yes | yes |
| 26 | [Poll](/kmip-server/docs/messages/#asynchronous-requests) | yes | yes | yes | yes | yes |
| 27 | [Notify](/kmip-server/docs/server-to-client/) | opt-in | opt-in | opt-in | opt-in | opt-in |
| 28 | [Put](/kmip-server/docs/server-to-client/) | opt-in | opt-in | opt-in | opt-in | opt-in |
| 29 | [Re-key Key Pair](/kmip-server/docs/rekey/) |  | yes | yes | yes | yes |
| 30 | [Discover Versions](/kmip-server/docs/messages/#version-negotiation) |  | yes | yes | yes | yes |
| 31 | [Encrypt](/kmip-server/docs/crypto-operations/#encrypt-and-decrypt) |  |  | yes | yes | yes |
| 32 | [Decrypt](/kmip-server/docs/crypto-operations/#encrypt-and-decrypt) |  |  | yes | yes | yes |
| 33 | [Sign](/kmip-server/docs/crypto-operations/#sign-and-signature-verify) |  |  | yes | yes | yes |
| 34 | [Signature Verify](/kmip-server/docs/crypto-operations/#sign-and-signature-verify) |  |  | yes | yes | yes |
| 35 | [MAC](/kmip-server/docs/crypto-operations/#mac-and-mac-verify) |  |  | yes | yes | yes |
| 36 | [MAC Verify](/kmip-server/docs/crypto-operations/#mac-and-mac-verify) |  |  | yes | yes | yes |
| 37 | [RNG Retrieve](/kmip-server/docs/crypto-operations/#rng-retrieve-and-rng-seed) |  |  | yes | yes | yes |
| 38 | [RNG Seed](/kmip-server/docs/crypto-operations/#rng-retrieve-and-rng-seed) |  |  | yes | yes | yes |
| 39 | [Hash](/kmip-server/docs/crypto-operations/#hash) |  |  | yes | yes | yes |
| 40 | [Create Split Key](/kmip-server/docs/objects/#split-keys) |  |  | yes | yes | yes |
| 41 | [Join Split Key](/kmip-server/docs/objects/#split-keys) |  |  | yes | yes | yes |
| 42 | [Import](/kmip-server/docs/key-transfer/#import-and-export) |  |  |  |  | yes |
| 43 | [Export](/kmip-server/docs/key-transfer/#import-and-export) |  |  |  |  | yes |

### KMIP 2.0, 2.1 and the 3.0 draft

| No. | Operation | 2.0 | 2.1 | 3.0 |
| ---: | --- | :---: | :---: | :---: |
| 1 | [Create](/kmip-server/docs/objects/#common-rules) | yes | yes | yes |
| 2 | [Create Key Pair](/kmip-server/docs/algorithms/) | yes | yes | yes |
| 3 | [Register](/kmip-server/docs/objects/#common-rules) | yes | yes | yes |
| 4 | [Re-key](/kmip-server/docs/rekey/) | yes | yes | yes |
| 5 | [Derive Key](/kmip-server/docs/crypto-operations/#derive-key) | yes | yes | yes |
| 6 | [Certify](/kmip-server/docs/certificates/#certify-and-re-certify) | yes | yes | yes |
| 7 | [Re-certify](/kmip-server/docs/certificates/#certify-and-re-certify) | yes | yes | yes |
| 8 | [Locate](/kmip-server/docs/locate/) | yes | yes | yes |
| 9 | [Check](/kmip-server/docs/lifecycle/#check) | yes | yes | yes |
| 10 | [Get](/kmip-server/docs/key-transfer/#get) | yes | yes | yes |
| 11 | [Get Attributes](/kmip-server/docs/attributes/#reading-attributes) | yes | yes | yes |
| 12 | [Get Attribute List](/kmip-server/docs/attributes/#reading-attributes) | yes | yes | yes |
| 13 | [Add Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes |
| 14 | [Modify Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes |
| 15 | [Delete Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes |
| 16 | [Obtain Lease](/kmip-server/docs/lifecycle/#leases) | yes | yes | yes |
| 17 | [Get Usage Allocation](/kmip-server/docs/lifecycle/#usage-limits) | yes | yes | yes |
| 18 | [Activate](/kmip-server/docs/lifecycle/#activate) | yes | yes | yes |
| 19 | [Revoke](/kmip-server/docs/lifecycle/#revoke) | yes | yes | yes |
| 20 | [Destroy](/kmip-server/docs/lifecycle/#destroy) | yes | yes | yes |
| 21 | [Archive](/kmip-server/docs/lifecycle/#archive-and-recover) | yes | yes | yes |
| 22 | [Recover](/kmip-server/docs/lifecycle/#archive-and-recover) | yes | yes | yes |
| 23 | [Validate](/kmip-server/docs/certificates/#validate) | yes | yes | yes |
| 24 | [Query](/kmip-server/docs/messages/#query) | yes | yes | yes |
| 25 | [Cancel](/kmip-server/docs/messages/#asynchronous-requests) | yes | yes | yes |
| 26 | [Poll](/kmip-server/docs/messages/#asynchronous-requests) | yes | yes | yes |
| 27 | [Notify](/kmip-server/docs/server-to-client/) | opt-in | opt-in | no |
| 28 | [Put](/kmip-server/docs/server-to-client/) | opt-in | opt-in | no |
| 29 | [Re-key Key Pair](/kmip-server/docs/rekey/) | yes | yes | yes |
| 30 | [Discover Versions](/kmip-server/docs/messages/#version-negotiation) | yes | yes | yes |
| 31 | [Encrypt](/kmip-server/docs/crypto-operations/#encrypt-and-decrypt) | yes | yes | yes |
| 32 | [Decrypt](/kmip-server/docs/crypto-operations/#encrypt-and-decrypt) | yes | yes | yes |
| 33 | [Sign](/kmip-server/docs/crypto-operations/#sign-and-signature-verify) | yes | yes | yes |
| 34 | [Signature Verify](/kmip-server/docs/crypto-operations/#sign-and-signature-verify) | yes | yes | yes |
| 35 | [MAC](/kmip-server/docs/crypto-operations/#mac-and-mac-verify) | yes | yes | yes |
| 36 | [MAC Verify](/kmip-server/docs/crypto-operations/#mac-and-mac-verify) | yes | yes | yes |
| 37 | [RNG Retrieve](/kmip-server/docs/crypto-operations/#rng-retrieve-and-rng-seed) | yes | yes | yes |
| 38 | [RNG Seed](/kmip-server/docs/crypto-operations/#rng-retrieve-and-rng-seed) | yes | yes | yes |
| 39 | [Hash](/kmip-server/docs/crypto-operations/#hash) | yes | yes | yes |
| 40 | [Create Split Key](/kmip-server/docs/objects/#split-keys) | yes | yes | yes |
| 41 | [Join Split Key](/kmip-server/docs/objects/#split-keys) | yes | yes | yes |
| 42 | [Import](/kmip-server/docs/key-transfer/#import-and-export) | yes | yes | yes |
| 43 | [Export](/kmip-server/docs/key-transfer/#import-and-export) | yes | yes | yes |
| 44 | [Log](/kmip-server/docs/messages/#log) | yes | yes | yes |
| 45 | [Login](/kmip-server/docs/tickets/#login) | yes | yes | yes |
| 46 | [Logout](/kmip-server/docs/tickets/#logout) | yes | yes | yes |
| 47 | [Delegated Login](/kmip-server/docs/tickets/#delegated-login) | yes | yes | yes |
| 48 | [Adjust Attribute](/kmip-server/docs/attributes/#adjust-attribute) | yes | yes | yes |
| 49 | [Set Attribute](/kmip-server/docs/attributes/#changing-attributes) | yes | yes | yes |
| 50 | [Set Endpoint Role](/kmip-server/docs/server-to-client/#set-endpoint-role) | yes | yes | yes |
| 51 | [PKCS#11](/kmip-server/docs/messages/#pkcs11) | yes | yes | yes |
| 52 | [Interop](/kmip-server/docs/messages/#interop-test-mode) | opt-in | opt-in | opt-in |
| 53 | [Re-Provision](/kmip-server/docs/re-provision/) | opt-in | opt-in | opt-in |
| 54 | [Set Defaults](/kmip-server/docs/defaults-and-constraints/#set-defaults) |  | yes | yes |
| 55 | [Set Constraints](/kmip-server/docs/defaults-and-constraints/#constraints) |  | yes | yes |
| 56 | [Get Constraints](/kmip-server/docs/defaults-and-constraints/#constraints) |  | yes | yes |
| 57 | [Query Asynchronous Requests](/kmip-server/docs/messages/#asynchronous-requests) |  | yes | yes |
| 58 | [Process](/kmip-server/docs/messages/#asynchronous-requests) |  | yes | yes |
| 59 | [Ping](/kmip-server/docs/messages/#ping) |  | yes | yes |
| 60 | [Create Group](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 61 | [Obliterate](/kmip-server/docs/kmip-3-0/#obliterate) |  |  | yes |
| 62 | [Create User](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 63 | [Create Credential](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 64 | [Deactivate](/kmip-server/docs/lifecycle/#revoke) |  |  | yes |
| 65 | [Encapsulate](/kmip-server/docs/algorithms/#post-quantum-keys) |  |  | yes |
| 66 | [Decapsulate](/kmip-server/docs/algorithms/#post-quantum-keys) |  |  | yes |

Opt-in: Notify and Put are sent only to principals with a `client_endpoint`; Interop is offered only with `--interop-test-mode`, which KMIP forbids on a production server; Re-Provision is offered only with `--provisioning-ca`.

## Object types

`yes`: listed by Query Objects in that edition. `no`: the edition defines the type and the server does not accept it. Empty: not defined.

### KMIP 1.0–1.4

| No. | Object type | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| ---: | --- | :---: | :---: | :---: | :---: | :---: |
| 1 | [Certificate](/kmip-server/docs/certificates/) | yes | yes | yes | yes | yes |
| 2 | [Symmetric Key](/kmip-server/docs/algorithms/) | yes | yes | yes | yes | yes |
| 3 | [Public Key](/kmip-server/docs/algorithms/) | yes | yes | yes | yes | yes |
| 4 | [Private Key](/kmip-server/docs/algorithms/) | yes | yes | yes | yes | yes |
| 5 | [Split Key](/kmip-server/docs/objects/#split-keys) | yes | yes | yes | yes | yes |
| 6 | [Template](/kmip-server/docs/objects/#templates-kmip-1x) | yes | yes | yes | yes | yes |
| 7 | [Secret Data](/kmip-server/docs/objects/#secret-data) | yes | yes | yes | yes | yes |
| 8 | [Opaque Object](/kmip-server/docs/objects/#opaque-objects) | yes | yes | yes | yes | yes |
| 9 | [PGP Key](/kmip-server/docs/objects/#pgp-keys) |  |  | yes | yes | yes |

### KMIP 2.0, 2.1 and the 3.0 draft

| No. | Object type | 2.0 | 2.1 | 3.0 |
| ---: | --- | :---: | :---: | :---: |
| 1 | [Certificate](/kmip-server/docs/certificates/) | yes | yes | yes |
| 2 | [Symmetric Key](/kmip-server/docs/algorithms/) | yes | yes | yes |
| 3 | [Public Key](/kmip-server/docs/algorithms/) | yes | yes | yes |
| 4 | [Private Key](/kmip-server/docs/algorithms/) | yes | yes | yes |
| 5 | [Split Key](/kmip-server/docs/objects/#split-keys) | yes | yes | yes |
| 7 | [Secret Data](/kmip-server/docs/objects/#secret-data) | yes | yes | yes |
| 8 | [Opaque Object](/kmip-server/docs/objects/#opaque-objects) | yes | yes | yes |
| 9 | [PGP Key](/kmip-server/docs/objects/#pgp-keys) | yes | yes | yes |
| 10 | [Certificate Request](/kmip-server/docs/certificates/#certificate-requests) | yes | yes | yes |
| 11 | [User](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 12 | [Group](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 13 | [Password Credential](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 14 | [Device Credential](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 15 | [One Time Password Credential](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |
| 16 | [Hashed Password Credential](/kmip-server/docs/kmip-3-0/#system-objects) |  |  | yes |

## Attributes the server reports on a new key

Get Attribute List on a newly created AES-256 key and RSA-2048 private key (`both`: both keys report it; `AES` or `RSA`: only that key does), with only algorithm, length and usage mask supplied. Client-settable attributes (Name, Object Group, Contact Information and others) appear once set; see [attributes](/kmip-server/docs/attributes/).

### KMIP 1.0–1.4

| Attribute | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
| --- | :---: | :---: | :---: | :---: | :---: |
| Always Sensitive |  |  |  |  | both |
| Cryptographic Algorithm | both | both | both | both | both |
| Cryptographic Length | both | both | both | both | both |
| Cryptographic Usage Mask | both | both | both | both | both |
| Digest | both | both | both | both | both |
| Extractable |  |  |  |  | both |
| Fresh |  | both | both | both | both |
| Initial Date | both | both | both | both | both |
| Last Change Date | both | both | both | both | both |
| Lease Time | both | both | both | both | both |
| Link | RSA | RSA | RSA | RSA | RSA |
| Never Extractable |  |  |  |  | both |
| Object Type | both | both | both | both | both |
| Operation Policy Name | both | both | both | both | both |
| Original Creation Date |  |  | both | both | both |
| Random Number Generator |  |  |  | both | both |
| Sensitive |  |  |  |  | both |
| State | both | both | both | both | both |
| Unique Identifier | both | both | both | both | both |

### KMIP 2.0, 2.1 and the 3.0 draft

| Attribute | 2.0 | 2.1 | 3.0 |
| --- | :---: | :---: | :---: |
| Always Sensitive | both | both | both |
| Cryptographic Algorithm | both | both | both |
| Cryptographic Length | both | both | both |
| Cryptographic Usage Mask | both | both | both |
| Digest | both | both | both |
| Extractable | both | both | both |
| Fresh | both | both | both |
| Initial Date | both | both | both |
| Key Format Type | both | both | both |
| Last Change Date | both | both | both |
| Lease Time | both | both | both |
| Link | RSA | RSA |  |
| Never Extractable | both | both | both |
| Object Class |  |  | both |
| Object Type | both | both | both |
| Original Creation Date | both | both | both |
| Protection Storage Mask | both | both | both |
| Public Key Link |  |  | RSA |
| Random Number Generator | both | both | both |
| Sensitive | both | both | both |
| Short Unique Identifier | both | both | both |
| State | both | both | both |
| Unique Identifier | both | both | both |
<!-- generated:end -->

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/docs/support-matrix.md"><code>docs/support-matrix.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>770ad85</code>.</p>
