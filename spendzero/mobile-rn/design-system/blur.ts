/** Backdrop-blur intensities matching Tailwind's `backdrop-blur-*` scale and the explicit `backdrop-filter: blur(20px)` on the bottom nav. expo-blur's `intensity` is 0-100, not a sigma — tuned to look equivalent. */
export const blur = {
  md: 40, // backdrop-blur-md (status chips)
  xl: 70, // backdrop-blur-xl / explicit blur(20px) on nav
} as const;
