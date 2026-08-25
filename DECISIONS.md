# Product Decisions (ADR-lite)

Status markers: ✅ decided · 🔜 planned (phase noted) · ⏸ deferred

## Voice input/output for low-literacy users
⏸ **Deferred to Phase 3.** Target users (PRD §3) include low-literacy and elderly users, so this stays on the roadmap — but shipping it before the core case flow is stable would slow validation. Revisit after Phase 2 AI intake ships; Web Speech API covers Arabic ASR poorly in some Android browsers, so a proper pilot is required.

## Self-service data export & deletion (PDPL "right to be forgotten")
✅ **Decided: build it — partially shipped now.**
- Export: "Export my data (JSON)" button on the My Case dashboard downloads everything the platform holds for the user.
- Deletion: request form exists on /privacy (`deletion_requests` table, 30-day SLA) + admin queue action. Full account cascade-delete is executed by an admin action until automated purge job lands with Phase 2.

## Lawyer engagement payments inside the app
✅ **Decided: explicitly out of scope.** The platform never brokers or processes lawyer fees. Lawyers get verified profiles + shared case handoff; any fee arrangement is contracted directly between lawyer and client outside Haqqi. `fee_model` remains informational only. This avoids becoming an escrow/intermediary entity under Jordanian financial regulation.

## Escalating reminder pipeline for hard deadlines
🔜 **Phase 2 (with Twilio/WhatsApp integration).** Current escalation ladder:
1. In-app notification center (shipped) — badge turns red ≤7 days, overdue items pinned.
2. `.ics` export + Google Calendar links (shipped).
3. SMS/WhatsApp at T-30/T-7/T-1 and overdue+1 (requires provider DPA — see PII policy).
4. Email fallback if SMS undelivered.

## PII before external LLM calls
✅ **Decided: hard-gated in code.** No AI call can be made unless (a) a signed DPA with the provider is recorded, (b) the user's `ai_processing` consent flag is true, and (c) payloads pass through `prepareLlmCall()` whitelist + free-text scrubbing (`src/lib/pii.ts`). Quarterly legal review of each feature's payload shape is part of the compliance calendar.

## Lawyer engagement = out of scope for payments (see above); handoff packets are free.
