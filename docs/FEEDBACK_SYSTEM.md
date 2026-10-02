# Feedback & Suggestions System

Required for launch. Code: `webapp/src/lib/feedback.ts`,
`webapp/src/routes/feedback.tsx`, `webapp/src/components/MicroFeedback.tsx`.

## Entry points
- **Profile → Feedback & suggestions** (`/feedback`).
- **Micro-feedback** at key moments: after a Decision Moment (`/continue`:
  "Was this decision moment useful? Yes / Somewhat / No") and after a Future
  Intelligence lesson ("Was this lesson useful? Yes / No"). One-tap, never blocks.

## Types captured
Report a problem · Something isn't working · Something feels confusing ·
Suggest an improvement · Request a feature · Tell us what you think · Other.
Suggestions/features are stored with their own `type`, so they're separable from
bug reports.

## Model (`FeedbackItem`) — backend-ready
`id, type, category?, message, screen?, rating?, createdAt, appVersion,
platform, status, priority?, contact?, metadata?, synced`.
Statuses: new → reviewed → planned → in_progress → released → closed.

## Storage abstraction
All writes/reads go through the `FeedbackStore` interface. The only
implementation today is `localFeedbackStore` (device localStorage). When a
backend exists, add a syncing implementation — **no UI change required**. Items
carry `synced: false` until a backend acknowledges them.

## Honesty
- Guest feedback allowed; **email/mobile never required** (optional "only if you
  want a reply").
- The UI states feedback is "saved on this device for now" — we never claim it
  reached the product team until a backend sync exists.
- "My feedback" shows each submission's status; copy says we can't promise every
  idea ships, but every one is read.

## Privacy
- Stored locally, per device. `platform` is coarse (web / web-android / web-ios)
  from userAgent; no fingerprinting. Contact is optional and only stored if given.

## Verified
`smoke.mjs`: open `/feedback` → pick "Suggest an improvement" → type → Submit →
thank-you → "My feedback" lists the submission.
