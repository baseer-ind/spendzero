import '../models/category.dart';
import '../models/goal.dart';
import '../models/listing.dart';
import '../models/user_stats.dart';

/// Bundled, fully offline fallback data. Used whenever the backend is
/// unreachable so the app never shows a broken home screen — see
/// `demoModeProvider` in `providers.dart` for how/when this kicks in.
const demoCategories = <SpendCategory>[
  SpendCategory(id: 'demo-food', slug: 'food', name: 'Food Delivery', emoji: '🍔'),
  SpendCategory(id: 'demo-groceries', slug: 'groceries', name: 'Groceries', emoji: '🛒'),
  SpendCategory(id: 'demo-fashion', slug: 'fashion', name: 'Fashion', emoji: '👕'),
  SpendCategory(id: 'demo-electronics', slug: 'electronics', name: 'Electronics', emoji: '📱'),
  SpendCategory(id: 'demo-travel', slug: 'travel', name: 'Travel', emoji: '✈️'),
  SpendCategory(id: 'demo-entertainment', slug: 'entertainment', name: 'Movies', emoji: '🎬'),
];

const _demoListingsByCategory = <String, List<Listing>>{
  'demo-food': [
    Listing(
      id: 'demo-food-1',
      brandId: 'demo-brand',
      title: 'Margherita Pizza (Large)',
      pricePaise: 49900,
      mrpPaise: 59900,
      rating: 4.3,
      reviewCount: 1280,
    ),
    Listing(
      id: 'demo-food-2',
      brandId: 'demo-brand',
      title: 'Butter Chicken Combo',
      pricePaise: 32900,
      rating: 4.5,
      reviewCount: 860,
    ),
  ],
  'demo-groceries': [
    Listing(
      id: 'demo-groceries-1',
      brandId: 'demo-brand',
      title: 'Weekly Grocery Basket',
      pricePaise: 89900,
      mrpPaise: 99900,
      rating: 4.1,
      reviewCount: 410,
    ),
  ],
  'demo-fashion': [
    Listing(
      id: 'demo-fashion-1',
      brandId: 'demo-brand',
      title: 'Classic Cotton T-Shirt',
      pricePaise: 79900,
      mrpPaise: 129900,
      rating: 4.2,
      reviewCount: 2100,
    ),
  ],
  'demo-electronics': [
    Listing(
      id: 'demo-electronics-1',
      brandId: 'demo-brand',
      title: 'Wireless Earbuds',
      pricePaise: 199900,
      mrpPaise: 249900,
      rating: 4.4,
      reviewCount: 5400,
    ),
  ],
  'demo-travel': [
    Listing(
      id: 'demo-travel-1',
      brandId: 'demo-brand',
      title: 'Weekend Getaway Package',
      pricePaise: 1499900,
      rating: 4.6,
      reviewCount: 95,
    ),
  ],
  'demo-entertainment': [
    Listing(
      id: 'demo-entertainment-1',
      brandId: 'demo-brand',
      title: 'Movie Tickets (2)',
      pricePaise: 59900,
      rating: 4.0,
      reviewCount: 320,
    ),
  ],
};

List<Listing> demoListingsFor(String categoryId) =>
    _demoListingsByCategory[categoryId] ?? const [];

const demoGoals = <SavingsGoal>[
  SavingsGoal(
    id: 'demo-goal-1',
    title: 'New Headphones',
    emoji: '🎧',
    targetPaise: 500000,
    savedPaise: 180000,
  ),
  SavingsGoal(
    id: 'demo-goal-2',
    title: 'Weekend Trip',
    emoji: '🏖️',
    targetPaise: 2000000,
    savedPaise: 350000,
  ),
];

const demoStats = UserStats(
  totalAmountNotSpentPaise: 530000,
  cravingsCompleted: 7,
  goalsCompleted: 0,
  currentStreakDays: 3,
  longestStreakDays: 5,
  categoriesExplored: ['demo-food', 'demo-groceries'],
);
