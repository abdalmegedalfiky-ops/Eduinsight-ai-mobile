// src/screens/EnrollScreen.tsx
import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Field, ScreenHeader } from "../components/ui";
import { colors, radius, spacing, type } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import * as db from "../data/db";
import type { ClassRow } from "../data/db";

export default function EnrollScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joinedClass, setJoinedClass] = useState<ClassRow | null>(null);

  const mutation = useMutation({
    mutationFn: (inviteCode: string) => db.enrollWithInviteCode(user!.id, inviteCode),
    onSuccess: (cls) => {
      setError(null);
      setCode("");
      setJoinedClass(cls);
      queryClient.invalidateQueries({ queryKey: ["myClasses", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["assignments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["announcements", user?.id] });
    },
    onError: (e: any) => {
      setError(e?.message ?? "Couldn't join that class. Try again.");
    },
  });

  function handleJoin() {
    setError(null);
    if (!code.trim()) {
      setError("Enter an invite code.");
      return;
    }
    mutation.mutate(code);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.scroll}>
        <ScreenHeader eyebrow="Join a class" title="Enter invite code" />

        <Card>
          <Text style={styles.helper}>
            Ask your teacher for the class invite code, then enter it below to join.
          </Text>
          <Field
            label="Invite code"
            placeholder="e.g. ALG2-7F3K"
            autoCapitalize="characters"
            value={code}
            onChangeText={(t) => {
              setCode(t);
              if (error) setError(null);
            }}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Join class" onPress={handleJoin} loading={mutation.isPending} />
        </Card>

        <Text style={styles.hint}>
          Demo tip: try ALG2-7F3K (Algebra II) or BIO1-4X8Q (Cell Biology).
        </Text>
      </View>

      <Modal visible={!!joinedClass} transparent animationType="fade" onRequestClose={() => setJoinedClass(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successBadge}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>You're enrolled!</Text>
            {joinedClass && (
              <Text style={styles.modalBody}>
                You've successfully joined{" "}
                <Text style={{ color: colors.teal, fontWeight: "700" }}>{joinedClass.name}</Text> with{" "}
                {joinedClass.teacherName}.
              </Text>
            )}
            <Button title="Done" onPress={() => setJoinedClass(null)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, flex: 1 },
  helper: { ...type.caption, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  hint: { ...type.caption, color: colors.textFaint, marginTop: spacing.md, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    width: "100%",
    alignItems: "center",
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successCheck: { color: colors.teal, fontSize: 26, fontWeight: "700" },
  modalTitle: { ...type.h1, color: colors.text, marginBottom: spacing.sm },
  modalBody: {
    ...type.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});
