import 'dart:io';

import 'package:flutter/widgets.dart';

/// Mobile/desktop: read a legacy on-device cover photo if it still exists.
ImageProvider? fileCoverProvider(String path) {
  final file = File(path);
  return file.existsSync() ? FileImage(file) : null;
}
