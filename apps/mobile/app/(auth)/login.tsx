import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth";
import { colors, fontSize, fontWeight, spacing } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email obrigatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email invalido";
    if (!password) errs.password = "Senha obrigatoria";
    else if (password.length < 6) errs.password = "Minimo 6 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Erro ao fazer login. Tente novamente.";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoSmall}>
              <Ionicons name="leaf" size={28} color={colors.white} />
            </View>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Entre com seus dados para acessar sua conta
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="seu@email.com"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <Input
              label="Senha"
              placeholder="Sua senha"
              leftIcon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda nao tem conta? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  logoSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    gap: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing["2xl"],
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
