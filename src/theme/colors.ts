// Design tokens for EduInsight AI
// Direction: dark "study at night" academic feel — deep indigo as the
// structural color (nav, headers), teal reserved for action/progress
// (the thing that's "alive" — due dates, success states, accents).

export const colors = {
  bg: "#0F1117", // near-black, slightly blue
  surface: "#171A23", // cards
  surfaceAlt: "#1E2230", // raised cards / inputs
  border: "#2A2F3D",

  indigo: "#4F46E5",
  indigoMuted: "#383478",
  teal: "#14B8A6",
  tealMuted: "#0F4A45",

  text: "#F3F4F6",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",

  danger: "#F87171",
  warning: "#FBBF24",
  success: "#34D399",

  white: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const type = {
  display: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.3 },
  h1: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.2 },
  h2: { fontSize: 17, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
  label: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.4 },
};
