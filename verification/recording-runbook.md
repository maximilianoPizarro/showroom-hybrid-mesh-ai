# Hybrid Mesh AI Workshop — screen recording runbook

**Policy:** MP4/MKV/WebM/MOV files are **never** committed to Git. Store locally or publish via YouTube unlisted / SharePoint / S3 only.

## Local capture folder (Windows)

```text
%UserProfile%/Videos/Captures/hybrid-mesh-ai/
```

## Recommended settings

| Setting | Value |
|---------|-------|
| Tool | Windows Game Bar (Win+G) or OBS |
| Resolution | 1920×1080 |
| Parte A | Modules 01–05 (~45 min) |
| Parte B | Modules 10–27 hands-on (~90 min) |
| Module 28 | Agent Browser walkthrough + recording checklist |

## Suggested filenames (local only)

```text
hybrid-mesh-ai-parte-a-executive.mp4
hybrid-mesh-ai-parte-b-user1-east-lab.mp4
hybrid-mesh-ai-module-25-neuroface-demo.mp4
```

## Pre-recording checklist

- [ ] Registration pool reset (`/admin` with `ADMIN_TOKEN`)
- [ ] user1 credentials: `Welcome123!`
- [ ] Showroom URL with `?USER_NAME=user1&CLUSTER_DOMAIN=…&EAST_DOMAIN=…`
- [ ] Hide notifications / close unrelated tabs
- [ ] Confirm NeuroFace `/api/health` returns 200

## Parte A flow (facilitator)

1. Module 00 index — dual agenda
2. 01 Hybrid strategy → 05 Cases & roadmap
3. Transition slide to Parte B / registration

## Parte B flow (user1 east)

1. Register at workshop-registration → redirect Showroom `#shared-demos`
2. 10 ACM → 13 IE deploy (or Plan B shared demo)
3. 19 NetworkPolicy — `oc get networkpolicy -n industrial-edge-tst-all`
4. 25 NeuroFace webcam + chat
5. 27 Full verification checklist

## Agent Browser

Use YAML under `verification/agent-browser/` for repeatable UI steps. Recordings of Agent Browser runs stay local.

## GitHub Pages note

The Jekyll mirror at `docs/workshop/` does **not** embed `<video>` tags or link to MP4 paths in this repository.
