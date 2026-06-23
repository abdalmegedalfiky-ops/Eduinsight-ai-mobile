// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as db from "../data/db";
import type { Role, UserProfile } from "../data/db";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getSessionUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await db.signIn({ email, password });
    setUser(profile);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: Role) => {
    const profile = await db.signUp({ email, password, name, role });
    setUser(profile);
  }, []);

  const signOut = useCallback(async () => {
    await db.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
