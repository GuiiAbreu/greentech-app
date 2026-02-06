import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/stores/auth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function RootLayout() {
  const { isReady, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(consumer)" />
        <Stack.Screen name="(farmer)" />
      </Stack>
    </>
  );
}
