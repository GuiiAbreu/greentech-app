import React from "react";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";
import { colors, fontSize, fontWeight } from "@/constants/theme";

export default function FarmerLayout() {
  const { user } = useAuthStore();

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (user.role !== "FARMER") return <Redirect href="/(consumer)/catalog" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Painel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Produtos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-product"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="edit-product/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="change-password"
        options={{ href: null }}
      />
    </Tabs>
  );
}
