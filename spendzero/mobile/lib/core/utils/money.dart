/// Formats paise as a rupee amount with thousands separators, e.g.
/// 420000 -> "₹4,200".
String formatPaise(int paise) {
  final rupees = paise ~/ 100;
  final digits = rupees.abs().toString();
  final buffer = StringBuffer();
  for (int i = 0; i < digits.length; i++) {
    final fromEnd = digits.length - i;
    if (i > 0 && fromEnd % 3 == 0) {
      buffer.write(',');
    }
    buffer.write(digits[i]);
  }
  return '${rupees < 0 ? '-' : ''}₹$buffer';
}
