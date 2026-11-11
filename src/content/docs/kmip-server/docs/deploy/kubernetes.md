---
title: "Kubernetes resources"
description: "The supported way to run keytend-kmip-server on Kubernetes is the Helm chart in ../helm/keytend-kmip-server (Kubernetes), which also runs the maintenance tasks listed in its README."
editUrl: "https://github.com/keytend/keytend-kmip-server/edit/main/deploy/kubernetes/README.md"
head: [{"tag":"title","content":"Kubernetes resources | Keytend KMIP Server"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Kubernetes resources · keytend-kmip-server"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip-server"}}]
---

The supported way to run keytend-kmip-server on Kubernetes is the Helm chart
in [`../helm/keytend-kmip-server`](/kmip-server/docs/deploy/helm/)
([Kubernetes](/kmip-server/docs/kubernetes/)), which also runs the maintenance
tasks listed in its README. Without Helm, render it with `helm template`
([without Helm](/kmip-server/docs/kubernetes/#without-helm-and-gitops)).

This directory is a minimal Kustomize base for one replica in the namespace
`keytend-kmip-server`, without those tasks. The test suite
`scripts/test_kubernetes.py` deploys it.

| File | Content |
| --- | --- |
| `namespace.yaml` | The namespace, with the `restricted` Pod Security level |
| `statefulset.yaml` | One replica, a 10 Gi PVC per pod, probes, non-root security context, 64 MiB memory `/tmp` |
| `service.yaml` | Headless Service for 5696 (TTLV) and 5697 (HTTPS) |
| `networkpolicy.yaml` | Default deny; KMIP ports only from labelled client pods, 8080 only from labelled Prometheus pods |
| `pdb.yaml` | PodDisruptionBudget for the single pod (`minAvailable: 1`: drains wait until you scale it to 0) |

The base holds no secrets. Before `kubectl apply -k`, create the TLS Secret
`keytend-kmip-server-tls` (`server.pem`, `server.key`, `ca.pem`), the
master-key Secret `keytend-kmip-server-master` (`master.key`) and the policy
ConfigMap `keytend-kmip-server-policy` (`policy.json`), and set your image in
an overlay (`images:`).

[`tools/kmip-check.yaml`](https://github.com/keytend/keytend-kmip-server/blob/802895e20231a5c04fc97b7a6b29f59232f280a6/deploy/kubernetes/tools/kmip-check.yaml) sends one HTTPS Query from a
client namespace, to check a client certificate and the NetworkPolicy labels
with either deployment ([client namespaces](/kmip-server/docs/kubernetes/#client-namespaces)). Its
curl image is pinned by digest.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-server/blob/802895e20231a5c04fc97b7a6b29f59232f280a6/deploy/kubernetes/README.md"><code>deploy/kubernetes/README.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-server</span> at commit <code>802895e</code>.</p>
