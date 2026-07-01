import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect, Path, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { colors, whiteOpacity, goldOpacity, mutedForegroundOpacity, foregroundOpacity } from "../design-system/colors";
import { eyebrow, display, sans } from "../design-system/typography";
import { gradients } from "../design-system/gradients";
import { space } from "../design-system/spacing";
import { motion } from "../design-system/motion";
import { formatPaise } from "../lib/money";
import { goalProgress } from "../lib/models";
import { useHomeData } from "../lib/useHomeData";

import { RiseIn } from "../design-system/components/RiseIn";
import { HeroDream } from "../design-system/components/HeroDream";
import { DreamCard, AddDreamCard } from "../design-system/components/DreamCard";
import { GlassCard } from "../design-system/components/GlassCard";
import { BottomNavigation, NavTab, TAB_ROUTES } from "../design-system/components/BottomNavigation";
import { ShimmerGoldText } from "../design-system/components/ShimmerGoldText";

const kyotoHero = require("../assets/images/kyoto-hero.jpg");
const dreamHome = require("../assets/images/dream-home.jpg");
const dreamMacbook = require("../assets/images/dream-macbook.jpg");

const MILESTONES = ["Visa", "Flights", "Stays", "Sakura"];
const WEEK_HEIGHTS = [34, 52, 28, 70, 44, 88, 62];
const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { goals, stats } = useHomeData();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<NavTab>("today");

  const onTabPress = (tab: NavTab) => {
    setActiveTab(tab);
    router.push(TAB_ROUTES[tab]);
  };

  const topDream = goals.find((g) => !g.archived && goalProgress(g) < 1) ?? goals[0];
  const percent = topDream ? Math.round(goalProgress(topDream) * 100) : 72;
  const remainingPaise = topDream ? topDream.targetPaise - topDream.savedPaise : 2850000;
  const otherDreams = goals.filter((g) => g.id !== topDream?.id && !g.archived);

  const totalSaved = stats?.totalAmountNotSpentPaise ?? 0;
  const streak = stats?.currentStreakDays ?? 7;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ambient gradient wash */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.ambientGold, { backgroundColor: gradients.ambientGold }]} />
        <View style={[styles.ambientFuture, { backgroundColor: gradients.ambientFuture }]} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 144 }}
        showsVerticalScrollIndicator={false}
      >
        <DeviceStatusBar topInset={insets.top} />
        <TopBar />

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Greeting />

          <View style={{ marginTop: 0 }}>
            <RiseIn delayMs={motion.riseDelayHero}>
              <HeroDream
                image={kyotoHero}
                activeLabel="Active Dream · 01 / 04"
                place="Kyoto, Japan"
                title={topDream?.title ?? "My Japan Trip"}
                subtitle="Sakura season opens in 127 days. Every intentional choice brings it closer."
                distanceLabel="Distance to Tokyo"
                distanceValue={formatPaise(remainingPaise)}
                percent={percent}
                milestones={MILESTONES}
                activeMilestoneIndex={2}
                // TODO: no dedicated dream-detail route exists yet (task #26)
                // — navigate to the Future tab as the closest reasonable
                // destination until a per-dream detail screen is built.
                onPress={() => router.push("/future")}
              />
            </RiseIn>
          </View>

          <RiseIn delayMs={motion.riseDelayNudge}>
            <IntentionalNudge />
          </RiseIn>

          <RiseIn delayMs={motion.riseDelayCollection}>
            <CollectionRow otherDreams={otherDreams} dreamHome={dreamHome} dreamMacbook={dreamMacbook} />
          </RiseIn>

          <RiseIn delayMs={motion.riseDelayMomentum}>
            <MomentumStrip totalSaved={totalSaved} streak={streak} />
          </RiseIn>

          <RiseIn delayMs={motion.riseDelayWhisper}>
            <Whisper />
          </RiseIn>
        </View>
      </ScrollView>

      <BottomNavigation
        active={activeTab}
        onTabPress={onTabPress}
        onCenterPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
    </View>
  );
}

/* ───────────────────────── Components ───────────────────────── */

function DeviceStatusBar({ topInset }: { topInset: number }) {
  return (
    <View style={[styles.statusBar, { paddingTop: topInset + 4 }]}>
      <Text style={sans(12, { weight: "500", color: foregroundOpacity(0.8) })}>9:41</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, opacity: 0.8 }}>
        <Signal />
        <Wifi />
        <Battery />
      </View>
    </View>
  );
}

function TopBar() {
  const router = useRouter();
  return (
    <View style={styles.topBar}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={styles.avatarF}>
          <Text style={display(15, { color: colors.gold })}>f</Text>
        </View>
        <View>
          <Text style={eyebrow({ size: 11, trackingEm: 0.22 })}>Project Future</Text>
          <Text style={sans(13, { color: foregroundOpacity(0.9) })}>Tuesday, June 30</Text>
        </View>
      </View>
      <Pressable style={styles.avatarA} onPress={() => router.push("/profile")}>
        <Text style={display(14, { color: foregroundOpacity(0.8) })}>A</Text>
      </Pressable>
    </View>
  );
}

function Greeting() {
  return (
    <RiseIn delayMs={motion.riseDelayGreeting}>
      <View style={{ paddingTop: 40, paddingBottom: 28 }}>
        <Text style={eyebrow({ size: 12, trackingEm: 0.28 })}>Good evening, Aarav</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={display(40, { color: colors.foreground, height: 42 })}>
            {"The future you’re"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
            <ShimmerGoldText
              text="building"
              style={{ ...display(40, { italic: true }), color: colors.gold }}
              height={42}
              width={200}
            />
            <Text style={display(40, { color: colors.foreground, height: 42 })}>{" is closer today."}</Text>
          </View>
        </View>
      </View>
    </RiseIn>
  );
}

function IntentionalNudge() {
  return (
    <GlassCard style={{ marginTop: 28 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
        <View style={styles.nudgeIcon}>
          <Text style={display(16, { color: colors.gold })}>✦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={eyebrow({ size: 11, trackingEm: 0.24, color: colors.gold })}>Today&apos;s intention</Text>
          <Text style={[sans(15, { color: foregroundOpacity(0.9), height: 21 }), { marginTop: 6 }]}>
            You felt a craving for sushi at 8:14 PM.{" "}
            <Text style={{ color: mutedForegroundOpacity(0.55) }}>
              You chose Kyoto instead. <Text style={{ color: colors.gold }}>+₹420</Text> toward sakura.
            </Text>
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function CollectionRow({
  otherDreams,
  dreamHome,
  dreamMacbook,
}: {
  otherDreams: ReturnType<typeof useHomeData>["goals"];
  dreamHome: any;
  dreamMacbook: any;
}) {
  const hasRealData = otherDreams.length > 0;
  const router = useRouter();
  return (
    <View style={{ marginTop: 40 }}>
      <View style={styles.collectionHeader}>
        <View>
          <Text style={eyebrow({ size: 11, trackingEm: 0.24 })}>Your collection</Text>
          <Text style={[display(22, { color: colors.foreground }), { marginTop: 4 }]}>Other futures</Text>
        </View>
        <Pressable onPress={() => router.push("/future")}>
          <Text style={sans(12, { color: goldOpacity(0.9) })}>View all</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 8 }}>
        {hasRealData ? (
          otherDreams.map((d) => (
            <DreamCard
              key={d.id}
              atmosphereSeed={d.title}
              tag={d.category}
              title={d.title}
              amount={formatPaise(d.targetPaise - d.savedPaise)}
              percent={Math.round(goalProgress(d) * 100)}
            />
          ))
        ) : (
          <>
            <DreamCard image={dreamHome} tag="Mumbai · 2029" title="My Dream Home" amount="₹18.4L" percent={31} />
            <DreamCard image={dreamMacbook} tag="Studio · This year" title="The MacBook" amount="₹1.2L" percent={64} />
          </>
        )}
        <AddDreamCard />
      </ScrollView>
    </View>
  );
}

function MomentumStrip({ totalSaved, streak }: { totalSaved: number; streak: number }) {
  return (
    <GlassCard elevated style={{ marginTop: 40 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text style={eyebrow({ size: 11, trackingEm: 0.24 })}>This week</Text>
          <Text style={[display(22, { color: colors.foreground }), { marginTop: 4 }]}>
            {streak} intentional days <Text style={sans(14, { color: foregroundOpacity(0.4) })}>in a row</Text>
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <ShimmerGoldText
            text={`+${formatPaise(totalSaved || 482000)}`}
            style={display(22, { color: colors.gold })}
            height={28}
            width={140}
          />
          <Text style={sans(11, { color: mutedForegroundOpacity(1) })}>toward dreams</Text>
        </View>
      </View>

      <View style={styles.weekBars}>
        {WEEK_HEIGHTS.map((h, i) => (
          <View key={i} style={[styles.weekBarTrack, { height: 48 }]}>
            <View style={[styles.weekBarFill, { height: `${h}%` }]}>
              {i === 5 ? (
                <LinearGradient colors={["#D8B36A", "#B8923F"]} style={StyleSheet.absoluteFill} />
              ) : (
                <LinearGradient colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.08)"]} style={StyleSheet.absoluteFill} />
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.weekLabels}>
        {WEEK_LABELS.map((d, i) => (
          <Text key={i} style={eyebrow({ size: 10, trackingEm: 0.18, color: mutedForegroundOpacity(0.7) })}>
            {d}
          </Text>
        ))}
      </View>
    </GlassCard>
  );
}

function Whisper() {
  return (
    <Text style={[display(15, { color: mutedForegroundOpacity(0.8), italic: true }), styles.whisper]}>
      &quot;One more intentional day.&quot;
    </Text>
  );
}

/* tiny iconography */
function Signal() {
  return (
    <Svg width={14} height={10} viewBox="0 0 16 10" fill={colors.foreground}>
      <Rect x={0} y={7} width={2} height={3} rx={0.5} />
      <Rect x={4} y={5} width={2} height={5} rx={0.5} />
      <Rect x={8} y={2.5} width={2} height={7.5} rx={0.5} />
      <Rect x={12} y={0} width={2} height={10} rx={0.5} />
    </Svg>
  );
}
function Wifi() {
  return (
    <Svg width={14} height={12} viewBox="0 0 16 12" fill={colors.foreground}>
      <Path d="M8 11.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM2.5 5.5a8 8 0 0 1 11 0l-1.4 1.4a6 6 0 0 0-8.2 0L2.5 5.5Zm2.7 2.7a4.2 4.2 0 0 1 5.6 0L9.4 9.6a2.2 2.2 0 0 0-2.8 0L5.2 8.2Z" />
    </Svg>
  );
}
function Battery() {
  return (
    <Svg width={24} height={12} viewBox="0 0 26 12" fill="none">
      <Rect x={0.5} y={0.5} width={22} height={11} rx={2.5} stroke={colors.foreground} opacity={0.6} />
      <Rect x={2} y={2} width={18} height={8} rx={1.5} fill={colors.foreground} />
      <Rect x={24} y={4} width={2} height={4} rx={1} fill={colors.foreground} opacity={0.6} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  ambientGold: {
    position: "absolute",
    top: -80,
    left: -40,
    right: -40,
    height: 360,
    borderRadius: 999,
  },
  ambientFuture: {
    position: "absolute",
    bottom: 200,
    left: -100,
    width: 320,
    height: 240,
    borderRadius: 999,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  avatarF: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: whiteOpacity(0.1),
  },
  avatarA: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: whiteOpacity(0.1),
  },
  nudgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: goldOpacity(0.08),
    borderWidth: 1,
    borderColor: goldOpacity(0.3),
    marginTop: 2,
  },
  collectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  weekBars: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 48,
  },
  weekBarTrack: {
    flex: 1,
    justifyContent: "flex-end",
  },
  weekBarFill: {
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  weekLabels: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  whisper: {
    marginTop: 40,
    textAlign: "center",
  },
});
