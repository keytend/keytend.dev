---
title: "Project status"
description: "keytend-kmip-server is a test server, not for production use. It is meant for CI systems and for validating KMIP clients and implementations. It stays a test server at 1.0 and beyond."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/status.md"
head: [{"tag":"title","content":"Project status | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Project status · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [getting started](/kmip-server/docs/#getting-started).

keytend-kmip-server is **a test server, not for production use**. It is meant for CI systems and for validating KMIP clients and implementations.
It stays a test server at 1.0 and beyond. It is not a complete implementation of any
KMIP edition, holds no conformance certification, has had no independent
security audit, and claims no FIPS 140-3 validation.

## What works

| Area | Supported |
| --- | --- |
| Protocol versions | KMIP 1.0–1.4, 2.0 and 2.1; the 3.0 draft (CSD02, 7 May 2026) only with `--experimental-v3`. Not every operation, object or attribute of a version is implemented. |
| Transports | Binary TTLV over TLS (5696); optional HTTPS with TTLV, JSON or XML bodies (5697: `--https-listen`, on in the supplied Kubernetes resources). Mutual TLS on both; no plaintext mode. |
| Objects | Symmetric keys; RSA and EC key pairs; X.509 and PGP certificates; secret data; opaque objects; split keys; PGP keys; certificate requests (2.0+); 1.x templates; ML-KEM, ML-DSA and SLH-DSA keys (3.0 draft). |
| Cryptography | AES (ECB, CBC, CFB, OFB, CTR, GCM), ChaCha20, ChaCha20-Poly1305, HMAC, AES-CMAC, RSA, ECDSA, SHA-1/2/3, key wrapping and derivation, multipart; 3DES if enabled ([algorithms](/kmip-server/docs/algorithms/)). |
| Access control | Client certificate fingerprint mapped to a principal and an operation allowlist; per-principal ownership; exact-object read grants; optional request-header credentials; Login and delegated tickets (in memory); optional certificate replacement by Re-Provision. |
| Storage | One SQLite database, objects encrypted with AES-256-GCM under a 32-byte master key; HMAC-chained audit log; online backup; master-key rotation; optional audit checkpoints. |
| Deployment | UBI 9 micro image (amd64, arm64) running as UID 10001; a [Helm chart](/kmip-server/docs/kubernetes/) for Kubernetes (one replica, scheduled backups, and restore, master-key rotation and maintenance mode set through Helm values); Prometheus metrics; FIPS mode using the RHEL 9 OpenSSL FIPS provider. |

The [support matrix](/kmip-server/docs/support-matrix/) lists every operation and object type
per edition, each linked to the page that says what is and is not
implemented, and the attributes a new key reports. How attributes are read
and changed is in [attributes](/kmip-server/docs/attributes/).

## Operations per edition

Operations offered by default, per edition, as Query reports them; the count
leaves out the opt-in operations. Every handler is partial: it
implements the operation for the supported objects and parameters, not every
case the specification describes.

| Edition | Offered by default | Opt-in | Not implemented |
| --- | --- | --- | --- |
| 1.0 | 26 of 28 | Notify, Put | |
| 1.1 | 28 of 30 | Notify, Put | |
| 1.2, 1.3 | 39 of 41 | Notify, Put | |
| 1.4 | 41 of 43 | Notify, Put | |
| 2.0 | 49 of 53 | Notify, Put, Interop, Re-Provision | |
| 2.1 | 55 of 59 | Notify, Put, Interop, Re-Provision | |
| 3.0 draft | 62 of 66 | Interop, Re-Provision | Notify, Put |

Opt-in operations are implemented but offered only when configured: the
server sends Notify and Put only to principals with a `client_endpoint`
([Notify and Put](/kmip-server/docs/server-to-client/)), offers Interop only with
`--interop-test-mode`, which KMIP forbids on a production server, and offers
Re-Provision only with `--provisioning-ca` ([Re-Provision](/kmip-server/docs/re-provision/)).

Login tickets ([Login and tickets](/kmip-server/docs/tickets/)), server defaults and
constraints ([server defaults and constraints](/kmip-server/docs/defaults-and-constraints/))
and Re-Provision have engine and process tests only: no independent client
in the tested set has an API for them, and no OASIS test trace exercises
them.

## What has been tested

The project's own tests cover the areas below. They record which operations
and versions each client and suite exercises. They are not a conformance
result. Results are in each release's [test reports](/kmip-server/docs/testing/#test-reports).

| Area | What the tests cover |
| --- | --- |
| Unit and engine tests (`cargo test`) | Every edition, operation handler and store path |
| Six independent client libraries and the keytend-kmip Java client ([versions](/kmip-server/docs/clients/#tested-clients)) | The operations each client exercises against a running server |
| Percona Server for MongoDB 8.0 and MySQL 8.4 | The [tested scope](/kmip-server/docs/percona/#what-was-tested); the MySQL component does not verify the server by default and does not reconnect after an idle close ([notes](/kmip-server/docs/percona/#percona-server-for-mysql)) |
| OASIS Profiles XML test traces, 1.3 to 3.0 | Strict replay, and replay with the variations the Profiles permit ([trace replay](/kmip-server/docs/testing/#oasis-trace-replay)) |
| FIPS mode (RHEL 9 OpenSSL FIPS provider) | The same tests with the FIPS provider, where only the refusals FIPS requires may differ ([FIPS](/kmip-server/docs/fips/)) |
| Container image (amd64, arm64) and Helm chart | Image hardening checks ([findings](/kmip-server/docs/container-image/#reviewed-findings)); the chart's install, test, backup, upgrade, restore, rotation and maintenance workflows on single-node kind; multi-node, NetworkPolicy enforcement, cert-manager and Prometheus Operator resources are not tested |

The clause-level [requirement matrix](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/docs/specs/requirement-matrix.json) of the
pinned KMIP documents is incomplete; many clauses are open.

## Known gaps

- Incomplete KMIP semantics: remaining attributes, mechanisms, Locate filters,
  asynchronous operations, and the operations above.
- One local SQLite store and one replica: no high availability, replication
  or failover.
- No HSM or external key sealing; the master key is a file.
- No remote audit witness: audit checkpoints must be retained by the operator.
- No per-request access log ([logging](/kmip-server/docs/configuration/#logging)).
- No hot reload of TLS material, CRLs or policy; changes need a restart.
- No per-tenant rate or size quotas beyond the [fixed limits](/kmip-server/docs/configuration/#fixed-limits).
- Best-effort zeroization only; no memory locking or protection from a
  privileged host. The [object cache](/kmip-server/docs/configuration/#object-cache) keeps
  recently used keys in memory (`--object-cache-mib 0` turns it off).
- The container image carries open scanner findings ([container image](/kmip-server/docs/container-image/#reviewed-findings)).
- Throughput and capacity are not measured or qualified; the
  [fixed limits](/kmip-server/docs/configuration/#fixed-limits) are denial-of-service bounds.
- Production storage, CNI and database topologies are not qualified.

## Running the checks

```sh title="Running the checks"
python3 scripts/support_matrix.py --check   # the support matrix matches the server
python3 scripts/oasis_conformance.py        # strict OASIS trace replay
```

Both build the server first (`--skip-build` uses an existing
`target/debug` build). `oasis_conformance.py --report-only` records every
outcome without failing. How to run the full test suite is in
[testing](/kmip-server/docs/testing/).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/docs/status.md"><code>docs/status.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>770ad85</code>.</p>
