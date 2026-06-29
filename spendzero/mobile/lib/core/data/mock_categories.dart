import '../models/category.dart';

/// Static, original-brand catalog data for the early build. Will be
/// replaced by the FastAPI /categories endpoint once the mobile app
/// has a networking layer wired up.
const mockCategories = <SpendCategory>[
  SpendCategory(slug: 'food', name: 'Food', emoji: '🍔'),
  SpendCategory(slug: 'shopping', name: 'Shopping', emoji: '🛒'),
  SpendCategory(slug: 'grocery', name: 'Grocery', emoji: '📦'),
  SpendCategory(slug: 'fashion', name: 'Fashion', emoji: '👕'),
  SpendCategory(slug: 'beauty', name: 'Beauty', emoji: '💄'),
  SpendCategory(slug: 'electronics', name: 'Electronics', emoji: '📱'),
  SpendCategory(slug: 'travel', name: 'Travel', emoji: '✈️'),
  SpendCategory(slug: 'hotels', name: 'Hotels', emoji: '🏨'),
  SpendCategory(slug: 'movies', name: 'Movies', emoji: '🎬'),
  SpendCategory(slug: 'vehicles', name: 'Vehicles', emoji: '🚗'),
  SpendCategory(slug: 'gaming', name: 'Gaming', emoji: '🎮'),
  SpendCategory(slug: 'gifts', name: 'Gifts', emoji: '🎁'),
];
