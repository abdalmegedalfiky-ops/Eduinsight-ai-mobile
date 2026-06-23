// src/components/ui.tsx
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors, radius, spacing, type } from "../theme/colors";

// ---------- Button ----------

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = "primary", loading, disabled }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btnBase,
        variant === "primary" && { backgroundColor: colors.indigo },
        variant === "secondary" && { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
        variant === "ghost" && { backgroundColor: "transparent" },
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "ghost" && { color: colors.teal },
            variant === "secondary" && { color: colors.text },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// ---------- Text field ----------

interface FieldProps extends TextInputProps {
  label: string;
}

export function Field({ label, style, ...rest }: FieldProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={[styles.input, style]}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
}

// ---------- Card ----------

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---------- Badge ----------

const STATUS_COLORS: Record<string, string> = {
  upcoming: colors.teal,
  overdue: colors.danger,
  graded: colors.indigo,
  submitted: colors.success,
};

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: c + "22", borderColor: c + "55" }]}>
      <Text style={[styles.badgeText, { color: c }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

// ---------- Empty state ----------

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

// ---------- Screen header ----------

export function ScreenHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btnBase: {
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  btnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  fieldLabel: {
    ...type.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    color: colors.text,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  eyebrow: {
    ...type.label,
    color: colors.teal,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  screenTitle: {
    ...type.display,
    color: colors.text,
  },
});
