import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            touchDailyStreak(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        touchDailyStreak(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
