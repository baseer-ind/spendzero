import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

const introSeenKey = 'spendzero_seen_intro';

/// First-launch-only framing of the core loop — "skip a craving, fund a
/// dream" — shown once before the home grid, so new users understand the
/// point of the app before they start browsing, instead of landing cold on
/// a grid of categories.
class IntroScreen extends StatefulWidget {
  const IntroScreen({super.key});

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroPage {
  const _IntroPage({required this.emoji, required this.title, required this.body});
  final String emoji;
  final String title;
  final String body;
}

const _pages = [
  _IntroPage(
    emoji: '🛍️',
    title: 'Skip a craving,\nfund a dream',
    body: 'Browse fictional apps the way you normally would. Every time you '
        'walk away instead of buying, that amount counts as saved.',
  ),
  _IntroPage(
    emoji: '🧾',
    title: 'Shop freely.\nNothing ever charges you.',
    body: 'Add to cart, check out, feel the moment — it\'s all simulated. '
        'No real money, no real accounts, ever.',
  ),
  _IntroPage(
    emoji: '🎯',
    title: 'Watch your dream\nget closer',
    body: 'Set something you\'re actually saving for. Every skipped craving '
        'moves the needle — and you\'ll want to come back and check.',
  ),
];

class _IntroScreenState extends State<IntroScreen> {
  final _controller = PageController();
  int _page = 0;

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(introSeenKey, true);
    if (mounted) context.go('/');
  }

  void _next() {
    if (_page == _pages.length - 1) {
      _finish();
      return;
    }
    HapticFeedback.selectionClick();
    _controller.nextPage(duration: const Duration(milliseconds: 320), curve: Curves.easeOutCubic);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final isLast = _page == _pages.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: TextButton(
                  onPressed: _finish,
                  child: const Text('Skip'),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _page = i),
                itemBuilder: (context, index) {
                  final page = _pages[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(page.emoji, style: const TextStyle(fontSize: 72)),
                        const SizedBox(height: 28),
                        Text(
                          page.title,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          page.body,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: colors.onSurfaceVariant,
                              ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _pages.length,
                (i) => AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: i == _page ? 20 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: i == _page ? colors.primary : colors.outlineVariant,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _next,
                  child: Text(isLast ? 'Get started' : 'Next'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
