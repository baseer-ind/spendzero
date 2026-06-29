import 'package:flutter_test/flutter_test.dart';
import 'package:spendzero/core/utils/money.dart';

void main() {
  group('formatPaise', () {
    test('formats whole rupees with thousands separators', () {
      expect(formatPaise(420000), '₹4,200');
      expect(formatPaise(100), '₹1');
      expect(formatPaise(0), '₹0');
    });

    test('formats large amounts using Indian digit grouping', () {
      expect(formatPaise(123456700), '₹12,34,567');
      expect(formatPaise(15000000), '₹1,50,000');
      expect(formatPaise(10000000), '₹1,00,000');
      expect(formatPaise(9999900), '₹99,999');
    });

    test('formats negative amounts', () {
      expect(formatPaise(-500), '-₹5');
    });
  });
}
