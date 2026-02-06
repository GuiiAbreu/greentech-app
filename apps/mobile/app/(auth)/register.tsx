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
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";
import type { UserRole } from "@/types";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!role) errs.role = "Selecione um perfil";
    if (!name.trim() || name.trim().length < 2) errs.name = "Nome obrigatorio (min. 2 caracteres)";
    if (!email.trim()) errs.email = "Email obrigatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email invalido";
    if (!password || password.length < 6) errs.password = "Minimo 6 caracteres";
    if (!phone.trim() || phone.trim().length < 8) errs.phone = "Telefone obrigatorio (min. 8 digitos)";
    if (!city.trim() || city.trim().length < 2) errs.city = "Cidade obrigatoria";
    if (role === "FARMER") {
      if (!propertyName.trim() || propertyName.trim().length < 2) errs.propertyName = "Nome da propriedade obrigatorio";
      if (!address.trim() || address.trim().length < 2) errs.address = "Endereco obrigatorio";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    try {
      await register({
        role: role!,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        city: city.trim(),
        ...(role === "FARMER" && {
          propertyName: propertyName.trim(),
          address: address.trim(),
        }),
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao criar conta. Tente novamente.";
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

          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Escolha seu perfil e preencha seus dados
          </Text>

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Tipo de perfil</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                role === "CONSUMER" && styles.roleCardActive,
              ]}
              onPress={() => setRole("CONSUMER")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.roleIcon,
                  role === "CONSUMER" && styles.roleIconActive,
                ]}
              >
                <Ionicons
                  name="cart-outline"
                  size={28}
                  color={role === "CONSUMER" ? colors.white : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.roleTitle,
                  role === "CONSUMER" && styles.roleTitleActive,
                ]}
              >
                Consumidor
              </Text>
              <Text style={styles.roleDesc}>Compre produtos frescos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                role === "FARMER" && styles.roleCardActive,
              ]}
              onPress={() => setRole("FARMER")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.roleIcon,
                  role === "FARMER" && styles.roleIconActive,
                ]}
              >
                <Ionicons
                  name="leaf-outline"
                  size={28}
                  color={role === "FARMER" ? colors.white : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.roleTitle,
                  role === "FARMER" && styles.roleTitleActive,
                ]}
              >
                Agricultor
              </Text>
              <Text style={styles.roleDesc}>Venda seus produtos</Text>
            </TouchableOpacity>
          </View>
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

          {/* Form */}
          {role && (
            <View style={styles.form}>
              <Input
                label="Nome completo"
                placeholder="Seu nome"
                leftIcon="person-outline"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />
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
                placeholder="Minimo 6 caracteres"
                leftIcon="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                leftIcon="call-outline"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
              />
              <Input
                label="Cidade"
                placeholder="Sua cidade"
                leftIcon="location-outline"
                value={city}
                onChangeText={setCity}
                error={errors.city}
              />

              {role === "FARMER" && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>Dados da Propriedade</Text>
                  <Input
                    label="Nome da Propriedade"
                    placeholder="Fazenda / Sitio"
                    leftIcon="home-outline"
                    value={propertyName}
                    onChangeText={setPropertyName}
                    error={errors.propertyName}
                  />
                  <Input
                    label="Endereco"
                    placeholder="Endereco completo"
                    leftIcon="map-outline"
                    value={address}
                    onChangeText={setAddress}
                    error={errors.address}
                  />
                </>
              )}

              <Button
                title="Cadastrar"
                onPress={handleRegister}
                loading={isLoading}
                size="lg"
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ja tem conta? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.footerLink}>Fazer login</Text>
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
    marginBottom: spacing["2xl"],
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.sm,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconActive: {
    backgroundColor: colors.primary,
  },
  roleTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  roleTitleActive: {
    color: colors.primaryDark,
  },
  roleDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  form: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
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
