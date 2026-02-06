import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { useCartStore } from "@/stores/cart";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  radius,
} from "@/constants/theme";
import type { CatalogProduct, ProductCategory } from "@/types";
import { CATEGORY_LABELS, UNIT_LABELS, formatCents } from "@/types";

const CATEGORIES: { key: ProductCategory | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "FRUTAS", label: "Frutas" },
  { key: "HORTALICAS", label: "Hortalicas" },
  { key: "LATICINIOS", label: "Laticinios" },
  { key: "OVOS", label: "Ovos" },
  { key: "GRAOS", label: "Graos" },
];

export default function CatalogScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "ALL"
  >("ALL");

  const fetchProducts = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedCategory !== "ALL") params.category = selectedCategory;
      if (search.trim()) params.q = search.trim();
      const { data } = await api.get<CatalogProduct[]>("/catalog/products", {
        params,
      });
      setProducts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  function renderProduct({ item }: { item: CatalogProduct }) {
    const photoUrl = item.photos[0]?.url;
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/(consumer)/product/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.productImage}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.productImg} />
          ) : (
            <View style={styles.productImgPlaceholder}>
              <Ionicons
                name="image-outline"
                size={32}
                color={colors.textTertiary}
              />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Badge
            text={CATEGORY_LABELS[item.category]}
            variant="success"
            style={{ marginBottom: spacing.xs }}
          />
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.farmerName} numberOfLines={1}>
            {item.farmer.propertyName || item.farmer.name} - {item.farmer.city}
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.price}>
              {formatCents(item.priceCents)}/{UNIT_LABELS[item.unit]}
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addItem(item)}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading && products.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Catalogo</Text>
          <Text style={styles.headerSub}>Produtos frescos perto de voce</Text>
        </View>
        <Ionicons name="leaf" size={28} color={colors.primary} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textTertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.key && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.key && styles.categoryTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Products */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.productRow}
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
            icon="search-outline"
            title="Nenhum produto encontrado"
            description="Tente ajustar seus filtros ou busca"
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
  searchRow: {
    paddingHorizontal: spacing["2xl"],
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  categoriesList: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  productList: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
  },
  productRow: {
    gap: spacing.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  productImage: {
    height: 120,
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
    padding: spacing.md,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  farmerName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
