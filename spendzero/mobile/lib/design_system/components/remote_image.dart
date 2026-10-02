import 'package:flutter/material.dart';

/// Loads a real photo from the network with a graceful lifecycle:
///   loading -> a soft shimmer block
///   loaded  -> the photo, fading in
///   error   -> a tasteful gradient + the product emoji (never a broken icon)
///
/// Uses plain [Image.network] on purpose: on the Flutter web build (html
/// renderer) this renders as an <img> tag, so photos load without the CORS
/// fetch issues a byte-caching loader hits. On the APK it loads normally.
class RemoteImage extends StatelessWidget {
  const RemoteImage({
    super.key,
    required this.url,
    this.fallbackEmoji,
    this.fit = BoxFit.cover,
    this.fallbackSeed = '',
  });

  final String url;
  final String? fallbackEmoji;
  final BoxFit fit;

  /// Seeds the fallback gradient hue so each item keeps a consistent look even
  /// when offline / the photo fails.
  final String fallbackSeed;

  @override
  Widget build(BuildContext context) {
    return Image.network(
      url,
      fit: fit,
      gaplessPlayback: true,
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return const _ShimmerBlock();
      },
      frameBuilder: (context, child, frame, wasSyncLoaded) {
        if (wasSyncLoaded || frame != null) {
          return AnimatedOpacity(
            opacity: frame == null ? 0 : 1,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            child: child,
          );
        }
        return const _ShimmerBlock();
      },
      errorBuilder: (context, error, stack) =>
          _Fallback(emoji: fallbackEmoji, seed: fallbackSeed.isEmpty ? url : fallbackSeed),
    );
  }
}

class _ShimmerBlock extends StatefulWidget {
  const _ShimmerBlock();

  @override
  State<_ShimmerBlock> createState() => _ShimmerBlockState();
}

class _ShimmerBlockState extends State<_ShimmerBlock> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) {
        final x = _c.value * 2 - 1;
        return DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment(-1 + x, -0.3),
              end: Alignment(1 + x, 0.3),
              colors: const [
                Color(0xFF1A1C22),
                Color(0xFF262A33),
                Color(0xFF1A1C22),
              ],
              stops: const [0.25, 0.5, 0.75],
            ),
          ),
        );
      },
    );
  }
}

class _Fallback extends StatelessWidget {
  const _Fallback({required this.emoji, required this.seed});

  final String? emoji;
  final String seed;

  @override
  Widget build(BuildContext context) {
    final hue = (seed.codeUnits.fold<int>(0, (a, b) => a + b) % 360).toDouble();
    final start = HSLColor.fromAHSL(1, hue, 0.45, 0.30).toColor();
    final end = HSLColor.fromAHSL(1, (hue + 32) % 360, 0.45, 0.20).toColor();
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [start, end],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: emoji == null
          ? const SizedBox.shrink()
          : Center(
              child: Text(emoji!, style: const TextStyle(fontSize: 30)),
            ),
    );
  }
}
