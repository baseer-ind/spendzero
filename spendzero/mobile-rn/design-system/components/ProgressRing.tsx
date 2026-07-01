import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedProps, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "../colors";
import { display } from "../typography";
import { motion } from "../motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Reproduces the hero-card SVG `ProgressRing`: r=28 in a 72x72 viewbox,
 * stroke 4, gold gradient stroke, draw-in animation (`animate-ring`,
 * 2.2s ease-out, stroke-dashoffset from full circumference to the percent
 * offset), centered percent label in Fraunces.
 */
export function ProgressRing({ percent, size = 72 }: { percent: number; size?: number }) {
  const r = (28 / 72) * size;
  const strokeWidth = (4 / 72) * size;
  const c = 2 * Math.PI * r;
  const targetOffset = c - (Math.max(0, Math.min(100, percent)) / 100) * c;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: motion.ringGrowDurationMs,
      easing: motion.ringGrowEasing,
    });
  }, [progress, percent]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c - progress.value * (c - targetOffset),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 72 72" style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={4} />
        <Defs>
          <LinearGradient id="ringGradient" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0%" stopColor="#F3DFA6" />
            <Stop offset="100%" stopColor={colors.gold} />
          </LinearGradient>
        </Defs>
        <AnimatedCircle
          cx={36}
          cy={36}
          r={28}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 28}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={display(15, { color: "#FFFFFF", height: 18 })}>{percent}%</Text>
      </View>
    </View>
  );
}
