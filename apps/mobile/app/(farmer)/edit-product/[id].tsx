import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { Product, ProductCategory, UnitType } from "@/types";
import { CATEGORY_LABELS, UNIT_LABELS } from "@/types";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];
const UNITS = Object.entries(UNIT_LABELS) as [UnitType, string][];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("FRUTAS");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<UnitType>("KG");
  const [stockQty, setStockQty] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await api.get<Product>(`/products/${id}`);
        setName(data.name);
        setDescription(data.description);
        setCategory(data.category);
        setPrice((data.priceCents / 100).toFixed(2).replace(".", ","));
        setUnit(data.unit);
        setStockQty(data.stockQty.toString());
        setActive(data.active);
      } catch {
        Alert.alert("Erro", "Produto nao encontrado");
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Nome obrigatorio";
    if (!description.trim() || description.trim().length < 2) errs.description = "Descricao obrigatoria";
    if (!price || isNaN(parseFloat(price.replace(",", "."))) || parseFloat(price.replace(",", ".")) <= 0) errs.price = "Preco invalido";
    if (!stockQty || isNaN(parseInt(stockQty)) || parseInt(stockQty) < 0) errs.stockQty = "Quantidade invalida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);
      await api.put(`/products/${id}`, {
        name: name.trim(),
        description: description.trim(),
        category,
        priceCents,
        unit,
        stockQty: parseInt(stockQty),
        active,
      });
      Alert.alert("Produto atualizado!", "", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao atualizar produto";
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Produto</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Active toggle */}
          <TouchableOpacity
            style={styles.activeToggle}
            onPress={() => setActive(!active)}
          >
            <Ionicons
              name={active ? "checkmark-circle" : "close-circle"}
              size={24}
              color={active ? colors.primary : colors.error}
            />
            <Text style={styles.activeText}>
              {active ? "Produto ativo" : "Produto inativo"}
            </Text>
          </TouchableOpacity>

          <Input
            label="Nome do Produto"
            placeholder="Ex: Tomate Organico"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label="Descricao"
            placeholder="Descreva seu produto..."
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          {/* Category */}
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.chip,
                  category === key && styles.chipActive,
                ]}
                onPress={() => setCategory(key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === key && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="Preco (R$)"
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
                error={errors.price}
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Estoque"
                placeholder="0"
                keyboardType="number-pad"
                value={stockQty}
                onChangeText={setStockQty}
                error={errors.stockQty}
              />
            </View>
          </View>

          {/* Unit */}
          <Text style={styles.label}>Unidade</Text>
          <View style={styles.chipRow}>
            {UNITS.map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.chip,
                  unit === key && styles.chipActive,
                ]}
                onPress={() => setUnit(key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    unit === key && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: spacing["2xl"] }} />

          <Button
            title="Salvar Alteracoes"
            onPress={handleSave}
            loading={saving}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
    paddingBottom: spacing["4xl"],
  },
  activeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  activeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
});
