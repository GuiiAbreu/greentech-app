import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { ProductCategory, UnitType } from "@/types";
import { CATEGORY_LABELS, UNIT_LABELS } from "@/types";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];
const UNITS = Object.entries(UNIT_LABELS) as [UnitType, string][];

export default function CreateProductScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<UnitType>("KG");
  const [stockQty, setStockQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Nome obrigatorio";
    if (!description.trim() || description.trim().length < 2) errs.description = "Descricao obrigatoria";
    if (!category) errs.category = "Selecione uma categoria";
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) errs.price = "Preco invalido";
    if (!stockQty || isNaN(parseInt(stockQty)) || parseInt(stockQty) < 0) errs.stockQty = "Quantidade invalida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);
      await api.post("/products", {
        name: name.trim(),
        description: description.trim(),
        category,
        priceCents,
        unit,
        stockQty: parseInt(stockQty),
      });
      Alert.alert("Produto criado!", "Seu produto foi cadastrado com sucesso.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao criar produto";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Produto</Text>
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
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}

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
            title="Cadastrar Produto"
            onPress={handleCreate}
            loading={loading}
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
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
});
