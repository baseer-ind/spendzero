import 'product_emoji.dart';

/// Real product photography for the shopping verticals. Mirrors
/// [emojiForProductTitle]: match a product/restaurant title to a concrete
/// photo subject so the image reads as "that's a pizza" / "that's a kurta"
/// rather than a flat gradient. Photos come from loremflickr keyword search
/// (no API key, keyword-matched real photos); a per-title lock keeps the same
/// item showing the same photo across the app and across rebuilds.
///
/// Rendering uses plain Image.network (see RemoteImage) so it works on the
/// Flutter web build (html renderer, <img> tags — no CORS fetch) and on the
/// APK. If a photo fails to load, the widget falls back to the product emoji.

/// Stable pseudo-random lock from a seed so a given product always maps to the
/// same photo (loremflickr returns a fixed image per lock value).
int _lock(String seed) {
  var h = 7;
  for (final c in seed.codeUnits) {
    h = (h * 31 + c) & 0x7fffffff;
  }
  return h % 900 + 1;
}

/// Picks the best photo subject (search tag) for a product title, reusing the
/// emoji keyword set so coverage stays in sync. Spaces are stripped so
/// "ice cream" -> "icecream" is a valid single loremflickr tag.
String _tagForTitle(String title) {
  final lower = title.toLowerCase();
  for (final k in productEmojiKeywords.keys) {
    if (lower.contains(k)) return k.replaceAll(' ', '');
  }
  return 'product';
}

/// Square product photo for cards/thumbnails.
String imageUrlForProductTitle(String title, {int size = 400}) {
  return 'https://loremflickr.com/$size/$size/${_tagForTitle(title)}?lock=${_lock(title)}';
}

/// Wide hero/banner photo for a store/restaurant/brand, keyed off a subject
/// tag (e.g. a cuisine or category) plus a stable seed (the entity id).
String imageUrlForBanner(String tag, String seed, {int width = 1200, int height = 640}) {
  final clean = tag.toLowerCase().trim().replaceAll(RegExp(r'\s+'), '');
  final subject = clean.isEmpty ? 'storefront' : clean;
  return 'https://loremflickr.com/$width/$height/$subject?lock=${_lock(seed)}';
}
