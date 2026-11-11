---
title: "TLS certificates and policy"
description: "The server needs a server certificate, the CA bundle that issues client certificates, one certificate per client, and a policy that maps each client certificate to a principal and its operations."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/tls-setup.md"
head: [{"tag":"title","content":"TLS certificates and policy | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"TLS certificates and policy · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [security](/kmip-server/docs/#security).

The server needs a server certificate, the CA bundle that issues client
certificates, one certificate per client, and a
[policy](/kmip-server/docs/configuration/#policy-file) that maps each client certificate to
a principal and its operations. The test certificates of the [quick
start](/kmip-server/docs/quick-start/) are for evaluation only.

## Server certificate

Extended key usage `serverAuth`, and a subject alternative name for every
name clients dial:

- On Kubernetes, the client Service's three names (release and namespace
  `keytend-kmip-server`): `keytend-kmip-server` (which the chart's
  `helm test` dials), `keytend-kmip-server.keytend-kmip-server.svc` and
  `keytend-kmip-server.keytend-kmip-server.svc.cluster.local`; and the load
  balancer's name for
  [clients outside the cluster](/kmip-server/docs/kubernetes/#clients-outside-the-cluster).
- With Docker, the host's DNS name, and `IP:` entries for any address clients
  dial directly.

If an intermediate CA issued it, append the intermediate to `server.pem` so
the server sends the chain.

## Client certificates

One per client (or per database security boundary), extended key usage
`clientAuth`, issued by a CA in the client CA bundle.

Under every [TLS profile](/kmip-server/docs/tls-profiles/), the server checks the keys and
signatures of the server certificate, client certificates and the CAs above
them (NIST SP 800-131A):

- Keys of at least 112-bit strength, on one of the
  [13 implemented curves](/kmip-server/docs/algorithms/#elliptic-curves) for EC keys. For the
  default `modern` policy, use RSA keys of at least 2048 bits or ECDSA keys
  on P-256, P-384 or P-521: `modern` completes no handshake with a secp256k1
  or brainpool server certificate
  ([elliptic curves](/kmip-server/docs/algorithms/#elliptic-curves)). The legacy policies need an RSA server key, and
  Suite B needs ECDSA on P-256 or P-384 on both sides
  ([policies](/kmip-server/docs/tls-profiles/#policies)).
- No certificate signed with MD2, MD4, MD5 or SHA-1. Only a self-signed
  root's own signature is not checked. Use SHA-256 or stronger when you
  issue these certificates.
- A weak server certificate stops the server at startup (`the server
  certificate is signed with a weak digest`, or `key has … security, below
  112`). A weak certificate in a client's chain fails its handshake
  (`certificate_rejected` in `kmip_tls_handshake_failures_total`, and the
  log line `peer certificate refused by the TLS profile`).

Under the default `modern` profile, TLS handshake signatures use ECDSA,
RSA-PSS or RSA PKCS#1 with SHA-2. The other [profiles](/kmip-server/docs/tls-profiles/#policies)
do not apply this list; `mozilla-intermediate` also allows EdDSA.

The server's `ca.pem` is the CA that issues client certificates. It can
differ from the CA that signed the server certificate, which is the one
clients must trust. The policy names each certificate by its fingerprint, so
a renewed client certificate is refused until the policy lists it
([rotating a client certificate](/kmip-server/docs/operations/#rotating-a-client-certificate)).

## Issuing them with OpenSSL

If you have no CA for these certificates yet, create one (keep `ca.key` off
the server):

```sh title="Issuing them with OpenSSL"
openssl req -x509 -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -keyout ca.key -out ca.pem -days 1825 -sha256 -subj "/CN=Example KMIP CA" \
  -addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign
```

Save the extensions as `server-ext.cnf` and `client-ext.cnf`, with the
server's names in `subjectAltName`:

```ini
# server-ext.cnf
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature
# for an RSA server key instead: keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = DNS:keytend-kmip-server, DNS:keytend-kmip-server.keytend-kmip-server.svc, DNS:keytend-kmip-server.keytend-kmip-server.svc.cluster.local
# Docker host instead, for example: subjectAltName = DNS:kms.example.com, IP:192.0.2.10
```

```ini
# client-ext.cnf
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature
extendedKeyUsage = clientAuth
```

then issue the certificates (this writes `server.pem` and `server.key` for the
server, and `orders-db.pem` and `orders-db.key` for one client):

```sh frame="code"
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -keyout server.key -out server.csr -subj "/CN=keytend-kmip-server"
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial \
  -days 365 -sha256 -extfile server-ext.cnf -out server.pem

openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -keyout orders-db.key -out orders-db.csr -subj "/CN=orders-db"
openssl x509 -req -in orders-db.csr -CA ca.pem -CAkey ca.key -CAcreateserial \
  -days 365 -sha256 -extfile client-ext.cnf -out orders-db.pem
```

Both certificates are valid for a year (`-days 365`). Plan their renewal:
a new server certificate needs a restart
([renewing](/kmip-server/docs/operations/#renewing-server-certificates-and-crls)), and a new
client certificate a policy entry
([rotating a client certificate](/kmip-server/docs/operations/#rotating-a-client-certificate)).

## Issuing them with cert-manager

The chart can have cert-manager issue the server certificate
([cert-manager](/kmip-server/docs/kubernetes/#cert-manager)): it creates the Certificate for
the Service's names from the issuer you name and points the server at
`tls.crt`, `tls.key` and `ca.crt`. For example, with a cluster-wide CA issuer
whose CA (`tls.crt` and `tls.key`) is in the Secret `kmip-ca` in the
`cert-manager` namespace:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: kmip-ca
spec:
  ca:
    secretName: kmip-ca
```

```yaml
# kmip-values.yaml
tls:
  certManager:
    enabled: true
    issuerRef: {name: kmip-ca, kind: ClusterIssuer}
```

`ca.crt` is the CA of the issuer that signed the server certificate. It
is used as the client CA only when the same CA signs the client certificates,
as here; otherwise give the client CA bundle as `tls.clientCA`, or clients
from other issuers are refused.

Client certificates can come from the same issuer (`usages: [client auth,
digital signature]`, in the client's namespace), but each renewal changes the
fingerprint, and the server refuses the renewed certificate until the policy
lists it. Renew client certificates as a planned
[rotation](/kmip-server/docs/operations/#rotating-a-client-certificate), not automatically.

The server reads certificates at startup, so restart the pod after a renewal
of the server certificate
([renewing server certificates](/kmip-server/docs/operations/#renewing-server-certificates-and-crls)).

## Policy

List each client certificate's fingerprint under a principal with the
operations it needs: the [policy file](/kmip-server/docs/configuration/#policy-file) shows a
complete example and the command that writes it, and the
[role templates](/kmip-server/docs/configuration/#role-templates) give operation lists. Then
[deploy](/kmip-server/docs/deployment/#docker-or-podman) the server.

## CRL

Optional `KMIP_CRL` (`--crl`), a PEM file of one or more CRLs. When it is set,
the server checks revocation for **every** certificate in a client's chain,
not only the client certificate, so the file needs a current CRL from each
issuing CA in the chain. For clients issued by an intermediate under a root,
that is the intermediate's CRL (for the client certificates) and the root's
CRL (for the intermediate). A chain with a missing CRL is refused like a
revoked one. Publish each next CRL before the current one's Next Update and
restart the server.

With OpenSSL, keep a small database per CA that signs; it records every
revocation, so create it once and keep it with the CA key. For the single
CA above (this refuses to run if `ca-db` exists):

```sh title="CRL"
mkdir ca-db && : > ca-db/index.txt && echo 01 > ca-db/crlnumber &&
  printf '%s\n' '[ca]' 'default_ca = this' '[this]' 'database = ca-db/index.txt' \
    'crlnumber = ca-db/crlnumber' 'default_md = sha256' 'default_crl_days = 30' > ca-crl.cnf
```

This issues a second client, `reporting`, to revoke:

```sh frame="code"
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -keyout reporting.key -out reporting.csr -subj "/CN=reporting"
openssl x509 -req -in reporting.csr -CA ca.pem -CAkey ca.key -CAcreateserial \
  -days 365 -sha256 -extfile client-ext.cnf -out reporting.pem
```

Revoke a certificate and write the CRL; run the second command alone to
publish the next CRL before Next Update:

```sh frame="code"
openssl ca -config ca-crl.cnf -cert ca.pem -keyfile ca.key -revoke reporting.pem
openssl ca -config ca-crl.cnf -cert ca.pem -keyfile ca.key -gencrl -out crl.pem
```

Install `crl.pem` next to the other TLS files, set `KMIP_CRL=/tls/crl.pem`,
list both clients in the policy and restart. Then, in the directory where you
issued the certificates, with `CHECKOUT` set to the checkout and `SERVER` to a
name in the server certificate and the HTTPS port:

```sh frame="code"
CHECKOUT=~/keytend-kmip-server   # where you cloned the repository
SERVER=kms.example.com:5697
for c in orders-db reporting; do
  printf '%s: ' $c
  curl -sS --cacert ca.pem --cert $c.pem --key $c.key -H 'Content-Type: application/json' \
    --data-binary @"$CHECKOUT/examples/https/create.json" https://$SERVER/kmip 2>&1 |
    grep -oE '"ResultStatus"[^}]*|curl: .*'
done
```

<div class="kt-output">

```text title="Output" wrap hangingIndent=2
orders-db: "ResultStatus","type":"Enumeration","value":"0x00000000"
reporting: curl: (56) OpenSSL SSL_read: OpenSSL/3.5.7: error:0A000414:SSL routines::ssl/tls alert certificate revoked, errno 0
```

</div>

`0x00000000` is Success; with `KMIP_TEXT_ENCODING=readable` the server
writes the name. With an intermediate, keep one such database per CA and concatenate their
CRLs (`cat intermediate.crl.pem root.crl.pem > crl.pem`); without the root's
CRL, every client of the intermediate fails too (`alert unknown ca`). The
server counts these refusals in
`kmip_tls_handshake_failures_total{reason="certificate_rejected"}`
([metrics](/kmip-server/docs/metrics/#tls-handshake-failure-reasons)).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/802895e20231a5c04fc97b7a6b29f59232f280a6/docs/tls-setup.md"><code>docs/tls-setup.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>802895e</code>.</p>
