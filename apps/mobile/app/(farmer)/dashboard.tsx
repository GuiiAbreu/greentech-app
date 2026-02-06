import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { Product, Order } from "@/types";
import { formatCents } from "@/types";

interface DashboardData {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get<Product[]>("/products/mine"),
        api.get<Order[]>("/orders/inbox"),
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;

      setData({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.active).length,
        lowStockProducts: products.filter((p) => p.active && p.stockQty <= 5).length,
        pendingOrders: orders.filter((o) => o.status === "PENDING").length,
        confirmedOrders: orders.filter((o) => o.status === "CONFIRMED").length,
        totalRevenue: orders
          .filter((o) => o.status === "DONE")
          .reduce((sum, o) => sum + o.subtotalCents, 0),
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Ola, {user?.name?.split(" ")[0]}
            </Text>
            <Text style={styles.headerSub}>Painel do Agricultor</Text>
          </View>
          <View style={styles.logoSmall}>
            <Ionicons name="leaf" size={24} color={colors.white} />
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <Ionicons name="trending-up" size={28} color={colors.white} />
          <View>
            <Text style={styles.revenueLabel}>Receita Total</Text>
            <Text style={styles.revenueValue}>
              {formatCents(data?.totalRevenue ?? 0)}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="leaf" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{data?.activeProducts ?? 0}</Text>
            <Text style={styles.statLabel}>Produtos Ativos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="alert-circle" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{data?.lowStockProducts ?? 0}</Text>
            <Text style={styles.statLabel}>Estoque Baixo</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{data?.pendingOrders ?? 0}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{data?.confirmedOrders ?? 0}</Text>
            <Text style={styles.statLabel}>Confirmados</Text>
          </View>
        </View>

        {/* Quick info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Voce tem {data?.totalProducts ?? 0} produtos cadastrados no total.
            {(data?.lowStockProducts ?? 0) > 0 &&
              ` Atencao: ${data?.lowStockProducts} produto(s) com estoque baixo.`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing["2xl"],
  },
  greeting: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  revenueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing["2xl"],
  },
  revenueLabel: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.8)",
  },
  revenueValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing["2xl"],
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    lineHeight: 20,
  },
});
