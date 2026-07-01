import React, { useCallback, useEffect, Component, ReactNode } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../design-system/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

console.log(`[Init] _layout module evaluating @ ${Date.now()}`);


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
  console.log(`[Init] RootLayout render start @ ${Date.now()}`);

  const [fontsLoaded, fontError] = useFonts({
    "Fraunces-Variable": require("../assets/fonts/Fraunces-Variable.ttf"),
    "Inter-Variable": require("../assets/fonts/Inter-Variable.ttf"),
  });

  console.log(`[Init] useFonts state: loaded=${fontsLoaded} error=${!!fontError} @ ${Date.now()}`);

  const hideSplash = useCallback(async () => {
    console.log(`[Init] hideSplash invoked @ ${Date.now()}`);
    await SplashScreen.hideAsync().catch((e) => console.error("[Init] hideAsync failed:", e));
    console.log(`[Init] hideAsync settled @ ${Date.now()}`);
  }, []);

  // Firing hideAsync() from a plain mount effect can be a silent no-op: if it
  // runs before the root view's first native layout pass, there's nothing
  // rendered yet to reveal, so the promise resolves with no visible effect
  // and no error. The reliable trigger is the root view's own onLayout event
  // (fires only after the native view has actually laid out), matching
  // Expo's own template pattern. Kept as a native View prop below, plus a
  // useEffect fallback in case onLayout never fires for some reason.
  const onLayoutRootView = useCallback(() => {
    console.log(`[Init] root view onLayout fired @ ${Date.now()}`);
    if (fontsLoaded || fontError) {
      if (fontError) console.error("[Fonts] load error:", fontError);
      hideSplash();
    }
  }, [fontsLoaded, fontError, hideSplash]);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    // Fallback: if onLayout somehow never fires, still hide once fonts settle.
    const fallback = setTimeout(() => {
      console.log(`[Init] fallback hideAsync fired @ ${Date.now()}`);
      hideSplash();
    }, 500);
    return () => clearTimeout(fallback);
  }, [fontsLoaded, fontError, hideSplash]);

  if (!fontsLoaded && !fontError) {
    console.log(`[Init] fonts not ready yet, rendering null @ ${Date.now()}`);
    return null;
  }

  console.log(`[Init] rendering full tree @ ${Date.now()}`);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: colors.background }}
        onLayout={onLayoutRootView}
      >
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
