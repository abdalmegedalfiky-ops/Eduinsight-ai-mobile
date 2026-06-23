# EduInsight AI — Mobile (Expo, mock backend)

A student-facing mobile app: sign in/up, a dashboard of upcoming assignments
and recent announcements, a profile screen, and a "join class with invite
code" flow. No external backend required — all data is served from an
in-memory/AsyncStorage mock layer (`src/data/db.ts`) with realistic latency,
so the rest of the app (loading states, pull-to-refresh, mutations) behaves
like it would against a real API.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android), or press `i` / `a` for a
simulator, or `w` for web preview.

## Try the flow

1. **Sign up** with any email/password and pick "Student".
2. You'll land on an empty Dashboard — no classes yet, that's expected.
3. Go to the **Join** tab and enter an invite code:
   - `ALG2-7F3K` → Algebra II
   - `BIO1-4X8Q` → Cell Biology
   - `HIST-9P2M` → World History
   - (6 more classes are seeded — see `src/data/db.ts` for the full list)
4. You'll see a success modal, then Dashboard/Profile will populate with
   that class's assignments, announcements, and roster info.

Accounts persist across app restarts via `AsyncStorage` (this is a device-local
mock, not a shared backend — data won't sync across devices).

## Swapping in a real backend later

Everything funnels through `src/data/db.ts`. Each exported function
(`signIn`, `signUp`, `getClassesForStudent`, `enrollWithInviteCode`,
`getAssignmentsForStudent`, `getAnnouncementsForStudent`, etc.) has the same
signature you'd want from a real API — replace the body of each with a
`fetch`/Supabase/Blink call and nothing in the screens or React Query hooks
needs to change.

## Structure

```
App.tsx                       # providers: SafeArea, React Query, Auth
src/
  theme/colors.ts              # design tokens (dark, indigo + teal)
  data/db.ts                   # mock "database" — swap for real backend
  context/AuthContext.tsx       # auth state + actions
  navigation/
    RootNavigator.tsx          # signed-in vs signed-out routing
    MainTabs.tsx                # Dashboard / Join / Profile tabs
  screens/
    AuthScreen.tsx
    DashboardScreen.tsx
    ProfileScreen.tsx
    EnrollScreen.tsx
  components/ui.tsx             # Button, Field, Card, Badge, EmptyState
```

## Design direction

Dark "study at night" feel. Deep indigo (#4F46E5) is structural — header
text, the auth logo mark, active class indicators. Teal (#14B8A6) is
reserved for things that are "live" or in-progress: the active tab, due
dates, success states — so it reads as signal rather than decoration.
