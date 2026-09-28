// Resolves a legacy `file:<path>` dream cover to an ImageProvider.
//
// Newly picked covers are stored inline as base64 (`data:` refs) so they work
// identically on every platform. This helper only exists for covers saved by
// older mobile builds as on-device file paths — which can't be read on web.
// Conditional import keeps `dart:io` out of the web build entirely.
export 'cover_file_io.dart' if (dart.library.html) 'cover_file_web.dart';
