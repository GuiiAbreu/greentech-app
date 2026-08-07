import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/Button";
import { colors, fontSize, fontWeight, spacing, radius } from "@/constants/theme";

interface ProfileViewProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export function ProfileView({ onEditProfile, onChangePassword }: ProfileViewProps) {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const isFarmer = user.role === "FARMER";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Meu Perfil</Text>

        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons
              name={isFarmer ? "leaf" : "cart"}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.roleText}>
              {isFarmer ? "Agricultor" : "Consumidor"}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
          <View style={styles.divider} />
          <InfoRow icon="call-outline" label="Telefone" value={user.phone} />
          <View style={styles.divider} />
          <InfoRow icon="location-outline" label="Cidade" value={user.city} />
          {isFarmer && user.farmerProfile && (
            <>
              <View style={styles.divider} />
              <InfoRow
                icon="home-outline"
                label="Propriedade"
                value={user.farmerProfile.propertyName}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="map-outline"
                label="Endereco"
                value={user.farmerProfile.address}
              />
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <MenuItem
            icon="create-outline"
            label="Editar Perfil"
            onPress={onEditProfile}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Alterar Senha"
            onPress={onChangePassword}
          />
          <MenuItem
            icon="log-out-outline"
            label="Sair"
            onPress={logout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? colors.error : colors.text}
        />
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing["2xl"],
    paddingBottom: spacing["4xl"],
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing["2xl"],
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  roleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing["2xl"],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  actions: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  menuLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  menuLabelDanger: {
    color: colors.error,
  },
});
