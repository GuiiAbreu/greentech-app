import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { CartItem } from "@/types";
import { UNIT_LABELS, formatCents } from "@/types";

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQty, removeItem, getTotal } = useCartStore();
  const total = getTotal();

  function renderItem({ item }: { item: CartItem }) {
    const photoUrl = item.product.photos[0]?.url;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImage}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.itemImg} />
          ) : (
            <View style={styles.itemImgPlaceholder}>
              <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={styles.itemPrice}>
            {formatCents(item.product.priceCents)}/{UNIT_LABELS[item.product.unit]}
          </Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQty(item.product.id, item.qty - 1)}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQty(item.product.id, item.qty + 1)}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemRight}>
          <TouchableOpacity onPress={() => removeItem(item.product.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
          <Text style={styles.lineTotal}>
            {formatCents(item.product.priceCents * item.qty)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Carrinho</Text>
        {items.length > 0 && (
          <Text style={styles.itemCount}>{items.length} ite(ns)</Text>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContainer : styles.list
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Carrinho vazio"
            description="Adicione produtos do catalogo para comecar"
            actionLabel="Ver catalogo"
            onAction={() => router.push("/(consumer)/catalog")}
          />
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCents(total)}</Text>
          </View>
          <Button
            title="Finalizar Pedido"
            onPress={() => router.push("/(consumer)/checkout")}
            size="lg"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  itemCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  itemImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemImgPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    minWidth: 20,
    textAlign: "center",
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  lineTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
