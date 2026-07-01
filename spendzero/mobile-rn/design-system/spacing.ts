/**
 * Radius + spacing scale from Lovable `--radius: 1.25rem` (20px) base:
 * sm = radius-4, md = radius-2, lg = radius, xl = radius+4, 2xl = radius+8,
 * 3xl = radius+12 (Tailwind `@theme inline` block in `styles.css`).
 */
export const radius = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  /** Bottom-sheet handle radius used across the reference (top corners). */
  sheet: 28,
} as const;

/**
 * Tailwind spacing scale (`px-N` = N * 4px) used verbatim across the
 * Lovable routes — keep numeric Tailwind units here so screen code can
 * read `space.x6` the same way the source reads `px-6`.
 */
export const space = {
  x0_5: 2,
  x1: 4,
  x1_5: 6,
  x2: 8,
  x2_5: 10,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x7: 28,
  x9: 36,
  x10: 40,
  x12: 48,
  x36: 144,
} as const;
