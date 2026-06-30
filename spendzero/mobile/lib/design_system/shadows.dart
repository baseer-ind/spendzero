import 'package:flutter/widgets.dart';

/// Box-shadow values reproduced from inline Lovable `boxShadow`/Tailwind
/// arbitrary `shadow-[...]` strings.
class DSShadows {
  DSShadows._();

  /// `shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]` — hero dream card.
  static const List<BoxShadow> heroCard = [
    BoxShadow(
      color: Color(0xCC000000),
      offset: Offset(0, 30),
      blurRadius: 80,
      spreadRadius: -30,
    ),
  ];

  /// `shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]` — bottom nav pill.
  static const List<BoxShadow> bottomNav = [
    BoxShadow(
      color: Color(0xE6000000),
      offset: Offset(0, 20),
      blurRadius: 50,
      spreadRadius: -20,
    ),
  ];

  /// Bottom nav center action: `0 10px 30px -8px rgba(216,179,106,0.5)`
  /// plus an inset highlight ring (approximated as a second soft shadow).
  static const List<BoxShadow> navCenterAction = [
    BoxShadow(
      color: Color(0x80D8B36A),
      offset: Offset(0, 10),
      blurRadius: 30,
      spreadRadius: -8,
    ),
  ];
}
