---
title: "keytend-kmip-server Helm chart"
description: "keytend-kmip-server is an experimental KMIP test server for CI systems and for validating KMIP clients; it is not for production use."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/deploy/helm/keytend-kmip-server/README.md"
head: [{"tag":"title","content":"keytend-kmip-server Helm chart | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"keytend-kmip-server Helm chart · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

keytend-kmip-server is an experimental KMIP test server for CI systems and
for validating KMIP clients; it is not for production use. This chart runs
one replica with its SQLite store on a ReadWriteOnce volume, and runs these
maintenance tasks from Helm values:

| Task | How |
| --- | --- |
| Install and check | `helm install` with your Secrets named in values; `helm test` sends a KMIP Query and requires Success ([install](/kmip-server/docs/kubernetes/#install)) |
| Back up | A daily CronJob into a retained PVC, and a backup before every upgrade and rollback; if that backup fails, so does the release ([backups](/kmip-server/docs/backup-restore/#scheduled-backups-on-kubernetes)) |
| Restore | `--set restore.from=<backup> --set restore.id=<id>` ([restore](/kmip-server/docs/backup-restore/#restore-on-kubernetes)) |
| Rotate the master key | A new versioned Secret in `masterKey.existingSecret`, the old one in `rotation.previousMasterKeySecret`; `rotation.revert` goes back ([rotation](/kmip-server/docs/master-key-rotation/#on-kubernetes)) |
| Stop for maintenance | `--set maintenance.enabled=true` (0 replicas; volumes and backups stay) |
| Monitor | `metrics.podMonitor`, `metrics.prometheusRule` (the suggested alerts plus `KmipBackupStale`) |

The chart creates no Secrets. Restore and rotation run in init containers
before the server starts, with the server's own `restore` and
`rotate-master-key --in-place` commands: running them again does nothing, so
the values can stay set until you have checked the result.

## Install

The chart needs Kubernetes 1.27 or later. Run from the directory that holds the `keytend-kmip-server` checkout and the
files `server.pem`, `server.key`, `ca.pem`, `master.key` and `policy.json`
([Kubernetes](/kmip-server/docs/kubernetes/#install) explains how to make them):

```sh title="Install"
kubectl create namespace keytend-kmip-server
kubectl label namespace keytend-kmip-server pod-security.kubernetes.io/enforce=restricted
kubectl -n keytend-kmip-server create secret generic kmip-tls \
  --from-file=server.pem --from-file=server.key --from-file=ca.pem
kubectl -n keytend-kmip-server create secret generic kmip-master-v1 --from-file=master.key
kubectl -n keytend-kmip-server create configmap kmip-policy --from-file=policy.json
helm install keytend-kmip-server keytend-kmip-server/deploy/helm/keytend-kmip-server -n keytend-kmip-server \
  --set image.repository=registry.example.com/keytend-kmip-server \
  --set image.digest=sha256:<image digest> \
  --set masterKey.existingSecret=kmip-master-v1 --set tls.existingSecret=kmip-tls \
  --set policy.existingConfigMap=kmip-policy --wait
```

The full procedure, with a values file and the test, is in
[Kubernetes](/kmip-server/docs/kubernetes/).

## Values

Every value is described in [`values.yaml`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/deploy/helm/keytend-kmip-server/values.yaml) and checked by
[`values.schema.json`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/deploy/helm/keytend-kmip-server/values.schema.json). The main ones:

| Value | Default | Meaning |
| --- | --- | --- |
| `image.repository`, `image.tag`, `image.digest` | `localhost/keytend-kmip-server`, the chart's `appVersion`, none | The server image. `appVersion` is this checkout's version without `-dev`, so between releases it names a release that has no image yet: set the digest from your registry, or `image.tag` to the release you loaded |
| `masterKey.existingSecret` | required | Secret with `master.key`; use versioned names |
| `tls.existingSecret` or `tls.certManager.*` | required | Server certificate, key and client CA (`server.pem`, `server.key`, `ca.pem`), or a cert-manager Certificate |
| `tls.clientCA.*` | none | A separate client CA bundle |
| `policy.existingConfigMap` or `policy.json` | required | The policy file: an existing ConfigMap, or the document itself (a change restarts the pod) |
| `users.existingSecret`, `crl.*` | none | Users file and CRL |
| `provisioning.existingSecret` | none | Provisioning CA (`tls.crt`, `tls.key`); setting it turns on Re-Provision. The CA must also be in the client CA bundle |
| `auditCheckpoint.enabled`, `.configMap` | off | Start only on a store at or after this checkpoint |
| `restore.from`, `restore.id`, `restore.existingClaim` | none | Restore a backup before the server starts |
| `rotation.previousMasterKeySecret`, `rotation.revert` | none, false | Rotate from that key to `masterKey`, or revert |
| `maintenance.enabled` | false | Stop the server (0 replicas) |
| `persistence.storageClass`, `.size` | default class, 10Gi | The data volume; fixed after install |
| `server.env`, `server.bindAddress`, `server.https.enabled` | none, `0.0.0.0`, true | Other settings as `KMIP_*` variables, listener address, HTTPS listener |
| `probes.startup.budgetSeconds` | 60 | Time the server may take to verify its store at start |
| `service.type`, `service.*` | ClusterIP | The client Service; LoadBalancer for clients outside the cluster (TLS passes through) |
| `networkPolicy.clients`, `.ipBlocks`, `.metrics`, `.egress` | labelled client pods; none; labelled scrapers; none | Who may connect; egress for Notify and Put |
| `backup.enabled`, `.schedule`, `.retain`, `.pvc.*`, `.preUpgradeHook.enabled` | true, `15 2 * * *`, 7, 20Gi, true | Scheduled and pre-upgrade backups |
| `volumeHelper.enabled` | false | A busybox pod with the volumes, for `kubectl cp` |
| `podDisruptionBudget.enabled` | false | Make drains wait until you stop the server |
| `metrics.podMonitor.enabled`, `metrics.prometheusRule.enabled` | false | Prometheus Operator resources |
| `tests.clientSecret` | none | Client certificate for `helm test` |

## Design notes

- With `provisioning.existingSecret` set, a client can replace its own TLS
  certificate ([Re-Provision](/kmip-server/docs/re-provision/)), and from then
  on the server refuses the old certificate on new connections. The chart
  cannot update the client's Secret, and replicas that share a client
  certificate are refused once one of them re-provisions
  ([retirement](/kmip-server/docs/re-provision/#retirement)).
- Every pod mounts the data volume as a directory (`/data`), never
  `kmip.sqlite` itself: `restore` and in-place rotation refuse a database
  that is a mount point.
- The backup CronJob, the pre-upgrade Job and the volume helper mount the
  server's ReadWriteOnce volumes, so they carry a required pod affinity to
  the server's node. When no server pod runs (maintenance), they schedule
  wherever the volumes attach, because each matches its own affinity term.
  ReadWriteOncePod volumes are not supported.
- While rotation values are set, the store is under the previous key until
  the init container has run and under the new one after, so the CronJob and
  the pre-upgrade backup pass both (`backup --master-key A --master-key B`;
  the log names the key that opened it). Otherwise they pass only
  `masterKey.existingSecret`. The hook also passes `--if-exists`, so an
  install whose server never created its database can still be upgraded.
- There is no PodDisruptionBudget by default: with one replica a budget
  either blocks every eviction or none.
- The chart runs one replica
  ([availability](/kmip-server/docs/kubernetes/#availability-and-node-maintenance)),
  and its StatefulSet uses `podManagementPolicy: Parallel`. The old pod still
  stops before the new one starts, so an upgrade never runs two versions on
  one store, and a pod that never became ready (a refused restore, a wrong
  Secret) is replaced by the next upgrade instead of blocking it.
- An upgrade's backup hook renders from the new chart and image. `backup`
  only reads the store and never upgrades it, so a newer image can back up an
  older store. `helm rollback` instead runs the hook stored with the target
  revision: its image and the keys of that revision. Across a master-key
  rotation that backup fails, and so does the rollback; use
  `rotation.revert` instead. `helm rollback` does not restore data either: to
  go back across a schema change,
  [restore the pre-upgrade backup](/kmip-server/docs/operations/#rolling-back).
- The hook is rendered only when `lookup` finds the data and backup volumes,
  so it is left out on the upgrade that turns backups on, and by
  `helm template` and GitOps renderers
  ([GitOps](/kmip-server/docs/kubernetes/#without-helm-and-gitops)).
- An upgrade that names a `masterKey.existingSecret` the running StatefulSet
  does not use, without `rotation.previousMasterKeySecret` or `restore.from`,
  fails at render time. With `restore.from` it renders, but the pre-upgrade
  backup then tries only the backup's key on the current store and fails:
  restore a backup from before a master-key rotation with `--no-hooks`
  ([restore on Kubernetes](/kmip-server/docs/backup-restore/#restore-on-kubernetes)).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/deploy/helm/keytend-kmip-server/README.md"><code>deploy/helm/keytend-kmip-server/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>770ad85</code>.</p>
