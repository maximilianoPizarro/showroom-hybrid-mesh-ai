---
name: showroom-validation
description: >-
  Audit the live Hybrid Mesh AI Showroom against the deployed cluster: verify module
  pages, lab URLs, content consistency with hybrid-mesh-platform BOM, regenerate hero
  images with Gemini 3.1 Pro, and open upstream issues via gh. Use when validating
  showroom-showroom URLs, link health, stale architecture references, or image refresh.
---

# Showroom Continuous Validation Skill

Companion to `hybrid-mesh-ai-workshop` (content authoring). This skill defines **how to audit** the deployed showroom, not how to write modules.

## Scope

| Repo | Role |
|------|------|
| `showroom-hybrid-mesh-ai` | Antora content, images, supplemental UI — fix broken links and stale text here |
| `hybrid-mesh-platform` | Cluster routes, ConsoleLinks, charts — open **issues** here when the cluster/GitOps is wrong |

## Live instance (update per RHDP order)

| Attribute | Example (Jun 2026) |
|-----------|-------------------|
| Hub domain | `cluster-5rm8z.dynamic2.redhatworkshops.io` |
| East domain | `cluster-4gzf2.dynamic2.redhatworkshops.io` |
| Showroom | `https://showroom-showroom.apps.<HUB_DOMAIN>/en/index.html` |

Always substitute `%HUB_DOMAIN%`, `%EAST_DOMAIN%`, `%USER_NAME%` in `.adoc` — never hardcode cluster names in source. Never use `{hub_domain}` (Antora will not resolve it).

## Validation workflow (reproducible)

Run in this order every time the platform or showroom changes.

### 1. Module inventory

Read [nav.adoc](content/modules/en/modules/ROOT/nav.adoc) — all learner pages plus `index.adoc`, `29-full-verification.adoc` (facilitator, not in nav).

Probe each rendered HTML page on the live showroom (`/en/<slug>.html`). **Expected: HTTP 200** for every module.

### 2. Link audit

Extract URLs from `content/modules/en/modules/ROOT/pages/*.adoc`:

- `link:https://...` — lab and external docs
- `xref:` — internal cross-refs only (no HTTP probe)

Replace attributes before probing: `%HUB_DOMAIN%` → live hub domain, `%EAST_DOMAIN%` → east domain.

| URL class | Expected status | Notes |
|-----------|-----------------|-------|
| Showroom pages | 200 | All `/en/*.html` |
| Public UIs (NeuroFace, IE, Mailpit, registration) | 200 | No auth |
| Kuadrant gateways (`workshop-apis`, `ai-gateway`) without APIKEY | **401** | Protected = healthy |
| OAuth UIs (Grafana, ODS, ACS, Skupper) | 200, 301, or 302 | Follow redirects; TLS errors = upstream issue |
| Red Hat docs (`docs.redhat.com`) | 200 | Spot-check 5–10 per run |
| GitHub Pages docs | 200 | Prefer `maximilianopizarro.github.io/hybrid-mesh-platform/` |

Record results in `verification/audit-<YYYY-MM-DD>.md` (status, URL, module, action).

**Fix locally** when: wrong attribute placeholder, stale path, wrong hostname pattern, footer pointing to deprecated docs.

**Open upstream issue** when: route missing, 503 from chart, TLS/cert on ConsoleLink, product not deployed.

### 3. Content consistency grep

Zero tolerance in learner `.adoc` (except explicit “old vs new” teaching notes):

| Stale pattern | Replace with |
|---------------|--------------|
| `{hub_domain}` | `%HUB_DOMAIN%` |
| `components/` | `charts/all/` |
| `platform-hub-spoke-config` | `hybrid-mesh-platform` |
| `workshop-apis.*/llm` or `/llm/v1` | `ai-gateway.%HUB_DOMAIN%/v1` |
| Kuadrant client `Authorization: Bearer` | `Authorization: APIKEY <key>` |
| `kuadrant.io/v1alpha1` APIProduct | `devportal.kuadrant.io/v1alpha1` |

**Allowed** `hub-gateway-system` only in modules 11/17 when describing Skupper/hub-gateway chart — not for Kuadrant workshop APIs (those use `workshop-kuadrant-apis` + `ai-gateway-system`).

Dual-gateway reference (modules 20, 23, index):

| Host | Namespace | Module |
|------|-----------|--------|
| `workshop-apis.%HUB_DOMAIN%` | `workshop-kuadrant-apis` | 20 |
| `ai-gateway.%HUB_DOMAIN%` | `ai-gateway-system` | 23 |

User activity path (document in index + 20 + 23):

1. Developer Hub → `/kuadrant` → API Product → Request API key
2. Catalog → System `workshop-kuadrant-apis` → API → Definition (Swagger) → Authorize `APIKEY`
3. Showroom terminal → `kuadrant-set-key` + `kuadrant-test-httpbin` / `kuadrant-test-ai` (401 then 200)

### 4. Image audit

List references: `grep -r 'image::' content/modules/en/modules/ROOT/pages/`

Cross-check files exist under `content/modules/en/modules/ROOT/images/`.

Regenerate when:

- File missing (broken hero on live site)
- Diagram shows deprecated architecture (single gateway, wrong product names)
- Hero does not match module narrative (see table in `hybrid-mesh-ai-workshop` SKILL)

**Do not overwrite** manual heroes unless explicitly obsolete: `18-scalability`, `20-acs-kuadrant`, `23-ai-gateway`, `24-mcp-gateway`, `30-ai-show-and-tell`.

Only **03** and **20** may share the same ACS hero hash.

## Gemini 3.1 Pro image generation — mandatory criteria

Use the `GenerateImage` tool. **Every** workshop hero must follow:

### Visual standards

1. **Background:** pure white (`#FFFFFF`) — no dark mode, no gradients as primary background
2. **Design system:** PatternFly / [ux.redhat.com](https://ux.redhat.com) — clean enterprise layout, generous whitespace, Red Hat typography feel (sans-serif headings, readable body labels)
3. **Logos:** include **official Red Hat product logos** relevant to the module (e.g. OpenShift, OpenShift AI, Developer Hub, ACS, Connectivity Link, Skupper, AMQ, Grafana). Place logos in corners or a labeled product strip — not distorted, not generic placeholders
4. **Format:** architecture diagram or conceptual illustration — not a fake screenshot unless module explicitly needs UI chrome
5. **Aspect:** landscape ~16:9, suitable for 960px width in Antora (`image::NN-slug.png[Alt,960]`)
6. **Text:** minimal English labels on diagram nodes; module number optional in corner (e.g. "Module 13")
7. **No secrets:** no API keys, no real cluster domains, no PII

### Standard prompt template

```
Enterprise architecture diagram for Red Hat Hybrid Mesh AI Workshop module {NN} — {title}.
White background (#FFFFFF). PatternFly / ux.redhat.com style: clean layout, subtle gray borders, Red Hat red (#EE0000) accents only for highlights and arrows.
Include official Red Hat product logos for: {product list}.
Show: {specific nodes and flows from module narrative}.
Landscape 16:9, minimal English labels, no screenshots, no secrets, no dark theme.
```

### After generation

1. Save as `content/modules/en/modules/ROOT/images/{NN}-{slug}.png`
2. Confirm `image::` reference and alt text in the matching `.adoc`
3. Note regeneration in audit file

Optional upstream sync: `SHOWROOM_DIR=../showroom-hybrid-mesh-ai bash scripts/sync-showroom-content.sh` in **hybrid-mesh-platform** (platform repo, not showroom).

## Upstream issues (hybrid-mesh-platform)

Use `gh issue create` **directly** — do not add bash scripts to the showroom repo.

```text
gh issue create \
  --repo maximilianoPizarro/hybrid-mesh-platform \
  --title "showroom: <short title>" \
  --label "showroom,workshop" \
  --body "$(cat <<'EOF'
## Context
Showroom validation on `<showroom-url>` — module `<NN-slug>`.

## Observed
- URL: ...
- HTTP status / error: ...

## Expected
...

## Showroom impact
Which module(s) and learner step blocked.

## Suggested fix
GitOps path (charts/all/...) if known.
EOF
)"
```

One issue per distinct platform defect (Gitea 503, ACS TLS, missing ConsoleLink, wrong route host).

Link showroom PR/commit in issue body when local content was already fixed.

## Post-validation checklist

- [ ] All `/en/*.html` pages return 200 on live showroom
- [ ] Lab URL table matches probe results (401 documented for Kuadrant)
- [ ] No `{hub_domain}` or hardcoded cluster domains in `.adoc`
- [ ] Footer Docs link → `maximilianopizarro.github.io/hybrid-mesh-platform/`
- [ ] Missing images regenerated with Gemini criteria above
- [ ] `verification/audit-<date>.md` committed
- [ ] Upstream issues filed for cluster/chart defects

## Related files

- Authoring: `.cursor/skills/hybrid-mesh-ai-workshop/SKILL.md`
- Nav: `content/modules/en/modules/ROOT/nav.adoc`
- Runtime wiring: `content/supplemental-ui/js/workshop-runtime.js`
- Platform BOM: https://github.com/maximilianoPizarro/hybrid-mesh-platform/blob/main/docs/bill-of-materials.md
