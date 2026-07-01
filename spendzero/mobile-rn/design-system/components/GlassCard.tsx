import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { colors, whiteOpacity } from "../colors";
import { radius } from "../spacing";

/** Generic surface card matching `bg-surface ring-1 ring-white/8 rounded-[22px]` used by IntentionalNudge / MomentumStrip. */
export function GlassCard({
  children,
  style,
  elevated = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: elevated ? "rgba(26,29,36,0.7)" : colors.surface },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: whiteOpacity(0.08),
    padding: 20,
  },
});
