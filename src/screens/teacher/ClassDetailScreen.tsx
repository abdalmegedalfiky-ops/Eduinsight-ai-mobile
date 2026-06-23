// src/screens/teacher/ClassDetailScreen.tsx
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, EmptyState, Field } from "../../components/ui";
import { colors, radius, spacing, type } from "../../theme/colors";
import * as db from "../../data/db";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TeacherStackParamList } from "../../navigation/TeacherStack";

type Props = NativeStackScreenProps<TeacherStackParamList, "ClassDetail">;

type ModalKind = "none" | "announcement" | "assignment";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ClassDetailScreen({ route, navigation }: Props) {
  const { classId, className } = route.params;
  const queryClient = useQueryClient();
  const [modalKind, setModalKind] = useState<ModalKind>("none");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [daysOut, setDaysOut] = useState("7");
  const [error, setError] = useState<string | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: className });
  }, [navigation, className]);

  const rosterQuery = useQuery({
    queryKey: ["roster", classId],
    queryFn: () => db.getRosterForClass(classId),
  });
  const assignmentsQuery = useQuery({
    queryKey: ["classAssignments", classId],
    queryFn: () => db.getAssignmentsForClass(classId),
  });
  const announcementsQuery = useQuery({
    queryKey: ["classAnnouncements", classId],
    queryFn: () => db.getAnnouncementsForClass(classId),
  });

  function closeModal() {
    setModalKind("none");
    setTitle("");
    setBody("");
    setDaysOut("7");
    setError(null);
  }

  const announceMutation = useMutation({
    mutationFn: () => db.postAnnouncement({ classId, title, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classAnnouncements", classId] });
      closeModal();
    },
    onError: (e: any) => setError(e?.message ?? "Couldn't post announcement."),
  });

  const assignMutation = useMutation({
    mutationFn: () => {
      const n = parseInt(daysOut, 10);
      const due = new Date();
      due.setDate(due.getDate() + (isNaN(n) ? 7 : n));
      return db.createAssignment({ classId, title, dueDate: due.toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classAssignments", classId] });
      closeModal();
    },
    onError: (e: any) => setError(e?.message ?? "Couldn't create assignment."),
  });

  function submit() {
    setError(null);
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    if (modalKind === "announcement") {
      if (!body.trim()) {
        setError("Add a message.");
        return;
      }
      announceMutation.mutate();
    } else if (modalKind === "assignment") {
      assignMutation.mutate();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.scroll}
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View>
            <View style={styles.actionsRow}>
              <View style={{ flex: 1 }}>
                <Button title="Post announcement" variant="secondary" onPress={() => setModalKind("announcement")} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Add assignment" onPress={() => setModalKind("assignment")} />
              </View>
            </View>

            <Text style={styles.sectionLabel}>
              Roster {rosterQuery.data ? `(${rosterQuery.data.length})` : ""}
            </Text>
            {rosterQuery.isLoading ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <Text style={{ color: colors.textMuted }}>Loading roster…</Text>
              </Card>
            ) : !rosterQuery.data || rosterQuery.data.length === 0 ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <EmptyState icon="👥" title="No students yet" subtitle="Share the invite code from the previous screen." />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                {rosterQuery.data.map((s) => (
                  <Card key={s.studentId}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentEmail}>{s.email}</Text>
                  </Card>
                ))}
              </View>
            )}

            <Text style={styles.sectionLabel}>Assignments</Text>
            {!assignmentsQuery.data || assignmentsQuery.data.length === 0 ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <EmptyState icon="📘" title="No assignments yet" subtitle="Add one with the button above." />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                {assignmentsQuery.data.map((a) => (
                  <Card key={a.id}>
                    <Text style={styles.itemTitle}>{a.title}</Text>
                    <Text style={styles.itemMeta}>Due {formatDate(a.dueDate)}</Text>
                  </Card>
                ))}
              </View>
            )}

            <Text style={styles.sectionLabel}>Announcements</Text>
            {!announcementsQuery.data || announcementsQuery.data.length === 0 ? (
              <Card>
                <EmptyState icon="📣" title="No announcements yet" subtitle="Post one with the button above." />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {announcementsQuery.data.map((a) => (
                  <Card key={a.id}>
                    <Text style={styles.itemTitle}>{a.title}</Text>
                    <Text style={styles.itemMeta}>{a.body}</Text>
                  </Card>
                ))}
              </View>
            )}
          </View>
        }
      />

      <Modal visible={modalKind !== "none"} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modalKind === "announcement" ? "Post an announcement" : "Add an assignment"}
            </Text>
            <Field label="Title" placeholder="e.g. Lab safety reminder" value={title} onChangeText={setTitle} />
            {modalKind === "announcement" ? (
              <Field
                label="Message"
                placeholder="What should students know?"
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={3}
                style={{ height: 90, textAlignVertical: "top", paddingTop: spacing.sm } as any}
              />
            ) : (
              <Field
                label="Due in (days from today)"
                placeholder="7"
                keyboardType="number-pad"
                value={daysOut}
                onChangeText={setDaysOut}
              />
            )}
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={closeModal} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={modalKind === "announcement" ? "Post" : "Add"}
                  onPress={submit}
                  loading={announceMutation.isPending || assignMutation.isPending}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  sectionLabel: {
    ...type.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  studentName: { ...type.h2, color: colors.text },
  studentEmail: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  itemTitle: { ...type.h2, color: colors.text, marginBottom: 4 },
  itemMeta: { ...type.caption, color: colors.textMuted },
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
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});
