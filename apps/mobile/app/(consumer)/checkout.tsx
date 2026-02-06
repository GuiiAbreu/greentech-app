import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui/Button";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { DeliveryMethod } from "@/types";
import { DELIVERY_LABELS, UNIT_LABELS, formatCents } from "@/types";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotal, clear } = useCartStore();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const total = getTotal();

  async function handleConfirm() {
    if (items.length === 0) return;

    setLoading(true);
    try {
      await api.post("/orders", {
        deliveryMethod,
        note: note.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          qty: i.qty,
        })),
      });
      clear();
      Alert.alert("Pedido realizado!", "Seu pedido foi enviado ao agricultor.", [
        { text: "Ver pedidos", onPress: () => router.replace("/(consumer)/orders") },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao realizar pedido";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    router.replace("/(consumer)/cart");
    return null;
  }

  const farmer = items[0].product.farmer;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Finalizar Pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Farmer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agricultor</Text>
          <View style={styles.farmerCard}>
            <Ionicons name="person-circle-outline" size={36} color={colors.primary} />
            <View>
              <Text style={styles.farmerName}>{farmer.name}</Text>
              <Text style={styles.farmerCity}>
                {farmer.propertyName ? `${farmer.propertyName} - ` : ""}
                {farmer.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Itens ({items.length})
          </Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQty}>{item.qty}x</Text>
                <View>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemUnit}>
                    {formatCents(item.product.priceCents)}/{UNIT_LABELS[item.product.unit]}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemTotal}>
                {formatCents(item.product.priceCents * item.qty)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metodo de entrega</Text>
          <View style={styles.deliveryRow}>
            {(["PICKUP", "DELIVERY"] as DeliveryMethod[]).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.deliveryOption,
                  deliveryMethod === method && styles.deliveryOptionActive,
                ]}
                onPress={() => setDeliveryMethod(method)}
              >
                <Ionicons
                  name={method === "PICKUP" ? "storefront-outline" : "bicycle-outline"}
                  size={24}
                  color={deliveryMethod === method ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.deliveryText,
                    deliveryMethod === method && styles.deliveryTextActive,
                  ]}
                >
                  {DELIVERY_LABELS[method]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observacao (opcional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Ex: sem agrotoxicos, preferencia organico..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            maxLength={500}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCents(total)}</Text>
        </View>
        <Button
          title="Confirmar Pedido"
          onPress={handleConfirm}
          loading={loading}
          size="lg"
        />
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scroll: {
    padding: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },
  section: {
    marginBottom: spacing["2xl"],
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  farmerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  farmerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  farmerCity: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  itemQty: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    width: 30,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  itemUnit: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  itemTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  deliveryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  deliveryOption: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  deliveryOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  deliveryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  deliveryTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
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
