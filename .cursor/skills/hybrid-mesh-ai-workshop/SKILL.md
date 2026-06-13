---
name: hybrid-mesh-ai-workshop
description: >-
  Author and iterate Antora AsciiDoc content for the Hybrid Mesh AI Workshop showroom.
  Use when editing .adoc files, adding modules, updating nav.adoc, aligning content with
  the hybrid-mesh-platform Bill of Materials, or deepening AI/YAML workshop sections.
---

# Hybrid Mesh AI Workshop Content Skill

## Repo layout

```
showroom-hybrid-mesh-ai/
├── site.yml                          # Antora playbook
├── content/
│   ├── antora.yml                    # Runtime attributes (%HUB_DOMAIN%, etc.)
│   ├── modules/en/antora.yml         # Component descriptor
│   └── modules/en/modules/ROOT/
│       ├── nav.adoc                  # Sidebar navigation
│       └── pages/                    # Module .adoc files (01–28 learner, 29 facilitator)
└── content/supplemental-ui/          # RHDP PatternFly 6 overrides (DO NOT break)
```

Platform GitOps repo (separate): https://github.com/maximilianoPizarro/hybrid-mesh-platform

## Antora guardrails — never break

- AsciiDoc only: `=`, `==`, `[source,yaml]`, `[cols]`, `|===`, `NOTE:`, `TIP:`, `link:`, `xref:`
- Preserve `++++` HTML passthrough for: `workshop-time-badge`, `workshop-progress`, `workshop-next-nav`, registration CTA
- Preserve attributes: `%HUB_DOMAIN%`, `%EAST_DOMAIN%`, `%WEST_DOMAIN%`, `%USER_NAME%`
- Do NOT add raw CSS classes or new HTML outside existing passthrough patterns
- Images: `image::NN-slug.png[Short alt text,960]` — files may be absent at build time
- Nav format: `* xref:XX-slug.adoc[NN. Title]`

## Module numbering

| Part | Modules | Audience |
|------|---------|----------|
| Welcome | index | All |
| Part A — Strategy | 01–05 | Executive / show-and-tell |
| Part B — Hands-on | 10–28 | `%USER_NAME%` lab |
| Facilitator | 29-full-verification | Not in nav |

AI track: 22 OpenShift AI → 23 AI Gateway → 24 MCP → 25 LLM/RAG → 26 Predictive → 27 NeuroFace → 28 End-user apps

## Standard page template

Every learner module should include (in order):

1. Title + `workshop-time-badge`
2. Hero `image::` (optional for minimal pages)
3. Mapping table (lab ↔ production)
4. `== What you will do` (Part B hands-on modules)
5. `== Overview` with Overview-only vs Hands-on pacing NOTE
6. YAML blocks with inline comments (see style guide below)
7. `=== Learn more` with 5–8 official Red Hat / upstream links
8. `== Features, benefits & cloud configuration` (AWS/Azure contrast optional)
9. `== Lab access — URLs & credentials` table
10. `== Show and Tell` — facilitator narrative with `%USER_NAME%`
11. `== Your TODO (user %USER_NAME%)`
12. `== Where this lab is defined` with GitOps paths
13. `== Verify` table + progress widget + next-nav

## GitOps path conventions

Always reference the **hybrid-mesh-platform** repo structure:

| Old (deprecated) | Current |
|------------------|---------|
| `components/foo/` | `charts/all/foo/` |
| `components/skupper/` | `charts/all/service-interconnect/` |
| `platform-hub-spoke-config` | `hybrid-mesh-platform` |
| `templates/component-applications.yaml` | `charts/region/hub/templates/component-applications.yaml` |

Region bootstrap: `charts/region/{hub,east,west}/values.yaml`
Shared charts: `charts/all/*` (50+ Helm charts)
VP globals: `values-global.yaml`, registry: `pattern-metadata.yaml`

NOTE block template:
```
NOTE: Paths refer to the GitOps repo link:https://github.com/maximilianoPizarro/hybrid-mesh-platform[`hybrid-mesh-platform`] deployed on **this** cluster. Do not copy-paste fragments as standalone manifests — use the console links above and verify with `oc`.
```

## BOM alignment checklist

When adding or updating product references, verify against:
https://github.com/maximilianoPizarro/hybrid-mesh-platform/blob/main/docs/bill-of-materials.md

Required operator fields: name, channel, minimum version, `charts/all/` gitPath, official docs link.

Key operators for AI modules:
- RHOAI 2.25+ (`stable-2.25`) — `charts/all/openshift-ai-hub/`
- RHCL 1.4+ — `charts/all/rhcl-operator/`, `charts/all/workshop-kuadrant-apis/`
- Skupper 2.1+ — `charts/all/service-interconnect/`
- Developer Hub 1.9+ — `charts/all/developer-hub/`
- NeuroFace — `charts/all/neuroface/`

Product index: https://github.com/maximilianoPizarro/hybrid-mesh-platform/blob/main/docs/validatedpatterns-docs/products/index.md

## YAML explanation style guide

Every YAML block in workshop content must:

1. Include file path comment: `# charts/all/foo/templates/bar.yaml`
2. Annotate non-obvious fields with inline `# comment`
3. Use `%USER_NAME%` for per-user namespaces (`ai-%USER_NAME%`, `ws-%USER_NAME%`)
4. Never commit secrets — reference `External Secrets` or `values-secret.yaml.template`
5. Pair YAML with one sentence explaining *why* the resource exists

Example:
```yaml
# charts/all/openshift-ai-hub/templates/datasciencecluster.yaml
apiVersion: datasciencecluster.opendatahub.io/v1
kind: DataScienceCluster
metadata:
  name: default-dsc
spec:
  components:
    modelmeshserving:
      managementState: Managed    # shared multi-model runtime for workshop-sklearn
```

## Show and Tell journey narrative

Facilitators should connect modules to the Hybrid Mesh AI story:

- **01–05 (Part A):** Strategy pillars → ROSA anchor → security → AWS AI → roadmap
- **10–14:** "As `%USER_NAME%`, you own a namespace on the fleet"
- **15–18:** "Your workloads are observable from the hub"
- **19–21:** "Governance protects your namespace"
- **22–24:** "AI is a platform service, not a team silo"
- **25–28:** "Every operator tool consumes the same governed AI"

Always mention Plan B: Developer Hub → System `hybrid-mesh-shared-demos`

## Official documentation sources (AI depth)

Prefer these when expanding AI modules:

- https://docs.redhat.com/en/documentation/red_hat_openshift_ai/
- https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/2.25/html/serving_models/
- https://docs.redhat.com/en/documentation/red_hat_developer_hub/
- https://www.kuadrant.io/docs/
- https://gateway-api.sigs.k8s.io/
- https://modelcontextprotocol.io/
- https://ai-on-openshift.io/
- https://validatedpatterns.io/

## Adding a new module

1. Create `content/modules/en/modules/ROOT/pages/NN-slug.adoc`
2. Add entry to `nav.adoc` in correct Part A or Part B section
3. Set `data-module="NN-slug"` on progress widget
4. Add next-nav link from previous module
5. Reference `charts/all/` paths from hybrid-mesh-platform
6. Include at least one annotated YAML block and 5+ official links for AI-related topics

## Verification

After content changes:
- Grep for stale `components/` or `platform-hub-spoke-config` references (should be zero)
- Confirm no orphan `.adoc` files outside nav (except facilitator pages)
- Preserve Antora build: no unclosed `[source,yaml]` blocks or broken `|===` tables
