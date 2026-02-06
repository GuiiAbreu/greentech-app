import React from "react";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { colors, fontSize, fontWeight } from "@/constants/theme";
import { View, Text, StyleSheet } from "react-native";

function CartBadge() {
  const count = useCartStore((s) => s.getItemCount());
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

export default function ConsumerLayout() {
  const { user } = useAuthStore();

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (user.role !== "CONSUMER") return <Redirect href="/(farmer)/dashboard" />;

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
        name="catalog"
        options={{
          title: "Catalogo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrinho",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart-outline" size={size} color={color} />
              <CartBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="orders"
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

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
});
