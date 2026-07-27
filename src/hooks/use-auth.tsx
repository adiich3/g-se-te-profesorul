import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase/client";

export type AppRole = "student" | "tutor" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  displayName: string;
  accountRoute: "/dashboard" | "/profesor-dashboard";
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Eroare la încărcarea profilului:", error.message);
    return null;
  }

  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function sync(nextSession: Session | null) {
      if (!mounted) return;

      setSession(nextSession);
      const userId = nextSession?.user?.id ?? null;

      if (!userId) {
        currentUserId.current = null;
        setProfile(null);
        setLoading(false);
        return;
      }

      const alreadyLoaded = currentUserId.current === userId;
      currentUserId.current = userId;

      if (alreadyLoaded) {
        setLoading(false);
        return;
      }
      const next = await fetchProfile(userId);
      if (!mounted || currentUserId.current !== userId) return;

      setProfile(next);
      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      void sync(nextSession).then(() => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          router.invalidate();
        }
      });
    });

    void supabase.auth.getSession().then(({ data }) => sync(data.session));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const refreshProfile = useCallback(async () => {
    const userId = currentUserId.current;
    if (!userId) return;
    setProfile(await fetchProfile(userId));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    currentUserId.current = null;
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const role = (profile?.role ?? (user?.user_metadata?.role as AppRole | undefined) ?? null) as
      | AppRole
      | null;

    return {
      user,
      session,
      profile,
      role,
      loading,
      displayName:
        profile?.full_name ||
        (user?.user_metadata?.full_name as string | undefined) ||
        user?.email ||
        "Contul meu",
      accountRoute: role === "tutor" ? "/profesor-dashboard" : "/dashboard",
      refreshProfile,
      signOut,
    };
  }, [session, profile, loading, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth trebuie folosit în interiorul AuthProvider");
  }

  return ctx;
}
