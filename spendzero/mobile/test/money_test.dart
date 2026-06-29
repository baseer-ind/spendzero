import 'package:flutter_test/flutter_test.dart';
import 'package:spendzero/core/utils/money.dart';

void main() {
  group('formatPaise', () {
    test('formats whole rupees with thousands separators', () {
      expect(formatPaise(420000), '₹4,200');
      expect(formatPaise(100), '₹1');
      expect(formatPaise(0), '₹0');
    });

    test('formats large amounts', () {
      expect(formatPaise(123456700), '₹1,234,567');
    });

    test('formats negative amounts', () {
      expect(formatPaise(-500), '-₹5');
    });
  });
}
