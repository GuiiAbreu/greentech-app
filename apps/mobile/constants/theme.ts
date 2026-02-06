export const colors = {
  primary: "#16A34A",
  primaryDark: "#15803D",
  primaryLight: "#DCFCE7",
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceDark: "#F3F4F6",
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  success: "#16A34A",
  successLight: "#DCFCE7",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.5)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
