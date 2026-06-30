/// Maps a product title to a recognizable emoji glyph via local keyword
/// matching — no AI/network calls, just a rule-based lookup — so items read
/// as "that's a pizza" / "that's a kurta" at a glance instead of a generic
/// shopping-bag icon. Shared between product cards and the cart so an item
/// looks the same wherever it's shown.
const productEmojiKeywords = <String, String>{
  'pizza': '🍕', 'burger': '🍔', 'biryani': '🍛', 'cake': '🍰',
  'coffee': '☕', 'tea': '🍵', 'chai': '🍵', 'juice': '🧃',
  'salad': '🥗', 'sandwich': '🥪', 'noodle': '🍜', 'rice': '🍚',
  'ice cream': '🍦', 'paneer': '🧀', 'chicken': '🍗', 'fish': '🐟',
  'soup': '🍲', 'roll': '🌯', 'dosa': '🥞', 'idli': '🍙', 'momo': '🥟',
  'pasta': '🍝', 'fries': '🍟', 'donut': '🍩', 'cookie': '🍪',
  'shirt': '👕', 'kurta': '👘', 'jeans': '👖', 'shoe': '👟', 'sneaker': '👟',
  'dress': '👗', 'jacket': '🧥', 'bag': '👜', 'watch': '⌚', 'saree': '🥻',
  'phone': '📱', 'laptop': '💻', 'headphone': '🎧', 'earbud': '🎧',
  'speaker': '🔊', 'charger': '🔌', 'camera': '📷', 'tv': '📺',
  'sofa': '🛋️', 'chair': '🪑', 'lamp': '💡', 'table': '🛋️',
  'milk': '🥛', 'bread': '🍞', 'egg': '🥚', 'fruit': '🍎', 'vegetable': '🥦',
  'lipstick': '💄', 'perfume': '🧴', 'cream': '🧴', 'shampoo': '🧴',
};

String emojiForProductTitle(String title) {
  final lower = title.toLowerCase();
  for (final entry in productEmojiKeywords.entries) {
    if (lower.contains(entry.key)) return entry.value;
  }
  return '🛍️';
}
