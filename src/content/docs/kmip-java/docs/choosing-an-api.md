---
title: "Choosing an API"
description: "Each task has one recommended entry point in dev.keytend.kmip.kms. Start there."
editUrl: "https://github.com/keytend/keytend-kmip-java/edit/main/docs/choosing-an-api.md"
head: [{"tag":"title","content":"Choosing an API | Keytend KMIP Java SDK"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Choosing an API · keytend-kmip (Java)"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip (Java)"}}]
---

Each task has one recommended entry point in `dev.keytend.kmip.kms`. Start there.

| Task | Entry point | Guide |
|---|---|---|
| Raw keys for local file encryption | `LocalKeys` | [Local keys](/kmip-java/docs/local-keys/) |
| Database encryption keys (TDE) | `LocalKeys` | [TDE keys](/kmip-java/docs/local-keys/#transparent-data-encryption-keys) |
| Encrypt records, streams and files under a KMS key | `kms.keys().current(name)` | [Envelope encryption](/kmip-java/docs/envelope-encryption/) |
| Node TLS identities and trust | `kms.tls()` | [TLS identities](/kmip-java/docs/tls-identities/) |
| Rotate keys on a schedule | `kms.keys().current(name).rotateIfActiveFor(period)` | [Rotate](/kmip-java/docs/operating-keys/#rotate-on-a-schedule) |
| Store passwords and tokens | `kms.keys().registerSecret(chars)` | [Secrets](/kmip-java/docs/operating-keys/#replacing-a-secret) |
| Any KMIP operation, as on the wire | `kms.protocol()` | [Protocol layer](/kmip-java/docs/protocol-layer/) |

Give each consumer's KMS credential only the operations its task uses. See
[What each consumer's credential needs](/kmip-java/docs/production/#what-each-consumers-credential-needs).

## In code

Raw keys for files. `config` is your `KmsConfig`. Open one `LocalKeys` per node and share it.

```java
try (LocalKeys keys = LocalKeys.builder(config, "orders-write")
    .scope(KeyQuery.all().custom(CustomAttribute.client("tde-family"), "orders"))
    .expect(Expect.aes(256))
    .open()) {
  try (LocalKeys.Use use = keys.forEncrypt()) {
    // Initialize the file's cipher with use.key(). Record use.id() in the file's header.
  }
}
```

Envelope encryption that follows rotation. `kms` is your connected `Kms`.

```java
byte[] orderJson = "{\"total\":42}".getBytes(StandardCharsets.UTF_8);
byte[] orderId = "order-1001".getBytes(StandardCharsets.UTF_8);
CurrentKey kek = kms.keys().current("orders-kek");
byte[] sealed = kek.seal(orderJson, orderId);
byte[] opened = kek.open(sealed, orderId);
```

TLS on a node. `scheduler` is a `ScheduledExecutorService` you own. `anchorQuery` selects the
trusted CA certificates and `allowedPeerQuery` the peer certificates to accept.

```java
TlsIdentityFollower identity =
    kms.tls().follow("cassandra/node1", Duration.ofSeconds(60), scheduler);
TlsTrustFollower trust =
    kms.tls().trustAnchors(anchorQuery, allowedPeerQuery, Duration.ofSeconds(60), scheduler);
SSLContext ssl = SSLContext.getInstance("TLS");
ssl.init(new KeyManager[] {identity.keyManager()},
    new TrustManager[] {trust.trustManager()}, null);
```

A rotation job. Run it from one scheduled job, never from every node.

```java
KeyHandle newest = kms.keys().current("orders-kek").rotateIfActiveFor(Duration.ofDays(30));
```

A secret. `password` is the `char[]` to store.

```java
KeyHandle secret = kms.keys().registerSecret(password).named("db-password").register();
try (SecretData value = kms.keys().findByName("db-password").orElseThrow().asSecretData()) {
  char[] chars = value.chars(); // a copy: wipe it when done
}
```

## The advanced alternatives

These calls overlap with the entry points above. Their Javadoc marks them **Advanced**. They
make you handle what the entry point handles for you: leases, rotation, who destroys a key copy.

| Advanced call | Use it only when |
|---|---|
| `KeyHandle.asSecretKey`, `asPrivateKey` | You need one copy of a key for immediate use |
| `CurrentKey.checkingEvery`, `refreshingEvery` | You need another check interval, or checks on your executor |
| `KeyHandle.open`, `openTo`, `opening`, `chunkedOpener`, `unwrapKey` | You open with a key you name |
| `KmsKeys.open`, `openTo`, `opening`, `chunkedOpener`, `unwrapKey`, `decrypt` | A query names the key |
| `KeyHandle.rewrapTo`, `rewrapRecordTo`, `rewrapKeyTo` | You move data to a key you name |
| `KeyHandle.sealing` | You stream under a key you name, not the key in force |
| `CurrentKey.generateDataKey`, `wrapKey`, `unwrapKey`, `KeyHandle.wrapKey` | You build your own envelope format |
| `KeyHandle.encrypt`, `decrypt` | The KMS must encrypt every byte |
| `KmsKeys.moveName` | An operator moves a write name to another key |
| `KeyHandle.rotate()`, `rotateOrLatest()`, `CurrentKey.rotateOrLatest()` | A rotation is not on a schedule |
| `KmsTls.certificates(query)`, `KeyHandle.asCertificate()` | Tooling reads certificates |
| The [protocol layer](/kmip-java/docs/protocol-layer/) | The application API does not cover the operation |

Watch out for:

- Only `CurrentKey` seals records, streams and files under the key in force: `seal`, `sealing`,
  `sealTo` and `chunkedSealer`. A `KeyHandle` has no `seal`, `sealTo` or `chunkedSealer`. Its
  `sealing` streams under the key it names.
- Raw keys you keep, even for seconds, go through `LocalKeys`. It checks a key's state and scope
  when it loads or revalidates it, and hands out a copy only while its TTL and lease run.
- `checkingEvery` and `refreshingEvery` return a new follower. Call one before you share the
  `CurrentKey`, and share what it returns.
- Opening with a named key is for recovery, such as a Compromised key. `CurrentKey` opens what
  its own lineage sealed.
- After a rotation, `CurrentKey.rewrapRecord`, `rewrapKey` and `rewrapHeader` move data to the
  key in force.
- `KeyHandle.encrypt` sends every byte to the KMS. `seal` sends one request whatever the size.
- A rotation through `CurrentKey` re-keys, and the server moves the name. A scheduled
  `rotateIfActiveFor(period)` rotates only once the current key has been Active for `period`,
  however often the job fires.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-java/blob/c5da4f1f409914da3790bbad79b37a6296585520/docs/choosing-an-api.md"><code>docs/choosing-an-api.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-java</span> at commit <code>c5da4f1</code>.</p>
