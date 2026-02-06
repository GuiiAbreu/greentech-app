import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, fontSize, fontWeight, spacing } from "@/constants/theme";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.primaryDark },
  warning: { bg: colors.warningLight, text: "#92400E" },
  error: { bg: colors.errorLight, text: colors.error },
  info: { bg: "#DBEAFE", text: "#1D4ED8" },
  neutral: { bg: colors.surfaceDark, text: colors.textSecondary },
};

export function Badge({ text, variant = "neutral", style }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
