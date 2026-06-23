// src/data/db.ts
//
// Mock "database" layer. Every function returns a Promise and has a small
// artificial delay, so the rest of the app (React Query, loading states,
// pull-to-refresh) behaves exactly like it would against a real backend.
// Swap these functions out for real API/Supabase/Blink calls later —
// nothing above this file needs to change.

import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------- Types ----------

export type Role = "student" | "teacher";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string; // ISO date
}

export interface ClassRow {
  id: string;
  name: string;
  subject: string;
  teacherName: string;
  grade: string;
  inviteCode: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  dueDate: string; // ISO date
  status: "upcoming" | "submitted" | "graded" | "overdue";
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  body: string;
  postedAt: string; // ISO date
}

// ---------- Storage keys ----------

const KEYS = {
  users: "eduinsight:users",
  session: "eduinsight:session",
  enrollments: "eduinsight:enrollments", // classId[] per userId
};

const delay = (ms = 450) => new Promise((res) => setTimeout(res, ms));

const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- Seed data ----------

const SEED_CLASSES: ClassRow[] = [
  { id: "c1", name: "Algebra II", subject: "Mathematics", teacherName: "Ms. Hana Reyes", grade: "10th Grade", inviteCode: "ALG2-7F3K" },
  { id: "c2", name: "World History", subject: "History", teacherName: "Mr. Daniel Osei", grade: "10th Grade", inviteCode: "HIST-9P2M" },
  { id: "c3", name: "Cell Biology", subject: "Science", teacherName: "Dr. Amina Saleh", grade: "10th Grade", inviteCode: "BIO1-4X8Q" },
  { id: "c4", name: "English Literature", subject: "English", teacherName: "Ms. Clare Whitfield", grade: "10th Grade", inviteCode: "ENGL-2T6R" },
  { id: "c5", name: "Physics Fundamentals", subject: "Science", teacherName: "Mr. Karim Idris", grade: "11th Grade", inviteCode: "PHYS-5W1N" },
  { id: "c6", name: "Arabic Language", subject: "Languages", teacherName: "Ms. Lina Haddad", grade: "10th Grade", inviteCode: "ARAB-8J4D" },
  { id: "c7", name: "Computer Science I", subject: "Technology", teacherName: "Mr. Youssef Tarek", grade: "11th Grade", inviteCode: "COMP-3Z9L" },
  { id: "c8", name: "Visual Arts", subject: "Arts", teacherName: "Ms. Priya Nair", grade: "10th Grade", inviteCode: "ARTS-6Y5B" },
];

const SEED_ASSIGNMENTS: Assignment[] = [
  { id: "a1", classId: "c1", title: "Quadratic Functions Worksheet", dueDate: daysFromNow(1), status: "upcoming" },
  { id: "a2", classId: "c3", title: "Mitosis Lab Report", dueDate: daysFromNow(2), status: "upcoming" },
  { id: "a3", classId: "c4", title: "Essay: Symbolism in 'The Great Gatsby'", dueDate: daysFromNow(4), status: "upcoming" },
  { id: "a4", classId: "c2", title: "WWI Causes — Reading Response", dueDate: daysFromNow(-1), status: "overdue" },
  { id: "a5", classId: "c7", title: "Loops & Conditionals Exercise Set", dueDate: daysFromNow(6), status: "upcoming" },
  { id: "a6", classId: "c1", title: "Linear Equations Quiz", dueDate: daysFromNow(-3), status: "graded" },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: "n1", classId: "c1", title: "Quiz moved to Thursday", body: "Algebra II quiz on linear systems is now Thursday instead of Tuesday — extra practice problems are posted.", postedAt: daysFromNow(-1) },
  { id: "n2", classId: "c3", title: "Lab safety reminder", body: "Please bring closed-toe shoes and your lab notebook to Friday's mitosis lab session.", postedAt: daysFromNow(-2) },
  { id: "n3", classId: "c4", title: "Essay rubric posted", body: "The grading rubric for the Gatsby essay is now available in the class folder.", postedAt: daysFromNow(-3) },
  { id: "n4", classId: "c7", title: "Guest speaker next week", body: "A software engineer from a local startup will join class next Wednesday to talk about real-world coding careers.", postedAt: daysFromNow(-4) },
];

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ---------- Internal helpers ----------

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

interface StoredUser extends UserProfile {
  password: string; // mock only — never do this in a real app
}

// ---------- Auth ----------

export async function signUp(params: { email: string; password: string; name: string; role: Role }): Promise<UserProfile> {
  await delay();
  const users = await readJSON<StoredUser[]>(KEYS.users, []);
  if (users.some((u) => u.email.toLowerCase() === params.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const newUser: StoredUser = {
    id: uid(),
    email: params.email.trim(),
    name: params.name.trim(),
    role: params.role,
    createdAt: new Date().toISOString(),
    password: params.password,
  };
  users.push(newUser);
  await writeJSON(KEYS.users, users);
  await writeJSON(KEYS.session, newUser.id);
  const { password, ...profile } = newUser;
  return profile;
}

export async function signIn(params: { email: string; password: string }): Promise<UserProfile> {
  await delay();
  const users = await readJSON<StoredUser[]>(KEYS.users, []);
  const found = users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
  if (!found || found.password !== params.password) {
    throw new Error("Incorrect email or password.");
  }
  await writeJSON(KEYS.session, found.id);
  const { password, ...profile } = found;
  return profile;
}

export async function signOut(): Promise<void> {
  await delay(150);
  await AsyncStorage.removeItem(KEYS.session);
}

export async function getSessionUser(): Promise<UserProfile | null> {
  await delay(300);
  const sessionId = await AsyncStorage.getItem(KEYS.session);
  if (!sessionId) return null;
  const users = await readJSON<StoredUser[]>(KEYS.users, []);
  const found = users.find((u) => u.id === sessionId);
  if (!found) return null;
  const { password, ...profile } = found;
  return profile;
}

// ---------- Classes / enrollment ----------

export async function getAllClasses(): Promise<ClassRow[]> {
  await delay();
  return SEED_CLASSES;
}

export async function getEnrolledClassIds(userId: string): Promise<string[]> {
  const enrollments = await readJSON<Record<string, string[]>>(KEYS.enrollments, {});
  return enrollments[userId] ?? [];
}

export async function getClassesForStudent(userId: string): Promise<ClassRow[]> {
  await delay();
  const enrollments = await readJSON<Record<string, string[]>>(KEYS.enrollments, {});
  const ids = enrollments[userId] ?? [];
  return SEED_CLASSES.filter((c) => ids.includes(c.id));
}

export async function enrollWithInviteCode(userId: string, rawCode: string): Promise<ClassRow> {
  await delay(600);
  const code = rawCode.trim().toUpperCase();
  const match = SEED_CLASSES.find((c) => c.inviteCode === code);
  if (!match) {
    throw new Error("That invite code doesn't match any class. Double-check it and try again.");
  }
  const enrollments = await readJSON<Record<string, string[]>>(KEYS.enrollments, {});
  const current = enrollments[userId] ?? [];
  if (current.includes(match.id)) {
    throw new Error(`You're already enrolled in ${match.name}.`);
  }
  enrollments[userId] = [...current, match.id];
  await writeJSON(KEYS.enrollments, enrollments);
  return match;
}

// ---------- Assignments / announcements ----------

export async function getAssignmentsForStudent(userId: string): Promise<(Assignment & { className: string })[]> {
  await delay();
  const classIds = await getEnrolledClassIds(userId);
  return SEED_ASSIGNMENTS.filter((a) => classIds.includes(a.classId))
    .map((a) => ({ ...a, className: SEED_CLASSES.find((c) => c.id === a.classId)?.name ?? "Class" }))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function getAnnouncementsForStudent(userId: string): Promise<(Announcement & { className: string })[]> {
  await delay();
  const classIds = await getEnrolledClassIds(userId);
  return SEED_ANNOUNCEMENTS.filter((a) => classIds.includes(a.classId))
    .map((a) => ({ ...a, className: SEED_CLASSES.find((c) => c.id === a.classId)?.name ?? "Class" }))
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}
