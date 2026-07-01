import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../design-system/colors";
import { PlaceholderScreen } from "../design-system/components/PlaceholderScreen";
import { BottomNavigation, NavTab, TAB_ROUTES } from "../design-system/components/BottomNavigation";
import * as Haptics from "expo-haptics";

export default function Journey() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<NavTab>("journey");

  const onTabPress = (tab: NavTab) => {
    setActiveTab(tab);
    router.push(TAB_ROUTES[tab]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PlaceholderScreen eyebrowLabel="Your path" title="Journey" />
      <BottomNavigation
        active={activeTab}
        onTabPress={onTabPress}
        onCenterPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
    </View>
  );
}
