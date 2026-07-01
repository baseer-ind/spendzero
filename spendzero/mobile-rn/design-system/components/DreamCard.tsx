import React, { useState } from "react";
import { View, Text, Image, ImageSourcePropType, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { colors, whiteOpacity } from "../colors";
import { eyebrow, display, sans } from "../typography";
import { gradients } from "../gradients";
import { DreamAtmosphere } from "./DreamAtmosphere";

const CARD_W = 230;
const CARD_H = 300;

/** Reproduces `DreamCard` from `index.tsx`'s `CollectionRow`: a 230x300 image card with a bottom scrim, tag/title/amount/percent, and a thin gold progress bar. */
export function DreamCard({
  image,
  atmosphereSeed,
  tag,
  title,
  amount,
  percent,
  onPress,
}: {
  image?: ImageSourcePropType;
  atmosphereSeed?: string;
  tag: string;
  title: string;
  amount: string;
  percent: number;
  onPress?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.card, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      {image ? (
        <Image source={image} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <DreamAtmosphere seed={atmosphereSeed ?? title} width={CARD_W} height={CARD_H} />
        </View>
      )}
      <LinearGradient
        colors={gradients.dreamCardScrim.colors}
        locations={gradients.dreamCardScrim.locations}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={eyebrow({ size: 10, trackingEm: 0.22, color: whiteOpacity(0.6) })}>{tag}</Text>
        <Text style={[display(20, { color: "#FFFFFF" }), { marginTop: 4 }]}>{title}</Text>
        <View style={styles.row}>
          <Text style={sans(12, { color: whiteOpacity(0.7) })}>{amount} to go</Text>
          <Text style={sans(11, { color: colors.gold })}>{percent}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, percent))}%` }]}>
            <LinearGradient colors={gradients.goldFill.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Reproduces `AddDreamCard`: dashed-border ghost button, 160x300. */
export function AddDreamCard({ onPress }: { onPress?: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.addCard, pressed && { borderColor: whiteOpacity(0.3) }]}
    >
      <View style={styles.addCircle}>
        <Text style={display(20, { color: "rgba(154,156,165,0.55)" })}>+</Text>
      </View>
      <Text style={[eyebrow({ size: 12, trackingEm: 0.18, color: "rgba(154,156,165,0.55)" }), { marginTop: 12 }]}>
        NEW FUTURE
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: whiteOpacity(0.1),
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  row: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barTrack: {
    marginTop: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: whiteOpacity(0.1),
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  addCard: {
    width: 160,
    height: CARD_H,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: whiteOpacity(0.15),
    alignItems: "center",
    justifyContent: "center",
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(154,156,165,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
