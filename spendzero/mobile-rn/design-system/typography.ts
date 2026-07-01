import { TextStyle } from "react-native";
import { colors } from "./colors";

/**
 * Typography primitives matching Lovable's `font-display` (Fraunces) /
 * `font-sans` (Inter) split and the exact px sizes used in `index.tsx`.
 * Tailwind's arbitrary `text-[Npx]` values map 1:1 to `fontSize: N`.
 */
export const fontFamily = {
  display: "Fraunces-Variable",
  sans: "Inter-Variable",
} as const;

export function display(
  size: number,
  opts: {
    weight?: TextStyle["fontWeight"];
    height?: number;
    letterSpacing?: number;
    color?: string;
    italic?: boolean;
  } = {},
): TextStyle {
  const { weight = "600", height, letterSpacing = -0.4, color = colors.foreground, italic = false } = opts;
  return {
    fontFamily: fontFamily.display,
    fontSize: size,
    fontWeight: weight,
    lineHeight: height ?? size * 1.05,
    letterSpacing,
    color,
    fontStyle: italic ? "italic" : "normal",
  };
}

export function sans(
  size: number,
  opts: {
    weight?: TextStyle["fontWeight"];
    height?: number;
    letterSpacing?: number;
    color?: string;
  } = {},
): TextStyle {
  const { weight = "400", height, letterSpacing = 0, color = colors.foreground } = opts;
  return {
    fontFamily: fontFamily.sans,
    fontSize: size,
    fontWeight: weight,
    lineHeight: height,
    letterSpacing,
    color,
  };
}

/** `text-[11px] uppercase tracking-[0.28em]` — eyebrow/overline labels. */
export function eyebrow(opts: {
  size?: number;
  trackingEm?: number;
  color?: string;
  weight?: TextStyle["fontWeight"];
} = {}): TextStyle {
  const { size = 11, trackingEm = 0.28, color = colors.mutedForeground, weight = "500" } = opts;
  return sans(size, { weight, letterSpacing: size * trackingEm, color });
}
