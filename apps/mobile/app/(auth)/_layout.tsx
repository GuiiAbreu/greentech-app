import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function AuthLayout() {
  const { user } = useAuthStore();

  if (user) {
    if (user.role === "FARMER") {
      return <Redirect href="/(farmer)/dashboard" />;
    }
    return <Redirect href="/(consumer)/catalog" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
