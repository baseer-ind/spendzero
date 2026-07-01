import React, { useState } from "react";
import { View, Text, Image, ImageSourcePropType, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors, whiteOpacity, blackOpacity, goldOpacity } from "../colors";
import { eyebrow, display, sans } from "../typography";
import { gradients } from "../gradients";
import { FallingPetals } from "./FallingPetals";
import { ProgressRing } from "./ProgressRing";
import { shadows } from "../shadows";

const HERO_H = 520;

/** Reproduces `index.tsx`'s `HeroDream`: a tall photo card with falling petals, top meta chip, bottom content (title, distance, ring, milestone bar). */
export function HeroDream({
  image,
  activeLabel,
  place,
  title,
  subtitle,
  distanceLabel,
  distanceValue,
  percent,
  milestones,
  activeMilestoneIndex,
  onPress,
}: {
  image?: ImageSourcePropType;
  activeLabel: string;
  place: string;
  title: string;
  subtitle: string;
  distanceLabel: string;
  distanceValue: string;
  percent: number;
  milestones: string[];
  activeMilestoneIndex: number;
  onPress?: () => void;
}) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48; // px-6 (24) each side
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.card, shadows.heroCard, pressed && { transform: [{ scale: 0.99 }] }]}
    >
      <View style={{ height: HERO_H, width: "100%" }}>
        {image && (
          <Image
            source={image}
            style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.1 }] }]}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={gradients.heroScrim.colors}
          locations={gradients.heroScrim.locations}
          style={StyleSheet.absoluteFill}
        />
        <FallingPetals />

        <View style={styles.topMeta}>
          <View style={styles.chip}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.chipContent}>
              <View style={styles.goldDot} />
              <Text style={eyebrow({ size: 10.5, trackingEm: 0.22, color: whiteOpacity(0.85) })}>
                {activeLabel}
              </Text>
            </View>
          </View>
          <View style={styles.iconBtn}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <Svg width={16} height={16} viewBox="0 0 24 24" style={{ position: "absolute", alignSelf: "center", top: 9 }}>
              <Path d="M7 17 17 7M9 7h8v8" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text style={eyebrow({ size: 11, trackingEm: 0.3, color: goldOpacity(0.9) })}>{place}</Text>
          <Text style={[display(34, { color: colors.foreground }), { marginTop: 8 }]}>{title}</Text>
          <Text style={[sans(13.5, { color: whiteOpacity(0.7) }), { marginTop: 12, maxWidth: cardWidth * 0.72 }]}>
            {subtitle}
          </Text>

          <View style={styles.distanceRow}>
            <View>
              <Text style={eyebrow({ size: 11, trackingEm: 0.22, color: whiteOpacity(0.55) })}>{distanceLabel}</Text>
              <Text style={[display(28, { color: colors.foreground }), { marginTop: 4 }]}>
                {distanceValue} <Text style={{ color: whiteOpacity(0.45), fontSize: 16 }}>away</Text>
              </Text>
            </View>
            <ProgressRing percent={percent} />
          </View>

          <View style={{ marginTop: 24 }}>
            <View style={styles.milestoneTrack}>
              <View style={[styles.milestoneFill, { width: `${Math.max(0, Math.min(100, percent))}%` }]}>
                <LinearGradient colors={["#D8B36A", "#F3DFA6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </View>
            </View>
            <View style={styles.milestoneLabels}>
              {milestones.map((m, i) => (
                <Text
                  key={m}
                  style={sans(11, { color: i === activeMilestoneIndex ? colors.gold : whiteOpacity(0.55) })}
                >
                  {m}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: whiteOpacity(0.1),
  },
  topMeta: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: whiteOpacity(0.15),
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: whiteOpacity(0.15),
  },
  bottomContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    paddingTop: 48,
  },
  distanceRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  milestoneTrack: {
    height: 3,
    width: "100%",
    borderRadius: 2,
    backgroundColor: whiteOpacity(0.1),
    overflow: "hidden",
  },
  milestoneFill: {
    height: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  milestoneLabels: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
