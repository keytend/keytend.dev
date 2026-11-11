---
title: "Rust (NLnet Labs kmip-protocol)"
description: "NLnet Labs kmip-protocol 0.4.3, binary KMIP 1.0–1.2 (it picks the version per operation). Upstream describes it as a partial implementation."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/clients/rust.md"
head: [{"tag":"title","content":"Rust (NLnet Labs kmip-protocol) | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Rust client (NLnet Labs kmip-protocol) · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [connecting a client](/kmip-server/docs/clients/).

[NLnet Labs kmip-protocol](https://github.com/NLnetLabs/kmip-protocol) 0.4.3,
binary KMIP 1.0–1.2 (it picks the version per operation). Upstream describes
it as a partial implementation. The complete program is a Cargo package in
[`examples/clients/rust`](https://github.com/keytend/keytend-kmip-server/tree/802895e20231a5c04fc97b7a6b29f59232f280a6/examples/clients/rust); its `Cargo.toml` pins
the crate and `Cargo.lock` the tested dependency versions.

## Create, Get and retire a key

You need Rust (tested with 1.99), a C compiler, `pkg-config` and the OpenSSL
development headers: `build-essential pkg-config libssl-dev` on Debian,
`gcc pkgconf-pkg-config openssl-devel` on RHEL. With the
[quick-start server](/kmip-server/docs/quick-start/) running, run from the checkout:

```sh title="Create, Get and retire a key"
CHECKOUT=$PWD; export KMIP_PKI=$CHECKOUT/.cache/dev-pki
cd examples/clients/rust
cargo run --locked
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
created 41454af8-a727-4560-a147-a188362c8c22: 32-byte AES key
Get after Destroy: Server error: Operation Get failed: Key value has been destroyed
```

</div>

[`src/main.rs`](https://github.com/keytend/keytend-kmip-server/blob/802895e20231a5c04fc97b7a6b29f59232f280a6/examples/clients/rust/src/main.rs) connects with the
test certificates, creates, activates and fetches an AES key, then revokes
and destroys it:

```rust
let client = connect(&ConnectionSettings {
    host: "127.0.0.1".into(), // must match the server certificate (IP or DNS name)
    port: 5696,
    ca_cert: Some(fs::read(format!("{pki}/ca.pem"))?),
    client_cert: Some(ClientCertificate::SeparatePem {
        cert_bytes: fs::read(format!("{pki}/{name}.pem"))?,
        key_bytes: Some(fs::read(format!("{pki}/{name}.key"))?),
    }),
    connect_timeout: Some(Duration::from_secs(5)),
    read_timeout: Some(Duration::from_secs(10)),
    write_timeout: Some(Duration::from_secs(10)),
    ..Default::default()
})?;
```

## Errors

Failures come back as `kmip_protocol::client::Error`: `ItemNotFound` or
`ServerError` with the server's message for a KMIP failure, and
`is_connection_error()` for a lost connection. The program's Get after
Destroy tells them apart:

```rust
match client.get_key(&id) {
    Err(e) if e.is_connection_error() => return Err(e.into()),
    Err(e) => println!("Get after Destroy: {e}"), // the KMIP failure
    Ok(_) => return Err("destroyed key was returned".into()),
}
```

`KMIP_CLIENT` picks another certificate in `KMIP_PKI`. With the one the CA
trusts but the policy leaves out, the first request fails and the program
exits with status 1:

```sh title="Errors"
KMIP_CLIENT=unlisted cargo run --locked
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
Error: ServerError("Operation Create failed: Operation denied by certificate policy")
```

</div>

## Connection notes

- The crate connects to the first address a name resolves to, so the program
  dials `127.0.0.1` rather than `localhost`, which can resolve to `::1` first
  while the server listens on IPv4 only.
- `connect_timeout` bounds the TCP connect, and `read_timeout` and
  `write_timeout` each socket read and write, the TLS handshake included.
  They default to none, so without them a server that does not answer blocks
  the call.

## More operations

The client also has helpers for key pairs, Sign and RNG Retrieve. The
project's test adapter, [`interop/nlnet`](https://github.com/keytend/keytend-kmip-server/tree/802895e20231a5c04fc97b7a6b29f59232f280a6/interop/nlnet), uses them and
runs negative checks (other principals, unlisted and missing certificates).
With `KMIP_PKI` set as above, from any directory:

```sh title="More operations"
KMIP_PORT=5696 cargo run --locked --manifest-path "$CHECKOUT/interop/nlnet/Cargo.toml"
```

Next: [beyond the test setup](/kmip-server/docs/clients/#beyond-the-test-setup).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/802895e20231a5c04fc97b7a6b29f59232f280a6/docs/clients/rust.md"><code>docs/clients/rust.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>802895e</code>.</p>
