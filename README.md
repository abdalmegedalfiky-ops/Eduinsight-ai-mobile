# EduInsight AI — Mobile (Expo, mock backend)

A two-sided classroom app: students join classes with an invite code and see
a dashboard of assignments and announcements; teachers create classes, share
the invite code, and post assignments/announcements to their roster. No
external backend required — all data is served from an in-memory/AsyncStorage
mock layer (`src/data/db.ts`) with realistic latency, so the rest of the app
(loading states, pull-to-refresh, mutations) behaves like it would against a
real API.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android), or press `i` / `a` for a
simulator, or `w` for web preview.

## Try it as a student

1. **Sign up**, pick **Student**.
2. You'll land on an empty Dashboard — no classes yet, that's expected.
3. Go to the **Join** tab and enter an invite code:
   - `ALG2-7F3K` → Algebra II
   - `BIO1-4X8Q` → Cell Biology
   - `HIST-9P2M` → World History
   - (5 more demo classes are seeded — see `src/data/db.ts`)
4. You'll see a success modal, then Dashboard/Profile populate with that
   class's assignments and announcements.

## Try it as a teacher

1. **Sign up**, pick **Teacher**.
2. Go to the **Classes** tab → **Create a class** (name, subject, grade).
3. You'll get a generated invite code — share it with students (or use a
   student account in another session to join with it).
4. Tap into the class to see its **roster**, **post an announcement**, or
   **add an assignment**. Both show up immediately for any student enrolled
   in that class.

Accounts and data persist across app restarts via `AsyncStorage` (device-local
mock, not a shared backend — data won't sync across physical devices).

## Swapping in a real backend later

Everything funnels through `src/data/db.ts`. Each exported function
(`signIn`, `signUp`, `getClassesForStudent`, `enrollWithInviteCode`,
`createClass`, `getRosterForClass`, `postAnnouncement`, `createAssignment`,
etc.) has the same signature you'd want from a real API — replace the body of
each with a `fetch`/Supabase/Blink call and nothing in the screens or React
Query hooks needs to change.

## Structure

```
App.tsx                          # providers: SafeArea, React Query, Auth
src/
  theme/colors.ts                 # design tokens (dark, indigo + teal)
  data/db.ts                      # mock "database" — swap for real backend
  context/AuthContext.tsx          # auth state + actions
  navigation/
    RootNavigator.tsx             # routes by auth state + role
    MainTabs.tsx                   # student tabs: Dashboard / Join / Profile
    TeacherTabs.tsx                 # teacher tabs: Classes / Profile
    TeacherStack.tsx                # teacher's Classes tab: list -> detail
  screens/
    AuthScreen.tsx
    DashboardScreen.tsx            # student: assignments + announcements
    ProfileScreen.tsx               # role-aware (enrolled vs. taught classes)
    EnrollScreen.tsx                 # student: join with invite code
    teacher/
      TeacherClassesScreen.tsx       # teacher: list + create class
      ClassDetailScreen.tsx           # teacher: roster, post, assign
  components/ui.tsx                 # Button, Field, Card, Badge, EmptyState
```

## Design direction

Dark "study at night" feel. Deep indigo (#4F46E5) is structural — header
text, the auth logo mark, active class indicators. Teal (#14B8A6) is
reserved for things that are "live" or in-progress: the active tab, due
dates, success states, invite codes — so it reads as signal rather than
decoration.

## Notes

- `npx tsc --noEmit` passes clean.
- Demo-only auth: passwords are stored in plain text in AsyncStorage. Fine
  for a local mock, never do this against a real backend.
