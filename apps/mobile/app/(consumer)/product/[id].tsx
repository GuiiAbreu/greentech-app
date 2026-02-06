import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { CatalogProductDetail } from "@/types";
import { CATEGORY_LABELS, UNIT_LABELS, formatCents } from "@/types";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await api.get<CatalogProductDetail>(
          `/catalog/products/${id}`
        );
        setProduct(data);
      } catch {
        Alert.alert("Erro", "Produto nao encontrado");
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading || !product) return <LoadingScreen />;

  function handleAddToCart() {
    if (!product) return;
    addItem(
      {
        ...product,
        farmer: {
          ...product.farmer,
          propertyName: product.farmer.propertyName ?? null,
        },
      } as any,
      qty
    );
    Alert.alert("Adicionado", `${qty}x ${product.name} adicionado ao carrinho`, [
      { text: "Continuar comprando", style: "cancel" },
      { text: "Ver carrinho", onPress: () => router.push("/(consumer)/cart") },
    ]);
  }

  const photoUrl = product.photos[0]?.url;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.imageContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={colors.textTertiary} />
            </View>
          )}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Badge text={CATEGORY_LABELS[product.category]} variant="success" />

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatCents(product.priceCents)}
            </Text>
            <Text style={styles.unit}>/ {UNIT_LABELS[product.unit]}</Text>
          </View>

          <View style={styles.stockRow}>
            <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.stockText}>
              {product.stockQty} {UNIT_LABELS[product.unit]}(s) em estoque
            </Text>
          </View>

          {/* Farmer info */}
          <View style={styles.farmerCard}>
            <View style={styles.farmerIcon}>
              <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{product.farmer.name}</Text>
              {product.farmer.propertyName && (
                <Text style={styles.farmerDetail}>
                  {product.farmer.propertyName}
                </Text>
              )}
              <Text style={styles.farmerDetail}>
                <Ionicons name="location-outline" size={12} color={colors.textSecondary} />{" "}
                {product.farmer.city}
              </Text>
            </View>
          </View>

          {/* Certifications */}
          {product.certs.length > 0 && (
            <View style={styles.certsSection}>
              <Text style={styles.sectionTitle}>Certificacoes</Text>
              {product.certs.map((cert) => (
                <View key={cert.id} style={styles.certRow}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                  <View style={styles.certInfo}>
                    <Text style={styles.certTitle}>{cert.title}</Text>
                    {cert.issuer && (
                      <Text style={styles.certIssuer}>{cert.issuer}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Photos gallery */}
          {product.photos.length > 1 && (
            <View style={styles.gallerySection}>
              <Text style={styles.sectionTitle}>Fotos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.url }}
                    style={styles.galleryImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty(Math.max(1, qty - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty(Math.min(product.stockQty, qty + 1))}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Button
          title={`Adicionar ${formatCents(product.priceCents * qty)}`}
          onPress={handleAddToCart}
          size="lg"
          fullWidth={false}
          style={{ flex: 1 }}
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
  imageContainer: {
    height: 280,
    backgroundColor: colors.surface,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing["2xl"],
  },
  name: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  unit: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing["2xl"],
  },
  stockText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  farmerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing["2xl"],
    gap: spacing.md,
  },
  farmerIcon: {},
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  farmerDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  certsSection: {
    marginBottom: spacing["2xl"],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  certInfo: {
    flex: 1,
  },
  certTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  certIssuer: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  gallerySection: {
    marginBottom: spacing["2xl"],
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: radius.lg,
    marginRight: spacing.sm,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    minWidth: 24,
    textAlign: "center",
  },
});
