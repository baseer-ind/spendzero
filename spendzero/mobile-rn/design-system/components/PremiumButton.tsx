import React, { useState } from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

/** A pressable wrapper with consistent scale-down press feedback + selection haptic, used wherever the Lovable mock has a custom interactive element (no default RN Button chrome). */
export function PremiumButton({
  onPress,
  children,
  style,
  haptic = "selection",
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  haptic?: "light" | "medium" | "selection";
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        if (haptic === "selection") Haptics.selectionAsync();
        else Haptics.impactAsync(haptic === "light" ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[style, pressed && { transform: [{ scale: 0.96 }] }]}
    >
      {children}
    </Pressable>
  );
}
