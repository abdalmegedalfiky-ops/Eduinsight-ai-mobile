// src/screens/ProfileScreen.tsx
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, EmptyState, ScreenHeader } from "../components/ui";
import { colors, radius, spacing, type } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import * as db from "../data/db";

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const classesQuery = useQuery({
    queryKey: ["myClasses", user?.id],
    queryFn: () => db.getClassesForStudent(user!.id),
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        contentContainerStyle={styles.scroll}
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow="Your profile" title="Profile" />

            <Card style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user.name)}</Text>
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Role</Text>
                <Text style={styles.metaValue}>{user.role === "student" ? "Student" : "Teacher"}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Joined</Text>
                <Text style={styles.metaValue}>{formatJoined(user.createdAt)}</Text>
              </View>
            </Card>

            <Text style={styles.sectionLabel}>
              My classes {classesQuery.data ? `(${classesQuery.data.length})` : ""}
            </Text>

            {classesQuery.isLoading ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <Text style={{ color: colors.textMuted }}>Loading classes…</Text>
              </Card>
            ) : !classesQuery.data || classesQuery.data.length === 0 ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <EmptyState
                  icon="🎒"
                  title="No classes yet"
                  subtitle="Use an invite code from the Join tab to enroll in your first class."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                {classesQuery.data.map((c) => (
                  <Card key={c.id}>
                    <View style={styles.classRow}>
                      <View style={[styles.subjectDot, { backgroundColor: colors.indigo }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.className}>{c.name}</Text>
                        <Text style={styles.classMeta}>
                          {c.subject} · {c.grade}
                        </Text>
                        <Text style={styles.teacherName}>{c.teacherName}</Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <Button title="Sign out" variant="secondary" onPress={signOut} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  profileCard: { alignItems: "center", marginBottom: spacing.lg, paddingVertical: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.indigoMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: "700" },
  name: { ...type.h1, color: colors.text },
  email: { ...type.caption, color: colors.textMuted, marginBottom: spacing.md },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaLabel: { ...type.caption, color: colors.textFaint },
  metaValue: { ...type.caption, color: colors.text, fontWeight: "600" },
  sectionLabel: {
    ...type.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  classRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  subjectDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  className: { ...type.h2, color: colors.text },
  classMeta: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  teacherName: { ...type.caption, color: colors.teal, marginTop: 2 },
});
