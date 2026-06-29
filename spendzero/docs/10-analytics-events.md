# Analytics Event Taxonomy

`snake_case`, `object_action` order. All events carry `user_id?`,
`device_id`, `session_id`, `category?`, `brand?`, `occurred_at`.

## Lifecycle

- `app_opened`
- `disclaimer_acknowledged`
- `guest_session_started`
- `signin_prompted` `{trigger}` — e.g. "third_saved_it", "seven_day_streak"
- `signup_completed` `{provider}`
- `guest_data_merged` `{goals_count, sessions_count}`

## Discovery

- `category_viewed` `{category}`
- `brand_viewed` `{category, brand}`
- `search_performed` `{mode: text|voice|ai, query}`
- `listing_viewed` `{listing_id}`

## Commerce simulation funnel

- `cart_item_added` `{listing_id, quantity}`
- `checkout_started`
- `fake_payment_selected` `{method}`
- `craving_session_placed` `{session_id, total_price_paise}`
- `tracking_viewed` `{session_id, stage}`
- `craving_session_completed` `{session_id}`
- `craving_completed_screen_viewed` `{session_id, amount_paise}` — **key
  activation event**
- `craving_outcome_selected` `{session_id, outcome: saved|maybe_later,
  goal_id?}` — **the core habit-loop event**

## Goals

- `goal_created` `{is_preset, goal_id}`
- `goal_set_active` `{goal_id}`
- `goal_progress_updated` `{goal_id, amount_paise, new_total_paise}`
- `goal_completed` `{goal_id}`

## Funnels to build in the analytics dashboard

1. `category_viewed → cart_item_added → checkout_started →
   craving_session_completed → craving_completed_screen_viewed →
   craving_outcome_selected(saved)` — per category, drop-off at each
   step.
2. `app_opened → guest_session_started → craving_completed_screen_viewed`
   (D0 activation, guest-mode specific).
3. `craving_outcome_selected(saved) → goal_progress_updated →
   goal_completed` (whether the savings mechanic actually drives goal
   completion, the product's core promise).
4. `signin_prompted → signup_completed` (soft-conversion effectiveness).

## Implementation notes

- Client batches events (max 20 or 10s flush) to `POST /events`.
- No raw search query retained beyond 30 days in identifiable form.
- `craving_outcome_selected` amount is always re-derived server-side from
  the session record, never trusted from client analytics payloads, to
  keep the savings ledger tamper-resistant even though it's "just" a
  self-reported tally.
