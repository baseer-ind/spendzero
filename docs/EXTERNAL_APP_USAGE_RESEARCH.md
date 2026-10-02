# External App Usage Tracking — Feasibility Research

Can Project Future show how long a user spends in *real* shopping apps (Amazon,
Flipkart, Blinkit…)? This is an **OS-level, native capability**, not something a
website can do. Android and iOS differ fundamentally. This document is research
for a future native companion — **nothing here is implemented**, and the current
web app tracks only its own in-app activity.

> Hard rules (non-negotiable):
> - Explicit, informed user consent before any external-app data is read.
> - **Do NOT** use Android AccessibilityService as a backdoor for usage tracking.
>   It is for assistive use; using it to monitor other apps violates Play policy
>   and user trust.
> - Do not silently monitor other apps. Do not upload external-app history
>   unnecessarily; prefer on-device aggregation.

## Android

**Mechanism:** `UsageStatsManager` (+ `PACKAGE_USAGE_STATS`).
- `PACKAGE_USAGE_STATS` is a **special/appops permission**, not a runtime one.
  The app cannot request it with a normal dialog; it must send the user to
  Settings → "Usage access" (`ACTION_USAGE_ACCESS_SETTINGS`) to toggle it on.
- **Data available:** per-package foreground time totals and last-used times over
  a queried interval (`queryUsageStats`, `queryAndAggregateUsageStats`), plus
  coarse event streams (`UsageEvents`: MOVE_TO_FOREGROUND/BACKGROUND). So
  **package-level usage duration is available**; per-screen or in-app detail is
  **not**.
- **Package visibility:** on Android 11+ (`QUERY_ALL_PACKAGES` is a sensitive,
  restricted Play permission) resolving which package a usage stat belongs to may
  require declared `<queries>` or a legitimate-use justification; avoid
  `QUERY_ALL_PACKAGES` unless genuinely needed and justified.
- **Background limits & battery:** modern Android restricts background work
  (Doze, background execution limits). Periodic aggregation via WorkManager is
  feasible; continuous polling is not and drains battery.
- **Play policy:** Usage-access and any "permissions to monitor other apps" are
  closely reviewed. Must have a clear, disclosed, user-facing purpose and a
  privacy policy; prominent-disclosure + consent required.

**Verdict:** Technically possible, with explicit user grant via Settings, to show
per-app foreground durations. Requires careful disclosure and Play review.

## iOS

**Mechanism:** Apple's Screen Time APIs — `FamilyControls`, `DeviceActivity`,
`ManagedSettings` (iOS 15+/16+).
- **Entitlement:** `com.apple.developer.family-controls` must be **requested from
  and granted by Apple**; historically oriented to parental-control / wellbeing
  use cases. Approval is not guaranteed for a general consumer shopping-awareness
  app.
- **Privacy model:** This is the crucial difference. iOS does **not** hand raw
  per-app usage numbers to your app. Usage is rendered inside a
  `DeviceActivityReport` SwiftUI extension that runs in a **privacy-preserving,
  sandboxed context** — your app code generally cannot read the underlying
  durations as plain values to log or upload. App-selection uses opaque tokens
  (`ApplicationToken`), not readable identities.
- **App Store review:** Family Controls apps get extra scrutiny and must fit
  Apple's intended use.

**Verdict:** iOS deliberately restricts this. We may be able to *display* a
usage report to the user via the official extension, but **cannot** freely read,
store, or relate raw per-app durations to money the way Android allows. Do not
promise iOS parity with Android.

## Architecture (if/when pursued)

Keep it entirely separate from the web simulation, behind an interface:

```ts
interface ExternalAppUsageProvider {
  getUsageSummary(range): Promise<{ totalMs: number }>;
  getAppUsage(range): Promise<{ app: string; ms: number }[]>;      // Android: real; iOS: constrained
  getCategoryUsage(range): Promise<{ category: string; ms: number }[]>;
}
```
- Android provider: `UsageStatsManager` behind the user's Settings grant.
- iOS provider: only what `DeviceActivityReport` permits — likely display-only.
- The web app ships **no** implementation; it only reserves the interface and the
  dashboard copy that clearly separates "in Project Future" from "other apps".

## Summary

| Capability | Android | iOS |
|-----------|---------|-----|
| Per-app foreground duration readable by our app | Yes, with user Settings grant | No (privacy-preserving report only) |
| Requires special approval/entitlement | Play review + usage-access toggle | Apple entitlement (may be declined) |
| Relate usage → money in our own analytics | Possible (on-device) | Largely not permitted |
| Accessibility-service workaround | Prohibited | N/A |
