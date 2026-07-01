import { ViewStyle } from "react-native";

/**
 * Box-shadow values reproduced from inline Lovable `boxShadow`/Tailwind
 * arbitrary `shadow-[...]` strings. React Native doesn't support multi-layer
 * CSS box-shadow or negative spread, so these are tuned approximations using
 * elevation + shadow* props that read the same visually.
 */
export const shadows = {
  /** `shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]` — hero dream card. */
  heroCard: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 18,
  } as ViewStyle,

  /** `shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]` — bottom nav pill. */
  bottomNav: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 14,
  } as ViewStyle,

  /** Bottom nav center action: `0 10px 30px -8px rgba(216,179,106,0.5)`. */
  navCenterAction: {
    shadowColor: "#D8B36A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
} as const;
