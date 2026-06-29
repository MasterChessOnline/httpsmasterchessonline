import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AUTH_TIMEOUT_MS = 5000;
const API_TIMEOUT_MS = 3000;

function entryLog(label: string, payload?: unknown) {
  try {
    console.info(`[MasterChess Entry] ${label}`, payload ?? "");
  } catch {
    // Logging must never affect startup.
  }
}

function withTimeout<T>(promise: PromiseLike<T>, ms = API_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`timeout-${ms}ms`)), ms);
    }),
  ]);
}

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  current_game_id?: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // Sensitive columns (master_coins, login_streak, welcome_*, push_notifications_enabled, etc.)
    // are not exposed through PostgREST. Use SECURITY DEFINER RPC for the owner's full row.
    try {
      const { data } = await withTimeout(supabase.rpc("get_my_profile"));
      const row = Array.isArray(data) ? data[0] : data;
      setProfile((row ?? null) as Profile | null);
    } catch (error) {
      entryLog("ERROR_STATE", { step: "INIT_DATA", message: "profile skipped", error });
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  // Touch the user's daily streak at most once per UTC day, per browser.
  // Auto-resets when a day is missed (handled inside the RPC logic below).
  const touchDailyStreak = async (userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const lastKey = `streak:lastTouch:${userId}`;
    if (typeof window !== "undefined" && localStorage.getItem(lastKey) === today) return;

    const { data: row } = await supabase
      .from("user_daily_streaks" as any)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const diffDays = (from: string, to: string) =>
      Math.round((new Date(to + "T00:00:00Z").getTime() - new Date(from + "T00:00:00Z").getTime()) / 86_400_000);

    if (!row) {
      await supabase.from("user_daily_streaks" as any).insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        total_active_days: 1,
        freeze_available: true,
      });
    } else {
      const r = row as any;
      if (r.last_active_date !== today) {
        const d = r.last_active_date ? diffDays(r.last_active_date, today) : 999;
        let newStreak = r.current_streak;
        let freezeAvailable = r.freeze_available;
        let freezeUsedDate = r.freeze_used_date;
        if (d === 1) newStreak = r.current_streak + 1;
        else if (d === 2 && r.freeze_available) {
          newStreak = r.current_streak + 1;
          freezeAvailable = false;
          freezeUsedDate = today;
        } else { newStreak = 1; freezeAvailable = true; freezeUsedDate = null; }
        await supabase
          .from("user_daily_streaks" as any)
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(r.longest_streak, newStreak),
            last_active_date: today,
            total_active_days: (r.total_active_days ?? 0) + 1,
            freeze_available: freezeAvailable,
            freeze_used_date: freezeUsedDate,
          })
          .eq("user_id", userId);
      }
    }
    if (typeof window !== "undefined") localStorage.setItem(lastKey, today);
  };

  useEffect(() => {
    let alive = true;
    entryLog("AUTH_START");
    const authTimeout = window.setTimeout(() => {
      if (!alive) return;
      entryLog("ERROR_STATE", { step: "INIT_AUTH", message: "auth timeout; continuing" });
      setLoading(false);
    }, AUTH_TIMEOUT_MS);

    const finishAuth = (label: string) => {
      if (!alive) return;
      window.clearTimeout(authTimeout);
      setLoading(false);
      entryLog("AUTH_DONE", { source: label });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!alive) return;
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            touchDailyStreak(session.user.id).catch((error) =>
              entryLog("ERROR_STATE", { step: "INIT_DATA", message: "streak skipped", error }),
            );
          }, 0);
        } else {
          setProfile(null);
        }
        finishAuth("state-change");
      }
    );

    withTimeout(supabase.auth.getSession(), API_TIMEOUT_MS).then(({ data: { session } }) => {
      if (!alive) return;
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        touchDailyStreak(session.user.id).catch((error) =>
          entryLog("ERROR_STATE", { step: "INIT_DATA", message: "streak skipped", error }),
        );
      }
      finishAuth("get-session");
    }).catch((error) => {
      entryLog("ERROR_STATE", { step: "INIT_AUTH", message: "auth skipped", error });
      finishAuth("get-session-error");
    });

    return () => {
      alive = false;
      window.clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
