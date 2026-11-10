---
title: "Release builds"
description: "What a release set contains and how it is built. How to verify a release is in release verification."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/release-builds.md"
head: [{"tag":"title","content":"Release builds | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Release builds · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [contributing](/kmip-server/docs/#contributing).

What a release set contains and how it is built. How to
verify a release is in [release verification](/kmip-server/docs/release-signing/).

## The release set

A release set is one directory (`scripts/release_artifacts.py assemble`
collects it):

| Path | Content |
| --- | --- |
| `linux-<arch>/keytend-kmip-server-<version>[-linux-<arch>].docker.tar` | Docker archive of the image for that platform, for `docker load` or `kind load image-archive` |
| `linux-<arch>/image.json` | package manifest: image ID, archive SHA-256, base image pins, builder host, source commit |
| `linux-<arch>/sbom.cdx.json` | CycloneDX 1.6 SBOM: the Cargo build graph without dev dependencies, and every RPM in the image |
| `linux-<arch>/provenance.intoto.json` | in-toto Statement v1 with an SLSA v1 provenance predicate (see [how releases are built](#how-releases-are-built)) |
| `index/keytend-kmip-server-<version>.oci.tar` | OCI image layout archive: the multi-architecture image index and every platform's image |
| `index/oci-image-index.json` | the raw OCI image index blob; its SHA-256 is the index digest |
| `index/image-index.json` | index digest, each platform's manifest digest and the bindings to the Docker archives |
| `reports/keytend-kmip-server-<version>-test-reports.tar.gz` | the reports of the run that produced the release ([test reports](/kmip-server/docs/testing/#test-reports)) |
| `SHA256SUMS` | SHA-256 of every file above |
| `SHA256SUMS.sigstore.json` | cosign signature of `SHA256SUMS` (a Sigstore bundle) |
| `SHA256SUMS.asc` | detached ASCII-armored OpenPGP signature of `SHA256SUMS` (see [OpenPGP signature](/kmip-server/docs/release-signing/#openpgp-signature)) |

`sign` writes the two signatures; nothing else in the set is signed
separately. `verify` adds
`verification.json`, the verifier's own report, which is not listed or
signed. The archives are build artifacts and stay out of Git.

A GitHub release publishes `SHA256SUMS`, `SHA256SUMS.sigstore.json` and
`SHA256SUMS.asc` as assets, and the release directory as one tar asset named
`keytend-kmip-server-<version>-signed-release.tar` (release assets cannot hold
directories). Other assets, such as a `.sha256` of the tar or a copy of
`cosign.pub`, are not needed for verification.

## How releases are built

- Each platform is built with one `podman build`, with both UBI base images
  pinned by digest, from a build context tar with sorted names, zero
  modification times and root ownership, so the image does not depend on the
  checkout ([build type](#build-type-podman-dockerfile-v1)).
- The server binary has been reproduced byte for byte by
  separate uncached builds; image IDs are not reproducible (each build writes
  a new RPM database, ldconfig cache and directory times).
- `provenance.intoto.json` is an
  [in-toto Statement v1](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md)
  with an [SLSA v1 provenance](https://slsa.dev/spec/v1.0/provenance)
  predicate, covered by the `SHA256SUMS` signatures. Its subjects are the
  Docker archive and the image configuration digest; it records the source
  commit, the build command, the base images, `Cargo.lock`, every shipped
  RPM, the toolchain, the builder host, and digests of `image.json`, the SBOM
  and the build log.
- The SLSA level is at most Build L1. Provenance is written and signed on
  developer-operated hosts, not by a hosted build platform (L2), and builds
  are not isolated from the signing keys (L3).

## Build type `podman-dockerfile-v1`

The `buildType` of each release's provenance. The provenance gives it as the
address of a [section in release verification](/kmip-server/docs/release-signing/#build-type-podman-dockerfile-v1),
which links here.

Each platform's image is built from a normalized build context, with both UBI
base images pinned by digest, and saved as a Docker archive:

```sh title="Build type podman-dockerfile-v1"
podman build --format docker --platform <platform> \
  --build-arg UBI_BUILDER=<pin> --build-arg UBI_MICRO=<pin> -t <tag> .
podman save --format docker-archive …
```

The OCI index keeps each image's runtime configuration but drops the
Docker-only health check, which OCI has no field for; Kubernetes uses the
probes of the [Helm chart](/kmip-server/docs/kubernetes/) (or of the minimal Kustomize base in
[deploy/kubernetes](/kmip-server/docs/deploy/kubernetes/)) instead, and
[deployment](/kmip-server/docs/deployment/#without-compose) covers `docker run`.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/docs/release-builds.md"><code>docs/release-builds.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>770ad85</code>.</p>
