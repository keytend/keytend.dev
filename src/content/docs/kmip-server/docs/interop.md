---
title: "Interoperability adapters"
description: "Small programs that drive the server through other KMIP clients. The test scripts start a server with test certificates, run each adapter against it, and fail if a client fails or is missing."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/interop/README.md"
head: [{"tag":"title","content":"Interoperability adapters | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Interoperability adapters · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Small programs that drive the server through other KMIP clients. The test
scripts start a server with test certificates, run each adapter against it,
and fail if a client fails or is missing. The tested clients and their
versions are in [tested clients](/kmip-server/docs/clients/#tested-clients); what the
runs exercised is in [project status](/kmip-server/docs/status/#what-has-been-tested).

| Adapter | Client and version | Run by |
| --- | --- | --- |
| [`pykmip.py`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/pykmip.py) | PyKMIP, commit `4815637` | `scripts/test_interop.py` |
| [`libkmip.c`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/libkmip.c) | OpenKMIP libkmip, commit `6611941` | `scripts/test_interop.py` |
| [`ovh/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/ovh) | OVH kmip-go, commit `525ef10` | `scripts/test_interop.py`, `scripts/test_https.py --go` |
| [`ovh-release/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/ovh-release) | OVH kmip-go v0.9.2 | `scripts/test_interop.py` |
| [`thales/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/thales) | Thales kmip-go, commit `5b93a22` | `scripts/test_interop.py` |
| [`nlnet/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/nlnet) | NLnet Labs kmip-protocol 0.4.3 | `scripts/test_interop.py` |
| [`../integration/ibm/client.c`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/integration/ibm/client.c) | IBM libkmipclient v2.44.1, in a client container | `scripts/test_ibm_client.py` |
| [`phsym/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/phsym) | phsym kmip-rs v0.6.0 (trial, not counted) | `scripts/test_phsym_client.py` |
| [`cosmian/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/cosmian) | Cosmian KMS client 5.28.0 (trial, not counted; BUSL-1.1, test use only) | `scripts/test_cosmian_client.py` |
| [`java/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/java) | the signed keytend-kmip 0.10.0-rc.1 release (commit `0c5c725`) that [`java/keytend-kmip-release.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/java/keytend-kmip-release.json) pins | `scripts/test_java_*.py` and other feature tests |
| [`pbm/`](https://github.com/keytend/keytend-kmip-server/tree/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/pbm) | Percona Backup for MongoDB 2.17.0 test image | `scripts/test_database_pbm*.py` |

phsym kmip-rs and the Cosmian client run in separate trial suites and are not
counted as tested clients: phsym kmip-rs shares its lead maintainer with OVH
kmip-go, and Cosmian's BUSL-1.1 licence allows test use only.

[`clients.lock.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/clients.lock.json) pins the Git commits that
`scripts/test_interop.py` checks out, and
[`requirements.lock`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/requirements.lock) the Python packages. Commands and
prerequisites are in [testing](/kmip-server/docs/testing/#process-and-client-suites).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/interop/README.md"><code>interop/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
