# CoS — development slice (SSAFF)

**Purpose:** Single place for the **minimal HTTP CoS** used while the full Chief-of-Staff stack (Slack Bolt, `approval_queue` in Supabase, Block Kit) is not deployed.

## Canonical orchestrator contract

See **[INTERFACES.md](./INTERFACES.md)** for `media-buyer-agent` types, `approval_queue` shapes, and the intended server route:

- `POST /approvals/:approvalId/resolve -> ApprovalResolutionResponse` (target contract on the **agent**)

The **minimal CoS service** (`media-buyer-agent/cos/README.md`) is a separate process that:

1. **Ingests** approval payloads from the agent (`APPROVALS_ENDPOINT` → `POST …/v1/approvals`).
2. **Resolves** human decisions and **calls back** the agent’s existing `POST /approve` with `{ decision_id, approved }`.

That is **not** the full SSAFF CoS from the agency OS drafts (registry, morning briefing, Slack templates). See `.tmp/ssaff-agency-os-part2.txt` for that long-term vision.

## Canonical implementation

**`cos-dev-spec.docx`** (`~/Documents/SSAFF/cos-dev-spec.docx`) is implemented as the **`cos` repo** — `../../cos` from this workspace (`/Users/christopher/Projects/cos`): Slack Bolt, Supabase tables, `POST /intake/approval`, etc.

The older **`media-buyer-agent/cos/`** folder was a thin HTTP stub; use the **`cos`** project for Chief of Staff.

## Mapping: INTERFACES → CoS v1

| INTERFACES concept | CoS (`Projects/cos`) |
|--------------------|----------------------|
| `ApprovalRequest` / queue | `approval_queue` + `POST /intake/approval` |
| Resolve | Slack buttons → orchestrator `POST /approve` |
| Registry | `orchestrator_registry` + `/registry/refresh` |

## Env wiring (recap)

**Agent:** `APPROVALS_ENDPOINT` = `https://<cos-host>/v1/approvals`, optional `APPROVALS_ENDPOINT_TOKEN`  
**CoS:** `MEDIA_BUYER_AGENT_URL`, `COS_INGEST_SECRET` / `COS_RESOLVE_SECRET` — see `media-buyer-agent/cos/.env.example`
