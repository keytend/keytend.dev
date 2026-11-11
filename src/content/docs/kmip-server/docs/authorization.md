---
title: "Authorization"
description: "The certificates, CA and policy a deployment provides are listed in what you deploy; the policy format, with operation numbers and role templates, is in the configuration reference."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/docs/authorization.md"
head: [{"tag":"title","content":"Authorization | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Authorization · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

Part of [configuration and operations](/kmip-server/docs/#configuration-and-operations).

The certificates, CA and policy a deployment provides are listed in
[what you deploy](/kmip-server/docs/deployment/#what-you-deploy); the policy format, with
operation numbers and role templates, is in the
[configuration reference](/kmip-server/docs/configuration/#policy-file). Every request is
authorized twice:

1. The client certificate's fingerprint selects a principal in the
   [policy file](/kmip-server/docs/configuration/#policy-file), and the principal's
   `operations` list is the allowlist of KMIP operation numbers for every
   request on that certificate. The fingerprint is looked up when
   the connection is made. A [Re-Provision](/kmip-server/docs/re-provision/#retirement)
   overrides the policy file for the certificates it touches: the replaced
   certificate is refused even if the policy lists it, and its replacement
   uses the replaced certificate's entry until you add it under the same
   name and remove the replaced one.
2. By default every object belongs to the principal that created it, and a
   principal sees and uses only its own objects, unless an object grant adds
   read access to one exact object of another principal. With `"client_identity": "credential"` in the policy entry, a
   verified user or device of the principal owns the managed objects it
   creates, separately from the principal's other users and devices
   ([client identity](/kmip-server/docs/credentials/#client-identity)); KMIP 3.0 System
   Objects still belong to the principal.

## Object grants

```json
{
  "principals": {
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef": {
      "name": "database-reader",
      "operations": [8, 10, 11, 12, 24, 30],
      "object_grants": [
        {"owner": "database-owner", "identifier": "exact-key-id", "operations": [10]},
        {"owner": "database-owner", "identifier": "another-key-id", "operations": [8, 11, 12]}
      ]
    }
  }
}
```

- A grant names one owner and one full Unique Identifier, matched exactly,
  with no wildcards, prefixes or normalization.
- Grants are read-only. They can allow Locate (8), Get (10), Get Attributes (11)
  and Get Attribute List (12), each separately: a Get grant does not make the
  object findable by Locate, and a Locate grant does not return its key.
  Grants never allow changing, destroying, recovering or using another
  owner's object for cryptography, including its wrapping keys.
- The operation must also be in the principal's own
  `operations` list.
- A principal keeps full access to its own objects; grants only add to it.
  To build a reader that sees only granted objects, give it its own principal
  name and a read-only operation list, as above; a certificate mapped to the owner's name
  shares everything the owner has.
- Archival, Sensitive and Extractable, lifecycle and format rules apply to a
  granted object as they do for its owner. A Sensitive shared key can be wrapped with a
  key the reader owns.
- When the owner uses
  `"client_identity": "credential"`, add `"user": "<name>"` or
  `"device": "<name>"` to grant an object of that user or device
  ([credentials](/kmip-server/docs/credentials/#client-identity)).
- A grant change takes effect at the next restart, because the policy is
  read at startup ([changing the policy](/kmip-server/docs/operations/#changing-the-policy)). Removing a grant
  cannot recall key material a reader has already fetched.
- At most 256 grants per certificate; owner names up to 128 bytes,
  identifiers up to 1,024 bytes; unknown fields or operations stop startup.

The audit chain records the caller, not the owner, for granted reads. There is
no remote management API for the policy. To let another client change or use
your objects for cryptography, give it a [delegated ticket](#delegated-tickets).

## Delegated tickets

[Delegated Login](/kmip-server/docs/tickets/#delegated-login) (operation 47, KMIP 2.0 and
later) lets a principal hand a narrower slice of its own authority to another
client at run time, without a policy change. The ticket is a bearer
credential that any certificate in the policy may present, so treat its value
like a password. A request that presents it acts as the delegator, and object
grants do not apply to it. The rules and limits are in
[using a delegated ticket](/kmip-server/docs/tickets/#using-a-delegated-ticket).

## Tenant isolation and Names

Ownership hides other principals' objects from Get, Locate and Destroy, and
Names are unique per owner, not per server: two principals may each hold an
object named `backup`, and neither learns that the other uses the Name. Only a
second object of the same owner with the same Name fails (Non Unique Name).
This differs from KMIP, which makes Names unique per server
([name uniqueness](/kmip-server/docs/interpretations/#name-uniqueness) gives the reasons).

A draft 3.0 Name Reference resolves among the caller's own objects first. Only
when the caller owns no object with that Name are objects granted by other
owners considered; if two granted objects share the Name the reference is
ambiguous and fails with Non Unique Name. Clients that rely on server-wide
uniqueness (one Name naming one object for every tenant) must use Unique
Identifiers across tenants.

With `--destroyed-name-reuse allow` (default), objects in the Destroyed or
Destroyed Compromised state do not reserve their Names, and a Name Reference
prefers live holders; `reserve` keeps destroyed Names reserved. See
[interpretations](/kmip-server/docs/interpretations/#names-held-only-by-destroyed-objects).

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/d401f07cd6eb5cab69fc8a046418e784774fc609/docs/authorization.md"><code>docs/authorization.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>d401f07</code>.</p>
