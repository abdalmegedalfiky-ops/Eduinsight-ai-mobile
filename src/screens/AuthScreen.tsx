// src/screens/AuthScreen.tsx
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Field } from "../components/ui";
import { colors, radius, spacing, type } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../data/db";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (isSignUp && !name.trim()) {
      setError("Enter your full name.");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name, role);
      } else {
        await signIn(email, password);
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandWrap}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>E</Text>
            </View>
            <Text style={styles.brand}>EduInsight AI</Text>
            <Text style={styles.tagline}>Your classes, assignments, and updates — in one place.</Text>
          </View>

          <View style={styles.tabRow}>
            <TabButton label="Sign In" active={!isSignUp} onPress={() => setMode("signin")} />
            <TabButton label="Sign Up" active={isSignUp} onPress={() => setMode("signup")} />
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <Field
                label="Full name"
                placeholder="e.g. Layla Ahmed"
                value={name}
                onChangeText={setName}
              />
            )}
            <Field
              label="Email"
              placeholder="you@school.edu"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Field
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {isSignUp && (
              <View style={{ marginBottom: spacing.md }}>
                <Text style={styles.roleLabel}>I am a</Text>
                <View style={styles.roleRow}>
                  <RoleChip label="Student" active={role === "student"} onPress={() => setRole("student")} />
                  <RoleChip label="Teacher" active={role === "teacher"} onPress={() => setRole("teacher")} />
                </View>
              </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              title={isSignUp ? "Create account" : "Sign in"}
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
    </Pressable>
  );
}

function RoleChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  brandWrap: { alignItems: "center", marginBottom: spacing.xl },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.indigo,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  logoMarkText: { color: colors.white, fontSize: 26, fontWeight: "700" },
  brand: { ...type.h1, color: colors.text, marginBottom: spacing.xs },
  tagline: { ...type.caption, color: colors.textMuted, textAlign: "center", maxWidth: 260 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: "center" },
  tabBtnActive: { backgroundColor: colors.indigo },
  tabBtnText: { color: colors.textMuted, fontWeight: "600", fontSize: 14 },
  tabBtnTextActive: { color: colors.white },
  form: { width: "100%" },
  roleLabel: { ...type.label, color: colors.textMuted, textTransform: "uppercase", marginBottom: spacing.sm },
  roleRow: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: { borderColor: colors.teal, backgroundColor: colors.tealMuted },
  chipText: { color: colors.textMuted, fontWeight: "600" },
  chipTextActive: { color: colors.teal },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
