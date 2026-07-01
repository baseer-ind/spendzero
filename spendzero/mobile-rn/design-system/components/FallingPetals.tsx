import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate, Extrapolation } from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { motion } from "../motion";

/**
 * Reproduces `Petals`/`animate-petal`: 9 small radial-gradient circles
 * falling top-to-bottom with rotation, looping 12-20s each, staggered
 * delays — deterministic per-index timing exactly matching the CSS
 * `@keyframes float-petal` in styles.css.
 */
export function FallingPetals({ count = 9 }: { count?: number }) {
  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Petal key={i} index={i} />
      ))}
    </Animated.View>
  );
}

function Petal({ index }: { index: number }) {
  const left = ((index * 11 + 7) % 100) / 100;
  const delay = motion.petalDelaySeconds(index);
  const dur = motion.petalDurationSeconds(index);
  const size = 6 + ((index * 3) % 5);

  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: dur * 1000, easing: Easing.linear }),
      -1,
      false,
    );
    // Apply the per-petal start delay by offsetting the shared value's
    // starting phase via an initial timing call.
  }, [t, dur]);

  const animatedStyle = useAnimatedStyle(() => {
    // shift the 0..1 cycle by `delay` seconds worth of phase
    const phase = ((t.value * dur + delay) % dur) / dur;
    const translateY = interpolate(phase, [0, 1], [-0.1, 1.1], Extrapolation.CLAMP) * 320;
    const translateX = phase * 40;
    const rotate = phase * 360;
    const opacity =
      phase < 0.1
        ? interpolate(phase, [0, 0.1], [0, 0.8], Extrapolation.CLAMP)
        : phase > 0.9
          ? interpolate(phase, [0.9, 1], [0.8, 0], Extrapolation.CLAMP)
          : 0.7;
    return {
      position: "absolute",
      left: `${left * 100}%`,
      top: 0,
      opacity,
      transform: [{ translateY }, { translateX }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`petal-${index}`} cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFD2E0" />
            <Stop offset="70%" stopColor="#E89BB4" />
            <Stop offset="71%" stopColor="#E89BB4" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#petal-${index})`} />
      </Svg>
    </Animated.View>
  );
}
