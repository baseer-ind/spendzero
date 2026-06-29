/// Maps to the icon emoji shown in the home grid. Falls back to a generic
/// shopping bag if the backend ever returns an icon_key we don't recognize.
const _iconByKey = <String, String>{
  '🍔': '🍔',
  '🛒': '🛒',
  '📦': '📦',
  '👕': '👕',
  '💄': '💄',
  '📱': '📱',
  '✈️': '✈️',
  '🏨': '🏨',
  '🎬': '🎬',
  '🚗': '🚗',
  '🎮': '🎮',
  '🎁': '🎁',
};

class SpendCategory {
  const SpendCategory({
    required this.id,
    required this.slug,
    required this.name,
    required this.emoji,
  });

  final String id;
  final String slug;
  final String name;
  final String emoji;

  factory SpendCategory.fromJson(Map<String, dynamic> json) {
    final iconKey = json['icon_key'] as String?;
    return SpendCategory(
      id: json['id'] as String,
      slug: json['slug'] as String,
      name: json['name'] as String,
      emoji: _iconByKey[iconKey] ?? iconKey ?? '🛍️',
    );
  }
}
