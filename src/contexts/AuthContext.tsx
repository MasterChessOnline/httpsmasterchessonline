import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getTierByProductId, type TierKey } from "@/lib/premium-tiers";

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
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isPremium: boolean;
  subscriptionTier: TierKey | null;
  subscriptionEnd: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isPremium: false,
  subscriptionTier: null,
  subscriptionEnd: null,
  signOut: async () => {},
  refreshProfile: async () => {},
  checkSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<TierKey | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      const subscribed = data?.subscribed ?? false;
      setIsPremium(subscribed);
      setSubscriptionEnd(data?.subscription_end ?? null);
      if (subscribed && data?.product_id) {
        setSubscriptionTier(getTierByProductId(data.product_id));
      } else {
        setSubscriptionTier(null);
      }
    } catch {
      setIsPremium(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            checkSubscription();
          }, 0);
        } else {
          setProfile(null);
          setIsPremium(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkSubscription();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [session?.user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setIsPremium(false);
    setSubscriptionTier(null);
    setSubscriptionEnd(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isPremium,
      subscriptionTier,
      subscriptionEnd,
      signOut,
      refreshProfile,
      checkSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
