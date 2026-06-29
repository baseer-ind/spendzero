# Core User Flows

## 1. First-run flow (guest-first)

Splash → Home Dashboard directly (no login wall). A dismissible banner
in Profile/Settings explains guest mode and offers optional sign-in. The
legal/financial disclaimer (see `legal-and-branding-safety.md`) is shown
once, must be acknowledged, but does not require account creation.

## 2. Generic simulated-commerce flow

1. Home → tap category → Category Home (pick fictional brand).
2. Browse → filter/sort → Detail screen.
3. Customize (where relevant) → Add to cart.
4. Cart review → apply coupon (fictional, always succeeds) → Checkout.
5. Fake payment method picker (UPI-style/card-style/COD-style — pure UI
   state, nothing transmitted, explicitly labeled "Simulated").
6. "Processing" animation → confirmation.
7. Tracking animation (stage progress, skippable/fast-forwardable).
8. Completion animation.
9. **Craving Completed screen**:
   - "🎉 Craving Completed — You chose not to spend ₹850"
   - Today's Savings / This Month totals
   - Active goal progress bar (e.g. 🏖 Goa Trip ₹4,200 / ₹10,000)
   - Buttons: **✔ I Saved It** (records the amount against the selected
     goal — local/account ledger entry only, no money movement) / **⏳
     Maybe Later** (dismisses with zero penalty, no nagging follow-up)
10. Return to Home; savings ticker and active goal card update.

## 3. Goal management flow

Goals tab → browse presets (Goa Trip, New Bike, iPhone, Laptop, House,
Education, Wedding, Baby Fund, Emergency Fund, Gaming Setup, Europe Trip,
Royal Enfield, Parents, Charity) or create a custom goal (name, icon,
target amount, optional target date) → set as active goal (default
allocation target for future "I Saved It" taps) → can hold multiple goals
simultaneously, switch active goal anytime.

## 4. "Maybe Later" flow

Tapping "⏳ Maybe Later" simply closes the Craving Completed screen with
no record written and no future reminder nagging about that specific
session — preserves the no-guilt principle. The session still counts in
aggregate "categories explored" stats but not in savings totals.

## 5. Guest → account flow (soft, contextual, never forced)

Triggered after meaningful engagement (e.g. 3rd "I Saved It," or 7-day
streak) → non-blocking prompt: "Back this up so you never lose your
progress" → Google/Apple/email/phone (user's choice) → existing local
goals/history merge into the account on first sign-in.

## 6. Category-specific variations

- **Travel/Hotels/Movies**: booking-style flows (seat map, room/showtime
  selection) before checkout, same Craving Completed ending.
- **Vehicles/Electronics/Real Estate**: customizer step (variant, colour,
  components, interior package) before cart, same ending.
- **Services**: slot + technician picker, "service completed" animation
  instead of delivery, same ending.
