---
title: "Python (PyKMIP)"
description: "PyKMIP, tested at commit 4815637, binary KMIP 1.1–1.4, and the standard library for HTTPS JSON. The complete programs are in examples/clients/python; its requirements.txt pins PyKMIP."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/clients/python.md"
head: [{"tag":"title","content":"Python (PyKMIP) | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Python client (PyKMIP) · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [connecting a client](/kmip-server/docs/clients/).

[PyKMIP](https://github.com/OpenKMIP/PyKMIP), tested at commit `4815637`,
binary KMIP 1.1–1.4, and the standard library for HTTPS JSON. The complete
programs are in [`examples/clients/python`](https://github.com/keytend/keytend-kmip-server/tree/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python);
its [`requirements.txt`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python/requirements.txt)
pins PyKMIP.

## Run the examples

They need the [quick-start server](/kmip-server/docs/quick-start/) and the PyKMIP
environment that the quick start's
[KMIP library example](/kmip-server/docs/quick-start/#make-a-request-with-a-kmip-library)
installs in `.cache/pykmip`. Run from the checkout:

```sh title="Run the examples"
CHECKOUT=$PWD; export KMIP_PKI=$CHECKOUT/.cache/dev-pki
PY=$CHECKOUT/.cache/pykmip/bin/python
cd examples/clients/python
```

Every command below runs in that shell and directory. PyKMIP prints a
harmless `Config file … not found` notice on standard error.

## Connection settings

:::caution[PyKMIP does not check the host name]
PyKMIP checks the server certificate against `ca` but not the host name
(at the tested commit it wraps the socket without `server_hostname`). Any
certificate from that CA is accepted as the server, so give the server a
CA that issues only its certificates, or use the standard library's
[HTTPS client](#server-side-encrypt-over-https-json), which checks the name.
:::

[`connect.py`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python/connect.py) has the settings
for the quick-start server; every program repeats them, so that it runs on
its own. `CLIENT` is `KMIP_CLIENT`, default `client`:

```python
client = ProxyKmipClient(
    hostname="localhost", port=5696,
    cert=f"{PKI}/{CLIENT}.pem", key=f"{PKI}/{CLIENT}.key",
    ca=f"{PKI}/ca.pem",                       # the server's CA
    ssl_version="PROTOCOL_TLSv1_2",           # TLS 1.2 exactly (PyKMIP cannot use 1.3)
    kmip_version=enums.KMIPVersion.KMIP_1_4,
)
with client:
    client.locate(maximum_items=1)   # one round trip
    print("connected")
```

```sh title="Connection settings"
"$PY" connect.py
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
connected
```

</div>

### Timeouts

`ProxyKmipClient` takes no timeout: its socket timeout is 30
seconds for the connect, the TLS handshake and each read, and a `timeout` in
a PyKMIP configuration file is ignored. A server that does not answer raises
`TimeoutError` after 30 seconds. At the tested commit, setting the internal
`client.proxy.timeout = 5` before `open()` (or `with`) changes it.

## Request-header credentials

With a [users file](/kmip-server/docs/credentials/#users-file), the server also checks a
username and password that the client sends in the request header; the
certificate must still be in the policy. Create a user `app` for the
`client` certificate:

```sh title="Request-header credentials"
FP=$(openssl x509 -in "$KMIP_PKI/client.pem" -outform DER | sha256sum | cut -d' ' -f1)   # macOS: shasum -a 256
VERIFIER=$(printf '%s\n' 'correct horse battery staple' |
  docker exec -i keytend-kmip-server keytend-kmip-server password-verifier)
# from source: … | "$CHECKOUT/target/debug/keytend-kmip-server" password-verifier
printf '{"users": {"%s": [{"username": "app", "password_verifier": %s}]}}\n' \
  "$FP" "$VERIFIER" > "$KMIP_PKI/app-users.json"
```

Restart the server with the users file. With the container, add the file and
its variable, then [recreate the container](/kmip-server/docs/manual-install/#change-a-setting):

```sh frame="code"
S=$CHECKOUT/.cache/container
install -m 0400 "$KMIP_PKI/app-users.json" "$S/policy/"
echo KMIP_USERS=/policy/app-users.json >> "$S/kmip.env"
(cd "$CHECKOUT" && scripts/quick-start.sh --restart)
```

From source, stop the server and add `--users .cache/dev-pki/app-users.json`
to its [`serve` command](/kmip-server/docs/manual-install/#run-from-source).

[`credentials.py`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python/credentials.py) connects
as `app`, once with the right password and once with a wrong one:

```python
def connect(password):
    return ProxyKmipClient(
        hostname="localhost", port=5696,
        cert=f"{PKI}/{CLIENT}.pem", key=f"{PKI}/{CLIENT}.key", ca=f"{PKI}/ca.pem",
        ssl_version="PROTOCOL_TLSv1_2", kmip_version=enums.KMIPVersion.KMIP_1_4,
        username="app", password=password,
    )
```

```sh frame="code"
"$PY" credentials.py
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
created be6c0522-173e-44e7-82b4-525f31f9cbc6 as app
AUTHENTICATION_NOT_SUCCESSFUL Authentication not successful
```

</div>

Requests without credentials still succeed on the certificate alone. Devices,
administrators and the other credential types are in
[credentials](/kmip-server/docs/credentials/).

## Common tasks

[`common_tasks.py`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python/common_tasks.py) creates a
named key and finds it by Name, encrypts locally with the fetched key,
registers outside key material, re-keys, and retires the keys. Each run uses
a new Name, so it can run any number of times. Finding a key by Name:

```python
name = attributes.AttributeFactory().create_attribute(enums.AttributeType.NAME, NAME)
print("located", client.locate(attributes=[name]))
```

```sh title="Common tasks"
"$PY" common_tasks.py
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
located ['e45b8ce6-47de-4d38-b381-50aa4bfae24a']
decrypted b'hello'
registered e3bc3b22-ace4-446d-8309-400663c7ba48
re-keyed e45b8ce6-47de-4d38-b381-50aa4bfae24a -> 42490740-0605-4006-86e2-671594e3f0ad
destroyed e45b8ce6-47de-4d38-b381-50aa4bfae24a
```

</div>

The data is encrypted in the application with the fetched key and
`cryptography` (installed with PyKMIP); store the nonce with the ciphertext.
Re-key gives the Name to a new key and leaves the old one its material
([Re-key](/kmip-server/docs/rekey/)). To keep key material on the server instead, use
server-side Encrypt and Decrypt. PyKMIP cannot carry the AES-GCM
authentication tag; send those requests over HTTPS JSON
([below](#server-side-encrypt-over-https-json)), or use the [Go](/kmip-server/docs/clients/go/) or
[Java](/kmip-server/docs/clients/java/) client.

## Server-side Encrypt over HTTPS JSON

[`https_encrypt.py`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python/https_encrypt.py) needs
only the standard library. It posts the
[request files](/kmip-server/docs/examples/https/) to the HTTPS listener, filling in
their `$NAME` placeholders as [`kmip.sh`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/https/kmip.sh) does: it creates and
activates an AES key, encrypts with AES-GCM on the server, decrypts, and
shows the refusal when the Additional Data changes. It accepts Success in
either [text encoding](/kmip-server/docs/configuration/#json-and-xml-response-forms): `Success` with the
quick start's `readable`, `0x00000000` with the default `compatible`, which
also prints the Result Reason as a hex code (`0x0000000a`).

```python
key = one(kmip("create-active.json"), "UniqueIdentifier")
aad = b"order-42".hex()
sealed = kmip("encrypt.json", KEY=key, DATA=b"hello".hex(), AAD=aad)
ct, iv, tag = (one(sealed, t) for t in ("Data", "IVCounterNonce", "AuthenticatedEncryptionTag"))
opened = kmip("decrypt.json", KEY=key, DATA=ct, IV=iv, TAG=tag, AAD=aad)
```

```sh title="Server-side Encrypt over HTTPS JSON"
"$PY" https_encrypt.py
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
encrypted f232f036-a6ad-46e9-808b-c4c96257aa61 1990e05544 58be4a1239c257cf12ec0db5 59f1c6f341c3e5e1827dfa39b1c4847f
decrypted b'hello'
refused: decrypt.json: CryptographicFailure: Cryptographic operation failed
```

</div>

Store the key identifier, IV, ciphertext and tag with the record; the
[HTTPS page](/kmip-server/docs/clients/https/#encrypt-and-decrypt-with-aes-gcm) explains the fields.

Its `kmip()` raises `KmipError` when the server answered and refused the
request. `OSError` (refused connection, TLS failure, `TimeoutError` after
the 10-second `timeout`) and `http.client.HTTPException` (a non-200 status
or a broken response) mean the exchange failed. After a timeout, a lost
connection or HTTP 500 a change may still have been applied: repeat only
what is safe to repeat
([retrying after a lost response](/kmip-server/docs/client-errors/#retrying-after-a-lost-response)).

## Errors

PyKMIP raises `KmipOperationFailure` for a refused operation, with the
Result Status, Result Reason and Result Message.
[`errors.py`](https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/examples/clients/python/errors.py) asks for a key that
does not exist:

```python
try:
    client.get("no-such-key")
except KmipOperationFailure as e:
    print(e.status.name, e.reason.name, e.message)
```

```sh title="Errors"
"$PY" errors.py
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
OPERATION_FAILED ITEM_NOT_FOUND Object not found
```

</div>

TLS and connection failures raise other exceptions (`ssl.SSLError`,
`OSError`). The causes of each Result Reason are in
[errors and what they mean](/kmip-server/docs/client-errors/#errors-and-what-they-mean).

Next: [beyond the test setup](/kmip-server/docs/clients/#beyond-the-test-setup).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/770ad850a3498544ef7a2259cece1a220e3d4520/docs/clients/python.md"><code>docs/clients/python.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>770ad85</code>.</p>
