import { colors } from "./colors";

/** Gradients reproduced exactly from inline `style={{ background: ... }}` in the Lovable source. */
export const gradients = {
  /** Home ambient wash: radial(gold/10) top, radial(future/8) bottom-left. */
  ambientGold: "rgba(216,179,106,0.10)",
  ambientFuture: "rgba(77,163,255,0.08)",

  /** Hero image scrim: linear 180deg, bg 15% -> 25% (35%) -> 85% (78%) -> 98% (100%). */
  heroScrim: {
    colors: [
      "rgba(10,11,14,0.15)",
      "rgba(10,11,14,0.25)",
      "rgba(10,11,14,0.85)",
      "rgba(10,11,14,0.98)",
    ] as const,
    locations: [0, 0.35, 0.78, 1] as const,
  },

  /** Dream card scrim: linear 180deg, 5% -> 55% (60%) -> 95% (100%). */
  dreamCardScrim: {
    colors: ["rgba(10,11,14,0.05)", "rgba(10,11,14,0.55)", "rgba(10,11,14,0.95)"] as const,
    locations: [0, 0.6, 1] as const,
  },

  /** Gold progress fill: linear 90deg, gold -> #f3dfa6. */
  goldFill: { colors: [colors.gold, "#F3DFA6"] as const },

  /** Bottom nav center-action radial button. */
  navCenterAction: {
    colors: ["#F5E1AA", colors.gold, "#A8853D"] as const,
    locations: [0, 0.55, 1] as const,
  },

  /** Bottom nav glass background: linear 180deg surfaceElevated/85 -> surface/85. */
  navGlass: {
    colors: ["rgba(26,29,36,0.85)", "rgba(17,19,24,0.85)"] as const,
  },

  /** Weekly momentum bar: non-peak day fill. */
  momentumBarIdle: {
    colors: ["rgba(255,255,255,0.25)", "rgba(255,255,255,0.08)"] as const,
  },

  /** Weekly momentum bar: peak day fill. */
  momentumBarPeak: {
    colors: [colors.gold, "#B8923F"] as const,
  },

  /** `text-shimmer-gold`: gold-soft -> gold -> #fff3d6 -> gold -> gold-soft. */
  textShimmerGold: {
    colors: [colors.goldSoft, colors.gold, "#FFF3D6", colors.gold, colors.goldSoft] as const,
    locations: [0, 0.4, 0.5, 0.6, 1] as const,
  },
} as const;
