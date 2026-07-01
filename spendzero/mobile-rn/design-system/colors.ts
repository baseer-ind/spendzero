/**
 * Exact color tokens from the Lovable "Future_You" source
 * (`src/styles.css` `:root`), converted from oklch to sRGB hex.
 * This is the single source of truth for color in the app — do not
 * introduce new colors outside this file.
 */
export const colors = {
  background: "#0A0B0E",
  foreground: "#F7F6F2",
  surface: "#111318",
  surfaceElevated: "#1A1D24",
  card: "#111318",
  cardForeground: "#F7F6F2",
  popover: "#111318",

  primary: "#F7F6F2",
  primaryForeground: "#0A0B0E",
  secondary: "#1A1D24",
  secondaryForeground: "#F7F6F2",
  muted: "#1A1D24",
  mutedForeground: "#9A9CA5",
  accent: "#1A1D24",
  accentForeground: "#F7F6F2",

  /** Champagne gold #D8B36A. */
  gold: "#D8B36A",
  goldSoft: "#E8CC94",

  /** Electric blue #4DA3FF — "future" accent. */
  future: "#4DA3FF",

  destructive: "#E25540",
  destructiveForeground: "#FAFAFA",

  /** white @ 8% — card/input borders. */
  border: "rgba(255,255,255,0.08)",
  input: "rgba(255,255,255,0.12)",
  ring: "rgba(216,179,106,0.6)",
} as const;

export function withOpacity(hex: string, opacity: number): string {
  const sanitized = hex.replace("#", "");
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export const foregroundOpacity = (o: number) => withOpacity(colors.foreground, o);
export const whiteOpacity = (o: number) => `rgba(255,255,255,${o})`;
export const blackOpacity = (o: number) => `rgba(0,0,0,${o})`;
export const goldOpacity = (o: number) => withOpacity(colors.gold, o);
export const mutedForegroundOpacity = (o: number) => withOpacity(colors.mutedForeground, o);
