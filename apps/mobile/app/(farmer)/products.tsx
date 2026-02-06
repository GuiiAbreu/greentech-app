import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { Product } from "@/types";
import { CATEGORY_LABELS, UNIT_LABELS, formatCents } from "@/types";

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get<Product[]>("/products/mine");
      setProducts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  async function handleDelete(product: Product) {
    Alert.alert(
      "Desativar produto",
      `Deseja desativar "${product.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/products/${product.id}`);
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === product.id ? { ...p, active: false } : p
                )
              );
            } catch {
              Alert.alert("Erro", "Nao foi possivel desativar o produto");
            }
          },
        },
      ]
    );
  }

  function renderProduct({ item }: { item: Product }) {
    const photoUrl = item.photos[0]?.url;
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          router.push(`/(farmer)/edit-product/${item.id}`)
        }
        activeOpacity={0.7}
      >
        <View style={styles.productImage}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.productImg} />
          ) : (
            <View style={styles.productImgPlaceholder}>
              <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <View style={styles.productTop}>
            <View style={styles.productTags}>
              <Badge
                text={CATEGORY_LABELS[item.category]}
                variant="success"
              />
              {!item.active && <Badge text="Inativo" variant="error" />}
              {item.active && item.stockQty <= 5 && (
                <Badge text="Estoque baixo" variant="warning" />
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.productBottom}>
            <Text style={styles.productPrice}>
              {formatCents(item.priceCents)}/{UNIT_LABELS[item.unit]}
            </Text>
            <Text style={styles.productStock}>
              Estoque: {item.stockQty}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Produtos</Text>
          <Text style={styles.subtitle}>{products.length} produto(s)</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(farmer)/create-product")}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={
          products.length === 0 ? styles.emptyContainer : styles.list
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
            icon="leaf-outline"
            title="Nenhum produto cadastrado"
            description="Comece adicionando seus produtos"
            actionLabel="Adicionar Produto"
            onAction={() => router.push("/(farmer)/create-product")}
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
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },
  emptyContainer: {
    flex: 1,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  productImage: {
    width: 100,
    backgroundColor: colors.surface,
  },
  productImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productImgPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
    padding: spacing.md,
  },
  productTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  productTags: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  productName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  productStock: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
