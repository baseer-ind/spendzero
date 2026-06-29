/// Formats paise as a rupee amount using Indian digit grouping (lakh/crore),
/// e.g. 150000 -> "₹1,50,000", not the Western "₹150,000".
String formatPaise(int paise) {
  final rupees = paise ~/ 100;
  final digits = rupees.abs().toString();
  String grouped;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    final last3 = digits.substring(digits.length - 3);
    final rest = digits.substring(0, digits.length - 3);
    final restGroups = <String>[];
    for (int i = rest.length; i > 0; i -= 2) {
      final start = i - 2 < 0 ? 0 : i - 2;
      restGroups.insert(0, rest.substring(start, i));
    }
    grouped = '${restGroups.join(',')},$last3';
  }
  return '${rupees < 0 ? '-' : ''}₹$grouped';
}
