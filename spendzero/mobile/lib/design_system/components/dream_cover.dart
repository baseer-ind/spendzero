import 'dart:io';
import 'package:flutter/material.dart';

import 'dream_atmosphere.dart';

/// A selectable cover photo for a dream. `assetKey` addresses a bundled
/// image; `label` is what the user sees in the picker.
class DreamCoverOption {
  const DreamCoverOption(this.key, this.label, this.asset);

  final String key;
  final String label;
  final String asset;
}

/// The curated set of bundled cover photos a user can choose from when
/// creating a dream. Stored on the goal's `imageSeed` as `asset:<key>`.
const dreamCoverOptions = <DreamCoverOption>[
  DreamCoverOption('travel', 'Travel', 'assets/images/covers/travel.jpg'),
  DreamCoverOption('home', 'Home', 'assets/images/covers/home.jpg'),
  DreamCoverOption('tech', 'Tech', 'assets/images/covers/tech.jpg'),
  DreamCoverOption('growth', 'Growth', 'assets/images/covers/growth.jpg'),
  DreamCoverOption('adventure', 'Adventure', 'assets/images/covers/adventure.jpg'),
  DreamCoverOption('experience', 'Experience', 'assets/images/covers/experience.jpg'),
];

DreamCoverOption? _coverForKey(String key) {
  for (final o in dreamCoverOptions) {
    if (o.key == key) return o;
  }
  return null;
}

/// Resolves a goal's cover reference (stored in `imageSeed`) to a widget:
///   `asset:<key>` -> a bundled cover photo
///   `file:<path>` -> a user-picked photo from their gallery
///   anything else / null -> the procedural [DreamAtmosphere] fallback,
/// keyed by [fallbackSeed] so photo-free dreams still look art-directed.
/// A bottom scrim is layered over photos so overlaid text stays legible.
class DreamCover extends StatelessWidget {
  const DreamCover({super.key, required this.imageRef, required this.fallbackSeed});

  final String? imageRef;
  final String fallbackSeed;

  @override
  Widget build(BuildContext context) {
    final ref = imageRef;
    Widget? image;

    if (ref != null && ref.startsWith('asset:')) {
      final opt = _coverForKey(ref.substring(6));
      if (opt != null) {
        image = Image.asset(opt.asset, fit: BoxFit.cover);
      }
    } else if (ref != null && ref.startsWith('file:')) {
      final path = ref.substring(5);
      if (File(path).existsSync()) {
        image = Image.file(File(path), fit: BoxFit.cover);
      }
    }

    if (image == null) {
      return DreamAtmosphere(seed: fallbackSeed);
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        image,
        // Scrim so title/amount text over the photo stays readable.
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0x14000000), Color(0x80000000), Color(0xE60A0B0E)],
              stops: [0.0, 0.55, 1.0],
            ),
          ),
        ),
      ],
    );
  }
}
