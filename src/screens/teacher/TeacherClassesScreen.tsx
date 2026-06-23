// src/screens/teacher/TeacherClassesScreen.tsx
import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, EmptyState, Field, ScreenHeader } from "../../components/ui";
import { colors, radius, spacing, type } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import * as db from "../../data/db";
import type { ClassRow } from "../../data/db";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TeacherStackParamList } from "../../navigation/TeacherStack";

type Props = NativeStackScreenProps<TeacherStackParamList, "ClassesList">;

export default function TeacherClassesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [createdClass, setCreatedClass] = useState<ClassRow | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState<string | null>(null);

  const classesQuery = useQuery({
    queryKey: ["teacherClasses", user?.id],
    queryFn: () => db.getClassesForTeacher(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: () => db.createClass(user!.id, user!.name, { name, subject, grade }),
    onSuccess: (cls) => {
      setModalOpen(false);
      setCreatedClass(cls);
      setName("");
      setSubject("");
      setGrade("");
      queryClient.invalidateQueries({ queryKey: ["teacherClasses", user?.id] });
    },
    onError: (e: any) => setError(e?.message ?? "Couldn't create the class."),
  });

  function handleCreate() {
    setError(null);
    if (!name.trim() || !subject.trim() || !grade.trim()) {
      setError("Fill in all three fields.");
      return;
    }
    mutation.mutate();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        contentContainerStyle={styles.scroll}
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <ScreenHeader eyebrow="Teaching" title="My classes" />
            </View>

            <Pressable style={styles.createBtn} onPress={() => setModalOpen(true)}>
              <Text style={styles.createBtnText}>+ Create a class</Text>
            </Pressable>

            {classesQuery.isLoading ? (
              <Card style={{ marginTop: spacing.lg }}>
                <Text style={{ color: colors.textMuted }}>Loading your classes…</Text>
              </Card>
            ) : !classesQuery.data || classesQuery.data.length === 0 ? (
              <Card style={{ marginTop: spacing.lg }}>
                <EmptyState
                  icon="🏫"
                  title="No classes yet"
                  subtitle="Create your first class to get an invite code students can use to join."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
                {classesQuery.data.map((c) => (
                  <Pressable key={c.id} onPress={() => navigation.navigate("ClassDetail", { classId: c.id, className: c.name })}>
                    <Card>
                      <Text style={styles.className}>{c.name}</Text>
                      <Text style={styles.classMeta}>
                        {c.subject} · {c.grade}
                      </Text>
                      <View style={styles.codeRow}>
                        <Text style={styles.codeLabel}>Invite code</Text>
                        <Text style={styles.codeValue}>{c.inviteCode}</Text>
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        }
      />

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create a class</Text>
            <Field label="Class name" placeholder="e.g. Algebra II" value={name} onChangeText={setName} />
            <Field label="Subject" placeholder="e.g. Mathematics" value={subject} onChangeText={setSubject} />
            <Field label="Grade" placeholder="e.g. 10th Grade" value={grade} onChangeText={setGrade} />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setModalOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Create" onPress={handleCreate} loading={mutation.isPending} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!createdClass} transparent animationType="fade" onRequestClose={() => setCreatedClass(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.successBadge}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Class created</Text>
            {createdClass && (
              <>
                <Text style={styles.modalBody}>
                  Share this invite code with your students so they can join {createdClass.name}.
                </Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeBlockText}>{createdClass.inviteCode}</Text>
                </View>
              </>
            )}
            <Button title="Done" onPress={() => setCreatedClass(null)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  createBtn: {
    backgroundColor: colors.indigo,
    borderRadius: radius.md,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  className: { ...type.h2, color: colors.text },
  classMeta: { ...type.caption, color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  codeLabel: { ...type.caption, color: colors.textFaint },
  codeValue: { ...type.caption, color: colors.teal, fontWeight: "700", letterSpacing: 0.5 },
  overlay: {
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
  },
  modalTitle: { ...type.h1, color: colors.text, marginBottom: spacing.md, textAlign: "center" },
  modalBody: { ...type.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.md, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    alignSelf: "center",
  },
  successCheck: { color: colors.teal, fontSize: 26, fontWeight: "700" },
  codeBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  codeBlockText: { color: colors.teal, fontSize: 20, fontWeight: "700", letterSpacing: 2 },
});
