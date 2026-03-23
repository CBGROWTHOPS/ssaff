# media-buyer-agent Interfaces (SSAFF)

## 1) Scope Confirmation

`media-buyer-agent` is the Layer 1 orchestrator for Facebook Ads performance across SSAFF's three affiliate brands (`BDN`, `RFJ`, `GTH`).

It:
- reads warehouse and attribution data (`warehouse_daily_metrics`, `job_leads`, `events`, plus agent memory),
- runs optimization decisions (pause/edit adsets, budget reallocations, audience refresh, attribution checks, creative refresh requests),
- writes decision history and experiment outcomes (`agent_decisions`, `campaign_experiments`, `creative_performance`, `offer_history`),
- escalates approvals in Slack for high-impact actions (budget increase, new campaign, offer swap, full brand pause),
- coordinates with `creative-agent` over HTTP (`POST /run`),
- uses Keygent at runtime for secrets (no fallback to checked-in `.env` credentials).

This document defines the pre-code contract for file boundaries, data shapes, API interfaces, and failure handling.

---

## 2) File Interfaces (Contract-First)

## Repo Layout

```text
media-buyer-agent/
  server.js
  orchestrator/
    index.js
  integrations/
    keygent.js
    anthropic.js
    supabase.js
    facebook.js
    maxbounty.js
    bemob.js
    slack.js
    monday.js
    creative-agent.js
  memory/
    decisions.js
    experiments.js
    creative-performance.js
    offer-history.js
    retrieval.js
  subagents/
    campaign-manager.js
    budget-optimizer.js
    audience-builder.js
    attribution-auditor.js
    offer-monitor.js
    social-poster.js
  cron/
    schedule.js
  types/
    index.js
  config/
    constants.js
    thresholds.js
```

## Runtime Entry Interfaces

### `server.js`
- Purpose: HTTP entrypoint + health + manual run trigger + Slack-triggered run/approval endpoints.
- Exposes:
  - `GET /health -> 200 { status, service, version, timestamp }`
  - `POST /run -> RunResponse`
  - `POST /approvals/:approvalId/resolve -> ApprovalResolutionResponse`
- Calls only `orchestrator/index.js` and transport adapters (Slack handlers).

### `orchestrator/index.js`
- Purpose: single decision loop coordinator.
- Input:
  - `RunRequest` (manual, scheduled, or Slack-command initiated)
- Output:
  - `RunResult` (actions, approvals created, errors, summary)
- Responsibilities:
  - pull current metrics/context from `integrations/supabase.js` and external signals,
  - execute subagents in deterministic order,
  - enforce approval gates before side-effecting actions,
  - persist all decisions/experiments,
  - emit summary + escalations.

## Integration Module Interfaces

### `integrations/keygent.js`
- `getSecret(name: SecretName): Promise<string>`
- Runtime fetch only.
- Required headers:
  - `X-Agent-Key: KEYGENT_PORTAL_TOKEN`
  - `X-Client-ID: KEYGENT_CLIENT_ID`
- Hard rule: if Keygent unavailable -> fatal run error (no credential fallback).

### `integrations/anthropic.js`
- `decideOptimization(input: DecisionModelInput): Promise<DecisionModelOutput>`
- `summarizeRun(input: RunSummaryInput): Promise<string>`
- Returns structured JSON only (no free-form contract).

### `integrations/supabase.js`
- Read:
  - `getWarehouseMetrics(filters): Promise<WarehouseMetricRow[]>`
  - `getLeadSignals(filters): Promise<JobLeadRow[]>`
  - `getEventSignals(filters): Promise<EventRow[]>`
  - `getPriorDecisions(query): Promise<AgentDecisionRow[]>`
  - `getOpenApprovals(query): Promise<ApprovalQueueRow[]>`
- Write:
  - `insertDecision(row: AgentDecisionInsert): Promise<AgentDecisionRow>`
  - `insertExperiment(row: CampaignExperimentInsert): Promise<CampaignExperimentRow>`
  - `upsertCreativePerformance(rows): Promise<number>`
  - `upsertOfferHistory(rows): Promise<number>`
  - `insertError(row: ErrorLogInsert): Promise<ErrorLogRow>`
  - `insertApproval(row: ApprovalQueueInsert): Promise<ApprovalQueueRow>`
  - `resolveApproval(id, resolution): Promise<ApprovalQueueRow>`

### `integrations/facebook.js`
- Read:
  - `listCampaigns(brand): Promise<FacebookCampaign[]>`
  - `listAdSets(brand): Promise<FacebookAdSet[]>`
  - `getPerformance(brand, window): Promise<FacebookPerformance[]>`
- Write:
  - `pauseAdSet(brand, adSetId): Promise<FacebookMutationResult>`
  - `updateAdSetBudget(brand, adSetId, dailyBudget): Promise<FacebookMutationResult>`
  - `createCustomAudience(brand, payload): Promise<FacebookAudienceResult>`
  - `addAudienceUsers(brand, audienceId, users): Promise<FacebookAudienceResult>`

### `integrations/maxbounty.js`
- `getOfferStats(brand, window): Promise<MaxBountyOfferStat[]>`
- `getOfferCaps(brand): Promise<MaxBountyOfferCap[]>`
- `getConversions(brand, window): Promise<MaxBountyConversion[]>`

### `integrations/bemob.js`
- `getCampaignPerformance(brand, window): Promise<BeMobCampaignStat[]>`
- `getClickToConversionDiagnostics(brand, window): Promise<BeMobAttributionDiagnostic[]>`

### `integrations/slack.js`
- `postDecisionDigest(payload): Promise<void>`
- `postApprovalRequest(payload): Promise<SlackApprovalHandle>`
- `postCriticalError(payload): Promise<void>`
- `postDailySummary(payload): Promise<void>`

### `integrations/monday.js`
- `createOrUpdateOptimizationItem(payload): Promise<MondayItemResult>`
- Optional/non-blocking for core optimization loop.

### `integrations/creative-agent.js`
- `requestCreativeRefresh(payload): Promise<CreativeAgentRunResult>`
- Transport: `POST /run` on creative-agent service.

## Memory Module Interfaces

### `memory/decisions.js`
- Maps runtime decision events -> `agent_decisions` rows.
- Guarantees each side-effecting action has one durable decision record.

### `memory/experiments.js`
- Creates/updates structured experiment records with before/after metrics and result window.

### `memory/creative-performance.js`
- Computes/updates fatigue and performance snapshots per creative/ad.

### `memory/offer-history.js`
- Tracks active/ended offers, lifecycle and reason codes.

### `memory/retrieval.js`
- Semantic lookup of similar prior decisions (pgvector).
- Interface:
  - `findSimilarDecisions(query, brand, limit): Promise<AgentDecisionRow[]>`

## Subagent Interfaces

Each subagent implements:
- `run(context: SubagentContext): Promise<SubagentResult>`

Shared output shape:
- `SubagentResult`:
  - `proposedActions: ProposedAction[]`
  - `requiresApproval: ApprovalRequest[]`
  - `observations: Observation[]`
  - `errors: HandledSubagentError[]`

Subagent ownership:
- `campaign-manager`: pause/edit adsets and campaign-level adjustments.
- `budget-optimizer`: cross-brand budget reallocation recommendations.
- `audience-builder`: refresh/push custom audiences from `job_leads`.
- `attribution-auditor`: reconcile Bridge (`events`) vs MaxBounty vs BeMob.
- `offer-monitor`: cap/payout/conversion surveillance and offer risk detection.
- `social-poster`: organic FB posting support (likely temporary; see ambiguities).

---

## 3) Canonical Data Shapes

## Core Domain Types

```text
Brand = "bdn" | "rfj" | "gth"

DecisionType =
  | "pause_adset"
  | "budget_change"
  | "audience_refresh"
  | "creative_refresh_request"
  | "attribution_alert"
  | "offer_swap_proposal"
  | "campaign_launch_proposal"
  | "brand_pause_proposal"

ApprovalStatus = "pending" | "approved" | "rejected" | "expired"
RunTrigger = "cron" | "manual" | "slack"
```

## Orchestrator I/O

```text
RunRequest {
  runId: string
  trigger: RunTrigger
  requestedBy?: string
  brands?: Brand[]            // default: all active brands
  forceReadOnly?: boolean     // for integration/canary tests
  timestamp: string           // ISO8601
}

RunResult {
  runId: string
  startedAt: string
  endedAt: string
  processedBrands: Brand[]
  actionsExecuted: ActionExecution[]
  approvalsCreated: ApprovalRequest[]
  warnings: WarningEvent[]
  errors: ErrorRef[]
  status: "ok" | "partial" | "failed"
}
```

## Action + Approval Shapes

```text
ProposedAction {
  actionId: string
  brand: Brand
  decisionType: DecisionType
  targetType: "campaign" | "adset" | "audience" | "offer" | "creative"
  targetId?: string
  reason: string
  confidence: number          // 0..1
  expectedImpact?: {
    roasDelta?: number
    cplDelta?: number
    conversionRateDelta?: number
  }
  requiresApproval: boolean
}

ApprovalRequest {
  approvalId: string
  orchestrator: "media-buyer-agent"
  brand: Brand
  decisionType: DecisionType
  context: object
  deadline: string            // ISO8601
  status: ApprovalStatus
}
```

## Experiment Shapes (`campaign_experiments`)

```text
CampaignExperimentInsert {
  experimentId?: string
  brand: Brand
  adsetId?: string
  experimentType:
    | "adset_pause"
    | "budget_change"
    | "creative_swap"
    | "offer_rotation"
    | "audience_refresh"
  hypothesis: string
  variableChanged: object
  controlGroup?: string
  beforeMetrics: MetricSnapshot
  afterMetrics?: MetricSnapshot
  measurementWindowHours: number
  result?: "win" | "loss" | "inconclusive"
  confidence?: number
}
```

## Metric Shapes

```text
MetricSnapshot {
  spend?: number
  leads?: number
  purchases?: number
  revenue?: number
  roas?: number
  cpl?: number
  ctr?: number
  conversionRate?: number
  timestamp: string
}
```

## Supabase Table Shapes Used by media-buyer-agent

```text
warehouse_daily_metrics (read)
  - date
  - brand
  - ad_account_id
  - campaign_id
  - adset_id
  - impressions
  - clicks
  - spend
  - leads
  - joined metrics from leads/events

job_leads (read)
  - uuid, email, phone, first_name, last_name, zip
  - source (brand)
  - fbclid, fbc, fbp
  - created_at

events (read)
  - event_type (Lead/Purchase)
  - source
  - value
  - pixel_id
  - fbc, fbp
  - created_at

agent_decisions (write/read)
  - brand
  - decision_type
  - context (jsonb)
  - action_taken (jsonb)
  - outcome
  - outcome_data
  - approved_by
  - embedding (pgvector)

campaign_experiments (write/read)
  - brand
  - adset_id
  - change_made (+ expanded structured experiment fields)
  - before_metrics
  - after_metrics
  - result

creative_performance (write/read)
  - creative_id
  - ad_id
  - brand
  - impressions, clicks, ctr, conversions, roas
  - fatigue_score
  - flagged_for_refresh

offer_history (write/read)
  - brand
  - offer_id
  - started_at
  - ended_at
  - total_revenue
  - reason_ended
  - active

approval_queue (write/read)
  - orchestrator
  - decision_type
  - context (jsonb)
  - deadline
  - created_at
  - resolved_at
  - resolution

error_logs (write/read)
  - agent
  - job_id
  - failed_step
  - error_message
  - retry_count
  - resolved
  - created_at
```

---

## 4) Error Handling Patterns (Non-Negotiable)

## API Call Reliability
- Retries for external API calls: max 3 attempts with exponential backoff `2s -> 8s -> 32s`.
- After final failure:
  - write `error_logs` row with `job_id`, `failed_step`, `retry_count`,
  - post critical alert to Slack (`#alerts-critical` pattern),
  - mark run/subtask failed without blocking unrelated jobs.

## Fatal vs Recoverable
- Fatal run errors:
  - Keygent unreachable or secret retrieval failure,
  - missing required secrets for current run,
  - schema mismatch in required Supabase tables.
- Recoverable errors:
  - Monday write failure (degrade gracefully),
  - single-brand external API outage (continue other brands; mark partial),
  - creative-agent timeout (queue retry + alert).

## Idempotency + Safety
- Every side-effect action carries `actionId` and dedupe key.
- Writes to memory tables happen before/with action execution metadata (never silent side effects).
- Approval-required actions must not execute without explicit `approved` status in `approval_queue`.
- Read-only mode must block Facebook mutations and outbound Slack non-alert posts.

## Observability
- Structured logs for each step: `runId`, `brand`, `subagent`, `decisionType`, `api`, `latencyMs`, `outcome`.
- End-of-run summary always emitted even on partial failure.

---

## 5) External API Inventory (media-buyer-agent)

## Required
- **Keygent API** (`keygent.one`)
  - Secret retrieval at runtime (`GET /mcp/secrets/{secret_name}`), agent auth headers.
- **Anthropic API**
  - Decision synthesis and run summaries.
- **Supabase (rovbqnncmzltdyeeldxz)**
  - Core reads + memory writes + approvals + error logs.
- **Facebook Graph/Marketing API (v19.0 in spec)**
  - Campaign/adset reads, pause/update budget, audience operations.
- **MaxBounty API**
  - Offer stats, caps, conversion data.
- **BeMob API**
  - Campaign performance and attribution diagnostics.
- **Slack API/Webhooks**
  - Approval cards, alerts, daily summary, decision notifications.
- **creative-agent service API**
  - `POST /run` for creative refresh requests.

## Optional/Secondary
- **Monday GraphQL API**
  - Task/board updates for operational visibility (non-critical path).

---

## 6) Ambiguities to Resolve Before Coding

1. **Schedule conflict**
   - Section 7 says `8:00am ET daily + on-demand`; elsewhere monitoring jobs are hourly/4-hourly.
   - Need final run cadence per subagent and brand.

2. **`campaign_experiments` schema mismatch**
   - One section shows minimal columns; experimentation section expects richer fields (`hypothesis`, `control_group`, `confidence`, etc.).
   - Need migration-level canonical schema.

3. **`social-poster` ownership**
   - Listed under media-buyer-agent, but broader doc says publishing centralizes in `social-agent`.
   - Need decision: keep here temporarily or delegate now.

4. **RFJ ad account missing**
   - Brand inventory has `RFJ FB Ad Account = TBD`.
   - Need actual account ID or explicit brand disable behavior.

5. **Approval transport contract**
   - "Slack approval required" is defined conceptually, but callback payload/schema and timeout behavior are not specified for media-buyer-agent.

6. **Creative request contract**
   - `POST /run` to creative-agent is named, but request/response schema, sync/async mode, and job correlation ID are unspecified.

7. **MaxBounty + BeMob endpoint details**
   - Auth method, endpoint paths, pagination, and rate limits are not specified in this architecture doc.

8. **Decision thresholds**
   - "ROAS kill threshold", fatigue threshold, and budget increase limits are not numerically defined per brand.

9. **Brand status behavior**
   - RFJ marked paused but "ready to relaunch." Need explicit rule: should runs include paused brands by default?

10. **Monday criticality**
    - Monday writes are listed, but not clear whether failures should fail the run or be best-effort only.

11. **Knowledge Base read path for media decisions**
    - Examples show media-buyer-agent querying seasonality knowledge, but no explicit retrieval interface in media-buyer-agent section.
    - Need to confirm if v1 includes this dependency.

12. **Token/cost guardrails in runtime contract**
    - Budget guidance exists globally, but media-buyer-agent hard limits and fallback behavior are not concretely defined.

---

## 7) Pre-Build Decisions Needed (Checklist)

- Confirm canonical file tree and module boundaries in this doc.
- Finalize migration schema for `campaign_experiments` and `agent_decisions` fields.
- Define numeric thresholds per brand (`kill_roas`, `fatigue_score`, max budget step-up).
- Approve approval-card schema + webhook callback contract.
- Confirm whether `social-poster` is in-scope for v1.
- Confirm RFJ run policy while ad account ID is unresolved.
- Confirm Monday as best-effort side channel.
- Confirm creative-agent `/run` contract and timeout/retry behavior.

Once these are resolved, implementation can start without interface drift.
