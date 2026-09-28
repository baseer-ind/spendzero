import 'package:flutter/widgets.dart';

/// Web: there's no local filesystem, so legacy `file:` covers can't be read.
/// The caller falls back to the procedural atmosphere in that case.
ImageProvider? fileCoverProvider(String path) => null;
