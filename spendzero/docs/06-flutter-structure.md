# Flutter Folder Structure

Feature-first, modular. Guest-mode-first: every feature must work without
an authenticated user, backed by a local `device_id`.

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart
│   │   ├── router.dart              # go_router; no auth-gated redirects
│   │   │                             # except account-only screens
│   │   └── bootstrap.dart           # DI, guest device_id provisioning
│   │
│   ├── core/
│   │   ├── theme/
│   │   ├── network/                 # Dio client, guest-token + JWT interceptors
│   │   ├── storage/                 # local-first goal/history cache (guest mode)
│   │   ├── analytics/
│   │   ├── widgets/
│   │   └── utils/
│   │
│   ├── features/
│   │   ├── onboarding/              # disclaimer + optional interest picker
│   │   ├── home/
│   │   ├── discover/
│   │   ├── goals/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │       ├── goal_list_screen.dart
│   │   │       ├── goal_detail_screen.dart
│   │   │       └── create_goal_screen.dart
│   │   ├── history/
│   │   ├── profile/                 # includes optional sign-in flow
│   │   └── categories/
│   │       ├── food/  shopping/  grocery/  fashion/  beauty/
│   │       ├── electronics/  travel/  hotels/  movies/  vehicles/
│   │       ├── real_estate/  services/  healthcare/  books/
│   │       ├── gaming/  gifts/  pets/  jewellery/  music/
│   │       │   ├── data/
│   │       │   ├── domain/
│   │       │   └── presentation/
│   │       │       ├── category_home_screen.dart
│   │       │       ├── listing_screen.dart
│   │       │       ├── detail_screen.dart
│   │       │       ├── cart_screen.dart
│   │       │       ├── checkout_screen.dart
│   │       │       ├── tracking_screen.dart
│   │       │       └── craving_completed_screen.dart
│   │
│   ├── shared_flows/
│   │   ├── checkout/
│   │   ├── tracking/
│   │   └── craving_completed/       # shared "I Saved It"/"Maybe Later" widget
│   │
│   └── l10n/                        # en, hi
│
├── test/
├── integration_test/
├── assets/
│   ├── icons/  illustrations/  animations/  fonts/
└── pubspec.yaml
```

## State management

Riverpod for app-level state (guest/auth session, active goal, stats);
Cubit/Bloc per category feature module for its own browse/cart/checkout
flow, identical pattern across categories via `shared_flows`.

## Navigation

`go_router`, deep-linkable per category/listing. No global auth guard —
only `features/profile/account/*` and goal-sync screens check sign-in
state; everything else works from a guest `device_id` alone.
