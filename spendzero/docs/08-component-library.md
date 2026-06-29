# Component Library

Shared widgets in `lib/core/widgets/` and `lib/shared_flows/`.

## Navigation & shell

- `AppBottomNav` — Home/Discover/Goals/History/Profile.
- `CategoryAppBar` — brand-themed app bar.
- `SavingsTicker` — persistent "₹X not spent today" counter.
- `ActiveGoalCard` — compact progress bar for the user's active goal,
  shown on Home.

## Browse & discovery

- `CategoryGridCard`, `BrandPickerCard`, `ListingCard`, `FilterSheet`,
  `SearchBar` (text/mic/AI-sparkle), `ReviewTile` — same role as a
  standard catalog component set, themed per-brand.

## Cart & checkout

- `CartLineItem`, `CouponInputField` (always-success, celebratory
  micro-animation), `FakePaymentMethodPicker` (explicitly labeled
  "Simulated — no real payment, no bank details ever requested"),
  `CheckoutSummaryBar`.

## Tracking & completion

- `TrackingStageRail`, `MapPinTracker` (stylized, no real maps SDK
  needed), category completion artifacts (`BoardingPassCard`,
  `MovieTicketCard`, `ServiceJobCard` on a shared `TicketCardBase`).

## Craving Completed & goals (core differentiator widgets)

- `CravingCompletedCard` — hero card: "🎉 Craving Completed", amount not
  spent, today/month totals, original celebratory animation.
- `GoalAllocationPicker` — inline selector defaulting to the active goal,
  with a "create new goal" shortcut.
- `SavedItButton` / `MaybeLaterButton` — the two outcome actions; both
  full-width, equal visual weight (no dark-pattern emphasis bias toward
  either choice — a deliberate fairness constraint).
- `GoalProgressBar` — used on Home, Goals tab, and Craving Completed.
- `GoalPresetGrid` — icon grid for the preset goal list (Goa Trip, New
  Bike, iPhone, etc.) plus a "Custom Goal" tile.
- `StreakBadge`, `AchievementToast`, `StatRing`.

## Configurators

- `OptionSwatchSelector`, `ConfiguratorSummaryPanel`, `EmiCalculatorWidget`
  (illustrative-only, clearly labeled non-binding).

All components are theme-aware (`BrandColorScheme` via Riverpod) so the
same widget renders correctly under any fictional brand's accent.
