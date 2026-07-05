import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AUTH_TIMEOUT_MS = 1000;
const API_TIMEOUT_MS = 5000;
const ENTRY_RELEASE_WAIT_MS = 5500;

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

function getStoredSessionFast(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const session = parsed?.currentSession ?? parsed;
      if (session?.access_token && session?.user) return session as Session;
    }
  } catch {
    // Local auth cache is best-effort and must never block entry.
  }
  return null;
}

function runAfterEntryRelease(task: () => void) {
  if (typeof window === "undefined") return;
  const released = (window as any).__mcEntryReleased === true;
  if (released) {
    window.setTimeout(task, 0);
    return;
  }

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    window.removeEventListener("mc:entry-finished", start);
    window.setTimeout(task, 0);
  };

  window.addEventListener("mc:entry-finished", start, { once: true });
  window.setTimeout(start, ENTRY_RELEASE_WAIT_MS);
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

  const fetchProfile = useCallback(async (userId: string) => {
    // Sensitive columns (master_coins, login_streak, welcome_*, push_notifications_enabled, etc.)
    // are not exposed through PostgREST. Use SECURITY DEFINER RPC for the owner's full row.
    try {
      entryLog("Loading profile...");
      const { data } = await withTimeout(supabase.rpc("get_my_profile"));
      const row = Array.isArray(data) ? data[0] : data;
      setProfile((row ?? null) as Profile | null);
      entryLog("Profile loaded", { step: "PROFILE_LOADED" });
    } catch (error) {
      entryLog("Profile skipped", { step: "INIT_DATA", message: "profile skipped", error });
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }, [fetchProfile, session?.user?.id]);

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
    let initialFinished = false;
    let lastSessionKey = "__unset__";
    entryLog("AUTH_START");
    entryLog("Auth restore started");
    const authTimeout = window.setTimeout(() => {
      if (!alive) return;
      entryLog("ERROR_STATE", { step: "INIT_AUTH", message: "auth timeout; continuing" });
      setLoading(false);
    }, AUTH_TIMEOUT_MS);

    const loadUserDataInBackground = (userId: string) => {
      runAfterEntryRelease(() => {
        entryLog("Background profile loading", { step: "INIT_DATA" });
        fetchProfile(userId);
        withTimeout(touchDailyStreak(userId), API_TIMEOUT_MS).catch((error) =>
          entryLog("ERROR_STATE", { step: "INIT_DATA", message: "streak skipped", error }),
        );
      });
    };

    const cachedSession = getStoredSessionFast();
    if (cachedSession?.user) {
      lastSessionKey = cachedSession.access_token || "cached-session";
      setSession(cachedSession);
      setLoading(false);
      initialFinished = true;
      window.clearTimeout(authTimeout);
      entryLog("Auth restore done", { source: "local-cache" });
      loadUserDataInBackground(cachedSession.user.id);
    }

    const finishAuth = (label: string) => {
      if (!alive || initialFinished) return;
      initialFinished = true;
      window.clearTimeout(authTimeout);
      setLoading(false);
      entryLog("Auth restore done", { source: label });
    };

    const applySession = (nextSession: Session | null, source: string) => {
      if (!alive) return;
      const nextKey = nextSession?.access_token || "no-session";
      if (nextKey !== lastSessionKey) {
        lastSessionKey = nextKey;
        setSession(nextSession);
        if (nextSession?.user) {
          entryLog("Auth restore done", { source });
          loadUserDataInBackground(nextSession.user.id);
        } else {
          entryLog("Auth restore skipped", { source });
          setProfile(null);
        }
      }
      finishAuth(source);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        applySession(session, "state-change");
      }
    );

    withTimeout(supabase.auth.getSession(), API_TIMEOUT_MS).then(({ data: { session } }) => {
      applySession(session, "get-session");
    }).catch((error) => {
      entryLog("ERROR_STATE", { step: "INIT_AUTH", message: "auth skipped", error });
      finishAuth("get-session-error");
    });

    return () => {
      alive = false;
      window.clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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
