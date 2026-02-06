import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABELS, DELIVERY_LABELS, formatCents, formatDate } from "@/types";

const STATUS_BADGE_VARIANT: Record<OrderStatus, "success" | "warning" | "error" | "neutral"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  DONE: "success",
  CANCELED: "error",
};

const FILTER_TABS: { key: OrderStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "PENDING", label: "Pendentes" },
  { key: "CONFIRMED", label: "Confirmados" },
  { key: "DONE", label: "Concluidos" },
  { key: "CANCELED", label: "Cancelados" },
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== "ALL") params.status = filter;
      const { data } = await api.get<Order[]>("/orders/mine", { params });
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  function renderOrder({ item }: { item: Order }) {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>
              Pedido #{item.id.slice(0, 8)}
            </Text>
            <Badge
              text={STATUS_LABELS[item.status]}
              variant={STATUS_BADGE_VARIANT[item.status]}
            />
          </View>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.farmerRow}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.farmerText}>
              {item.farmer.name} - {item.farmer.city}
            </Text>
          </View>
          <View style={styles.farmerRow}>
            <Ionicons name="bicycle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.farmerText}>
              {DELIVERY_LABELS[item.deliveryMethod]}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items.map((oi) => (
            <View key={oi.id} style={styles.orderItemRow}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {oi.qty}x {oi.productName}
              </Text>
              <Text style={styles.orderItemPrice}>
                {formatCents(oi.lineTotalCents)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCents(item.subtotalCents)}</Text>
        </View>
      </View>
    );
  }

  if (loading && orders.length === 0) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pedidos</Text>
      </View>

      {/* Filters */}
      <FlatList
        data={FILTER_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={
          orders.length === 0 ? styles.emptyContainer : styles.list
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Nenhum pedido encontrado"
            description="Seus pedidos aparecerão aqui"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  filterList: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },
  emptyContainer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  orderHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  orderId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  orderDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  orderBody: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  farmerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  orderItems: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItemName: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
