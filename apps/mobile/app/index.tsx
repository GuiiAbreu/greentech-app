import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user.role === "FARMER") {
    return <Redirect href="/(farmer)/dashboard" />;
  }

  return <Redirect href="/(consumer)/catalog" />;
}
