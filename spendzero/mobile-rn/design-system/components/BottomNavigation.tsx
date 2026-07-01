import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors, whiteOpacity } from "../colors";
import { gradients } from "../gradients";
import { shadows } from "../shadows";
import { blur } from "../blur";

export type NavTab = "today" | "future" | "journey" | "me";

/**
 * Reproduces `index.tsx`'s `BottomNav`: a floating glass pill, centered,
 * max-width 380px, blurred translucent gradient background, ring border,
 * drop shadow, a gold dot under the active label, and a radial-gradient
 * "+" center action button that floats above the pill.
 */
export function BottomNavigation({
  active,
  onTabPress,
  onCenterPress,
}: {
  active: NavTab;
  onTabPress: (tab: NavTab) => void;
  onCenterPress: () => void;
}) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.constrain}>
        <View style={[styles.pillOuter, shadows.bottomNav]}>
          <BlurView intensity={blur.xl} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient colors={gradients.navGlass.colors} style={StyleSheet.absoluteFill} />
          <View style={styles.pillInner}>
            <NavItem label="Today" active={active === "today"} onPress={() => onTabPress("today")} />
            <NavItem label="Future" active={active === "future"} onPress={() => onTabPress("future")} />
            <CenterAction onPress={onCenterPress} />
            <NavItem label="Journey" active={active === "journey"} onPress={() => onTabPress("journey")} />
            <NavItem label="Me" active={active === "me"} onPress={() => onTabPress("me")} />
          </View>
        </View>
      </View>
    </View>
  );
}

function NavItem({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={styles.navItem}
    >
      <Text
        style={{
          fontFamily: "Inter-Variable",
          fontSize: 11,
          fontWeight: "500",
          letterSpacing: 1.98,
          color: active ? colors.foreground : "rgba(154,156,165,0.7)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <View style={styles.dotWrap}>{active && <View style={styles.dot} />}</View>
    </Pressable>
  );
}

function CenterAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [styles.centerAction, shadows.navCenterAction, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      <LinearGradient
        colors={gradients.navCenterAction.colors}
        locations={gradients.navCenterAction.locations as unknown as readonly [number, number, ...number[]]}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
      />
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d="M12 5v14M5 12h14" stroke={colors.background} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
  },
  constrain: {
    width: "100%",
    maxWidth: 380,
    paddingHorizontal: 16,
  },
  pillOuter: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: whiteOpacity(0.1),
  },
  pillInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  navItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  dotWrap: {
    height: 8,
    width: 4,
    marginTop: 6,
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  centerAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: whiteOpacity(0.4),
    overflow: "hidden",
  },
});
