import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#4A4A4A",
    textTertiary: "#7A7A7A",
    buttonText: "#FFFFFF",
    tabIconDefault: "#7A7A7A",
    tabIconSelected: "#FFCC00",
    link: "#FF6B35",
    primary: "#FFCC00",
    primaryPressed: "#E6B800",
    primaryLight: "#FFF9E6",
    cta: "#FF6B35",
    ctaPressed: "#E55A2B",
    accent: "#1A1A1A",
    accentPressed: "#333333",
    accentLight: "#F0F0F0",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#FFCC00",
    trust: "#3B82F6",
    border: "#E0E0E0",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#EBEBEB",
    backgroundTertiary: "#E0E0E0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#D4D4D4",
    textTertiary: "#A3A3A3",
    buttonText: "#FFFFFF",
    tabIconDefault: "#737373",
    tabIconSelected: "#FFCC00",
    link: "#FF6B35",
    primary: "#FFCC00",
    primaryPressed: "#E6B800",
    primaryLight: "#3D3D00",
    cta: "#FF6B35",
    ctaPressed: "#E55A2B",
    accent: "#FFCC00",
    accentPressed: "#E6B800",
    accentLight: "#2D2D00",
    success: "#4ADE80",
    error: "#F87171",
    warning: "#FFCC00",
    trust: "#60A5FA",
    border: "#404040",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#262626",
    backgroundSecondary: "#333333",
    backgroundTertiary: "#404040",
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

export const CATEGORY_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  gradjevinarstvo: { primary: "#FFCC00", secondary: "#FFF9E6", accent: "#E6B800" },
  basta: { primary: "#22C55E", secondary: "#DCFCE7", accent: "#16A34A" },
  renoviranje: { primary: "#FF6B35", secondary: "#FFF0EB", accent: "#E55A2B" },
  drvoprerađivanje: { primary: "#8B5A2B", secondary: "#FDF4EC", accent: "#6B4423" },
  autoMehanika: { primary: "#3B82F6", secondary: "#EFF6FF", accent: "#2563EB" },
  ciscenje: { primary: "#06B6D4", secondary: "#ECFEFF", accent: "#0891B2" },
  elektricni: { primary: "#FFCC00", secondary: "#FFF9E6", accent: "#E6B800" },
  akumulatorski: { primary: "#22C55E", secondary: "#DCFCE7", accent: "#16A34A" },
  rucni: { primary: "#6B7280", secondary: "#F3F4F6", accent: "#4B5563" },
  pneumatski: { primary: "#8B5CF6", secondary: "#F5F3FF", accent: "#7C3AED" },
  gradevinskemasine: { primary: "#FF6B35", secondary: "#FFF0EB", accent: "#E55A2B" },
  merniLaserski: { primary: "#EF4444", secondary: "#FEF2F2", accent: "#DC2626" },
};

export const CATEGORY_ICONS: Record<string, string> = {
  gradjevinarstvo: "home",
  basta: "sun",
  renoviranje: "tool",
  drvoprerađivanje: "layers",
  autoMehanika: "truck",
  ciscenje: "droplet",
  elektricni: "zap",
  akumulatorski: "battery-charging",
  rucni: "edit-3",
  pneumatski: "wind",
  gradevinskemasine: "truck",
  merniLaserski: "crosshair",
};

export const CATEGORY_SEO_NAMES: Record<string, string> = {
  gradjevinarstvo: "Iznajmi građevinski alat",
  basta: "Iznajmi baštenski alat",
  renoviranje: "Iznajmi alat za renoviranje",
  drvoprerađivanje: "Iznajmi alat za drvo",
  autoMehanika: "Iznajmi auto alat",
  ciscenje: "Iznajmi opremu za čišćenje",
  elektricni: "Iznajmi električni alat",
  akumulatorski: "Iznajmi akumulatorski alat",
  rucni: "Iznajmi ručni alat",
  pneumatski: "Iznajmi pneumatski alat",
  gradevinskemasine: "Iznajmi građevinske mašine",
  merniLaserski: "Iznajmi merne uređaje",
};

export const BOOKING_STATUSES = {
  pending: { label: "Na čekanju", color: "#FFCC00" },
  confirmed: { label: "Potvrđeno", color: "#22C55E" },
  active: { label: "Aktivna", color: "#FFCC00" },
  completed: { label: "Završena", color: "#6B7280" },
  cancelled: { label: "Otkazana", color: "#EF4444" },
} as const;
