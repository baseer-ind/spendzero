import { Easing } from "react-native-reanimated";

/** Motion vocabulary lifted verbatim from `styles.css` keyframes. */
export const motion = {
  /** `animate-rise`: fade + translateY(14px), 0.9s, cubic-bezier(.2,.7,.2,1). */
  riseDurationMs: 900,
  riseEasing: Easing.bezier(0.2, 0.7, 0.2, 1),
  riseTranslateY: 14,

  /** Stagger delays used by Home sections (`animationDelay`), in ms. */
  riseDelayGreeting: 0,
  riseDelayHero: 120,
  riseDelayNudge: 240,
  riseDelayCollection: 340,
  riseDelayMomentum: 440,
  riseDelayWhisper: 560,

  /** `text-shimmer-gold` sweep, 6s linear infinite. */
  shimmerDurationMs: 6000,

  /** `animate-ring`: stroke draws in, 2.2s ease-out. */
  ringGrowDurationMs: 2200,
  ringGrowEasing: Easing.out(Easing.cubic),

  /** `animate-petal`: 12-20s linear infinite fall + rotate (per-petal dur). */
  petalDurationSeconds: (i: number) => 12 + ((i * 7) % 8),
  petalDelaySeconds: (i: number) => (i * 1.3) % 14,
} as const;
