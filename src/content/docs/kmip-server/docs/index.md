---
title: "Keytend KMIP Server documentation"
description: "Getting started, client examples, configuration, operations and feature reference for keytend-kmip-server, the Keytend KMIP Server: an experimental KMIP server for client tests and CI."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/README.md"
head: [{"tag":"title","content":"Documentation | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Keytend KMIP Server documentation · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

<p class="kt-doc-status"><span class="kt-pill kt-pill--experimental"><span class="kt-dot" aria-hidden="true"></span>Experimental</span> <span><span class="kt-nw">keytend-kmip-server</span> is for client tests and CI, and stays experimental at every version, 1.0 included. Do not use it to protect real keys or data.</span></p>

<nav class="kt-doc-cards not-content" aria-label="Start here">
<ul>
<li><a class="kt-doc-card" href="/kmip-server/docs/quick-start/"><span class="kt-doc-card__eyebrow">Start here</span><span class="kt-doc-card__title">Quick start</span><span class="kt-doc-card__summary">Run the server locally in a container and make a first request.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-server/docs/clients/"><span class="kt-doc-card__eyebrow">Start here</span><span class="kt-doc-card__title">Connecting a client</span><span class="kt-doc-card__summary">Client examples in Python, Go, Java, C and Rust, requests over HTTPS, and how to handle errors and retries.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-server/docs/status/"><span class="kt-doc-card__eyebrow">Start here</span><span class="kt-doc-card__title">Project status</span><span class="kt-doc-card__summary">What works in KMIP 1.0 to 2.1, client and OASIS test results, and known gaps such as the single replica.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-server/docs/support-matrix/"><span class="kt-doc-card__eyebrow">Start here</span><span class="kt-doc-card__title">Support matrix</span><span class="kt-doc-card__summary">Which operations, object types and attributes each KMIP edition supports.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-server/docs/deployment/"><span class="kt-doc-card__eyebrow">Guide</span><span class="kt-doc-card__title">Deployment</span><span class="kt-doc-card__summary">How to run it with Docker Compose or on Kubernetes, and the operations runbooks.</span></a></li>
<li><a class="kt-doc-card" href="/kmip-server/docs/configuration/"><span class="kt-doc-card__eyebrow">Reference</span><span class="kt-doc-card__title">Configuration reference</span><span class="kt-doc-card__summary">Every <code>serve</code> flag and environment variable, the policy file format, endpoints and fixed limits.</span></a></li>
</ul>
</nav>

## Getting started

- [Quick start](/kmip-server/docs/quick-start/): run a server and make a first request
  ([by hand, changing a setting, or from source](/kmip-server/docs/manual-install/)).
- [Connecting a client](/kmip-server/docs/clients/): what a client needs, with examples for
  [Python](/kmip-server/docs/clients/python/), [Go](/kmip-server/docs/clients/go/), [Java](/kmip-server/docs/clients/java/),
  [C](/kmip-server/docs/clients/c/), [Rust](/kmip-server/docs/clients/rust/) and
  [HTTPS with JSON or XML](/kmip-server/docs/clients/https/) (the rules:
  [JSON, XML and HTTPS bindings](/kmip-server/docs/encodings/));
  [errors and retries](/kmip-server/docs/client-errors/).
- [Project status](/kmip-server/docs/status/) and the [support matrix](/kmip-server/docs/support-matrix/):
  what is supported, tested and missing, per KMIP edition.

## Common tasks

:::tip[Three keys can be rotated]
Three different keys can be rotated: an application key that KMIP clients
use ([Re-key](/kmip-server/docs/rekey/)); the server's own master key, which encrypts the
store ([master-key rotation](/kmip-server/docs/master-key-rotation/)); and a database's
master key held in this server, such as Percona's `--kmipRotateMasterKey`
([Percona](/kmip-server/docs/percona/)).
:::

In an application:

| Task | Also |
| --- | --- |
| [Create and fetch a key](/kmip-server/docs/quick-start/#make-a-request-with-curl) | [register an existing key](/kmip-server/docs/clients/python/#common-tasks) |
| [Find a key by Name](/kmip-server/docs/clients/https/#locate-by-name) | [Go](/kmip-server/docs/clients/go/#find-a-key-by-name) |
| [Encrypt and decrypt on the server](/kmip-server/docs/clients/https/#encrypt-and-decrypt-with-aes-gcm) | [Python](/kmip-server/docs/clients/python/#server-side-encrypt-over-https-json), [Go](/kmip-server/docs/clients/go/#create-encrypt-and-retire-a-key), [Java](/kmip-server/docs/clients/java/#binary-kmip) |
| [Sign and verify with an RSA key pair](/kmip-server/docs/clients/https/#sign-and-verify-with-rsa) | [ECDSA with Java](/kmip-server/docs/clients/java/#sign-and-verify) |
| [Derive a key with HKDF](/kmip-server/docs/crypto-operations/#example-derive-a-key-with-hkdf-over-https) | |
| [Fetch a Sensitive key wrapped under another key](/kmip-server/docs/key-transfer/#example-fetch-a-sensitive-key-wrapped) | |
| [Set and read an attribute](/kmip-server/docs/attributes/#example-set-and-read-an-attribute) | |
| [Revoke and destroy a key](/kmip-server/docs/clients/https/#retire-a-key-in-one-batch) | |
| [Rotate an application key with Re-key](/kmip-server/docs/rekey/) | [Python](/kmip-server/docs/clients/python/#common-tasks) |
| [Export and import keys](/kmip-server/docs/key-transfer/#import-and-export) | |
| [Turn on request-header credentials](/kmip-server/docs/credentials/) | [Python](/kmip-server/docs/clients/python/#request-header-credentials) |

Running the server:

| Task | Also |
| --- | --- |
| [Issue server and client certificates](/kmip-server/docs/tls-setup/#issuing-them-with-openssl) | [cert-manager](/kmip-server/docs/tls-setup/#issuing-them-with-cert-manager), [revoke with a CRL](/kmip-server/docs/tls-setup/#crl) |
| [Run it with Docker Compose](/kmip-server/docs/deployment/#docker-compose) | [upgrade it](/kmip-server/docs/operations/#upgrading-with-compose) |
| [Install on Kubernetes with Helm](/kmip-server/docs/kubernetes/#install) | `helm test`, [check a client certificate](/kmip-server/docs/kubernetes/#client-namespaces) with [`kmip-check.yaml`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/deploy/kubernetes/tools/kmip-check.yaml) |
| [Reach the server from outside Kubernetes](/kmip-server/docs/kubernetes/#clients-outside-the-cluster) | [allow Notify and Put delivery](/kmip-server/docs/server-to-client/#configuration) |
| [Add or move the health check](/kmip-server/docs/deployment/#health-check) | |
| [Add a client or change its operations](/kmip-server/docs/operations/#changing-the-policy) | [role templates](/kmip-server/docs/configuration/#role-templates) |
| [Rotate a client certificate](/kmip-server/docs/operations/#rotating-a-client-certificate) | [the client CA](/kmip-server/docs/operations/#rotating-the-client-ca) |
| [Recover a client locked out by Re-Provision](/kmip-server/docs/re-provision/#lockout-recovery) | [after a Re-Provision, add the new certificate to the policy](/kmip-server/docs/operations/#re-provision-and-lockout-recovery) |
| [Renew the server certificate or CRL](/kmip-server/docs/operations/#renewing-server-certificates-and-crls) | |
| [Back up](/kmip-server/docs/backup-restore/#back-up) | [schedule](/kmip-server/docs/backup-restore/#scheduled-backups-with-docker), [restore](/kmip-server/docs/backup-restore/#restore), [recover onto a new host](/kmip-server/docs/backup-restore/#recover-onto-a-new-host-or-namespace) |
| [Back up and restore on Kubernetes](/kmip-server/docs/backup-restore/#on-kubernetes) | [run a backup now](/kmip-server/docs/backup-restore/#scheduled-backups-on-kubernetes), [restore with `helm upgrade`](/kmip-server/docs/backup-restore/#restore-on-kubernetes) |
| [Rotate the master key](/kmip-server/docs/master-key-rotation/) | [on Kubernetes](/kmip-server/docs/master-key-rotation/#on-kubernetes), [if it fails](/kmip-server/docs/master-key-rotation/#if-the-docker-rotation-fails) |
| [Export an audit checkpoint](/kmip-server/docs/audit-checkpoints/#export-a-checkpoint) | |
| [Monitor the server](/kmip-server/docs/metrics/#alerts) | |
| [See which version and settings are running](/kmip-server/docs/configuration/#logging) | [`kmip_build_info`](/kmip-server/docs/metrics/#build-and-process) |
| [Upgrade](/kmip-server/docs/operations/#upgrading) | [on Kubernetes](/kmip-server/docs/operations/#upgrading-on-kubernetes), [troubleshoot](/kmip-server/docs/operations/#troubleshooting) |
| [Stop the server for node maintenance](/kmip-server/docs/kubernetes/#availability-and-node-maintenance) | |
| [Verify a release](/kmip-server/docs/release-signing/#verifying-a-release) | |

## Configuration and operations

| Page | Covers |
| --- | --- |
| [Configuration reference](/kmip-server/docs/configuration/) | Commands, every `serve` setting, endpoints, the policy file, limits, logging |
| [Authorization](/kmip-server/docs/authorization/) | Ownership, object grants, tenant isolation |
| [Request-header credentials](/kmip-server/docs/credentials/) | Users, devices, Hashed Password, One Time Password |
| [TLS profiles](/kmip-server/docs/tls-profiles/) | The TLS policies and when to choose them |
| [JSON, XML and HTTPS bindings](/kmip-server/docs/encodings/) | Media types, HTTP status codes, response forms |
| [Deployment](/kmip-server/docs/deployment/) | Inputs, master key, Docker, Podman, Compose |
| [Kubernetes](/kmip-server/docs/kubernetes/) | The Helm chart: install, settings, external clients, monitoring, node maintenance |
| [Operations runbooks](/kmip-server/docs/operations/) | Health, policy and certificate changes, upgrades, incidents |
| [Backup and restore](/kmip-server/docs/backup-restore/) | Backups, schedules and restores, with Docker and the Helm chart |
| [Master-key rotation](/kmip-server/docs/master-key-rotation/) | Re-encrypting the store under a new master key |
| [Metrics](/kmip-server/docs/metrics/) | Prometheus metrics, connection counters, scraping, alerts |
| [Container image](/kmip-server/docs/container-image/) | Image contents, licences, scanner findings |
| [FIPS mode](/kmip-server/docs/fips/) | The OpenSSL FIPS provider and what FIPS mode refuses |

## Security

| Page | Covers |
| --- | --- |
| [Security](/kmip-server/docs/security/) | Reporting, threat model, hardening checklist |
| [TLS certificates and policy](/kmip-server/docs/tls-setup/) | Issuing certificates, the policy, CRLs |
| [Store integrity](/kmip-server/docs/store-integrity/) | How the store proves records current and detects a swapped database |
| [Audit checkpoints](/kmip-server/docs/audit-checkpoints/) | Protecting the store against rollback across restarts |
| [Release verification](/kmip-server/docs/release-signing/) | Signatures, checksums, copying to a registry, provenance and SBOM |

## Feature reference

What works in which KMIP edition, which setting controls it, and what is not
supported. The [support matrix](/kmip-server/docs/support-matrix/) links each operation to its
page.

| Page | Covers |
| --- | --- |
| [Object types](/kmip-server/docs/objects/) | Secret data, opaque objects, PGP keys, templates, split keys |
| [Algorithms and key formats](/kmip-server/docs/algorithms/) | AES, HMAC, ChaCha20, 3DES, RSA, DSA, curves, post-quantum keys |
| [Cryptographic operations](/kmip-server/docs/crypto-operations/) | Encrypt, Decrypt, Sign, MAC, Hash, RNG, Derive Key, streaming |
| [KMIP certificate objects](/kmip-server/docs/certificates/) | Storing, verifying, validating, requesting and issuing certificates as KMIP objects (TLS certificates: [TLS setup](/kmip-server/docs/tls-setup/)) |
| [Getting and transferring keys](/kmip-server/docs/key-transfer/) | Get, key wrapping, Import and Export |
| [Object lifecycle](/kmip-server/docs/lifecycle/) | States and dates, Revoke, Destroy, usage limits, leases, usage masks |
| [Re-key](/kmip-server/docs/rekey/) | Re-key and Re-key Key Pair |
| [Attributes](/kmip-server/docs/attributes/) | Reading and changing attributes, names, links |
| [Locate](/kmip-server/docs/locate/) | Filters, dates, storage status, group members |
| [Messages, batches and Query](/kmip-server/docs/messages/) | Batches, Undo, response size, asynchronous requests |
| [Notify, Put and Set Endpoint Role](/kmip-server/docs/server-to-client/) | Server-to-client delivery |
| [Login and tickets](/kmip-server/docs/tickets/) | Login, Logout, Delegated Login, Ticket credentials |
| [Server defaults and constraints](/kmip-server/docs/defaults-and-constraints/) | Set Defaults, Set Constraints, Get Constraints |
| [Re-Provision](/kmip-server/docs/re-provision/) | Replacing a client's TLS certificate |
| [KMIP 3.0 draft](/kmip-server/docs/kmip-3-0/) | System objects, Login, Obliterate, constraints |
| [Specification interpretations](/kmip-server/docs/interpretations/) | Compatibility settings; how ambiguous KMIP rules are read |

## Integrations

- [Percona database encryption](/kmip-server/docs/percona/): MongoDB and MySQL configuration.

## Contributing

- [Testing](/kmip-server/docs/testing/): building from source, the test suites and the image.
- [Interoperability adapters](/kmip-server/docs/interop/): the client programs the
  test suites run.
- [Release builds](/kmip-server/docs/release-builds/): what a release set contains and how it
  is built.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/docs/README.md"><code>docs/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
