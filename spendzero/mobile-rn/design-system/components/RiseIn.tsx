import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { motion } from "../motion";

/**
 * Reproduces `animate-rise`: fade + translateY(14px) entrance, played once
 * on mount with an optional stagger delay (matches `animationDelay` in ms
 * on each Home section in index.tsx).
 */
export function RiseIn({
  children,
  delayMs = 0,
  style,
}: {
  children: React.ReactNode;
  delayMs?: number;
  style?: any;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: motion.riseDurationMs, easing: motion.riseEasing }),
    );
  }, [delayMs, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * motion.riseTranslateY }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
