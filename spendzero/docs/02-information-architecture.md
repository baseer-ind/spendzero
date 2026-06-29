# Information Architecture

```
App Root
├── Guest-first entry
│   ├── Splash
│   └── Home Dashboard (full access, no signup required)
│
├── Main Shell (bottom nav)
│   ├── Home Dashboard
│   │   ├── Category grid (Food, Shopping, Grocery, Fashion, Beauty,
│   │   │   Electronics, Travel, Hotels, Movies, Vehicles, Real Estate,
│   │   │   Books, Gaming, Gifts, Pets, Jewellery, Services, Healthcare,
│   │   │   Music, ...)
│   │   ├── Today's savings ticker
│   │   └── Active goal progress card
│   │
│   ├── Discover (search: text / AI / voice)
│   │
│   ├── Goals
│   │   ├── Goal list (presets + custom)
│   │   ├── Goal detail (progress, history of contributions)
│   │   └── Create custom goal
│   │
│   ├── History
│   │   └── Past "Craving Completed" sessions, filterable by category
│   │
│   └── Profile / Settings
│       ├── Guest banner ("Sign in to sync & back up — optional")
│       ├── Account (Google/Apple/email/phone — only if user opts in)
│       ├── Total lifetime savings recorded
│       ├── Legal (disclaimer, privacy policy, terms)
│       └── Data export / delete account
│
└── Category Experience Stack (pushed from Home/Discover)
    ├── Category Home (fictional brand picker)
    ├── Listing / Browse
    ├── Detail (product/listing detail)
    ├── Customizer (where relevant)
    ├── Cart
    ├── Checkout (fake payment selector)
    ├── Tracking / Status (category-specific)
    ├── Completion animation
    └── Craving Completed screen
        ├── Amount not spent
        ├── Goal allocation picker (defaults to active goal)
        └── "✔ I Saved It" / "⏳ Maybe Later"
```

## Navigation model

- Bottom tabs: Home · Discover · Goals · History · Profile.
- Guest mode reaches every tab except account-sync features in Profile.
- Sign-in is offered contextually (e.g. after a few "I Saved It" taps:
  "Back this up — sign in") rather than gating entry.
- Category stacks push full-screen from Home/Discover, same depth model
  as generic commerce apps, returning to the shell on completion.
