import React from "react";
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle } from "react-native-svg";
import { colors } from "../colors";

/**
 * There is no bundled photography per user-created dream (titles are free
 * text — "My Japan Trip", "The MacBook" — so we can't ship a stock photo
 * per dream the way the Lovable mock can for its two fixed examples). This
 * paints a deterministic, dream-specific atmospheric gradient + glow-bloom +
 * vignette field instead of a flat placeholder color box, mirroring
 * mobile/lib/design_system/components/dream_atmosphere.dart conceptually.
 */
const PALETTES: [string, string, string][] = [
  ["#2A1E3D", "#4A2F5C", "#D8B36A"],
  ["#12222E", "#1F3B4D", "#4DA3FF"],
  ["#2E1A1A", "#4A2A23", "#E8CC94"],
  ["#12241F", "#1E3A30", "#D8B36A"],
  ["#231830", "#3C2750", "#8C9EFF"],
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic pseudo-random generator (mulberry32) seeded from a hash. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DreamAtmosphere({
  seed,
  width,
  height,
}: {
  seed: string;
  width: number;
  height: number;
}) {
  const hash = hashString(seed);
  const palette = PALETTES[hash % PALETTES.length];
  const rng = mulberry32(hash);
  const glows = Array.from({ length: 5 }).map(() => ({
    cx: rng() * width,
    cy: rng() * height * 0.7,
    r: Math.min(width, height) * (0.25 + rng() * 0.3),
  }));

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`base-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette[0]} />
          <Stop offset="100%" stopColor={palette[1]} />
        </LinearGradient>
        {glows.map((g, i) => (
          <RadialGradient key={i} id={`glow-${hash}-${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={palette[2]} stopOpacity={0.22} />
            <Stop offset="100%" stopColor={palette[2]} stopOpacity={0} />
          </RadialGradient>
        ))}
        <RadialGradient id={`vignette-${hash}`} cx="50%" cy="50%" r="65%">
          <Stop offset="0%" stopColor={colors.background} stopOpacity={0} />
          <Stop offset="100%" stopColor={colors.background} stopOpacity={0.55} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#base-${hash})`} />
      {glows.map((g, i) => (
        <Circle key={i} cx={g.cx} cy={g.cy} r={g.r} fill={`url(#glow-${hash}-${i})`} />
      ))}
      <Rect x={0} y={0} width={width} height={height} fill={`url(#vignette-${hash})`} />
    </Svg>
  );
}
