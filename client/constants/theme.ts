import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#4B5563",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#2563EB",
    link: "#2563EB",
    primary: "#2563EB",
    primaryPressed: "#1D4ED8",
    primaryLight: "#EFF6FF",
    accent: "#F97316",
    accentPressed: "#EA580C",
    accentLight: "#FFF7ED",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    border: "#E5E7EB",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F9FAFB",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#60A5FA",
    link: "#60A5FA",
    primary: "#3B82F6",
    primaryPressed: "#2563EB",
    primaryLight: "#1E3A5F",
    accent: "#FB923C",
    accentPressed: "#F97316",
    accentLight: "#431407",
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    border: "#374151",
    backgroundRoot: "#111827",
    backgroundDefault: "#1F2937",
    backgroundSecondary: "#374151",
    backgroundTertiary: "#4B5563",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  inputHeight: 48,
  buttonHeight: 48,
  fabSize: 56,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  link: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const CATEGORIES = [
  { id: "busilice", label: "Bušilice", icon: "tool" },
  { id: "merdevine", label: "Merdevine", icon: "maximize" },
  { id: "agregati", label: "Agregati", icon: "zap" },
  { id: "satori", label: "Šatori", icon: "triangle" },
  { id: "basta", label: "Alat za baštu", icon: "sun" },
  { id: "auto", label: "Alat za auto", icon: "truck" },
  { id: "gradjevina", label: "Građevinski alat", icon: "hard-drive" },
  { id: "ostalo", label: "Ostalo", icon: "package" },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: "Na čekanju", color: "#F59E0B" },
  confirmed: { label: "Potvrđeno", color: "#10B981" },
  active: { label: "Aktivna", color: "#2563EB" },
  completed: { label: "Završena", color: "#6B7280" },
  cancelled: { label: "Otkazana", color: "#EF4444" },
} as const;
