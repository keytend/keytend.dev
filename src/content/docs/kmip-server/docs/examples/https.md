---
title: "HTTPS request examples"
description: "KMIP 2.1 request messages in the JSON form (one in XML) for the HTTPS listener, and kmip.sh, which sends them with curl."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/examples/https/README.md"
head: [{"tag":"title","content":"HTTPS request examples | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"HTTPS request examples · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

KMIP 2.1 request messages in the JSON form (one in XML) for the HTTPS
listener, and [`kmip.sh`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/kmip.sh), which sends them with `curl`. Load it in
bash or zsh from the checkout, then send a file by name, filling in its
`$NAME` placeholders:

```sh title="HTTPS request examples"
. examples/https/kmip.sh
ID=$(kmip create.json | field UniqueIdentifier)
kmip get.json ID="$ID" | field KeyMaterial
```

`kmip.sh` uses the [quick start](/kmip-server/docs/quick-start/)'s test
certificates; `KMIP_PKI`, `KMIP_CLIENT` and `KMIP_URL` select others. Its
functions are described in
[HTTPS with JSON or XML](/kmip-server/docs/clients/https/).

| File | Operation | Placeholders | Used in |
| --- | --- | --- | --- |
| [`create.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create.json), [`create.xml`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create.xml) | Create an AES-256 key | | [quick start](/kmip-server/docs/quick-start/#make-a-request-with-curl), [XML](/kmip-server/docs/clients/https/#xml) |
| [`get.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/get.json) | Get | `ID` | [quick start](/kmip-server/docs/quick-start/#make-a-request-with-curl) |
| [`create-named.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create-named.json) | Create with a Name | `NAME` | [Locate by Name](/kmip-server/docs/clients/https/#locate-by-name) |
| [`locate.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/locate.json) | Locate by Name | `NAME` | [Locate by Name](/kmip-server/docs/clients/https/#locate-by-name) |
| [`retire.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/retire.json) | Activate, Revoke and Destroy in one batch | `ID` | [retire a key](/kmip-server/docs/clients/https/#retire-a-key-in-one-batch) |
| [`create-active.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create-active.json) | Create a non-extractable key and Activate it | | [AES-GCM](/kmip-server/docs/clients/https/#encrypt-and-decrypt-with-aes-gcm) |
| [`encrypt.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/encrypt.json), [`decrypt.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/decrypt.json) | AES-GCM Encrypt, Decrypt | `KEY`, `DATA`, `AAD`; Decrypt also `IV`, `TAG` | [AES-GCM](/kmip-server/docs/clients/https/#encrypt-and-decrypt-with-aes-gcm) |
| [`create-key-pair.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create-key-pair.json) | Create an RSA 3072 signing key pair | | [Sign and verify](/kmip-server/docs/clients/https/#sign-and-verify-with-rsa) |
| [`sign.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/sign.json), [`verify.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/verify.json) | RSASSA-PSS Sign, Signature Verify | `KEY`, `DATA`; Verify also `SIG` | [Sign and verify](/kmip-server/docs/clients/https/#sign-and-verify-with-rsa) |
| [`create-derivation-key.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create-derivation-key.json) | Create and Activate a non-extractable AES key for Derive Key | | [Derive Key](/kmip-server/docs/crypto-operations/#example-derive-a-key-with-hkdf-over-https) |
| [`derive.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/derive.json) | Derive Key with HKDF-SHA-256 | `KEY`, `SALT`, `INFO` | [Derive Key](/kmip-server/docs/crypto-operations/#example-derive-a-key-with-hkdf-over-https) |
| [`create-kek.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create-kek.json) | Create and Activate an AES key-wrapping key | | [wrapped Get](/kmip-server/docs/key-transfer/#example-fetch-a-sensitive-key-wrapped) |
| [`create-sensitive.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/create-sensitive.json) | Create a Sensitive key | | [wrapped Get](/kmip-server/docs/key-transfer/#example-fetch-a-sensitive-key-wrapped) |
| [`get-wrapped.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/get-wrapped.json) | Get wrapped with AES Key Wrap | `ID`, `KEK` | [wrapped Get](/kmip-server/docs/key-transfer/#example-fetch-a-sensitive-key-wrapped) |
| [`set-attribute.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/set-attribute.json) | Set Attribute (Contact Information) | `ID`, `CONTACT` | [attributes](/kmip-server/docs/attributes/#example-set-and-read-an-attribute) |
| [`get-attributes.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/get-attributes.json) | Get Attributes (Contact Information, State) | `ID` | [attributes](/kmip-server/docs/attributes/#example-set-and-read-an-attribute) |
| [`export.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/export.json) | Export | `ID` | [export and import](/kmip-server/docs/key-transfer/#example-export-a-key-and-import-it-again) |
| [`import.json`](https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/import.json) | Import a symmetric key, Replace Existing | `ID`, `ATTRIBUTES`, `KEY` (JSON lists) | [export and import](/kmip-server/docs/key-transfer/#example-export-a-key-and-import-it-again) |

Byte strings are hex in JSON (`hex TEXT` converts text). Every file except
`import.json` is valid JSON as it stands; `import.json` takes two JSON lists
in place of its `$ATTRIBUTES` and `$KEY`.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/examples/https/README.md"><code>examples/https/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
