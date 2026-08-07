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

interface EditProfileViewProps {
  onBack: () => void;
}

export function EditProfileView({ onBack }: EditProfileViewProps) {
  const { user, updateUser, isLoading } = useAuthStore();
  const isFarmer = user?.role === "FARMER";

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [propertyName, setPropertyName] = useState(
    user?.farmerProfile?.propertyName ?? ""
  );
  const [address, setAddress] = useState(user?.farmerProfile?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Nome obrigatorio";
    if (!phone.trim() || phone.trim().length < 8) errs.phone = "Telefone obrigatorio";
    if (!city.trim() || city.trim().length < 2) errs.city = "Cidade obrigatoria";
    if (isFarmer) {
      if (!propertyName.trim() || propertyName.trim().length < 2)
        errs.propertyName = "Nome da propriedade obrigatorio";
      if (!address.trim() || address.trim().length < 2)
        errs.address = "Endereco obrigatorio";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    try {
      await updateUser({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        ...(isFarmer && {
          propertyName: propertyName.trim(),
          address: address.trim(),
        }),
      });
      Alert.alert("Perfil atualizado!", "", [
        { text: "OK", onPress: onBack },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao atualizar perfil";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>
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
            label="Nome completo"
            placeholder="Seu nome"
            leftIcon="person-outline"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label="Email"
            placeholder={user?.email ?? ""}
            leftIcon="mail-outline"
            editable={false}
            value={user?.email ?? ""}
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

          {isFarmer && (
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
            title="Salvar Alteracoes"
            onPress={handleSave}
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
