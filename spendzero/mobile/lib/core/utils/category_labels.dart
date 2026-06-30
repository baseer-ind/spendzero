const categoryLabels = {
  'demo-food': 'Food',
  'demo-groceries': 'Grocery',
  'demo-fashion': 'Shopping',
  'demo-electronics': 'Electronics',
  'demo-travel': 'Travel',
  'demo-entertainment': 'Entertainment',
  'demo-beauty': 'Beauty',
  'demo-furniture': 'Furniture',
};

const categoryEmoji = {
  'demo-food': '🍔',
  'demo-groceries': '🛒',
  'demo-fashion': '👕',
  'demo-electronics': '📱',
  'demo-travel': '✈️',
  'demo-entertainment': '🎬',
  'demo-beauty': '💄',
  'demo-furniture': '🛋️',
};

String labelForCategory(String categoryId) =>
    categoryLabels[categoryId] ??
    categoryId.replaceFirst('demo-', '').replaceAll('-', ' ');

String emojiForCategory(String categoryId) => categoryEmoji[categoryId] ?? '💰';
