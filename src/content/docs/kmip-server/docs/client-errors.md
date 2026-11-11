---
title: "Client errors and retries"
description: "What a refused request or a failed connection means, how to fix it, and which requests are safe to repeat after a lost response."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/client-errors.md"
head: [{"tag":"title","content":"Client errors and retries | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Client errors and retries · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [connecting a client](/kmip-server/docs/clients/).

What a refused request or a failed connection means, how to fix it, and which
requests are safe to repeat after a lost response.

## Errors and what they mean

A refused operation comes back as Result Status `OperationFailed` with a
Result Reason and a Result Message; the connection stays open unless the
certificate is not in the policy. Over HTTPS a KMIP failure is still HTTP 200.

| Result Reason | Cause | Fix |
| --- | --- | --- |
| `PermissionDenied`, message `Operation denied by certificate policy`, then the connection closes | The certificate is trusted but not in the policy. | Add its fingerprint to the policy; restart. |
| `PermissionDenied` on one operation | The operation is not in the certificate's `operations`, or the object's state forbids it (1.x, some 2.0 cases, and Obtain Lease in every edition). | Grant it, or see [refusals by state](/kmip-server/docs/lifecycle/#refusals-by-state). |
| `ObjectNotFound` (2.x) or `ItemNotFound` (1.x) for an existing identifier | Another principal owns it, and the answer is as for a missing object. | Use the owner's principal, or an [object grant](/kmip-server/docs/authorization/). |
| `WrongKeyLifecycleState` (2.x) | The object's state forbids the operation, such as Encrypt with a Pre-Active key (Permission Denied in 1.x). | Activate it first, or see [refusals by state](/kmip-server/docs/lifecycle/#refusals-by-state). |
| `ObjectDestroyed` (2.x) or `IllegalOperation` (1.x) on Get | The key was destroyed; its attributes remain. | Expected after Destroy ([Get](/kmip-server/docs/key-transfer/#get)). |
| `NotExtractable` on Get (1.4+) | The object's Extractable attribute is False: it is never returned, plain or wrapped. | Use it through [server-side operations](/kmip-server/docs/crypto-operations/). |
| `Sensitive` on Get (1.4+) | The object is Sensitive and the Get asks for plaintext. | Get it [wrapped](/kmip-server/docs/key-transfer/#wrapped-get-and-register). |
| `NonUniqueNameAttribute` (2.x); `InvalidField` or `IllegalOperation` (1.x) | The owner already has an object with that Name. | Use another Name, or Locate the existing object ([duplicate names](/kmip-server/docs/attributes/#duplicate-names-in-kmip-1x)). |
| `CryptographicFailure` on Decrypt | Wrong key, IV, ciphertext, tag or Additional Data; an AES-GCM tag that does not verify returns no plaintext. | Do not retry: the same input fails again. Check what was stored with the record. |
| `ItemNotFound` (1.x) for an object created through 2.x | Some objects (certificate requests) do not exist in 1.x. | Use a 2.x request. |
| `AuthenticationNotSuccessful` | A request-header credential did not verify. | Check the users file and the credential. |
| `UnsupportedProtocolVersion` (2.x and 3.0) | The server does not accept the request's Protocol Version, for example 3.0 when it runs without `--experimental-v3`. | Request a version that Discover Versions lists, or start the server with `--experimental-v3` for 3.0. |
| `OperationNotSupported` | Not in the request's KMIP version, or not implemented. | See the [support matrix](/kmip-server/docs/support-matrix/). |
| `FeatureNotSupported` | Algorithm, format, curve or option unsupported, off by a setting (`--triple-des`, `--ec-curves`) or refused in FIPS mode. | See the message and [algorithms](/kmip-server/docs/algorithms/). |

A few 2.x operations answer an unknown identifier with `ItemNotFound` or
`WrappingObjectNotFound` instead ([exceptions](/kmip-server/docs/messages/#unknown-identifiers)).
How each client reports these: [Python](/kmip-server/docs/clients/python/#errors),
[Go](/kmip-server/docs/clients/go/#errors-and-deadlines), [Java](/kmip-server/docs/clients/java/#errors),
[C](/kmip-server/docs/clients/c/#errors), [Rust](/kmip-server/docs/clients/rust/#errors) and
[HTTPS](/kmip-server/docs/clients/https/) (a KMIP failure is HTTP 200).

Failures below the KMIP layer:

| What the client sees | Cause | Fix |
| --- | --- | --- |
| TLS handshake fails; `curl` reports `certificate required` | No client certificate, or one not from a CA in `--ca`. | Present a certificate from the client CA. |
| The client rejects the server certificate | The client does not trust the server CA, or dials a name the certificate does not list. | Trust the server CA; dial a listed name. |
| TLS handshake fails with no shared parameters | The client offers only ChaCha20-Poly1305, X25519 or finite-field DHE. | Update the client, or set `--tls-profile mozilla-intermediate` on the server. |
| TLS handshake fails with a protocol version error | The client offers only TLS 1.0 or 1.1. | Update the client. Only `kmip-1-basic` accepts them, without forward secrecy ([policies](/kmip-server/docs/tls-profiles/#policies)). |
| HTTP 400, 411, 415 | Chunked body, no `Content-Length`, or a missing or unsupported `Content-Type`. | See [HTTP status codes](/kmip-server/docs/encodings/#http-status-codes). |
| HTTP 503 | Four HTTPS requests were already in progress ([fixed limits](/kmip-server/docs/configuration/#fixed-limits)); the request did not run. | Retry after a short, growing delay. |
| HTTP 403 on an open HTTPS connection | The client certificate expired while the connection was open. | Renew it and reconnect. |
| I/O error on the first request after a quiet period | The server closed the idle connection (`--idle-timeout`, default 300 s). | Reconnect on failure, or raise the timeout. |

## Retrying after a lost response

When a connection drops before the response arrives (a server restart, an
idle close, a network failure), or the HTTPS listener answers HTTP 500, the
request may or may not have been applied: the server commits a change before
it encodes the response. Any other non-200 HTTP status means the request did
not run. Retry 503 with backoff, and 408 (the body did not arrive within 10
seconds) once the upload can finish in time; the other statuses need their
cause fixed first ([HTTP status codes](/kmip-server/docs/encodings/#http-status-codes)).

Reads are safe to repeat: an unwrapped Get, Get Attributes, Get Attribute
List and an ordinary Locate. Two reads change state:

- A wrapped Get (with a Key Wrapping Specification) counts against the
  wrapping key's usage limits, if it has any, so a retry spends that budget
  again ([wrapped Get](/kmip-server/docs/key-transfer/#wrapped-get-and-register)).
- A Locate with Object Group Member set to Group Member Default moves the
  group's rotation on by one per request, so a retry can return the next
  member ([Object Group Member](/kmip-server/docs/locate/#object-group-member-11)).

Before repeating a Create or Register, check whether the first attempt
succeeded, for example with Locate by the Name you gave the object; otherwise
you can end up with two objects, or a Name collision. Restarts are described
in [shutdown and restarts](/kmip-server/docs/operations/#shutdown-and-restarts).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/docs/client-errors.md"><code>docs/client-errors.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
