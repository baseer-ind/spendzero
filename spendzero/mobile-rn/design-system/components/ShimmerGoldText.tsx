import React, { useEffect } from "react";
import { Text, TextStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, Easing } from "react-native-reanimated";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { motion } from "../motion";
import { gradients } from "../gradients";

const AnimatedLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

/**
 * Reproduces `.text-shimmer-gold`: a gold gradient sweeping across the text
 * fill, looping every 6s linearly, `background-size: 200% 100%`
 * (`background-position: -200% 0 -> 200% 0`).
 *
 * Implemented as an SVG text with an animated gradient fill — RN has no
 * background-clip:text, so we render the glyphs directly inside the SVG.
 */
export function ShimmerGoldText({
  text,
  style,
  width = 260,
  height,
}: {
  text: string;
  style: TextStyle;
  width?: number;
  height?: number;
}) {
  const t = useSharedValue(0);
  const fontSize = (style.fontSize as number) ?? 28;
  const h = height ?? fontSize * 1.3;

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: motion.shimmerDurationMs, easing: Easing.linear }), -1, false);
  }, [t]);

  const animatedProps = useAnimatedProps(() => {
    const x1 = -200 + t.value * 400;
    return { x1: `${x1}%`, x2: `${x1 + 200}%` } as any;
  });

  return (
    <Svg width={width} height={h}>
      <Defs>
        <AnimatedLinearGradient id="shimmer" y1="0%" y2="0%" animatedProps={animatedProps}>
          {gradients.textShimmerGold.colors.map((c, i) => (
            <Stop key={i} offset={gradients.textShimmerGold.locations[i]} stopColor={c} />
          ))}
        </AnimatedLinearGradient>
      </Defs>
      <SvgText
        x="0"
        y={h * 0.78}
        fontSize={fontSize}
        fontFamily={style.fontFamily}
        fontStyle={style.fontStyle as any}
        fontWeight={style.fontWeight as any}
        fill="url(#shimmer)"
      >
        {text}
      </SvgText>
    </Svg>
  );
}

/** Plain (non-shimmering) fallback for environments where SVG text metrics misbehave. */
export function StaticGoldText({ text, style }: { text: string; style: TextStyle }) {
  return <Text style={[style, { color: "#D8B36A" }]}>{text}</Text>;
}
