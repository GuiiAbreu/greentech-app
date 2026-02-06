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
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth";
import { colors, fontSize, fontWeight, spacing } from "@/constants/theme";

interface ChangePasswordViewProps {
  onBack: () => void;
}

export function ChangePasswordView({ onBack }: ChangePasswordViewProps) {
  const { changePassword, isLoading } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = "Senha atual obrigatoria";
    if (!newPassword || newPassword.length < 6)
      errs.newPassword = "Nova senha deve ter no minimo 6 caracteres";
    if (newPassword !== confirmPassword)
      errs.confirmPassword = "Senhas nao conferem";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleChange() {
    if (!validate()) return;
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Senha alterada!", "Sua senha foi atualizada com sucesso.", [
        { text: "OK", onPress: onBack },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao alterar senha";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Alterar Senha</Text>
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
            label="Senha Atual"
            placeholder="Digite sua senha atual"
            leftIcon="lock-closed-outline"
            isPassword
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={errors.currentPassword}
          />
          <Input
            label="Nova Senha"
            placeholder="Minimo 6 caracteres"
            leftIcon="key-outline"
            isPassword
            value={newPassword}
            onChangeText={setNewPassword}
            error={errors.newPassword}
          />
          <Input
            label="Confirmar Nova Senha"
            placeholder="Repita a nova senha"
            leftIcon="key-outline"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <Button
            title="Alterar Senha"
            onPress={handleChange}
            loading={isLoading}
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
});
