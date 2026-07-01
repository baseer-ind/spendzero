import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../colors";
import { display, eyebrow } from "../typography";

/** Minimal shared shell for screens not yet rebuilt from the Lovable source. */
export function PlaceholderScreen({ eyebrowLabel, title }: { eyebrowLabel: string; title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 24, paddingHorizontal: 24 }}>
      <Text style={eyebrow({ size: 11, trackingEm: 0.24 })}>{eyebrowLabel}</Text>
      <Text style={[display(28, { color: colors.foreground }), { marginTop: 8 }]}>{title}</Text>
    </View>
  );
}
