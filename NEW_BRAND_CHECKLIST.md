# SSAFF — New Brand Checklist

Use this when onboarding a new affiliate brand into the stack (Conversion Bridge, BeMob, MaxBounty, `media-buyer-agent`, warehouse).

---

## BeMob — **CRITICAL FLAGS** (traffic source)

After creating or editing the **Facebook Ads** (or any) traffic source, verify **both** are set to **`true`** in the BeMob dashboard **or** via API (`PUT /v1/traffic-sources/{id}`):

| Field | Required value | If wrong |
|--------|----------------|----------|
| `postbackSendConfirmStatus` | **`true`** | Confirmed conversions never fire S2S postback |
| `postbackSendNewStatus` | **`true`** | New conversions never fire S2S postback |

**Symptom when false:** Conversions appear in BeMob and in MaxBounty, but **never** reach Conversion Bridge, Supabase `events`, Facebook CAPI Purchase, or `warehouse_daily_metrics` revenue. ROAS stays `0.00`; `media-buyer-agent` will correctly treat that as zero ROAS.

**API example (merge with existing `name`, `status`, `postbackUrl`, custom params):**

```json
{
  "name": "Facebook Ads",
  "status": "active",
  "postbackSendConfirmStatus": true,
  "postbackSendNewStatus": true
}
```

---

## After fixing flags — verify the chain

1. **Next conversion** — In Supabase `events`, confirm a row with `event_type = purchase`, expected `pixel_id`, and `source = bemob` (or `backfill`).
2. **`warehouse_daily_metrics`** — Confirm `revenue` and `conversions` for that brand/date (ET) update on the next query.
3. **`media-buyer-agent`** — On the next `POST /run`, confirm ROAS reflects spend + revenue (not `0.00` when revenue exists).

---

## Backfill (missed conversions)

**Script:** `bemob-connect/scripts/backfill-maxbounty-capi.js`

```bash
cd ~/Projects/bemob-connect
node scripts/backfill-maxbounty-capi.js --start=YYYY-MM-DD --end=YYYY-MM-DD
```

- **Facebook CAPI** only accepts events whose **event time is within the last ~7 days** (server-side). Older rows are inserted into **Supabase only** with `created_at` set to the conversion time so `warehouse_daily_metrics` (ET) is correct.
- Requires `SUPABASE_*`, `BDN_FB_ACCESS_TOKEN`, `GTH_FB_ACCESS_TOKEN`, and `RFJ_FB_ACCESS_TOKEN` or `FB_ACCESS_TOKEN` (RFJ), plus MaxBounty credentials (env or `~/Documents/permissions/internal/maxbounty_credentials.txt`).

CSV mode still works: `node scripts/backfill-maxbounty-capi.js /path/to/MaxBounty-export.csv`

---

## Related docs

- `bemob-connect/BEMOB_MAXBOUNTY_FIX.md` — MaxBounty ↔ BeMob ↔ Bridge
- `bemob-connect/docs/BEMOB_GOAL_URL_RUNBOOK.md` — Goal URLs & postbacks
- `bemob-connect/TRACKING_DIAGNOSTIC.md` — End-to-end verification
