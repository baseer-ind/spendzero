/**
 * Formats paise as a rupee amount using Indian digit grouping (lakh/crore),
 * e.g. 150000 -> "₹1,50,000", not the Western "₹150,000".
 * Ported 1:1 from mobile/lib/core/utils/money.dart.
 */
export function formatPaise(paise: number): string {
  const rupees = Math.trunc(paise / 100);
  const digits = Math.abs(rupees).toString();
  let grouped: string;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    const restGroups: string[] = [];
    for (let i = rest.length; i > 0; i -= 2) {
      const start = Math.max(i - 2, 0);
      restGroups.unshift(rest.slice(start, i));
    }
    grouped = `${restGroups.join(",")},${last3}`;
  }
  return `${rupees < 0 ? "-" : ""}₹${grouped}`;
}
