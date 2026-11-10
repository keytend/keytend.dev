---
title: "Store integrity"
description: "How the store proves that every record it returns is current, and how a running server notices that its database was swapped for an older or different copy."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/store-integrity.md"
head: [{"tag":"title","content":"Store integrity | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Store integrity · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [security](/kmip-server/docs/#security).

How the store proves that every record it returns is current, and how a
running server notices that its database was swapped for an older or
different copy.

:::tip[No setup needed]
These checks need no setup. To protect against a rollback across a restart (a restored backup or volume
snapshot), set up [audit checkpoints](/kmip-server/docs/audit-checkpoints/). When a check
fails, follow [store integrity incidents](/kmip-server/docs/operations/#store-integrity-incidents).
:::

Encrypting each record with AES-256-GCM proves that it was written with the
master key, but not that it is the latest version: putting back an old,
validly encrypted record, or a whole older database, could restore destroyed
key material or reset a usage budget. The store has two checks for this.
An **authenticated index** of the current records, bound into the
HMAC-chained audit log, catches a single record replaced or removed. The
**audit floor** (the identity of the store, the last committed audit
sequence number and that entry's MAC, which a running server keeps in
memory and checks on every read and write) catches a whole database
replaced.

## Authenticated index

- An authenticated search tree (an AVL tree in the `object_state`
  table) holds, for each object, its identifier, owner, row and the SHA-256 of
  its exact encrypted bytes. Its root is stored encrypted under the master key.
- Every new audit entry's HMAC covers a commitment to the
  current root, so the index and the audit chain cannot be rolled back
  separately.
- Reads check the root's binding to the latest audit entry and
  authenticate the search path to the record (or its absence) within one
  SQLite snapshot. Collection operations such as Locate walk the authenticated
  index, so a record added outside it never becomes visible.
- Writes authenticate the existing record before replacing it, and update
  records, index and root in one transaction. Writes that are not KMIP
  operations (for example storage maintenance) append an internal audit
  event, so every change is covered.
- Startup and `check-store` verify the whole chain, the root binding, the
  tree structure, every record hash and every record's encryption.

Reads and updates are logarithmic in the number of objects. SQLite may spill
statement journals to temporary files, which is why a read-only container
needs a writable `/tmp`. Performance at large scale has not been measured.

## Live history check

Every read and write compares the database with the audit floor inside the
same SQLite snapshot it uses for the operation:

- If the database is the same history, extended by entries the server has not
  seen yet, each new entry must authenticate and link to the floor.
- If the database is older (fewer entries), a different branch (even a longer
  one), or a different store under the same key, the check fails.
- Without new entries the check is a few indexed lookups; it does not rescan
  the whole chain on each Get.

Only committed transactions advance the floor: batch Undo and rolled-back
transactions do not move it.

The maintenance commands (`backup`, `check-store`, `audit-checkpoint`,
`rotate-master-key`) run as separate processes. Each starts its own floor
from the database it opens and checks against it for the rest of its run;
`backup`, for example, verifies the copy it writes against it. None inherits
the running server's floor, so none can tell on its own that the database
was replaced before it started. For that, give it an independently stored
[audit checkpoint](/kmip-server/docs/audit-checkpoints/): `--audit-checkpoint` for
`check-store` and `rotate-master-key`, `--previous` for `audit-checkpoint`.
`backup` takes neither; run `check-store --audit-checkpoint` on the source or
the copy.

A failure is **latched** for the life of the process: `/readyz` returns 503
(`/livez` stays 200), KMIP requests that touch storage get General Failure
without material, and putting the right database back does not clear it. Only
a restart on a verified database does.

## Backup and rotation

`backup` verifies the copy it wrote before publishing it.
`rotate-master-key` re-encrypts every record, rebuilds the index for the new
ciphertext, re-authenticates the audit history under the new key and appends
one `keytend-kmip-server/storage-rotation` event
([rotating the master key](/kmip-server/docs/master-key-rotation/)).

## Limits

- The floor is in memory and does not survive a restart. Across restarts use
  an independently stored [audit checkpoint](/kmip-server/docs/audit-checkpoints/) with
  `--audit-checkpoint`; a running server does not reload a replaced
  checkpoint file.
- Deletions or corruption of older history are found by the full checks at
  startup, `check-store`, `audit-checkpoint` and `backup`, not on every
  request.
- There is no remote witness and no coordination between replicas.
- Neither mechanism protects against an attacker who holds the master key,
  controls the host or can change process memory.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/docs/store-integrity.md"><code>docs/store-integrity.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>770ad85</code>.</p>
