# حَقّي — Haqqi

**Your rights after a car accident in Jordan.** Arabic-first (RTL) web app implementing the MVP scope of PRD v3.0 (§5.1), updated with the confirmed business model:

- **Registration + email confirmation required** before using any section.
- **Free sections** (after registration): rights & compensation guide, community stories.
- **Paid case assistance — JOD 30 per accident case**: personal action plan, deadline tracking (.ics export), insurer demand letter, CBJ complaint letter, print-ready PDF.
- **Payments: CliQ only.** The user transfers via their bank app to the platform's CliQ alias and submits the reference number; an admin verifies it against the bank statement and confirms → tools unlock. No card data ever touches the platform.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000  (Arabic default, EN toggle top-left)
```

Runs without configuration in **demo mode** (simulated auth/payment, in-browser storage) so every flow is previewable. For production:

```bash
cp .env.example .env.local   # Supabase keys + your CliQ alias/IBAN
supabase db push             # apply supabase/migrations/
```

### Admin payment verification

When a user submits a transfer reference (`payments` table, status `pending`):

```sql
update payments set status='confirmed', reviewed_at=now() where id='<payment-id>';
```

Match `cliq_reference` + amount against your CliQ/bank statement first. Rejected: set `status='rejected'` (+ optional `review_note`).

## What's implemented (PRD → code)

| PRD § | Feature | Where |
|-------|---------|-------|
| 5.1.1 | Static rights guide: entitlements, ceilings, deadlines, payment timelines, document checklist + version/review metadata | `src/app/rights`, `src/lib/legal-data.ts` |
| 5.1.2 | Accident workflow planner: static rules engine → tasks/deadlines (3y Art.932, 1y Fund, 5–10 wd payment), progress tracking (localStorage), `.ics` calendar export | `src/app/workflow`, `src/lib/workflow.ts` |
| 5.1.3 | Complaint letters (insurer / CBJ FCP) with live preview, copy, print-to-PDF (Arabic RTL), text download + contacts directory (CBJ official; insurers flagged unverified until admin confirms) | `src/app/complaints`, `src/lib/letters.ts` |
| 5.1.4 | Anonymous stories: submission (honeypot, consent checkbox, type/outcome taxonomy), filters, moderation-ready API | `src/app/stories`, `src/app/api/stories` |
| 5.1.5 | PDPL page + deletion-request workflow (`deletion_requests` table, 30-day SLA) | `src/app/privacy`, `src/app/api/deletion-requests` |
| 6.2 | Full PostgreSQL schema incl. Phase 2/3 tables, pgvector RAG table, audit log | `supabase/migrations/00001_init.sql` |
| 6.3 | RLS policies (owner CRUD, anon insert-only, approved-only public reads), private storage bucket | migration |

## Case platform (multi-user) — migration 00003

- **Shared cases**: `cases` + `case_access` (owner / family representative / assigned lawyer / viewer). Owners invite by email; invitees accept from their dashboard. RLS enforces membership.
- **My Case dashboard** (`/dashboard`): single hub — case overview, hard-deadline countdowns, evidence log, access management, data export.
- **Hard-deadline tracker**: `deadlines` rows auto-created per case (3y limitation Art. 932, 1y Fund window), color-escalating countdown (red ≤7d / amber ≤30d), Google Calendar links, `.ics` export, in-app notifications (`/notifications` + header bell).
- **Evidence chain-of-custody**: browser computes SHA-256 before upload; `documents` stores hash + immutable timestamp metadata (byte storage lands with Storage integration).
- **Lawyer verification**: `/join-as-lawyer` → hashed license upload → admin approves in `/admin` (auto-creates verified `lawyers` profile linked to the account).
- **Audit trail**: `audit_write()` triggers on payments/documents/cases/case_access/drafts/stories/legal_guides/lawyer_applications/deletion_requests/complaints — canonical queryable log visible in the admin panel.
- **Consent versioning**: register records terms/privacy/disclaimer versions (`user_consents.doc_type` + `doc_version`).
- **PII before AI**: `src/lib/pii.ts` — DPA checklist, field whitelist, free-text scrubbing; `prepareLlmCall()` throws unless preconditions hold. See DECISIONS.md.

**Admin bootstrap:** `insert into admins (user_id) values ('<uuid>');` then open `/admin` (payments confirm, story moderation, lawyer approvals, deletion requests, audit view).

## Deliberately deferred (per PRD phasing)

- Grok/AI intake, Drafting Mode citations panel, RAG pipeline (Phase 2 — schema already in place)
- Lawyer directory/handoff UI, regulator dashboard (Phase 3)
- Admin CMS UI for legal guides (editable via `legal_guides` table now)
- Voice input/output — deferred to Phase 3 (see DECISIONS.md)

## Architecture notes

- **Next.js 14 App Router + TypeScript + Tailwind** — cookie-based locale (`haqqi_locale`), server-rendered `<html lang/dir>` so RTL/LTR switch without client flash.
- **Supabase optional**: server routes use the service-role key only when configured; otherwise they fall back to an in-memory demo store so the UX is testable offline.
- **PDF via print stylesheet** (`@media print`) — zero-dependency, perfect Arabic shaping. Swap to `@react-pdf/renderer` later if programmatic PDFs are needed.
- **Reminders (SMS/WhatsApp)** are intentionally not wired: Twilio needs credentials and per-user consent records (PDPL). The planner ships `.ics` export as the no-backend reminder path.

## Deliberately deferred (per PRD phasing)

- Grok/AI intake, Drafting Mode citations panel, RAG pipeline (Phase 2 — schema already in place)
- Lawyer directory/handoff, regulator dashboard (Phase 3)
- Admin CMS UI (guides editable via `legal_guides` table now)

## Before launch (non-negotiable, PRD §9.1)

1. **Lawyer review** of every string under `rights.*`, workflow tasks, and both letter templates.
2. Verify insurer contact details before publishing them as verified.
3. Confirm compensation figures against the official CBJ tables and set `LEGAL_META.lastReviewedByLawyer`.
