---
title: "Client examples"
description: "Complete programs for the client pages, one directory per language, with their dependency manifests. They run against the quick-start server and read its test certificates from KMIP_PKI."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/examples/clients/README.md"
head: [{"tag":"title","content":"Client examples | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Client examples · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Complete programs for the [client pages](/kmip-server/docs/clients/), one
directory per language, with their dependency manifests. They run against the
[quick-start server](/kmip-server/docs/quick-start/) and read its test
certificates from `KMIP_PKI`. Like [`kmip.sh`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/kmip.sh), every
program uses the client certificate that `KMIP_CLIENT` names in that
directory: `client` by default, `other` (read-only) or `unlisted` (refused by
the policy). From the checkout:

```sh title="Client examples"
export KMIP_PKI=$PWD/.cache/dev-pki
```

| Directory | Library | Then, in the directory | Page |
| --- | --- | --- | --- |
| [`python`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/clients/python) | PyKMIP (`requirements.txt`); standard library | `../../../.cache/pykmip/bin/python connect.py` | [Python](/kmip-server/docs/clients/python/) |
| [`go`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/clients/go) | OVH kmip-go (`go.mod`, `go.sum`) | `go run .` | [Go](/kmip-server/docs/clients/go/) |
| [`java`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/clients/java) | keytend-kmip 0.10.0-rc.1, from the signed release zip | `./run.sh Quickstart` | [Java](/kmip-server/docs/clients/java/) |
| [`c`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/clients/c) | OpenKMIP libkmip (`Makefile`) | `make && ./create_get` | [C](/kmip-server/docs/clients/c/) |
| [`rust`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/clients/rust) | NLnet Labs kmip-protocol (`Cargo.toml`, `Cargo.lock`) | `cargo run --locked` | [Rust](/kmip-server/docs/clients/rust/) |

Each page lists the prerequisites, the other programs and their output.
Downloads and build output stay in the directories, ignored by Git;
`git clean -ffdX examples/clients` removes them.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/clients/README.md"><code>examples/clients/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
