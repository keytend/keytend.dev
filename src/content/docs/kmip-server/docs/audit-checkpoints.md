---
title: "Audit checkpoints"
description: "The store's HMAC-chained audit history proves that its records were not altered, but an older, authentic copy of the store (a restored backup, a rolled-back volume snapshot) passes the same checks."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/audit-checkpoints.md"
head: [{"tag":"title","content":"Audit checkpoints | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Audit checkpoints · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [security](/kmip-server/docs/#security).

The store's HMAC-chained audit history proves that its records were not
altered, but an older, authentic copy of the store (a restored backup, a
rolled-back volume snapshot) passes the same checks. An **audit checkpoint**
records the audit position the store has reached. A server started with
`--audit-checkpoint` (`KMIP_AUDIT_CHECKPOINT`) checks the store against it
before it opens any listener, and refuses to start when the store is older
than the checkpoint, has a different history at that point, belongs to
another store or master key, or when the file is missing or altered. A store
with later audit events passes.

## Export a checkpoint

Export one from a verified backup, so the newest backup always satisfies the
newest checkpoint. With the `/srv/kmip` Docker layout, the command is the last
step of [back up with Docker](/kmip-server/docs/backup-restore/#back-up-with-docker). For
files in a directory you own, run each command below as
`docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" "$IMAGE" …` with
`/work/` before each file name:

```sh title="Export a checkpoint"
keytend-kmip-server check-store --database backup-2026-11-04.sqlite --master-key master.key
keytend-kmip-server audit-checkpoint --database backup-2026-11-04.sqlite \
  --master-key master.key --previous checkpoint-2026-11-03.json \
  --output checkpoint-2026-11-04.json
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
Master key, object records and audit chain verified
Authenticated audit checkpoint exported; retain it independently of database snapshots
```

</div>

`--previous` makes the export fail unless the store is at or after the last
checkpoint you trust, so you never export a lower floor by mistake; leave it
out for the first one. The command refuses to overwrite an existing file. The
same command works on the live database.

Keep the checkpoints where the people and systems that can roll back the
server's storage cannot replace them, for example an object store with
versioning or retention locks under separate administration.

## Start the server with it

Docker or Podman, with the `/srv/kmip` layout and Compose file of
[deployment](/kmip-server/docs/deployment/#docker-compose): install the checkpoint under a
fixed name, name it in `kmip.env`, turn on the checkpoint mount in
`compose.yaml` and recreate the container:

```sh title="Start the server with it"
sudo install -d -o 10001 -g 10001 -m 0700 /srv/kmip/checkpoints
sudo install -o 10001 -g 10001 -m 0444 checkpoint-2026-11-04.json /srv/kmip/checkpoints/checkpoint.json
echo KMIP_AUDIT_CHECKPOINT=/checkpoints/checkpoint.json | sudo tee -a /srv/kmip/kmip.env
sudo sed -i 's|# - \(.*/checkpoints:/checkpoints:ro\)|- \1|' /srv/kmip/compose.yaml
docker compose -f /srv/kmip/compose.yaml up -d --force-recreate
curl -sf --retry 30 --retry-all-errors --retry-delay 1 http://127.0.0.1:8080/readyz
```

Without Compose, add `-v /srv/kmip/checkpoints:/checkpoints:ro` to the
[`docker run -d` command](/kmip-server/docs/deployment/#without-compose) when you create the
container again.

Kubernetes, with the [chart](/kmip-server/docs/kubernetes/): put the checkpoint in a
ConfigMap and turn it on (`kmip-values.yaml` and the variables as in
[installing the chart](/kmip-server/docs/kubernetes/#install)):

```sh frame="code"
kubectl -n $NS create configmap kmip-checkpoint \
  --from-file=checkpoint.json=checkpoint-2026-11-04.json --dry-run=client -o yaml |
  kubectl apply -f -
```

```yaml
auditCheckpoint:
  enabled: true
  configMap: kmip-checkpoint
```

```sh frame="code"
helm upgrade keytend-kmip-server $CHART -n $NS -f kmip-values.yaml --wait
```

The server's `kmip_store_audit_checkpoint_verified` metric is 1 when it
started with the checkpoint verified. The chart does not export checkpoints:
to advance one after a backup, copy the backup off the cluster
([backups on Kubernetes](/kmip-server/docs/backup-restore/#scheduled-backups-on-kubernetes)),
export from it as [above](#export-a-checkpoint) and replace the ConfigMap. Restrict who may change that ConfigMap,
and keep the authoritative copy in the independent store: anyone who can edit
the ConfigMap can also put an older checkpoint back.

## Advance it

The server reads the checkpoint only at startup; `check-store
--audit-checkpoint` reads it on demand. To advance, export a newer checkpoint
(after the next backup), store it, then replace the mounted file. No restart
is required: the running server keeps the checkpoint it started with, and the
next time it restarts, for any reason, it checks the store against the new
file. A rollback to a backup taken after the current checkpoint is not detected, so
export a checkpoint after every backup.

## Restore

A backup older than the current checkpoint cannot start. Before you restore,
check the candidate:

```sh title="Restore"
keytend-kmip-server check-store --database backup-2026-11-04.sqlite \
  --master-key master.key --audit-checkpoint checkpoint-2026-11-04.json
```

Restore the newest backup that passes ([restore](/kmip-server/docs/backup-restore/#restore)).
If none does, you are choosing to lose the history after the checkpoint: do
not lower or regenerate the checkpoint from the restored store to make it
pass, but treat it as an incident ([store integrity
incidents](/kmip-server/docs/operations/#store-integrity-incidents)), record the decision, and
start a new checkpoint series from the restored store only after it.

## Master-key rotation

A checkpoint is bound to the master key: the old checkpoint does not verify
the rotated store, and the server refuses it. `rotate-master-key
--audit-checkpoint <current>` checks the source against the current
checkpoint; then deploy the rotated store with a checkpoint exported under the
new key ([master-key rotation](/kmip-server/docs/master-key-rotation/)). With `--in-place`,
`--checkpoint-output` writes that checkpoint as part of the rotation
([rotate in place](/kmip-server/docs/master-key-rotation/#rotate-in-place)); the chart prints
it for publishing ([on Kubernetes](/kmip-server/docs/master-key-rotation/#on-kubernetes)).
Keep the old checkpoint with the old database and key: a
[revert](/kmip-server/docs/master-key-rotation/#revert-on-kubernetes) needs it.

## Limits

- The checkpoint is authenticated with a key derived from the master key, not
  signed: anyone with the master key can forge one, as they can forge the
  audit chain.
- It is checked at startup and by `check-store`, not continuously; a running
  server's own [live history](/kmip-server/docs/store-integrity/#live-history-check) check covers replacement of
  the database under a running process.
- It covers the store as a whole. Replay of a single object's older record is
  detected by the [authenticated index](/kmip-server/docs/store-integrity/#authenticated-index), not by the
  checkpoint.
- Export, storage and advancing are operator tasks; the server uploads
  nothing.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/802895e20231a5c04fc97b7a6b29f59232f280a6/docs/audit-checkpoints.md"><code>docs/audit-checkpoints.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>802895e</code>.</p>
