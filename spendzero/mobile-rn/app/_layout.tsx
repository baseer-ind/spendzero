import React, { useCallback, useEffect, Component, ReactNode } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../design-system/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[RootErrorBoundary] crash:", error, info);
    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: "#0A0B0E", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#D8B36A", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Startup Error
          </Text>
          <ScrollView>
            <Text style={{ color: "#fff", fontSize: 13, fontFamily: "monospace" }}>
              {this.state.error?.message ?? "Unknown error"}
              {"\n\n"}
              {this.state.error?.stack ?? ""}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Fraunces-Variable": require("../assets/fonts/Fraunces-Variable.ttf"),
    "Inter-Variable": require("../assets/fonts/Inter-Variable.ttf"),
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded || fontError) {
      if (fontError) console.error("[Fonts] load error:", fontError);
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
