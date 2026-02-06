import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { colors, fontSize, fontWeight, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={48} color={colors.white} />
          </View>
          <Text style={styles.title}>GreenTech</Text>
          <Text style={styles.subtitle}>
            Conectando agricultores e consumidores para um futuro mais sustentavel
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="nutrition-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Produtos Frescos</Text>
              <Text style={styles.featureDesc}>
                Direto do produtor para sua mesa
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Certificados</Text>
              <Text style={styles.featureDesc}>
                Produtos com selo de qualidade
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Comercio Justo</Text>
              <Text style={styles.featureDesc}>
                Apoie a agricultura local
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Entrar"
          onPress={() => router.push("/(auth)/login")}
          variant="primary"
          size="lg"
        />
        <Button
          title="Criar Conta"
          onPress={() => router.push("/(auth)/register")}
          variant="outline"
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
  content: {
    flex: 1,
    paddingHorizontal: spacing["2xl"],
    justifyContent: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing["4xl"],
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  features: {
    gap: spacing.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actions: {
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    gap: spacing.md,
  },
});
