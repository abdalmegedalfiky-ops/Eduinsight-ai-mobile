// src/screens/DashboardScreen.tsx
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, EmptyState, ScreenHeader, StatusBadge } from "../components/ui";
import { colors, spacing, type } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import * as db from "../data/db";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ["assignments", user?.id],
    queryFn: () => db.getAssignmentsForStudent(user!.id),
    enabled: !!user,
  });

  const announcementsQuery = useQuery({
    queryKey: ["announcements", user?.id],
    queryFn: () => db.getAnnouncementsForStudent(user!.id),
    enabled: !!user,
  });

  const refreshing = assignmentsQuery.isFetching || announcementsQuery.isFetching;

  function onRefresh() {
    queryClient.invalidateQueries({ queryKey: ["assignments", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["announcements", user?.id] });
  }

  const upcoming = (assignmentsQuery.data ?? []).filter((a) => a.status !== "graded").slice(0, 6);
  const announcements = announcementsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        contentContainerStyle={styles.scroll}
        data={[]}
        renderItem={null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow={`Welcome back`} title={user?.name?.split(" ")[0] ?? "Student"} />

            <SectionLabel text="Upcoming assignments" />
            {assignmentsQuery.isLoading ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <Text style={styles.loadingText}>Loading assignments…</Text>
              </Card>
            ) : upcoming.length === 0 ? (
              <Card style={{ marginBottom: spacing.lg }}>
                <EmptyState
                  icon="📘"
                  title="Nothing due right now"
                  subtitle="Join a class to start seeing assignments here."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                {upcoming.map((a) => (
                  <Card key={a.id}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1, paddingRight: spacing.sm }}>
                        <Text style={styles.className}>{a.className}</Text>
                        <Text style={styles.itemTitle}>{a.title}</Text>
                        <Text style={styles.dueDate}>
                          {a.status === "overdue" ? "Was due" : "Due"} {formatDate(a.dueDate)}
                        </Text>
                      </View>
                      <StatusBadge status={a.status} />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <SectionLabel text="Recent announcements" />
            {announcementsQuery.isLoading ? (
              <Card>
                <Text style={styles.loadingText}>Loading announcements…</Text>
              </Card>
            ) : announcements.length === 0 ? (
              <Card>
                <EmptyState
                  icon="📣"
                  title="No announcements yet"
                  subtitle="Updates from your teachers will show up here."
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {announcements.map((n) => (
                  <Card key={n.id}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.className}>{n.className}</Text>
                      <Text style={styles.timeAgo}>{timeAgo(n.postedAt)}</Text>
                    </View>
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <Text style={styles.body}>{n.body}</Text>
                  </Card>
                ))}
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...type.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  className: { ...type.caption, color: colors.teal, fontWeight: "600", marginBottom: 2 },
  itemTitle: { ...type.h2, color: colors.text, marginBottom: 4 },
  dueDate: { ...type.caption, color: colors.textMuted },
  timeAgo: { ...type.caption, color: colors.textFaint },
  body: { ...type.caption, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  loadingText: { color: colors.textMuted },
});
